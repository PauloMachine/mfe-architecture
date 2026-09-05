import React, { useEffect, useState } from 'react';

/**
 * Async chunk widget — bundled separately by webpack splitChunks.cacheGroups.widgets
 */
export default function StatsWidget() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      setEvents((prev) => [e.detail, ...prev].slice(0, 5));
    };
    window.addEventListener('mfe:dashboard:refresh', handler);
    return () => window.removeEventListener('mfe:dashboard:refresh', handler);
  }, []);

  const metrics = [
    { label: 'Active users', value: '1,284' },
    { label: 'Requests/min', value: '342' },
    { label: 'Error rate', value: '0.02%' },
  ];

  return (
    <section className="stats">
      <h2>Live metrics (lazy chunk)</h2>
      <div className="stats__grid">
        {metrics.map(({ label, value }) => (
          <article key={label} className="stats__card">
            <span className="stats__label">{label}</span>
            <strong className="stats__value">{value}</strong>
          </article>
        ))}
      </div>
      {events.length > 0 && (
        <pre className="stats__events">{JSON.stringify(events, null, 2)}</pre>
      )}
    </section>
  );
}
