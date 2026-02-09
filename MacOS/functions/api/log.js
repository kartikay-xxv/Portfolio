function parseBasicDevice(ua = "", clientHints = null) {
  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  let os = "Other";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Linux/i.test(ua)) os = "Linux";

  let isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 1 : 0;

  if (clientHints && typeof clientHints === "object") {
    if (Array.isArray(clientHints.brands) && clientHints.brands.length > 0) {
      const meaningful = clientHints.brands.find(
        (b) => b.brand && !/Not.A.Brand|Chromium/i.test(b.brand)
      );
      const chosen = meaningful || clientHints.brands[0];
      if (chosen?.brand) {
        browser = chosen.version ? `${chosen.brand} ${chosen.version}` : chosen.brand;
      }
    }
    if (clientHints.platform) {
      os = clientHints.platformVersion
        ? `${clientHints.platform} ${clientHints.platformVersion}`
        : clientHints.platform;
    }
    if (typeof clientHints.mobile === "boolean") {
      isMobile = clientHints.mobile ? 1 : 0;
    }
  }

  return { browser, os, isMobile };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "DB not bound" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();

    // 1. Update session duration when visitor leaves or hides tab
    if (body.action === "end" && body.id) {
      const duration = Math.max(0, Math.round(Number(body.duration_sec) || 0));
      await env.DB.prepare(
        `UPDATE visits
         SET duration_sec = ?, updated_at = datetime('now')
         WHERE id = ?`
      )
        .bind(duration, body.id)
        .run();

      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Log a new visit
    const cf = request.cf || {};
    const id = crypto.randomUUID();
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const userAgent = request.headers.get("User-Agent") || "unknown";
    const { browser, os, isMobile } = parseBasicDevice(userAgent, body.client_hints);

    await env.DB.prepare(
      `INSERT INTO visits (
        id, ref_tag, utm_source, utm_campaign, referrer, landing_path,
        ip, org, asn, continent, country, region, city, postal_code, cf_timezone,
        browser, os, is_mobile, screen_res, viewport_res, language, languages, client_timezone, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        String(body.ref_tag || "").slice(0, 100),
        String(body.utm_source || "").slice(0, 100),
        String(body.utm_campaign || "").slice(0, 100),
        String(body.referrer || "direct").slice(0, 300),
        String(body.landing_path || "/").slice(0, 200),
        ip,
        String(cf.asOrganization || "unknown").slice(0, 200),
        cf.asn ? String(cf.asn) : "",
        String(cf.continent || "").slice(0, 20),
        String(cf.country || "unknown").slice(0, 20),
        String(cf.region || "unknown").slice(0, 100),
        String(cf.city || "unknown").slice(0, 100),
        String(cf.postalCode || "").slice(0, 30),
        String(cf.timezone || "").slice(0, 80),
        browser.slice(0, 100),
        os.slice(0, 100),
        isMobile,
        String(body.screen_res || "").slice(0, 40),
        String(body.viewport_res || "").slice(0, 40),
        String(body.language || "").slice(0, 40),
        String(body.languages || "").slice(0, 200),
        String(body.client_timezone || "").slice(0, 80),
        userAgent.slice(0, 500)
      )
      .run();

    return new Response(JSON.stringify({ id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ uniqueVisitors: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const row = await env.DB.prepare(
    "SELECT COUNT(DISTINCT ip) AS count FROM visits WHERE ip != 'unknown'"
  ).first();

  return new Response(JSON.stringify({ uniqueVisitors: row?.count || 0 }), {
    headers: { "Content-Type": "application/json" },
  });
}