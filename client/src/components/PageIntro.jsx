// Title/tagline/stats/quiz-score readout — previously the hero banner's
// content, now a plain page intro above the course list. IDs are set by
// src/js/course.js (statTracks/statModules/quizCorrect/etc.) — keep as-is.
export default function PageIntro() {
  return (
    <div className="page-intro">
      <h1>CryptoPro <span>Training</span></h1>
      <p>Crypto Trading Micro-Learning — bite-sized modules from spot basics to leverage and risk management, filtered to your level.</p>
      <div className="banner-stats">
        <span id="statTracks">📚 … tracks</span>
        <span id="statModules">🔗 … video-link + reading modules</span>
        <span>✅ progress saved automatically</span>
      </div>
      <div className="quizbar" id="quizbar">
        <span className="qb-label">🧠 Quiz score</span>
        <span>✅ <b id="quizCorrect">0</b> correct</span>
        <span>❌ <b id="quizWrong">0</b> incorrect</span>
        <span className="qb-acc">🎯 <b id="quizAcc">—</b> accuracy</span>
        <span className="qb-muted"><b id="quizTotal">0</b> answered</span>
      </div>
    </div>
  );
}
