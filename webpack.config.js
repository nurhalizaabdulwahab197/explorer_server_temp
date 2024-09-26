const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Ensure this is installed

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
    filename: 'server.js', // Output file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', '**', '*.json'),
          to: path.resolve(__dirname, 'dist', '[name][ext]'),
        },
      ],
    }),
  ],
};
