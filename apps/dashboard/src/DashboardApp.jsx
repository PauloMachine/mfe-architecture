import React, { Suspense, lazy } from 'react';
import './dashboard.css';

/**
 * Lazy-loaded widget — becomes a separate async chunk (see webpack splitChunks).
 * Demonstrates code-splitting inside a federated remote without affecting the host.
 */
const StatsWidget = lazy(() => import('./widgets/StatsWidget'));

export default function DashboardApp({ theme, onGlobalEvent, mfeName }) {
  const handleNotify = () => {
    // Custom prop from root-config — cross-MFE event bus via window CustomEvent
    onGlobalEvent?.('dashboard:refresh', { at: new Date().toISOString() });
  };

  return (
    <div className="dashboard" data-theme={theme}>
      <header className="dashboard__header">
        <h1>Dashboard</h1>
        <span className="dashboard__mfe">{mfeName}</span>
      </header>

      <p className="dashboard__desc">
        Route: <code>/dashboard</code> — mounted via single-spa{' '}
        <code>activeWhen</code> + Module Federation remote import.
      </p>

      <Suspense fallback={<div className="dashboard__loading">Loading widget…</div>}>
        <StatsWidget />
      </Suspense>

      <button type="button" className="dashboard__btn" onClick={handleNotify}>
        Emit global event
      </button>
    </div>
  );
}
