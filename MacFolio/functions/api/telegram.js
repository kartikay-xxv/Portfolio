import {
  escapeHtml,
  formatDuration,
  sendTelegramMessage,
} from "../_lib/analytics.js";

function shortTime(iso) {
  if (!iso) return "?";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso.slice(0, 16);
  }
}

export async function onRequestPost({ request, env }) {
  // 1. Verify webhook secret header
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== env.TELEGRAM_WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response("OK", { status: 200 });
  }

  const msg = update?.message;
  const chatId = msg?.chat?.id;
  const text = (msg?.text || "").trim();

  if (!chatId || !text) {
    return new Response("OK", { status: 200 });
  }

  // 2. Allow ONLY your personal Telegram Chat ID
  if (String(chatId) !== String(env.TELEGRAM_CHAT_ID)) {
    return new Response("OK", { status: 200 });
  }

  const [rawCmd, ...args] = text.split(/\s+/);
  const cmd = rawCmd.toLowerCase().split("@")[0];
  const limit = Math.max(1, Math.min(20, parseInt(args[0], 10) || 8));

  try {
    if (cmd === "/start" || cmd === "/help") {
      await sendTelegramMessage(
        env,
        [
          `🤖 <b>MacFolio Analytics Bot</b>`,
          ``,
          `/stats — Overview & top ref tags`,
          `/visitors [n] — Latest unique humans (default 8)`,
          `/visits [n] — Latest raw 0s visits (default 8)`,
          `/gmails [n] — Captured Gmail users (default 10)`,
          `/bots [n] — Recent filtered bots`,
          `/search &lt;word&gt; — Search email, city, ISP, or ref`,
        ].join("\n"),
        chatId
      );
      return new Response("OK", { status: 200 });
    }

    if (cmd === "/stats") {
      const todayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [humans, bots, totalVisits, gmails, last24h, topRefs] = await Promise.all([
        env.DB.prepare("SELECT COUNT(*) AS c FROM visitors WHERE is_bot = 0").first(),
        env.DB.prepare("SELECT COUNT(*) AS c FROM visitors WHERE is_bot = 1").first(),
        env.DB.prepare("SELECT COUNT(*) AS c FROM visits").first(),
        env.DB.prepare("SELECT COUNT(*) AS c FROM gmail_users").first(),
        env.DB.prepare(
          "SELECT COUNT(*) AS c FROM visitors WHERE is_bot = 0 AND last_seen >= ?"
        )
          .bind(todayIso)
          .first(),
        env.DB.prepare(
          "SELECT last_ref_tag AS tag, COUNT(*) AS c FROM visitors WHERE is_bot = 0 AND last_ref_tag IS NOT NULL GROUP BY last_ref_tag ORDER BY c DESC LIMIT 5"
        ).all(),
      ]);

      const refLines = (topRefs?.results || []).map(
        (r) => `  • <code>${escapeHtml(r.tag)}</code>: ${r.c}`
      );

      await sendTelegramMessage(
        env,
        [
          `📊 <b>MacFolio Live Stats</b>`,
          ``,
          `👥 <b>Unique Humans:</b> ${humans?.c ?? 0}`,
          `⚡ <b>Active Last 24h:</b> ${last24h?.c ?? 0}`,
          `🎣 <b>Gmail Captures:</b> ${gmails?.c ?? 0}`,
          `📝 <b>Total Raw Visits:</b> ${totalVisits?.c ?? 0}`,
          `🤖 <b>Bots Filtered:</b> ${bots?.c ?? 0}`,
          refLines.length ? `\n🏷 <b>Top Ref Tags:</b>\n${refLines.join("\n")}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        chatId
      );
      return new Response("OK", { status: 200 });
    }

    if (cmd === "/visitors") {
      const { results } = await env.DB.prepare(`
        SELECT visitor_id, gmail_email, visit_count, total_duration_sec, last_seen,
               city, region, country, isp_org, browser, os, screen_res, last_ref_tag
        FROM visitors
        WHERE is_bot = 0
        ORDER BY last_seen DESC
        LIMIT ?
      `)
        .bind(limit)
        .all();

      if (!results?.length) {
        await sendTelegramMessage(env, "No human visitors logged yet.", chatId);
        return new Response("OK", { status: 200 });
      }

      const blocks = results.map((v, i) => {
        const loc = [v.city, v.country].filter(Boolean).join(", ") || "?";
        return [
          `<b>${i + 1}. ${escapeHtml(loc)}</b> (${v.visit_count}x · ${formatDuration(v.total_duration_sec)})`,
          v.gmail_email ? `   📧 <code>${escapeHtml(v.gmail_email)}</code>` : null,
          `   💻 ${escapeHtml(v.browser || "?")} / ${escapeHtml(v.os || "?")} · ${escapeHtml(v.screen_res || "?")}`,
          `   🌐 ${escapeHtml(v.isp_org || "?")}${v.last_ref_tag ? ` · 🏷 <code>${escapeHtml(v.last_ref_tag)}</code>` : ""}`,
          `   🕒 ${shortTime(v.last_seen)}`,
        ]
          .filter(Boolean)
          .join("\n");
      });

      await sendTelegramMessage(
        env,
        `👥 <b>Latest ${results.length} Unique Visitors</b>\n\n${blocks.join("\n\n")}`,
        chatId
      );
      return new Response("OK", { status: 200 });
    }

    if (cmd === "/visits") {
      const { results } = await env.DB.prepare(`
        SELECT visited_at, duration_sec, is_bot, city, country, isp_org,
               browser, os, ref_tag, landing_path
        FROM visits
        ORDER BY visited_at DESC
        LIMIT ?
      `)
        .bind(limit)
        .all();

      if (!results?.length) {
        await sendTelegramMessage(env, "No visits logged yet.", chatId);
        return new Response("OK", { status: 200 });
      }

      const blocks = results.map((v, i) => {
        const loc = [v.city, v.country].filter(Boolean).join(", ") || "?";
        const badge = v.is_bot ? "🤖" : "🟢";
        return [
          `${badge} <b>${i + 1}. ${escapeHtml(loc)}</b> · ${formatDuration(v.duration_sec)} · ${shortTime(v.visited_at)}`,
          `   ${escapeHtml(v.browser || "?")} / ${escapeHtml(v.os || "?")} · ${escapeHtml(v.isp_org || "?")}`,
          v.ref_tag ? `   🏷 <code>${escapeHtml(v.ref_tag)}</code>` : null,
        ]
          .filter(Boolean)
          .join("\n");
      });

      await sendTelegramMessage(
        env,
        `📝 <b>Latest ${results.length} Raw Visits</b>\n\n${blocks.join("\n\n")}`,
        chatId
      );
      return new Response("OK", { status: 200 });
    }

    if (cmd === "/gmails") {
      const gLimit = Math.max(1, Math.min(20, parseInt(args[0], 10) || 10));
      const { results } = await env.DB.prepare(`
        SELECT name, email, hosted_domain, login_count, last_login_at,
               city, country, isp_org, browser, os, ref_tag
        FROM gmail_users
        ORDER BY last_login_at DESC
        LIMIT ?
      `)
        .bind(gLimit)
        .all();

      if (!results?.length) {
        await sendTelegramMessage(env, "No Gmail users captured yet 🎣", chatId);
        return new Response("OK", { status: 200 });
      }

      const blocks = results.map((g, i) => {
        const loc = [g.city, g.country].filter(Boolean).join(", ") || "?";
        return [
          `<b>${i + 1}. ${escapeHtml(g.name || "Unknown")}</b> (${g.login_count}x)`,
          `   📧 <code>${escapeHtml(g.email)}</code>${g.hosted_domain ? ` (${escapeHtml(g.hosted_domain)})` : ""}`,
          `   📍 ${escapeHtml(loc)} · ${escapeHtml(g.isp_org || "?")}`,
          `   💻 ${escapeHtml(g.browser || "?")} / ${escapeHtml(g.os || "?")}${g.ref_tag ? ` · 🏷 <code>${escapeHtml(g.ref_tag)}</code>` : ""}`,
          `   🕒 ${shortTime(g.last_login_at)}`,
        ].join("\n");
      });

      await sendTelegramMessage(
        env,
        `🎣 <b>Captured Gmail Users (${results.length})</b>\n\n${blocks.join("\n\n")}`,
        chatId
      );
      return new Response("OK", { status: 200 });
    }

    if (cmd === "/bots") {
      const { results } = await env.DB.prepare(`
        SELECT last_seen, visit_count, bot_reason, city, country, isp_org, asn, browser, os
        FROM visitors
        WHERE is_bot = 1
        ORDER BY last_seen DESC
        LIMIT ?
      `)
        .bind(limit)
        .all();

      if (!results?.length) {
        await sendTelegramMessage(env, "No bots logged yet.", chatId);
        return new Response("OK", { status: 200 });
      }

      const blocks = results.map((b, i) => {
        const loc = [b.city, b.country].filter(Boolean).join(", ") || "?";
        return `🤖 <b>${i + 1}. ${escapeHtml(b.isp_org || "?")}</b> (AS${b.asn || "?"}) · ${escapeHtml(loc)}\n   Reason: <code>${escapeHtml(b.bot_reason || "?")}</code> · ${b.visit_count}x · ${shortTime(b.last_seen)}`;
      });

      await sendTelegramMessage(
        env,
        `🤖 <b>Recent Filtered Bots (${results.length})</b>\n\n${blocks.join("\n\n")}`,
        chatId
      );
      return new Response("OK", { status: 200 });
    }

    if (cmd === "/search") {
      const term = args.join(" ").trim();
      if (!term) {
        await sendTelegramMessage(env, "Usage: <code>/search google</code> or <code>/search resume</code>", chatId);
        return new Response("OK", { status: 200 });
      }

      const like = `%${term}%`;
      const [gRes, vRes] = await Promise.all([
        env.DB.prepare(`
          SELECT name, email, city, country, last_login_at
          FROM gmail_users
          WHERE email LIKE ? OR name LIKE ? OR city LIKE ? OR isp_org LIKE ? OR ref_tag LIKE ?
          ORDER BY last_login_at DESC LIMIT 5
        `)
          .bind(like, like, like, like, like)
          .all(),
        env.DB.prepare(`
          SELECT gmail_email, city, country, isp_org, last_ref_tag, visit_count, last_seen
          FROM visitors
          WHERE is_bot = 0 AND (
            city LIKE ? OR country LIKE ? OR isp_org LIKE ? OR last_ref_tag LIKE ? OR gmail_email LIKE ?
          )
          ORDER BY last_seen DESC LIMIT 5
        `)
          .bind(like, like, like, like, like)
          .all(),
      ]);

      const parts = [`🔎 <b>Search:</b> <code>${escapeHtml(term)}</code>`];

      if (gRes?.results?.length) {
        parts.push(
          `\n🎣 <b>Gmail Matches:</b>\n` +
            gRes.results
              .map(
                (g) =>
                  `• ${escapeHtml(g.name || "?")} — <code>${escapeHtml(g.email)}</code> (${escapeHtml(g.city || "?")}, ${shortTime(g.last_login_at)})`
              )
              .join("\n")
        );
      }

      if (vRes?.results?.length) {
        parts.push(
          `\n👥 <b>Visitor Matches:</b>\n` +
            vRes.results
              .map(
                (v) =>
                  `• ${escapeHtml(v.city || "?")}, ${escapeHtml(v.country || "?")} (${v.visit_count}x) · ${escapeHtml(v.isp_org || "?")}${v.last_ref_tag ? ` · <code>${escapeHtml(v.last_ref_tag)}</code>` : ""}`
              )
              .join("\n")
        );
      }

      if (parts.length === 1) {
        parts.push("\nNo matches found.");
      }

      await sendTelegramMessage(env, parts.join("\n"), chatId);
      return new Response("OK", { status: 200 });
    }

    await sendTelegramMessage(
      env,
      "Unknown command. Send /help to see all commands.",
      chatId
    );
  } catch (err) {
    await sendTelegramMessage(
      env,
      `⚠️ Query error: <code>${escapeHtml(err?.message || err)}</code>`,
      chatId
    );
  }

  return new Response("OK", { status: 200 });
}