const path = require('path');
// eslint-disable-next-line node/no-unpublished-require
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/server.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
      }),
    ],
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'contracts/**/*.json',
          to: '[path][name][ext]',
          context: 'src',
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
};
