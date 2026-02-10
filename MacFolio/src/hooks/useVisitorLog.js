import { useEffect } from "react";

const VISITOR_ID_KEY = "macfolio_visitor_id";
const SESSION_KEY = "macfolio_active_session";
const VISITOR_DELAY_MS = 2500;

export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? `v_${crypto.randomUUID()}`
          : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    // Strict privacy browser blocking storage -> backend uses deterministic fallback hash
    return null;
  }
}

function parseBrowserAndOS() {
  const ua = navigator.userAgent || "";
  const uaData = navigator.userAgentData;

  let browser = "Unknown";
  if (uaData?.brands?.length) {
    const picked =
      uaData.brands.find((b) => !/not.?a.?brand|chromium/i.test(b.brand)) ||
      uaData.brands[0];
    browser = `${picked.brand} ${picked.version}`.trim();
  } else if (/Edg\/([\d.]+)/.test(ua)) {
    browser = `Edge ${ua.match(/Edg\/([\d.]+)/)[1]}`;
  } else if (/OPR\/([\d.]+)/.test(ua)) {
    browser = `Opera ${ua.match(/OPR\/([\d.]+)/)[1]}`;
  } else if (/Chrome\/([\d.]+)/.test(ua)) {
    browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/)[1]}`;
  } else if (/Firefox\/([\d.]+)/.test(ua)) {
    browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/)[1]}`;
  } else if (/Safari\/([\d.]+)/.test(ua) && !/Chrome/.test(ua)) {
    const v = ua.match(/Version\/([\d.]+)/)?.[1] || "";
    browser = `Safari ${v}`.trim();
  }

  let os = uaData?.platform || "Unknown";
  if (os === "Unknown") {
    if (/Windows NT 10/i.test(ua)) os = "Windows";
    else if (/Windows/i.test(ua)) os = "Windows";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/Mac OS X/i.test(ua)) os = "macOS";
    else if (/Linux/i.test(ua)) os = "Linux";
  }

  const isMobile =
    typeof uaData?.mobile === "boolean"
      ? uaData.mobile
      : /Mobi|Android|iPhone|iPod/i.test(ua);

  const isTablet = /iPad|Tablet/i.test(ua);
  const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  return { browser, os, isMobile, deviceType };
}

export function collectClientMeta() {
  const params = new URLSearchParams(window.location.search);
  const { browser, os, isMobile, deviceType } = parseBrowserAndOS();

  const dpr = Number((window.devicePixelRatio || 1).toFixed(2));
  const screenWidth = window.screen?.width || 0;
  const screenHeight = window.screen?.height || 0;
  const physWidth = Math.round(screenWidth * dpr);
  const physHeight = Math.round(screenHeight * dpr);

  const viewportWidth = window.innerWidth || 0;
  const viewportHeight = window.innerHeight || 0;

  let clientTimezone = null;
  try {
    clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    // Ignore
  }

  const colorScheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  return {
    refTag: params.get("ref") || null,
    utmSource: params.get("utm_source") || null,
    utmMedium: params.get("utm_medium") || null,
    utmCampaign: params.get("utm_campaign") || null,
    referrer: document.referrer || null,
    landingPath: `${window.location.pathname}${window.location.search}`,

    browser,
    os,
    deviceType,
    isMobile,
    screenWidth,
    viewportWidth,
    screenRes: `${physWidth}x${physHeight}`,
    viewportRes: `${viewportWidth}x${viewportHeight}`,
    dpr,

    language: navigator.language || null,
    languages: Array.isArray(navigator.languages) ? navigator.languages.join(", ") : null,
    clientTimezone,
    cpuCores: navigator.hardwareConcurrency || null,
    deviceMemory: navigator.deviceMemory || null,
    connectionType: navigator.connection?.effectiveType || null,
    colorScheme,
    webdriver: Boolean(navigator.webdriver),
  };
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // Ignore in strict browsers
  }
}

export default function useVisitorLog() {
  useEffect(() => {
    // Skip logging on localhost dev server
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return;
    }

    const client = collectClientMeta();
    const initialVisitorId = getVisitorId();
    const existing = loadSession();

    // Reuse session on refresh unless they arrived with a brand-new ?ref= tag
    const sameSession =
      existing &&
      existing.visitId &&
      (client.refTag === null || client.refTag === existing.refTag);

    let session = sameSession
      ? existing
      : {
          visitId: null,
          visitorId: initialVisitorId,
          visitorLogged: false,
          refTag: client.refTag,
          startedAt: Date.now(),
          lastSentSec: 0,
        };

    let cancelled = false;
    let visitorTimer = null;

    const sendDuration = () => {
      if (!session.visitId && !session.visitorId) return;
      const totalSec = Math.max(0, Math.round((Date.now() - session.startedAt) / 1000));
      const deltaSec = Math.max(0, totalSec - (session.lastSentSec || 0));
      if (deltaSec <= 0) return;

      session.lastSentSec = totalSec;
      saveSession(session);

      const payload = JSON.stringify({
        action: "duration",
        visitId: session.visitId,
        visitorId: session.visitorId,
        durationSec: totalSec,
        deltaSec,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/log", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    const scheduleVisitorLog = () => {
      if (session.visitorLogged || cancelled) return;

      visitorTimer = setTimeout(async () => {
        if (cancelled || document.visibilityState === "hidden" || session.visitorLogged) return;

        try {
          const res = await fetch("/api/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "visitor",
              visitorId: session.visitorId,
              client,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            session.visitorLogged = true;
            if (data?.visitorId) session.visitorId = data.visitorId;
            saveSession(session);
          }
        } catch {
          // Ignore network failures
        }
      }, VISITOR_DELAY_MS);
    };

    // 0s Instant Visit Log (only once per tab session)
    if (!sameSession) {
      fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "visit",
          visitorId: session.visitorId,
          client,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (cancelled || !data) return;
          session.visitId = data.visitId ?? null;
          if (data.visitorId) session.visitorId = data.visitorId;
          saveSession(session);
          scheduleVisitorLog();
        })
        .catch(() => {});
    } else if (!session.visitorLogged) {
      scheduleVisitorLog();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendDuration();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", sendDuration);

    return () => {
      cancelled = true;
      if (visitorTimer) clearTimeout(visitorTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", sendDuration);
    };
  }, []);
}