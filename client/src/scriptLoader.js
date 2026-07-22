// Loads src/js/course.js (served at /js/course.js) as a classic, non-module
// script — same mechanism CryptoPro Trader uses for its dashboard scripts.
// It must load *after* React's first render puts #course/#glossary/the
// header controls in the document, since it queries them synchronously as
// soon as it runs (no DOMContentLoaded wrapper) — see App.jsx's useEffect.
let started = false;

export function loadCourseScript() {
  if (started) return;
  started = true;
  const el = document.createElement('script');
  el.src = '/js/course.js';
  document.body.appendChild(el);
}

// Loads src/js/auth.js (Suite SSO account button + sign-in modal) as a
// classic, non-module script, same mechanism as loadCourseScript() above.
// src/js/qrcode-lib.js (vendored QR encoder, used by auth.js's 2FA setup
// modal) loads alongside it — order relative to auth.js doesn't matter since
// auth.js only reads window.qrcode later, when the user opens that modal.
let authStarted = false;

export function loadAuthScript() {
  if (authStarted) return;
  authStarted = true;
  for (const src of ['/js/qrcode-lib.js', '/js/auth.js']) {
    const el = document.createElement('script');
    el.src = src;
    document.body.appendChild(el);
  }
}
