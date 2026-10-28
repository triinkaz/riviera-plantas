(() => {
  const measurementId = "G-583S2XR92X";
  const configured = /^G-[A-Z0-9]+$/.test(measurementId);
  const consentKey = "riviera-analytics-consent-v1";
  const banner = document.getElementById("analytics-consent");
  const preferences = document.getElementById("analytics-preferences");
  let choice = null;
  let started = false;

  try { choice = localStorage.getItem(consentKey); } catch {}

  function startAnalytics() {
    if (!configured || started || choice !== "accepted") return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(script);
  }

  function setChoice(value) {
    const wasStarted = started;
    choice = value;
    try { localStorage.setItem(consentKey, value); } catch {}
    banner.hidden = true;
    if (value === "accepted" && wasStarted) window.gtag("consent", "update", { analytics_storage: "granted" });
    else if (value === "accepted") startAnalytics();
    else if (started) window.gtag("consent", "update", { analytics_storage: "denied" });
  }

  window.rivieraAnalytics = Object.freeze({
    track(name, parameters = {}) {
      if (choice === "accepted" && started) window.gtag("event", name, parameters);
    }
  });

  if (!configured) return;
  preferences.hidden = false;
  document.getElementById("analytics-accept").addEventListener("click", () => setChoice("accepted"));
  document.getElementById("analytics-reject").addEventListener("click", () => setChoice("rejected"));
  preferences.addEventListener("click", () => { banner.hidden = false; banner.querySelector("button").focus(); });
  if (choice === "accepted") startAnalytics();
  else if (choice !== "rejected") banner.hidden = false;
})();
