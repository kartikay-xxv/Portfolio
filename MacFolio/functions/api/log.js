import {
  n,
  escapeHtml,
  formatDuration,
  extractCfMeta,
  detectBot,
  resolveVisitorId,
  sendTelegramMessage,
} from "../_lib/analytics.js";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function onRequestGet({ env }) {
  try {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM visitors WHERE is_bot = 0"
    ).first();

    return new Response(
      JSON.stringify({ uniqueVisitors: Number(row?.count ?? 0) }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ uniqueVisitors: 0, error: String(err?.message || err) }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    const raw = await request.text();
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const action = body.action || "visit";
  const now = new Date().toISOString();

  // ------------------------------------------------------------------
  // 1. DURATION UPDATE (beacon on tab hide / close)
  // ------------------------------------------------------------------
  if (action === "duration") {
    const visitId = Number(body.visitId);
    const durationSec = Math.max(0, Math.min(86400, Math.round(Number(body.durationSec) || 0)));
    const deltaSec = Math.max(0, Math.min(86400, Math.round(Number(body.deltaSec) || 0)));
    const visitorId = typeof body.visitorId === "string" ? body.visitorId : null;

    try {
      const queries = [];

      if (Number.isInteger(visitId) && visitId > 0) {
        queries.push(
          env.DB.prepare(
            "UPDATE visits SET duration_sec = MAX(duration_sec, ?) WHERE id = ?"
          ).bind(durationSec, visitId)
        );
      }

      if (visitorId && deltaSec > 0) {
        queries.push(
          env.DB.prepare(
            "UPDATE visitors SET total_duration_sec = total_duration_sec + ?, last_seen = ? WHERE visitor_id = ?"
          ).bind(deltaSec, now, visitorId)
        );
      }

      if (queries.length > 0) {
        await env.DB.batch(queries);
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: JSON_HEADERS,
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }
  }

  // Extract Cloudflare + client details
  const cfMeta = extractCfMeta(request);
  const client = body.client || {};
  const { isBot, botReason } = detectBot(cfMeta, client);
  const { visitorId, idSource } = await resolveVisitorId(body.visitorId, cfMeta, client);

  // ------------------------------------------------------------------
  // 2. INSTANT 0s VISIT LOG -> `visits` table
  // ------------------------------------------------------------------
  if (action === "visit") {
    try {
      const result = await env.DB.prepare(`
        INSERT INTO visits (
          visitor_id, id_source, visited_at, duration_sec, is_bot, bot_reason,
          ref_tag, utm_source, utm_medium, utm_campaign, referrer, landing_path,
          ip, isp_org, asn, continent, country, region, city, postal_code,
          latitude, longitude, cf_timezone, cf_colo, http_protocol, tls_version,
          browser, os, device_type, is_mobile, screen_res, viewport_res, dpr,
          language, languages, client_timezone, cpu_cores, device_memory,
          connection_type, color_scheme, user_agent
        ) VALUES (
          ?, ?, ?, 0, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?
        )
      `)
        .bind(
          visitorId, idSource, now, isBot, n(botReason),
          n(client.refTag), n(client.utmSource), n(client.utmMedium), n(client.utmCampaign), n(client.referrer), n(client.landingPath),
          n(cfMeta.ip), n(cfMeta.isp_org), n(cfMeta.asn), n(cfMeta.continent), n(cfMeta.country), n(cfMeta.region), n(cfMeta.city), n(cfMeta.postal_code),
          n(cfMeta.latitude), n(cfMeta.longitude), n(cfMeta.cf_timezone), n(cfMeta.cf_colo), n(cfMeta.http_protocol), n(cfMeta.tls_version),
          n(client.browser), n(client.os), n(client.deviceType), client.isMobile ? 1 : 0, n(client.screenRes), n(client.viewportRes), n(client.dpr),
          n(client.language), n(client.languages), n(client.clientTimezone), n(client.cpuCores), n(client.deviceMemory),
          n(client.connectionType), n(client.colorScheme), n(cfMeta.user_agent)
        )
        .run();

      return new Response(
        JSON.stringify({
          ok: true,
          visitId: result?.meta?.last_row_id ?? null,
          visitorId,
          idSource,
          isBot,
        }),
        { status: 200, headers: JSON_HEADERS }
      );
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }
  }

  // ------------------------------------------------------------------
  // 3. DELAYED (2.5s) UNIQUE VISITOR UPSERT -> `visitors` table + Telegram
  // ------------------------------------------------------------------
  if (action === "visitor") {
    try {
      const existing = await env.DB.prepare(
        "SELECT id, visit_count, total_duration_sec, gmail_email FROM visitors WHERE visitor_id = ?"
      )
        .bind(visitorId)
        .first();

      const isReturning = Boolean(existing);
      const newVisitCount = isReturning ? Number(existing.visit_count || 0) + 1 : 1;

      await env.DB.prepare(`
        INSERT INTO visitors (
          visitor_id, id_source, is_bot, bot_reason, visit_count, total_duration_sec,
          first_seen, last_seen,
          first_ref_tag, last_ref_tag, first_referrer, last_referrer, last_landing_path,
          first_ip, last_ip, isp_org, asn, continent, country, region, city, postal_code,
          latitude, longitude, cf_timezone,
          browser, os, device_type, is_mobile, screen_res, viewport_res, dpr,
          language, languages, client_timezone, cpu_cores, device_memory,
          connection_type, color_scheme, user_agent
        ) VALUES (
          ?, ?, ?, ?, 1, 0,
          ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?
        )
        ON CONFLICT(visitor_id) DO UPDATE SET
          visit_count = visitors.visit_count + 1,
          last_seen = excluded.last_seen,
          is_bot = CASE WHEN visitors.is_bot = 1 OR excluded.is_bot = 1 THEN 1 ELSE 0 END,
          bot_reason = COALESCE(excluded.bot_reason, visitors.bot_reason),
          last_ref_tag = COALESCE(excluded.last_ref_tag, visitors.last_ref_tag),
          last_referrer = COALESCE(excluded.last_referrer, visitors.last_referrer),
          last_landing_path = excluded.last_landing_path,
          last_ip = excluded.last_ip,
          isp_org = COALESCE(excluded.isp_org, visitors.isp_org),
          asn = COALESCE(excluded.asn, visitors.asn),
          country = COALESCE(excluded.country, visitors.country),
          region = COALESCE(excluded.region, visitors.region),
          city = COALESCE(excluded.city, visitors.city),
          postal_code = COALESCE(excluded.postal_code, visitors.postal_code),
          browser = COALESCE(excluded.browser, visitors.browser),
          os = COALESCE(excluded.os, visitors.os),
          device_type = COALESCE(excluded.device_type, visitors.device_type),
          is_mobile = excluded.is_mobile,
          screen_res = COALESCE(excluded.screen_res, visitors.screen_res),
          viewport_res = COALESCE(excluded.viewport_res, visitors.viewport_res),
          dpr = COALESCE(excluded.dpr, visitors.dpr),
          connection_type = COALESCE(excluded.connection_type, visitors.connection_type),
          color_scheme = COALESCE(excluded.color_scheme, visitors.color_scheme),
          user_agent = COALESCE(excluded.user_agent, visitors.user_agent)
      `)
        .bind(
          visitorId, idSource, isBot, n(botReason),
          now, now,
          n(client.refTag), n(client.refTag), n(client.referrer), n(client.referrer), n(client.landingPath),
          n(cfMeta.ip), n(cfMeta.ip), n(cfMeta.isp_org), n(cfMeta.asn), n(cfMeta.continent), n(cfMeta.country), n(cfMeta.region), n(cfMeta.city), n(cfMeta.postal_code),
          n(cfMeta.latitude), n(cfMeta.longitude), n(cfMeta.cf_timezone),
          n(client.browser), n(client.os), n(client.deviceType), client.isMobile ? 1 : 0, n(client.screenRes), n(client.viewportRes), n(client.dpr),
          n(client.language), n(client.languages), n(client.clientTimezone), n(client.cpuCores), n(client.deviceMemory),
          n(client.connectionType), n(client.colorScheme), n(cfMeta.user_agent)
        )
        .run();

      // Send Telegram alert for human visitors only
      if (isBot === 0) {
        const location = [cfMeta.city, cfMeta.region, cfMeta.country].filter(Boolean).join(", ") || "Unknown";
        const header = isReturning
          ? `🔁 <b>Returning Visitor (Visit #${newVisitCount})</b>`
          : `🟢 <b>New Unique Visitor</b>`;

        const lines = [
          header,
          existing?.gmail_email ? `📧 <b>Known Gmail:</b> ${escapeHtml(existing.gmail_email)}` : null,
          `📍 <b>Location:</b> ${escapeHtml(location)}`,
          `🌐 <b>ISP:</b> ${escapeHtml(cfMeta.isp_org || "Unknown")}${cfMeta.asn ? ` (AS${cfMeta.asn})` : ""}`,
          `💻 <b>Device:</b> ${escapeHtml(client.browser || "?")} on ${escapeHtml(client.os || "?")} (${escapeHtml(client.deviceType || "desktop")})`,
          `🖥 <b>Screen:</b> ${escapeHtml(client.screenRes || "?")} | <b>Mode:</b> ${escapeHtml(client.colorScheme || "?")}`,
          client.refTag ? `🏷 <b>Ref Tag:</b> <code>${escapeHtml(client.refTag)}</code>` : null,
          client.referrer ? `🔗 <b>Referrer:</b> ${escapeHtml(client.referrer)}` : null,
          isReturning && existing?.total_duration_sec
            ? `⏱ <b>Prev Time Spent:</b> ${formatDuration(existing.total_duration_sec)}`
            : null,
          `🆔 <code>${escapeHtml(visitorId)}</code> (${escapeHtml(idSource)})`,
        ].filter(Boolean);

        context.waitUntil(sendTelegramMessage(env, lines.join("\n")));
      }

      return new Response(
        JSON.stringify({ ok: true, visitorId, isReturning, visitCount: newVisitCount, isBot }),
        { status: 200, headers: JSON_HEADERS }
      );
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }
  }

  return new Response(JSON.stringify({ ok: false, error: "Unknown action" }), {
    status: 400,
    headers: JSON_HEADERS,
  });
}