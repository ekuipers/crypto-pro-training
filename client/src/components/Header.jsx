// Slim utility header — same bar height/padding/font convention as
// CryptoPro Trader and Charts (Suite CLAUDE.md rule 17). Element IDs below
// (themes/tname/levels/lvlDesc) are queried directly by src/js/course.js's
// setTheme()/setLevel()/applyLevel() — keep them exactly as-is.
const THEMES = [
  { id: 'dark', label: 'Dark', swatch: 'linear-gradient(135deg,#141a24 50%,#f7931a 50%)' },
  { id: 'light', label: 'Light', swatch: 'linear-gradient(135deg,#ffffff 50%,#e8820e 50%)' },
  { id: 'ocean', label: 'Ocean', swatch: 'linear-gradient(135deg,#0d2233 50%,#38bdf8 50%)' },
  { id: 'forest', label: 'Forest', swatch: 'linear-gradient(135deg,#10211a 50%,#4ade80 50%)' },
  { id: 'grape', label: 'Grape', swatch: 'linear-gradient(135deg,#1e1330 50%,#c084fc 50%)' },
];

const LEVELS = [
  { l: '1', label: '🟢 Beginner' },
  { l: '2', label: '🟡 Intermediate' },
  { l: '3', label: '🔴 Advanced' },
  { l: 'all', label: '🔷 All levels' },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="brand">
        <img src="/favicon.svg" alt="CryptoPro Training logo" />
        <span className="brand-cp">CryptoPro</span> Training
      </div>

      <div className="header-right">
        <div className="themes" id="themes">
          <span className="tname" id="tname">Dark</span>
          {THEMES.map((t) => (
            <button
              key={t.id}
              className="swatch"
              data-theme={t.id}
              title={t.label}
              onClick={() => window.setTheme(t.id)}
              style={{ background: t.swatch }}
            />
          ))}
        </div>

        <div className="levelpick">
          <span className="lvl-title">🎯 Level</span>
          <div className="levels" id="levels">
            {LEVELS.map((lv) => (
              <button key={lv.l} data-l={lv.l} onClick={() => window.setLevel(lv.l === 'all' ? 'all' : Number(lv.l))}>
                {lv.label}
              </button>
            ))}
          </div>
          <span className="lvl-desc" id="lvlDesc"></span>
        </div>
      </div>
    </header>
  );
}
