const cssMqPacker = require(`css-mqpacker`);
const cssnano = require(`cssnano`);
const ExtractTextPlugin = require(`extract-text-webpack-plugin`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const PostcssAssetsPlugin = require(`postcss-assets-webpack-plugin`);
const SWPrecacheWebpackPlugin = require(`sw-precache-webpack-plugin`);
const webpack = require(`webpack`);

const baseConfig = require(`./webpack.base.config`);
const sassLoaderConfig = require(`./loader-sass.config`);
const vueLoaderConfig = require(`./loader-vue.config`);

vueLoaderConfig.loaders = {
  scss: `${sassLoaderConfig.fallbackLoader}!${sassLoaderConfig.loader}`,
};

const config = Object.assign({}, baseConfig, {
  plugins: (baseConfig.plugins || []).concat([
    // Strip comments in Vue code.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || `development`),
      'process.env.VUE_ENV': `"client"`,
    }),
    // Extract vendor chunks for better caching.
    new webpack.optimize.CommonsChunkPlugin({
      name: `vendor`,
    }),
    // Generate output HTML.
    new HtmlWebpackPlugin({
      template: `./app/html/index.template.html`,
    }),
  ]),
});

if (process.env.NODE_ENV === `production`) {
  vueLoaderConfig.loaders = {
    scss: ExtractTextPlugin.extract(sassLoaderConfig),
  };

  config.plugins.push(
    new ExtractTextPlugin(`styles.[hash].css`),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
    new PostcssAssetsPlugin({
      test: /\.css$/,
      plugins: [
        cssMqPacker(),
        cssnano(),
      ],
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
    new SWPrecacheWebpackPlugin({
      cacheId: `well-composed-frontend`,
      filename: `service-worker.js`,
      dontCacheBustUrlsMatching: /./,
      staticFileGlobsIgnorePatterns: [/index\.html$/, /\.map$/],
    })
  );
}

module.exports = config;
