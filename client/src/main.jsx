import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// No <React.StrictMode>: course.js is legacy imperative code (direct DOM
// mutation, a localStorage-backed progress/quiz state) never written to
// tolerate StrictMode's double-invoke-then-cleanup of effects in dev.
createRoot(document.getElementById('root')).render(<App />);
