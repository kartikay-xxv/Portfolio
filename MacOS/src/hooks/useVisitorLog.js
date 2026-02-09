import { useEffect } from "react";

export default function useVisitorLog() {
  useEffect(() => {
    // Skip logging on localhost
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return;
    }

    const startTime = Date.now();
    let visitId = null;

    const params = new URLSearchParams(window.location.search);
    const refTag = params.get("ref") || params.get("src") || "";

    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "start",
        referrer: document.referrer || "direct",
        ref_tag: refTag,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.id) visitId = data.id;
      })
      .catch(() => {});

    const sendDuration = () => {
      if (!visitId) return;
      const durationSec = Math.round((Date.now() - startTime) / 1000);
      const payload = JSON.stringify({
        action: "end",
        id: visitId,
        duration_sec: durationSec,
      });
      navigator.sendBeacon("/api/log", new Blob([payload], { type: "application/json" }));
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