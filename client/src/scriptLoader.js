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
