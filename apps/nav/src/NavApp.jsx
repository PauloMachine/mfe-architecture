import React from 'react';
import './nav.css';

/**
 * Navigation shell — always mounted, uses native links for single-spa routing.
 *
 * `preventDefault` is NOT used: full page navigation triggers single-spa
 * `popstate` / `pushState` reroute without reloading the host HTML.
 */
export default function NavApp(props) {
  const { theme, mfeName, authToken } = props;

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <header className="nav" data-theme={theme}>
      <div className="nav__brand">MFE Lab</div>
      <nav className="nav__links">
        {links.map(({ href, label }) => (
          <a key={href} href={href} className="nav__link">
            {label}
          </a>
        ))}
      </nav>
      <div className="nav__meta">
        <span className="nav__badge">{mfeName}</span>
        <span className="nav__token" title="Custom prop from root-config">
          token: {authToken?.slice(0, 8)}…
        </span>
      </div>
    </header>
  );
}
