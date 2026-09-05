const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const { createSharedDependencies, createDevServerConfig } = require('../../packages/shared-webpack/webpack.shared');

/**
 * SETTINGS MFE — demonstrates dynamic publicPath for CDN deployments.
 *
 * `output.publicPath: 'auto'` lets webpack infer the correct base URL from
 * remoteEntry.js location — important when the same build deploys to multiple CDNs.
 */
module.exports = {
  entry: path.resolve(__dirname, 'src/single-spa-entry.js'),
  output: {
    publicPath: 'auto',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    uniqueName: 'settings_mfe',
  },
  devServer: createDevServerConfig(8083),
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
      name: 'settings',
      filename: 'remoteEntry.js',
      exposes: {
        './SettingsApp': './src/single-spa-entry.js',
      },
      /**
       * `shared` with strictVersion: false (from factory) allows minor version
       * drift between host and remote during independent deployments.
       * Set strictVersion: true in production for tighter control.
       */
      shared: createSharedDependencies({ eager: false }),
    }),
  ],
};
