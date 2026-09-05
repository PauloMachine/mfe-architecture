const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const { createSharedDependencies, createDevServerConfig } = require('../../packages/shared-webpack/webpack.shared');

/**
 * NAV MFE — Module Federation Remote
 *
 * Remotes EXPOSE modules that the host imports dynamically.
 * Each exposed path maps to a single-spa lifecycle bundle (bootstrap/mount/unmount).
 */
module.exports = {
  entry: path.resolve(__dirname, 'src/single-spa-entry.js'),
  output: {
    publicPath: 'auto',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    uniqueName: 'nav_mfe',
  },
  devServer: createDevServerConfig(8081),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new ModuleFederationPlugin({
      /**
       * `name` must match the scope in host remotes config:
       * nav@http://localhost:8081/remoteEntry.js  →  name: 'nav'
       */
      name: 'nav',

      /**
       * `filename` is the entry point the host fetches to bootstrap this remote.
       * Convention: remoteEntry.js (webpack default for federation).
       */
      filename: 'remoteEntry.js',

      /**
       * EXPOSES — public API of this micro frontend.
       * Host imports via: import('nav/NavApp')
       * Key `./NavApp` becomes the module path after the scope name.
       */
      exposes: {
        './NavApp': './src/single-spa-entry.js',
      },

      /**
       * Remotes do NOT declare other remotes — they only expose.
       * `eager: false` (default) — shared deps provided by host at runtime.
       */
      shared: createSharedDependencies({ eager: false }),
    }),
  ],
};
