import { useEffect } from 'react';
import Header from './components/Header.jsx';
import PageIntro from './components/PageIntro.jsx';
import Footer from './components/Footer.jsx';
import { loadCourseScript } from './scriptLoader.js';

export default function App() {
  // Runs once, after React's first commit — guaranteeing #course/#glossary/
  // the progress-box are already in the DOM before course.js (which queries
  // them synchronously, no DOMContentLoaded wrapper) starts running.
  useEffect(() => {
    loadCourseScript();
  }, []);

  return (
    <>
      <Header />
      <div className="wrap">
        <PageIntro />

        <div className="disclaimer">
          <strong>⚠️ Educational only — not financial advice.</strong> Crypto markets are highly volatile and you can lose your entire capital, especially with leverage. Nothing here is a recommendation to buy, sell, or hold any asset. Never trade with money you can't afford to lose. Verify everything yourself before risking real funds.
        </div>

        <div className="progress-box">
          <b id="pcount">0 / 0</b>
          <div className="bar"><i id="pbar"></i></div>
          <span id="ppct" style={{ color: 'var(--muted)', minWidth: '42px' }}>0%</span>
          <button className="reset" onClick={() => window.resetProgress()}>Reset progress</button>
        </div>

        <div id="course"></div>

        <details className="glossary">
          <summary>📖 Quick glossary</summary>
          <dl id="glossary"></dl>
        </details>
      </div>
      <Footer />
    </>
  );
}
