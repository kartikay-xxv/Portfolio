import {
  formatDuration,
  shortTime,
  verifyDiscordSignature,
} from "../_lib/analytics.js";

const JSON_HEADERS = { "Content-Type": "application/json" };

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function getOption(interaction, name) {
  return interaction.data?.options?.find((o) => o.name === name)?.value;
}

function getCount(interaction) {
  const raw = Number(getOption(interaction, "count"));
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(25, Math.floor(raw));
}

function buildEmbeds(title, blocks, color) {
  const embeds = [];
  let current = "";
  let totalChars = title.length;

  for (const block of blocks) {
    const addition = current ? `\n\n${block}` : block;

    if (totalChars + addition.length > 5800) {
      break;
    }

    if (current.length + addition.length > 3800) {
      embeds.push({
        title: embeds.length === 0 ? title : `${title} (cont.)`,
        description: current,
        color,
      });
      current = block;
      totalChars += block.length + 20;
    } else {
      current += addition;
      totalChars += addition.length;
    }
  }

  if (current) {
    embeds.push({
      title: embeds.length === 0 ? title : `${title} (cont.)`,
      description: current,
      color,
    });
  }

  return embeds;
}

export async function onRequestPost({ request, env }) {
  const rawBody = await request.text();

  // 1. Verify Discord Ed25519 signature
  const isValid = await verifyDiscordSignature(
    request,
    rawBody,
    env.DISCORD_PUBLIC_KEY
  );
  if (!isValid) {
    return new Response("Invalid request signature", { status: 401 });
  }

  let interaction;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // 2. Discord PING check (required when saving Interactions Endpoint URL)
  if (interaction.type === 1) {
    return jsonResponse({ type: 1 });
  }

  // 3. Only handle Application Slash Commands
  if (interaction.type !== 2) {
    return jsonResponse({
      type: 4,
      data: { content: "Unsupported interaction.", flags: 64 },
    });
  }

  // 4. Optional security locks (User ID + #commands Channel ID)
const userId = interaction.member?.user?.id || interaction.user?.id;
if (
  env.DISCORD_USER_ID &&
  String(userId).trim() !== String(env.DISCORD_USER_ID).trim()
) {
  return jsonResponse({
    type: 4,
    data: {
      content: `⛔ Unauthorized user. Discord sent: \`${userId}\``,
      flags: 64,
    },
  });
}

  if (
    env.DISCORD_COMMANDS_CHANNEL_ID &&
    String(interaction.channel_id) !== String(env.DISCORD_COMMANDS_CHANNEL_ID)
  ) {
    return jsonResponse({
      type: 4,
      data: {
        content: `⛔ Run bot commands inside <#${env.DISCORD_COMMANDS_CHANNEL_ID}>.`,
        flags: 64,
      },
    });
  }

  const cmd = interaction.data?.name;

  try {
    // ------------------------------------------------------------------
    // /commands
    // ------------------------------------------------------------------
    if (cmd === "commands") {
      const guide = [
        "**📊 `/stats`**",
        "• **Usage:** `/stats`",
        "• **What it does:** Shows live totals (Unique Humans, Active Last 24h, Gmail Captures, Total Raw Visits, Bots Filtered) plus your top 5 `?ref` tags.",
        "",
        "**👥 `/visitors`**",
        "• **Usage:** `/visitors` *(latest 1)* · `/visitors count:5` *(latest 1–25)*",
        "• **What it does:** Fetches deduplicated human profiles from `visitors` (location, visit count, total time spent, linked Gmail, browser/OS, screen size, ISP, ref tag, last seen).",
        "",
        "**📝 `/visits`**",
        "• **Usage:** `/visits` *(latest 1)* · `/visits count:10` *(latest 1–25)*",
        "• **What it does:** Fetches raw 0s visit logs from `visits` (humans `🟢` and bots `🤖`, session duration, timestamp, browser/OS, ISP, ref tag).",
        "",
        "**🎣 `/gmails`**",
        "• **Usage:** `/gmails` *(latest 1)* · `/gmails count:5` *(latest 1–25)*",
        "• **What it does:** Fetches captured Google OAuth profiles from `gmail_users` (name, email, org domain, login count, location, ISP, device, ref tag, last login).",
        "",
        "**🤖 `/bots`**",
        "• **Usage:** `/bots` *(latest 1)* · `/bots count:10` *(latest 1–25)*",
        "• **What it does:** Fetches filtered bot entries from `visitors` showing ISP, ASN, location, detection `bot_reason`, hit count, and last seen.",
        "",
        "**🔎 `/search`**",
        "• **Usage:** `/search query:resume` · `/search query:gmail.com` · `/search query:mumbai`",
        "• **What it does:** Searches up to 5 matches each across `gmail_users` and human `visitors` by email, name, city, country, ISP, or ref tag.",
        "",
        "**📖 `/commands`**",
        "• **Usage:** `/commands`",
        "• **What it does:** Displays this full command list and usage guide.",
      ].join("\n");

      return jsonResponse({
        type: 4,
        data: {
          embeds: [
            {
              title: "🤖 MacFolio Bot — All Commands & Usage",
              description: guide,
              color: 0x5865f2,
              footer: {
                text: "Tip: List commands default to 1 record and accept count from 1 to 25.",
              },
            },
          ],
        },
      });
    }

    // ------------------------------------------------------------------
    // /stats
    // ------------------------------------------------------------------
    if (cmd === "stats") {
      const todayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [humans, bots, totalVisits, gmails, last24h, topRefs] =
        await Promise.all([
          env.DB.prepare(
            "SELECT COUNT(*) AS c FROM visitors WHERE is_bot = 0"
          ).first(),
          env.DB.prepare(
            "SELECT COUNT(*) AS c FROM visitors WHERE is_bot = 1"
          ).first(),
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
        (r) => `• \`${r.tag}\`: **${r.c}**`
      );

      const description = [
        `👥 **Unique Humans:** ${humans?.c ?? 0}`,
        `⚡ **Active Last 24h:** ${last24h?.c ?? 0}`,
        `🎣 **Gmail Captures:** ${gmails?.c ?? 0}`,
        `📝 **Total Raw Visits:** ${totalVisits?.c ?? 0}`,
        `🤖 **Bots Filtered:** ${bots?.c ?? 0}`,
        refLines.length ? `\n🏷 **Top Ref Tags:**\n${refLines.join("\n")}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      return jsonResponse({
        type: 4,
        data: {
          embeds: [
            {
              title: "📊 MacFolio Live Stats",
              description,
              color: 0x3b82f6,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      });
    }

    // ------------------------------------------------------------------
    // /visitors [count] (default 1, max 25)
    // ------------------------------------------------------------------
    if (cmd === "visitors") {
      const limit = getCount(interaction);
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
        return jsonResponse({
          type: 4,
          data: { content: "No human visitors logged yet." },
        });
      }

      const blocks = results.map((v, i) => {
        const loc = [v.city, v.country].filter(Boolean).join(", ") || "?";
        return [
          `**${i + 1}. ${loc}** (${v.visit_count}x · ${formatDuration(v.total_duration_sec)})`,
          v.gmail_email ? `📧 \`${v.gmail_email}\`` : null,
          `💻 ${v.browser || "?"} / ${v.os || "?"} · ${v.screen_res || "?"}`,
          `🌐 ${v.isp_org || "?"}${v.last_ref_tag ? ` · 🏷 \`${v.last_ref_tag}\`` : ""}`,
          `🕒 ${shortTime(v.last_seen)}`,
        ]
          .filter(Boolean)
          .join("\n");
      });

      const title =
        results.length === 1
          ? "👥 Latest Unique Visitor"
          : `👥 Latest ${results.length} Unique Visitors`;

      return jsonResponse({
        type: 4,
        data: { embeds: buildEmbeds(title, blocks, 0x22c55e) },
      });
    }

    // ------------------------------------------------------------------
    // /visits [count] (default 1, max 25)
    // ------------------------------------------------------------------
    if (cmd === "visits") {
      const limit = getCount(interaction);
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
        return jsonResponse({
          type: 4,
          data: { content: "No visits logged yet." },
        });
      }

      const blocks = results.map((v, i) => {
        const loc = [v.city, v.country].filter(Boolean).join(", ") || "?";
        const badge = v.is_bot ? "🤖" : "🟢";
        return [
          `${badge} **${i + 1}. ${loc}** · ${formatDuration(v.duration_sec)} · ${shortTime(v.visited_at)}`,
          `💻 ${v.browser || "?"} / ${v.os || "?"} · 🌐 ${v.isp_org || "?"}`,
          v.ref_tag ? `🏷 \`${v.ref_tag}\`` : null,
        ]
          .filter(Boolean)
          .join("\n");
      });

      const title =
        results.length === 1
          ? "📝 Latest Raw Visit"
          : `📝 Latest ${results.length} Raw Visits`;

      return jsonResponse({
        type: 4,
        data: { embeds: buildEmbeds(title, blocks, 0x06b6d4) },
      });
    }

    // ------------------------------------------------------------------
    // /gmails [count] (default 1, max 25)
    // ------------------------------------------------------------------
    if (cmd === "gmails") {
      const limit = getCount(interaction);
      const { results } = await env.DB.prepare(`
        SELECT name, email, hosted_domain, login_count, last_login_at,
               city, country, isp_org, browser, os, ref_tag
        FROM gmail_users
        ORDER BY last_login_at DESC
        LIMIT ?
      `)
        .bind(limit)
        .all();

      if (!results?.length) {
        return jsonResponse({
          type: 4,
          data: { content: "No Gmail users captured yet 🎣" },
        });
      }

      const blocks = results.map((g, i) => {
        const loc = [g.city, g.country].filter(Boolean).join(", ") || "?";
        return [
          `**${i + 1}. ${g.name || "Unknown"}** (${g.login_count}x)`,
          `📧 \`${g.email}\`${g.hosted_domain ? ` (${g.hosted_domain})` : ""}`,
          `📍 ${loc} · ${g.isp_org || "?"}`,
          `💻 ${g.browser || "?"} / ${g.os || "?"}${g.ref_tag ? ` · 🏷 \`${g.ref_tag}\`` : ""}`,
          `🕒 ${shortTime(g.last_login_at)}`,
        ].join("\n");
      });

      const title =
        results.length === 1
          ? "🎣 Latest Captured Gmail User"
          : `🎣 Latest ${results.length} Captured Gmail Users`;

      return jsonResponse({
        type: 4,
        data: { embeds: buildEmbeds(title, blocks, 0xf59e0b) },
      });
    }

    // ------------------------------------------------------------------
    // /bots [count] (default 1, max 25)
    // ------------------------------------------------------------------
    if (cmd === "bots") {
      const limit = getCount(interaction);
      const { results } = await env.DB.prepare(`
        SELECT last_seen, visit_count, bot_reason, city, country, isp_org, asn
        FROM visitors
        WHERE is_bot = 1
        ORDER BY last_seen DESC
        LIMIT ?
      `)
        .bind(limit)
        .all();

      if (!results?.length) {
        return jsonResponse({
          type: 4,
          data: { content: "No bots logged yet." },
        });
      }

      const blocks = results.map((b, i) => {
        const loc = [b.city, b.country].filter(Boolean).join(", ") || "?";
        return `🤖 **${i + 1}. ${b.isp_org || "?"}** (AS${b.asn || "?"}) · ${loc}\nReason: \`${b.bot_reason || "?"}\` · ${b.visit_count}x · ${shortTime(b.last_seen)}`;
      });

      const title =
        results.length === 1
          ? "🤖 Latest Filtered Bot"
          : `🤖 Latest ${results.length} Filtered Bots`;

      return jsonResponse({
        type: 4,
        data: { embeds: buildEmbeds(title, blocks, 0x64748b) },
      });
    }

    // ------------------------------------------------------------------
    // /search <query>
    // ------------------------------------------------------------------
    if (cmd === "search") {
      const term = String(getOption(interaction, "query") || "").trim();
      if (!term) {
        return jsonResponse({
          type: 4,
          data: { content: "Provide a search term.", flags: 64 },
        });
      }

      const like = `%${term}%`;
      const [gRes, vRes] = await Promise.all([
        env.DB.prepare(`
          SELECT name, email, city, last_login_at
          FROM gmail_users
          WHERE email LIKE ? OR name LIKE ? OR city LIKE ? OR isp_org LIKE ? OR ref_tag LIKE ?
          ORDER BY last_login_at DESC LIMIT 5
        `)
          .bind(like, like, like, like, like)
          .all(),
        env.DB.prepare(`
          SELECT city, country, isp_org, last_ref_tag, visit_count, last_seen
          FROM visitors
          WHERE is_bot = 0 AND (
            city LIKE ? OR country LIKE ? OR isp_org LIKE ? OR last_ref_tag LIKE ? OR gmail_email LIKE ?
          )
          ORDER BY last_seen DESC LIMIT 5
        `)
          .bind(like, like, like, like, like)
          .all(),
      ]);

      const sections = [];

      if (gRes?.results?.length) {
        sections.push(
          `**🎣 Gmail Matches:**\n` +
            gRes.results
              .map(
                (g) =>
                  `• ${g.name || "?"} — \`${g.email}\` (${g.city || "?"}, ${shortTime(g.last_login_at)})`
              )
              .join("\n")
        );
      }

      if (vRes?.results?.length) {
        sections.push(
          `**👥 Visitor Matches:**\n` +
            vRes.results
              .map(
                (v) =>
                  `• ${v.city || "?"}, ${v.country || "?"} (${v.visit_count}x) · ${v.isp_org || "?"}${v.last_ref_tag ? ` · \`${v.last_ref_tag}\`` : ""}`
              )
              .join("\n")
        );
      }

      return jsonResponse({
        type: 4,
        data: {
          embeds: [
            {
              title: `🔎 Search: ${term}`,
              description: sections.length
                ? sections.join("\n\n")
                : "No matches found.",
              color: 0x8b5cf6,
            },
          ],
        },
      });
    }

    return jsonResponse({
      type: 4,
      data: { content: "Unknown command. Try `/commands`.", flags: 64 },
    });
  } catch (err) {
    return jsonResponse({
      type: 4,
      data: {
        embeds: [
          {
            title: "⚠️ Query Error",
            description: `\`${String(err?.message || err)}\``,
            color: 0xef4444,
          },
        ],
        flags: 64,
      },
    });
  }
}