# Micro Frontend Architecture Lab

Reference monorepo demonstrating **single-spa orchestration** with **Webpack 5 Module Federation**.

Simple React apps, but the focus is on **advanced configuration patterns** you can copy into production setups.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  root-config (host) — port 9000                             │
│  • Module Federation consumer (remotes map)                 │
│  • single-spa registerApplication + layout engine           │
│  • Shared deps loaded eagerly (React singleton)             │
└──────────────┬──────────────────┬───────────────────────────┘
               │ remoteEntry.js    │
       ┌───────▼──────┐    ┌───────▼──────┐    ┌──────────────┐
       │  nav :8081   │    │ dashboard    │    │  settings    │
       │  (always on) │    │   :8082      │    │   :8083      │
       └──────────────┘    └──────────────┘    └──────────────┘
```

| App | Role | Key config file |
|-----|------|-----------------|
| `root-config` | Host + orchestrator | `webpack.config.js`, `src/root-config.js` |
| `apps/nav` | Persistent shell | `webpack.config.js` (remote exposes) |
| `apps/dashboard` | Route `/dashboard` | async chunks + splitChunks |
| `apps/settings` | Route `/settings` | cross-MFE custom props |
| `packages/shared-webpack` | Shared federation factory | `webpack.shared.js` |

## Quick start

```bash
npm install
npm start
```

Open **http://localhost:9000/dashboard**

Start remotes individually if needed:

```bash
npm run start:nav
npm run start:dashboard
npm run start:settings
npm run start:root   # start host last (or use npm start for all)
```

## What to study (comments are in English in the code)

### Module Federation (`webpack.config.js` in each app)

- **`remotes`** — host declares `scope@url/remoteEntry.js` aliases
- **`exposes`** — remotes publish `./NavApp` lifecycle bundles
- **`shared`** — `singleton`, `requiredVersion`, `eager` (host vs remote)
- **`uniqueName`** — prevents chunk ID collisions across remotes
- **`publicPath: 'auto'`** — CDN-safe chunk URL resolution
- **Dev server CORS** — `Access-Control-Allow-Origin: *` for cross-port loading

### single-spa (`root-config/src/root-config.js`)

- **`constructRoutes` / `constructLayoutEngine`** — declarative layout
- **`activeWhen`** — URL-based mount rules (nav always on)
- **Custom props** — auth, theme, event bus injected into every MFE
- **`addErrorHandler`** — global MFE failure handling
- **`start({ urlRerouteOnly })`** — routing behavior

### MFE lifecycle (`apps/*/src/single-spa-entry.js`)

- **`single-spa-react`** adapter → `bootstrap`, `mount`, `unmount`
- **`domElementGetter`** — targets layout-created containers

## Production checklist

1. Replace `localhost` URLs in `root-config/webpack.config.js` `remotes` with CDN/ingress URLs
2. Set `strictVersion: true` on shared dependencies for tighter semver control
3. Add environment-specific remote URLs via webpack `DefinePlugin` or env files
4. Consider `@module-federation/enhanced` for runtime remote registration
5. Add import-map-overrides for local dev against production host

## Build

```bash
npm run build
```

Outputs land in each app's `dist/` folder.
