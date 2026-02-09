export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "DB not bound" }), { status: 500 });
  }

  try {
    const body = await request.json();

    // 1. Update duration when the visitor leaves the page
    if (body.action === "end" && body.id) {
      const duration = Math.max(0, Math.round(Number(body.duration_sec) || 0));
      await env.DB.prepare("UPDATE visits SET duration_sec = ? WHERE id = ?")
        .bind(duration, body.id)
        .run();

      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Log a new visit when the page loads
    const cf = request.cf || {};
    const id = crypto.randomUUID();
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const userAgent = request.headers.get("User-Agent") || "unknown";

    await env.DB.prepare(
      `INSERT INTO visits (id, ip, city, region, country, org, referrer, ref_tag, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        ip,
        cf.city || "unknown",
        cf.region || "unknown",
        cf.country || "unknown",
        cf.asOrganization || "unknown",
        body.referrer || "direct",
        body.ref_tag || "",
        userAgent
      )
      .run();

    return new Response(JSON.stringify({ id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Optional: GET /api/log returns total unique IPs (ready for your future counter)
export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ uniqueVisitors: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const row = await env.DB.prepare(
    "SELECT COUNT(DISTINCT ip) AS count FROM visits"
  ).first();

  return new Response(JSON.stringify({ uniqueVisitors: row?.count || 0 }), {
    headers: { "Content-Type": "application/json" },
  });
}