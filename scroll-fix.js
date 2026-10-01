(function () {
  const KEY = 'rj-form-scroll-y';
  let pendingY = null;

  function savePosition(e) {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    pendingY = window.scrollY || window.pageYOffset || 0;
    try { sessionStorage.setItem(KEY, String(pendingY)); } catch (_) {}

    const restore = () => {
      if (typeof pendingY !== 'number') return;
      window.scrollTo({ top: pendingY, left: 0, behavior: 'auto' });
    };
    [0, 50, 150, 300, 600, 1000].forEach(ms => setTimeout(restore, ms));
  }

  function restoreOnLoad() {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw === null) return;
      const y = Number(raw);
      if (!Number.isFinite(y)) return;
      sessionStorage.removeItem(KEY);
      pendingY = y;
      [0, 50, 150, 300, 600, 1000].forEach(ms => setTimeout(() => {
        window.scrollTo({ top: y, left: 0, behavior: 'auto' });
      }, ms));
    } catch (_) {}
  }

  function removeSponsorButton() {
    const button = document.querySelector('.placeholder-action');
    if (button) button.remove();
  }

  document.addEventListener('submit', savePosition, true);
  window.addEventListener('pageshow', restoreOnLoad);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      restoreOnLoad();
      removeSponsorButton();
    }, { once: true });
  } else {
    restoreOnLoad();
    removeSponsorButton();
  }
})();
