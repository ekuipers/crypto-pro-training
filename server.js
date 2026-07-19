// CryptoPro Training — Node.js entrypoint.
// Serves the course's built React app (client/dist, built via `npm run
// build` -> `vite build`), plus its CSS/JS from src/css and src/js (the
// course content + interactive logic, loaded as a classic script after
// React mounts — see client/src/scriptLoader.js), and remaining static
// assets (favicons, trading-journal.xlsx) from /docs.
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: pkg.version, time: new Date().toISOString() });
});

app.use('/js', express.static(join(__dirname, 'src', 'js')));
app.use('/css', express.static(join(__dirname, 'src', 'css')));
app.use(express.static(join(__dirname, 'client', 'dist')));
app.use(express.static(join(__dirname, 'docs')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'client', 'dist', 'index.html'));
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CryptoPro Training listening on http://localhost:${PORT}`);
  });
}

export default app;
