/**
 * single-spa React adapter — wraps a React root component as lifecycle exports.
 *
 * single-spa expects each MFE to export:
 * - bootstrap(props)  → one-time setup before first mount
 * - mount(props)      → render into DOM container provided by layout engine
 * - unmount(props)    → cleanup when navigating away or app deactivates
 *
 * `domElementGetter` tells single-spa-react which DOM node to render into.
 * Must match the layout template container IDs.
 */
import React from 'react';
import singleSpaReact from 'single-spa-react';
import NavApp from './NavApp';

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient: require('react-dom/client'),
  rootComponent: NavApp,
  errorBoundary(err, info, props) {
    return (
      <div style={{ color: '#f87171', padding: '1rem' }}>
        Nav MFE crashed: {err.message}
      </div>
    );
  },
  /**
   * Returns the DOM element where this MFE mounts.
   * single-spa-layout creates `#single-spa-application:nav` automatically.
   */
  domElementGetter: () => document.getElementById('single-spa-application:nav'),
});

export const { bootstrap, mount, unmount } = lifecycles;
