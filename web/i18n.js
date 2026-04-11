// ── Shared i18n helper for all helix modules ─────────────────────
// Uses localStorage key 'helix_lang' (same as karyotype module).
// Modules register their own dictionaries via registerI18n(dict).
// Current language is exposed on window.helixLang and emits a
// 'helix:lang-changed' custom event when it changes.

(function () {
  const KEY = 'helix_lang';
  const DEFAULT = 'de';

  function getLang() {
    try {
      return localStorage.getItem(KEY) || DEFAULT;
    } catch (_) {
      return DEFAULT;
    }
  }

  function setLang(lang) {
    if (lang !== 'de' && lang !== 'en') return;
    try {
      localStorage.setItem(KEY, lang);
    } catch (_) {}
    window.helixLang = lang;
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent('helix:lang-changed', { detail: { lang } }));
  }

  function toggleLang() {
    setLang(getLang() === 'de' ? 'en' : 'de');
  }

  // Module dictionaries get merged here
  const DICTS = { de: {}, en: {} };

  function registerI18n(dict) {
    if (dict.de) Object.assign(DICTS.de, dict.de);
    if (dict.en) Object.assign(DICTS.en, dict.en);
  }

  function t(key) {
    const lang = getLang();
    return (DICTS[lang] && DICTS[lang][key]) || DICTS.de[key] || key;
  }

  // Wire up any element with id="lang-toggle" automatically
  function initLangToggle() {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;
    const updateLabel = () => {
      btn.textContent = getLang().toUpperCase();
    };
    updateLabel();
    btn.addEventListener('click', () => {
      toggleLang();
      updateLabel();
    });
    window.addEventListener('helix:lang-changed', updateLabel);
  }

  // Expose
  window.helixI18n = { getLang, setLang, toggleLang, registerI18n, t, initLangToggle };
  window.helixLang = getLang();
  document.documentElement.lang = getLang();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLangToggle);
  } else {
    initLangToggle();
  }
})();
