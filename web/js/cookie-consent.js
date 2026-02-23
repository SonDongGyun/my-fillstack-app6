(function(){
  const STORAGE_KEY = "cookieConsentChoice";

  function $(id){ return document.getElementById(id); }

  function hideBanner(){
    const banner = $("cookieConsentBanner");
    if (!banner) return;
    banner.style.display = "none";
  }

  function saveChoice(choice){
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (_) {}
    window.__COOKIE_CONSENT__ = choice;
    hideBanner();
  }

  function loadChoice(){
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }

  function init(){
    const banner = $("cookieConsentBanner");
    if (!banner) return;

    const existing = loadChoice();
    if (existing === "all" || existing === "essential") {
      window.__COOKIE_CONSENT__ = existing;
      hideBanner();
      return;
    }

    banner.style.display = "block";

    const allBtn = $("cookieAllowAllBtn");
    const essentialBtn = $("cookieEssentialOnlyBtn");

    if (allBtn) allBtn.addEventListener("click", () => saveChoice("all"));
    if (essentialBtn) essentialBtn.addEventListener("click", () => saveChoice("essential"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
