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

export function shortTime(iso) {
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
    return String(iso).slice(0, 16);
  }
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

  if (
    client.screenWidth > 0 &&
    client.viewportWidth > 0 &&
    client.viewportWidth > client.screenWidth + 20
  ) {
    reasons.push("viewport_gt_screen");
  }

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

export async function sendDiscordWebhook(webhookUrl, embed) {
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch {
    // Never break logging if Discord is temporarily unreachable
  }
}

function hexToBytes(hex) {
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    return null;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export async function verifyDiscordSignature(request, rawBody, publicKeyHex) {
  const signatureHex = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");
  if (!signatureHex || !timestamp || !publicKeyHex) return false;

  const publicKeyBytes = hexToBytes(publicKeyHex);
  const signatureBytes = hexToBytes(signatureHex);
  if (!publicKeyBytes || !signatureBytes) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      publicKeyBytes,
      { name: "Ed25519" },
      false,
      ["verify"]
    );
    const message = new TextEncoder().encode(timestamp + rawBody);
    return await crypto.subtle.verify("Ed25519", key, signatureBytes, message);
  } catch {
    return false;
  }
}