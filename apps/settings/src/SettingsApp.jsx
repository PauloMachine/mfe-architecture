import React, { useEffect, useState } from 'react';
import './settings.css';

/**
 * Settings MFE — demonstrates receiving custom props from root-config
 * and listening to cross-MFE events dispatched via onGlobalEvent.
 */
export default function SettingsApp({ theme, authToken, mfeName }) {
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    const handler = (e) => setLastEvent(e.detail);
    window.addEventListener('mfe:dashboard:refresh', handler);
    return () => window.removeEventListener('mfe:dashboard:refresh', handler);
  }, []);

  return (
    <div className="settings" data-theme={theme}>
      <header className="settings__header">
        <h1>Settings</h1>
        <span className="settings__mfe">{mfeName}</span>
      </header>

      <section className="settings__panel">
        <h2>Custom props from host</h2>
        <dl className="settings__dl">
          <dt>theme</dt>
          <dd>{theme}</dd>
          <dt>authToken</dt>
          <dd><code>{authToken}</code></dd>
        </dl>
      </section>

      <section className="settings__panel">
        <h2>Cross-MFE event bus</h2>
        <p className="settings__hint">
          Click &quot;Emit global event&quot; on Dashboard — this app listens via{' '}
          <code>window.addEventListener('mfe:dashboard:refresh')</code>
        </p>
        {lastEvent ? (
          <pre className="settings__event">{JSON.stringify(lastEvent, null, 2)}</pre>
        ) : (
          <p className="settings__empty">No events received yet.</p>
        )}
      </section>
    </div>
  );
}
