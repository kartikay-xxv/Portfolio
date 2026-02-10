const CLOUD_ASNS = new Set([
  16509, // Amazon AWS
  14618, // Amazon AWS
  15169, // Google Cloud / Googlebot
  396982, // Google Cloud
  8075,  // Microsoft Azure
  14061, // DigitalOcean
  16276, // OVH
  24940, // Hetzner
  63949, // Akamai / Linode
  20473, // Vultr
  31898, // Oracle Cloud
  45102, // Alibaba Cloud
  132203, // Tencent Cloud
  13335, // Cloudflare
  54113, // Fastly
  12876, // Scaleway
  51167, // Contabo
  212238, // Datacamp / CDN77
]);

const BOT_UA_REGEX =
  /bot|crawler|spider|headless|puppeteer|playwright|selenium|phantomjs|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake|curl|wget|python-requests|aiohttp|go-http-client|axios|node-fetch|facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|discordbot|telegrambot|applebot|bingpreview|ahrefs|semrush|mj12bot|dotbot|petalbot|yandex|bytespider|gptbot|claudebot|oai-searchbot/i;

export function n(val) {
  return val === undefined || val === "" ? null : val;
}

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatDuration(totalSec) {
  const sec = Math.max(0, Math.round(Number(totalSec) || 0));
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}

export function extractCfMeta(request) {
  const cf = request.cf || {};
  const headers = request.headers;

  const ip =
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null;

  const ua = headers.get("user-agent") || "";

  return {
    ip,
    isp_org: cf.asOrganization || null,
    asn: typeof cf.asn === "number" ? cf.asn : cf.asn ? Number(cf.asn) : null,
    continent: cf.continent || null,
    country: cf.country || null,
    region: cf.region || null,
    city: cf.city || null,
    postal_code: cf.postalCode || null,
    latitude: cf.latitude ? String(cf.latitude) : null,
    longitude: cf.longitude ? String(cf.longitude) : null,
    cf_timezone: cf.timezone || null,
    cf_colo: cf.colo || null,
    http_protocol: cf.httpProtocol || null,
    tls_version: cf.tlsVersion || null,
    user_agent: ua || null,
  };
}

export function detectBot(cfMeta, client = {}) {
  const reasons = [];

  if (cfMeta.asn && CLOUD_ASNS.has(cfMeta.asn)) {
    reasons.push(`cloud_asn:${cfMeta.asn}`);
  }

  if (cfMeta.user_agent && BOT_UA_REGEX.test(cfMeta.user_agent)) {
    reasons.push("bot_ua");
  }

  if (client.webdriver === true) {
    reasons.push("webdriver");
  }

  // Headless signature: viewport larger than reported screen (e.g., 1366x768 inside 800x600)
  if (
    client.screenWidth > 0 &&
    client.viewportWidth > 0 &&
    client.viewportWidth > client.screenWidth + 20
  ) {
    reasons.push("viewport_gt_screen");
  }

  // Missing UA completely
  if (!cfMeta.user_agent) {
    reasons.push("empty_ua");
  }

  return {
    isBot: reasons.length > 0 ? 1 : 0,
    botReason: reasons.length > 0 ? reasons.join(",") : null,
  };
}

export async function resolveVisitorId(clientVisitorId, cfMeta, client = {}) {
  if (
    typeof clientVisitorId === "string" &&
    clientVisitorId.length >= 8 &&
    clientVisitorId.length <= 80
  ) {
    return { visitorId: clientVisitorId, idSource: "localStorage" };
  }

  // Bulletproof fallback when localStorage is blocked: hash(ip + os + browser)
  const seed = `${cfMeta.ip || "noip"}|${client.os || "noos"}|${client.browser || "nobrowser"}`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(seed)
  );
  const hashHex = Array.from(new Uint8Array(digest))
    .slice(0, 10)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { visitorId: `fb_${hashHex}`, idSource: "fallback_hash" };
}

export async function sendTelegramMessage(env, htmlText, chatIdOverride = null) {
  const token = env?.TELEGRAM_BOT_TOKEN;
  const chatId = chatIdOverride || env?.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const safeText =
    htmlText.length > 4000 ? `${htmlText.slice(0, 3980)}\n\n<i>...(truncated)</i>` : htmlText;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: safeText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch {
    // Never break logging if Telegram is temporarily unreachable
  }
}