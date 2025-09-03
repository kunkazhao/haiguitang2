# Repository Guidelines

## Project Structure & Modules
- Root: static React pages served by a tiny Node HTTP server (`server.js`).
- Pages: `index.html` (list), `riddle.html` (detail), `add-riddle.html` (create).
- Scripts: `app.js`, `riddle-app.js`, `add-riddle-app.js`.
- Components: `components/*.js` (e.g., `Header.js`, `RiddleList.js`).
- Utilities: `utils/` (`storage.js`, `imageGenerator.js`, `envConfig.js`).
- Data: `data/sampleData.js` (seed for LocalStorage).
- Tooling: `run.ps1`/`run.bat` (portable Node runner), `.env.example` for config.

## Build, Test, and Development Commands
- Start (Node installed): `npm start` → runs `server.js` at `http://localhost:5173`.
- Start (portable on Windows): `./run.bat 5173` or `pwsh ./run.ps1 -Port 5173`.
- Custom port: `node server.js --port=8080`.

## Coding Style & Naming Conventions
- JavaScript, 2‑space indentation, semicolons required, single quotes or consistent quoting.
- React 18 via in‑browser Babel (`type="text/babel"`), functional components preferred.
- Filenames: Components in `components/` use `PascalCase.js`; utilities use `camelCase` exports.
- Keep UI text in Chinese to match current pages; avoid introducing frameworks/bundlers.

## Testing Guidelines
- No test framework configured. Do manual QA before PR:
  - List page: search, filter, and card navigation work.
  - Detail page: answer toggle and metadata render.
  - Create page: add riddle, LocalStorage persistence, and optional image generation.
- Run locally and test in a private window to validate LocalStorage flows.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject (e.g., "feat: add difficulty filter", "fix: prevent XSS in titles").
- PRs: include purpose, scope, screenshots/GIFs for UI, steps to verify, and linked issues.
- Keep PRs small and focused; note any data migrations for LocalStorage.

## Security & Configuration Tips
- Do not commit secrets. Copy `.env.example` to `.env` for local use; `.env` is git‑ignored.
- `utils/envConfig.js` has defaults for development; override via `.env`/environment. Replace placeholder API keys before enabling image generation.
- Avoid introducing server‑side state; this site is a static app served by `server.js`.

