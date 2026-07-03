# Local-first deployment direction

Status: Planned  
Related issue: #33

## Decision

This app should be packaged as a **local-first application** that runs on a machine
inside the same network as the printers.

The current best deployment target is a local Node service with persistent SQLite
storage and the existing browser UI at `http://localhost:3000/ui`.

Do not prioritize serverless/cloud deployment for the next phase.

## Why local-first

- Snapmaker U1 / Moonraker URLs are normally LAN-only, such as
  `http://snapmaker-u1.local` or `http://192.168.x.x`.
- SQLite and cached cover images need durable local disk.
- Printer APIs should not be exposed publicly just so a hosted app can reach them.
- The app is primarily private shop/business data: print history, customers,
  prices, and notes.

## Current local workflow

Install dependencies:

```bash
npm install
```

Start the API/UI locally:

```bash
npm run api
```

Open:

```text
http://localhost:3000/ui
```

Sync all configured providers when needed:

```bash
npm run sync
```

Sync only Bambu history when needed:

```bash
npm run sync:bambu
```

Sync only Snapmaker U1 / Moonraker history when needed:

```bash
MOONRAKER_BASE_URL=http://snapmaker-u1.local npm run sync:moonraker
```

If Moonraker requires a key:

```bash
MOONRAKER_BASE_URL=http://snapmaker-u1.local \
MOONRAKER_API_KEY=... \
npm run sync:moonraker
```

For multiple providers, copy the example registry and edit the local values:

```bash
cp printworks.config.example.json printworks.config.json
npm run sync
npm run sync -- --provider moonraker-shop-u1
```

`printworks.config.json` is gitignored. Use `PRINTWORKS_CONFIG=/path/to/config.json`
to store the registry elsewhere. Keep secrets in environment variables such as
`BAMBU_TOKEN` or a provider-specific `apiKeyEnv`; the JSON file should contain
local provider settings, not secret tokens.

## Persistent data

Today the default data lives in the repository working directory:

- `bambu_print_history.sqlite`
- `bambu_print_history.sqlite-wal`
- `bambu_print_history.sqlite-shm`
- `covers/`

The local app packaging work should move those into an explicit app data
directory, for example:

```text
~/Library/Application Support/3d-printing-app/
```

or another documented directory configured by `BAMBU_DB` and a future covers path
setting.

## Backup guidance

Until a formal backup command exists, stop the app/sync process and copy:

```text
bambu_print_history.sqlite*
covers/
```

Keep the SQLite `-wal` and `-shm` files with the main database if they exist.

## Near-term packaging plan

1. Add a start script that loads local configuration and uses a stable app data
   directory.
2. Add macOS LaunchAgent documentation so the app can run in the background.
3. Add backup/restore docs for SQLite and covers.
4. Consider Docker Compose after the plain local Node workflow is reliable.

## Not the plan right now

- Do not expose Moonraker publicly without a VPN/tunnel and auth.
- Do not move to Electron/Tauri until the browser UI + local service model proves
  insufficient.
- Do not migrate away from SQLite only to make serverless hosting work; use a
  hosted DB later only if remote access becomes a real product requirement.
