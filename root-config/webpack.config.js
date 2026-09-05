const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { createSharedDependencies, createDevServerConfig } = require('../packages/shared-webpack/webpack.shared');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * ROOT CONFIG — Webpack Host (Module Federation consumer)
 *
 * This app is the single-spa orchestrator. It does NOT render feature UI itself;
 * it loads remote MFEs at runtime via Module Federation `remotes` map.
 *
 * Advanced concepts demonstrated:
 * 1. Host declares remotes with `scope@url/remoteEntry.js` syntax
 * 2. Shared deps use `eager: true` so the host bootstraps React before remotes mount
 * 3. `publicPath: 'auto'` lets webpack resolve chunk URLs relative to each deployment
 */
module.exports = {
  entry: path.resolve(__dirname, 'src/root-config.js'),
  output: {
    filename: 'root-config.js',
    path: path.resolve(__dirname, 'dist'),
    // `auto` is recommended for federated apps deployed to different CDN paths
    publicPath: 'auto',
    clean: true,
  },
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  devServer: createDevServerConfig(9000),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      // Host application name — referenced by remotes when sharing modules
      name: 'root_config',

      /**
       * REMOTES — runtime-loaded micro frontends.
       *
       * Format: `alias: 'scope@http://host:port/remoteEntry.js'`
       * - `alias`     → import name used in code: import('nav/NavApp')
       * - `scope`     → must match remote's ModuleFederationPlugin `name`
       * - URL         → where remoteEntry.js is served (change per environment)
       *
       * In production, replace localhost URLs with CDN / ingress URLs.
       */
      remotes: {
        nav: 'nav@http://localhost:8081/remoteEntry.js',
        dashboard: 'dashboard@http://localhost:8082/remoteEntry.js',
        settings: 'settings@http://localhost:8083/remoteEntry.js',
      },

      /**
       * SHARED — host loads shared libraries eagerly so remotes reuse them.
       * Without eager loading on the host, remotes may bundle duplicate React copies.
       */
      shared: createSharedDependencies({ eager: true }),
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.ejs'),
      inject: false,
    }),
  ],
};
