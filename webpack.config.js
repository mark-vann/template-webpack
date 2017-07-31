/* eslint-disable */
const path = require('path');
const chalk = require('chalk');
const moment = require('moment');
const webpack = require('webpack');

const DEV_MODE = process.env.NODE_ENV === 'development';
const colorFunc = DEV_MODE ? chalk.green : chalk.blue;
console.log(colorFunc(`webpack.DEV_MODE = ${DEV_MODE}, process.env.NODE_ENV = ${process.env.NODE_ENV}`));

const config = {
  context: path.join(__dirname, '/src'),
  entry: {
    index: ['./js/index.js'],
    // vendor: ['device'],
  },
  output: {
    filename: 'asset/js/[name].js?[hash]',
    chunkFilename: 'asset/js/[name].js?[hash]',
    path: path.resolve(__dirname, './dist'),
    publicPath: '',
  },
  resolveLoader: {
    moduleExtensions: ['-loader'],
  },
  resolve: {
    alias: {
      // device: path.resolve('./src/lib/device.min'),
    },
    modules: [
      path.resolve('./src/js'),
      path.resolve('./src/css'),
      path.resolve('./src/html'),
      path.resolve('./src/img'),
      path.resolve('./node_modules'),
    ],
    extensions: ['.js', '.styl', '.pug']
  },
  devServer: {
    historyApiFallback: false,
    noInfo: true,
    hot: true,
    inline: true,
    contentBase: './',
    // https://webpack.js.org/configuration/stats/
    stats: {
      colors: true,
      hash: false, // add the hash of the compilation
      version: false, // add webpack version information
      timings: true, // add timing information
      assets: true, // add assets information
      chunks: false, // add chunk information
      chunkModules: false, // add built modules information to chunk information
      modules: false, // add built modules information
      cached: false, // add also information about cached (not built) modules
      reasons: false, // add information about the reasons why modules are included
      source: false, // add the source code of modules
      error: true,
      errorDetails: true, // add details to errors (like resolving log)
      chunkOrigins: false // add the origins of chunks and chunk merging info
    },
  },
};

config.module = {
  // noParse: /device\.min/,
  rules: [{
    test: /\.js$/,
    use: [{
      loader: 'babel',
      options: {
        presets: ['es2015', 'stage-3'],
        plugins: [
          'transform-runtime',
          'transform-object-rest-spread',
          'transform-async-to-generator',
          'transform-async-generator-functions',
          'transform-class-properties',
          'dynamic-import-webpack',
        ]
      }
    }],
    include: path.resolve('src/js'),
    exclude: /node_modules/,
  }, {
    test: /\.styl$/,
    use: [...DEV_MODE ? ['style'] : [{
      loader: 'file',
      options: {
        name: 'asset/[path][name].css',
      }
    }, {
      loader: 'extract',
      options: {
        publicPath: '../../',
      }
    }], {
      loader: 'css',
      options: {
        '-minimize': true,
        sourceMap: true,
      }
    }, 'postcss', {
      loader: 'stylus',
      options: {
        sourceMap: true,
        preferPathResolver: 'webpack',
      }
    }],
    include: path.resolve('src/css'),
    exclude: /node_modules/,
  }, {
    test: /\.pug$/,
    use: [{
      loader: 'file',
      options: {
        name: '[name].html',
      }
    }, {
      loader: 'extract',
      options: {
        publicPath: '',
      }
    }, {
      loader: 'html',
      options: {
        interpolate: 'require',
        name: '[name].html',
      },
    }, {
      loader: 'pug-html',
      options: {
        pretty: true,
        data: {
          DEV_MODE,
          TIME: moment().format('YYYY/MM/DD-HH:mm:ss'),
          HASH: moment().format('YYYYMMDDHHmmss'),
        },
        verbos: true,
      }
    }],
    include: path.resolve('src/html'),
    exclude: /node_modules/,
  }, {
    test: /\.(jpg|png|gif|svg|ico)$/,
    use: [{
      loader: 'url',
      options: {
        limit: 8,
        name: 'asset/[path][name].[ext]?[hash:8]'
      }
    }],
    include: path.resolve('src/img'),
    exclude: /node_modules/,
  }, {
    use: [{
      loader: 'file',
      options: {
        name: '[path][name].[ext]',
      }
    }],
    include: path.resolve('src/asset'),
    exclude: /node_modules/,
  }],
};

config.plugins = [
  // new webpack.optimize.CommonsChunkPlugin({
  //   name: 'vendor',
  // }),
  new webpack.DefinePlugin({
    __DEV__: DEV_MODE,
    'process.env.NODE_ENV': DEV_MODE ? '"development"' : '"production"',
  }),
  ...DEV_MODE ? [
    new webpack.HotModuleReplacementPlugin()
  ] : [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false,
      },
    })
  ]
];

config.externals = {
  // vue: 'Vue',
};

module.exports = config;