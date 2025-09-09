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

## Vercel 部署（自动化）
- 已新增 `vercel.json`（静态站点配置、禁用缓存）与 `.vercelignore`（忽略本地开发工具和密钥，例如 `.env`、`.tools/`、`server.js`）。
- 推荐使用 Vercel 的 Git 集成：
  - 将该仓库推送至 GitHub（默认分支 `main`）。
  - 在 Vercel 控制台 Import Project → 选择该仓库。
  - Framework 选择 “Other”，Build Command 留空（无需构建），Output Directory 选择 `.`（根目录）。
  - 环境变量（可选）：按需在 Vercel → Settings → Environment Variables 中配置 `SILICONFLOW_API_KEY`、`SILICONFLOW_PROXY_URL`。
  - 绑定后：
    - 对 `main` 的每次 push → 触发 Production 部署。
    - Pull Request/其它分支 → 触发 Preview 部署。
- 如需关闭自动部署或限定分支：Vercel → Project Settings → Git 中调整。

说明：项目是纯静态资源，Vercel 直接托管根目录文件。`server.js` 仅用于本地开发，已通过 `.vercelignore` 排除，不会参与线上运行。
