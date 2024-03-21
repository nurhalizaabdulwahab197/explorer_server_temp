const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: './src/server.ts', // Your entry point
  target: 'node', // Ensures Node.js compatibility
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
    extensions: ['.tsx', '.ts', '.js'],
    // Setup the plugin that reads paths from tsconfig
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json', // or the path to your tsconfig file
      }),
    ],
  },
  output: {
    filename: 'server.js', // Output file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
};
