// Suite-consistent footer (favicon-as-logo, same font/padding as Trader's
// footer). #statFooter and #courseVersion are set by src/js/course.js.
export default function Footer() {
  return (
    <footer className="site-footer">
      <span className="footer-name">
        <img src="/favicon.svg" alt="" className="footer-logo-icon" />
        <span className="brand-cp">CryptoPro</span> Training
      </span>
      <span className="footer-sep">·</span>
      <span id="statFooter">… tracks · … modules</span>
      <span className="footer-sep">·</span>
      <span>external video links + reading per module</span>
      <span className="footer-sep">·</span>
      <span>Creator: <strong>Erik Kuipers</strong></span>
      <span className="footer-sep">·</span>
      <span className="footer-studio">
        <img src="/studio-logo.png" alt="" className="footer-logo-icon" />
        Developer Studio: <strong>SoftVibe Studio</strong>
      </span>
      <span className="footer-sep">·</span>
      <span>Version: <strong id="courseVersion"></strong></span>
      <a className="footer-donate" href="https://patreon.com/vibesoftstudio" target="_blank" rel="noopener">♥ Support</a>
    </footer>
  );
}
