const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const { createSharedDependencies, createDevServerConfig } = require('../../packages/shared-webpack/webpack.shared');

/**
 * DASHBOARD MFE — demonstrates remote with async chunks.
 *
 * `output.uniqueName` prevents chunk ID collisions when multiple remotes
 * load on the same page (webpack 5 requirement for Module Federation).
 */
module.exports = {
  entry: path.resolve(__dirname, 'src/single-spa-entry.js'),
  output: {
    publicPath: 'auto',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    // Unique namespace for this build — avoids chunk filename clashes across remotes
    uniqueName: 'dashboard_mfe',
  },
  devServer: createDevServerConfig(8082),
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
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './DashboardApp': './src/single-spa-entry.js',
      },
      shared: createSharedDependencies({ eager: false }),
    }),
  ],

  /**
   * Optimization — split vendor chunks inside this remote only.
   * Shared libs (react) stay in `shared` scope, not in these chunks.
   */
  optimization: {
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        widgets: {
          test: /[\\/]widgets[\\/]/,
          name: 'dashboard-widgets',
          chunks: 'async',
        },
      },
    },
  },
};
