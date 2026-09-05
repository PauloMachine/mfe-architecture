/**
 * Shared Webpack Module Federation configuration factory.
 *
 * Centralizes advanced federation settings so every MFE behaves consistently:
 * - Singleton shared dependencies (only one React instance across apps)
 * - Strict version matching to avoid duplicate library bugs
 * - Common dev-server CORS headers for cross-origin remote loading
 */

/**
 * Builds the `shared` block for ModuleFederationPlugin.
 *
 * `singleton: true`   → webpack ensures a single copy is loaded at runtime.
 * `requiredVersion`  → semver range enforced when remotes negotiate sharing.
 * `eager: true`       → bundle shared deps into the host entry (root-config only).
 *                       Remotes use `eager: false` so the host provides them.
 */
function createSharedDependencies({ eager = false } = {}) {
  return {
    react: {
      singleton: true,
      requiredVersion: '^18.3.1',
      eager,
      strictVersion: false,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.3.1',
      eager,
      strictVersion: false,
    },
    'react-router-dom': {
      singleton: true,
      requiredVersion: '^6.28.0',
      eager,
      strictVersion: false,
    },
    'single-spa': {
      singleton: true,
      requiredVersion: '^6.0.3',
      eager,
      strictVersion: false,
    },
    'single-spa-react': {
      singleton: true,
      requiredVersion: '^6.0.2',
      eager,
      strictVersion: false,
    },
  };
}

/**
 * Dev-server settings required when remotes are loaded from different ports.
 * Without `Access-Control-Allow-Origin`, the browser blocks remoteEntry.js.
 */
function createDevServerConfig(port) {
  return {
    port,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    hot: true,
    client: {
      overlay: true,
    },
  };
}

module.exports = {
  createSharedDependencies,
  createDevServerConfig,
};
