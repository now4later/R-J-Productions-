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

  function applyClientUpdates() {
    const concerts = document.querySelector('#concerts .soon-panel');
    if (concerts) {
      concerts.innerHTML = '<div class="icon" aria-hidden="true">🎷</div><div class="eyebrow">NEXT BLUE ROOM PERFORMANCE</div><h2>R&amp;J Productions at The Blue Room</h2><p>Join R&amp;J Productions for the next live performance at The Blue Room. Bring your family, friends, and neighbors for an evening of music, laughter, and community.</p><div class="soon-fields"><div class="soon-field">📅 Friday, December 18, 2026</div><div class="soon-field">⏰ 8:30 PM — 11:00 PM</div><div class="soon-field">📍 The Blue Room · Kansas City, MO</div><div class="soon-field">🎤 R&amp;J Playerz Band</div></div><a href="#contact" class="btn btn-gold">Contact R&amp;J Productions</a>';
    }

    const about = document.querySelector('#about .about-wrap .reveal:last-child');
    if (about) {
      const paragraphs = about.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'R&amp;J Productions — W Entertainment dba R&amp;J Productions LLC — is dedicated to bringing quality, family-friendly entertainment to our community through free live concerts.';
      if (![...paragraphs].some(p => p.textContent.includes('Our goal is to create a safe, welcoming environment'))) {
        about.insertAdjacentHTML('beforeend', '<p>Our goal is to create a safe, welcoming environment where families, friends, and neighbors can come together to enjoy music, laughter, and community spirit!</p><p><strong>For further information, please call <a href="tel:7852213720">785-221-3720</a> for Rhonda. She is our Manager.</strong></p>');
      }
    }

    const contact = document.querySelector('#contact .contact-grid > .reveal');
    if (contact && !contact.querySelector('[data-rj-manager]')) {
      contact.insertAdjacentHTML('beforeend', '<p data-rj-manager style="margin-top:18px;color:var(--text-muted);"><strong style="color:var(--text);">Manager:</strong> Rhonda · <a href="tel:7852213720" style="color:var(--gold);font-weight:700;">785-221-3720</a></p>');
    }

    const footerBrand = document.querySelector('.footer-brand p');
    if (footerBrand) footerBrand.textContent = 'W Entertainment dba R&J Productions LLC. Free live concerts, family-friendly entertainment, and community.';
    const footerThanks = document.querySelector('.footer-thanks b');
    if (footerThanks) footerThanks.textContent = '🎷W Entertainment — dba R&J Productions LLC';

    const nav = document.querySelector('.nav-links');
    const videos = document.querySelector('#videos');
    if (nav && videos && !document.querySelector('#band')) {
      const section = document.createElement('section');
      section.className = 'section band-dark';
      section.id = 'band';
      section.innerHTML = '<div class="wrap"><div class="section-head"><div class="eyebrow">R&amp;J PLAYERZ BAND</div><h2>Meet the band.</h2><p>The talented musicians and performers who bring the R&amp;J Playerz sound to the stage.</p></div><div class="lineup"><div class="ph-label"><b>Adriene McGinnis</b>Lead Vocals</div><div class="ph-label"><b>Taylor Johnson</b>Lead Guitar</div><div class="ph-label"><b>Joe Kingcannon Jr.</b>Bass</div><div class="ph-label"><b>Matthew Fields</b>Keyboards · “Bumpy”</div><div class="ph-label"><b>Joseph Wakefield</b>Sax / Keys / Vocals · “Red”</div></div></div>';
      videos.parentNode.insertBefore(section, videos);
    }
  }

  document.addEventListener('submit', savePosition, true);
  window.addEventListener('pageshow', restoreOnLoad);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      restoreOnLoad();
      removeSponsorButton();
      applyClientUpdates();
    }, { once: true });
  } else {
    restoreOnLoad();
    removeSponsorButton();
    applyClientUpdates();
  }
})();
