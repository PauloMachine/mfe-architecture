/**
 * ROOT CONFIG — single-spa orchestration entry point
 *
 * Responsibilities:
 * 1. Register each remote MFE with lifecycle hooks (bootstrap/mount/unmount)
 * 2. Define `activeWhen` routing rules (which app mounts for which URL)
 * 3. Pass custom props from host to remotes (global event bus, auth token, etc.)
 * 4. Start single-spa with optional prefetch / routing event listeners
 */

import { registerApplication, start, addErrorHandler } from 'single-spa';
import { constructRoutes, constructApplications, constructLayoutEngine } from 'single-spa-layout';

/**
 * Custom props injected into every MFE lifecycle.
 * Remotes receive these via single-spa-react `customProps` or lifecycle props.
 *
 * Useful for: auth context, feature flags, analytics, i18n locale, theme.
 */
const globalCustomProps = {
  authToken: 'demo-token-123',
  theme: 'dark',
  onGlobalEvent: (eventName, payload) => {
    window.dispatchEvent(new CustomEvent(`mfe:${eventName}`, { detail: payload }));
  },
};

/**
 * Layout definition — declarative DOM placement for MFEs.
 * Parsed by single-spa-layout; connects HTML template to registered apps.
 */
const routes = constructRoutes(`
  <single-spa-router>
    <nav>
      <application name="nav"></application>
    </nav>
    <main>
      <route path="dashboard">
        <application name="dashboard"></application>
      </route>
      <route path="settings">
        <application name="settings"></application>
      </route>
      <route default>
        <application name="dashboard"></application>
      </route>
    </main>
  </single-spa-router>
`);

/**
 * Application definitions — links layout `<application>` names to dynamic imports.
 *
 * `app: () => import('nav/NavApp')` uses Webpack Module Federation:
 * webpack resolves `nav` from the host's `remotes` config and loads remoteEntry.js.
 */
const applications = constructApplications({
  routes,
  loadApp: ({ name }) => {
    switch (name) {
      case 'nav':
        return import('nav/NavApp');
      case 'dashboard':
        return import('dashboard/DashboardApp');
      case 'settings':
        return import('settings/SettingsApp');
      default:
        return Promise.reject(new Error(`Unknown application: ${name}`));
    }
  },
});

/**
 * `activeWhen` — function or path prefix array controlling when an app mounts.
 *
 * Advanced patterns:
 * - Path prefix: ['/dashboard'] mounts when location starts with /dashboard
 * - Function: (location) => location.pathname.includes('admin')
 * - Exclude: activeWhen except certain paths via custom logic
 */
applications.forEach((app) => {
  if (app.name === 'nav') {
    // Nav bar is always mounted (persistent chrome)
    app.activeWhen = () => true;
  } else if (app.name === 'dashboard') {
    app.activeWhen = (location) =>
      location.pathname === '/' ||
      location.pathname.startsWith('/dashboard');
  } else if (app.name === 'settings') {
    app.activeWhen = (location) => location.pathname.startsWith('/settings');
  }

  // Inject shared custom props into every lifecycle
  const originalApp = app.app;
  app.app = () =>
    originalApp().then((lifecycle) => ({
      ...lifecycle,
      mount: (props) =>
        lifecycle.mount({
          ...props,
          ...globalCustomProps,
          mfeName: app.name,
        }),
    }));
});

const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();

/**
 * Global error handler — catches bootstrap/mount/unmount failures from any MFE.
 * In production, forward to observability (Sentry, Datadog, etc.).
 */
addErrorHandler((err) => {
  console.error('[single-spa] Application error:', err);
});

/**
 * `start()` bootstraps the single-spa runtime.
 *
 * Options:
 * - urlRerouteOnly: true  → only reroute on URL changes (ignore hash-only changes)
 * - prefetch: true        → prefetch inactive apps' JS after first mount
 */
start({
  urlRerouteOnly: true,
});

// Default route: redirect bare "/" to dashboard
if (window.location.pathname === '/') {
  window.history.replaceState(null, '', '/dashboard');
}

console.info('[root-config] single-spa started with Module Federation remotes');
