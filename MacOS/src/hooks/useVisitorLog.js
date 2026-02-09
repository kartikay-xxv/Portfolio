import { useEffect } from "react";

async function getClientHintsSafe() {
  const uaData = navigator.userAgentData;
  if (!uaData) return null;

  const base = {
    brands: uaData.brands || [],
    mobile: Boolean(uaData.mobile),
    platform: uaData.platform || "",
    platformVersion: "",
  };

  if (typeof uaData.getHighEntropyValues === "function") {
    try {
      const high = await uaData.getHighEntropyValues(["platformVersion"]);
      if (high?.platformVersion) {
        base.platformVersion = high.platformVersion;
      }
    } catch {
      // Ignore if blocked or unavailable
    }
  }

  return base;
}

export default function useVisitorLog() {
  useEffect(() => {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return;
    }

    const startTime = Date.now();
    let visitId = null;

    const params = new URLSearchParams(window.location.search);
    const refTag = params.get("ref") || params.get("src") || "";
    const utmSource = params.get("utm_source") || "";
    const utmCampaign = params.get("utm_campaign") || "";

    const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
    const viewportRes = `${window.innerWidth || 0}x${window.innerHeight || 0}`;
    const language = navigator.language || "";
    const languages = Array.isArray(navigator.languages)
      ? navigator.languages.join(", ")
      : language;
    let clientTimezone = "";
    try {
      clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
      clientTimezone = "";
    }

    (async () => {
      const clientHints = await getClientHintsSafe();
      try {
        const res = await fetch("/api/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "start",
            ref_tag: refTag,
            utm_source: utmSource,
            utm_campaign: utmCampaign,
            referrer: document.referrer || "direct",
            landing_path: window.location.pathname || "/",
            screen_res: screenRes,
            viewport_res: viewportRes,
            language,
            languages,
            client_timezone: clientTimezone,
            client_hints: clientHints,
          }),
        });
        const data = await res.json();
        if (data?.id) visitId = data.id;
      } catch {
        // Ignore network errors
      }
    })();

    const sendDuration = () => {
      if (!visitId) return;
      const durationSec = Math.max(0, Math.round((Date.now() - startTime) / 1000));
      const payload = JSON.stringify({
        action: "end",
        id: visitId,
        duration_sec: durationSec,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/log",
          new Blob([payload], { type: "application/json" })
        );
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") sendDuration();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", sendDuration);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", sendDuration);
    };
  }, []);
}