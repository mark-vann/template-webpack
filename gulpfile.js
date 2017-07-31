/* eslint-disable */
const gulp = require('gulp');
const webpack = require('webpack');
const sequence = require('run-sequence');
const $ = require('gulp-load-plugins')();

const developAscii = `
                                                                         
 _|_|_|    _|_|_|_|  _|      _|  _|_|_|_|  _|          _|_|    _|_|_|    
 _|    _|  _|        _|      _|  _|        _|        _|    _|  _|    _|  
 _|    _|  _|_|_|    _|      _|  _|_|_|    _|        _|    _|  _|_|_|    
 _|    _|  _|          _|  _|    _|        _|        _|    _|  _|        
 _|_|_|    _|_|_|_|      _|      _|_|_|_|  _|_|_|_|    _|_|    _|        
                                                                         
                                                                         `;
const productAscii = `
                                                                         
 _|_|_|    _|_|_|      _|_|    _|_|_|    _|    _|    _|_|_|  _|_|_|_|_|  
 _|    _|  _|    _|  _|    _|  _|    _|  _|    _|  _|            _|      
 _|_|_|    _|_|_|    _|    _|  _|    _|  _|    _|  _|            _|      
 _|        _|    _|  _|    _|  _|    _|  _|    _|  _|            _|      
 _|        _|    _|    _|_|    _|_|_|      _|_|      _|_|_|      _|      
                                                                         
                                                                         `;
const chalk = require('chalk');
const developLog = str => {
  console.log(chalk.green(str));
};
const productLog = str => {
  console.log(chalk.blue(str));
};
const DEV_MODE = $.util.env._[0] !== 'p';
const log = (...args) => {
  const str = args.length === 1 ? args[0] : args.join(' ');
  if (DEV_MODE) developLog(str);
  else productLog(str);
};

const net = require('os').networkInterfaces();
const host = Object.keys(net).map(i => net[i].filter(i => i.family === 'IPv4' && !i.internal)[0]).filter(i => i)[0].address;
const port = 3000;
const URL = `http://${host}:${port}/`;
var openLink = URL;

var entry, defaultEntry;
if ($.util.env.entry) {
  entry = DEV_MODE ? {
    main: ['./js/main.js']
  } : {};
  $.util.env.entry.split(',').forEach(e => {
    if (!defaultEntry) defaultEntry = e;
    entry[e] = [`./js/${e}.js`];
  });
}

gulp.task('imagemin', () => {
  const merge = require('merge-stream');
  const imageminMozjpeg = require('imagemin-mozjpeg');
  const imageminPngquant = require('imagemin-pngquant');
  const imageSrc = ['src/img_src/**/*.+(jpg|png|gif)', '!src/img_src/**/_*', '!src/img_src/_*/*'];
  const ignoreSrc = ['src/img_src/**/_*', 'src/img_src/_*/*'];
  const distPath = 'src/img';
  const taskIgnore = gulp.src(ignoreSrc)
    .pipe($.changed(distPath))
    .pipe($.size({ showFiles: true }))
    .pipe(gulp.dest(distPath));
  const taskImage = gulp.src(imageSrc)
    .pipe($.changed(distPath))
    .pipe($.imagemin([
      imageminMozjpeg({ quality: 80 }),
      imageminPngquant({ quality: 75 }),
      $.imagemin.gifsicle({interlaced: true}),
      // $.imagemin.jpegtran({ progressive: true }),
      // $.imagemin.optipng({ optimizationLevel: 5 }),
    ], { verbose: true }))
    .pipe(gulp.dest(distPath));
  return merge(taskIgnore, taskImage);
});

gulp.task('watch', () => {
  gulp.watch('src/img_src/**/*', ['imagemin']);
});

gulp.task('rimraf', callback => {
  require('rimraf')('./dist', callback);
});

gulp.task('webpack-dev-server', callback => {
  log(developAscii);
  process.env.NODE_ENV = 'development';
  const WebpackDevServer = require('webpack-dev-server');
  const config = require('./webpack.config');
  if (defaultEntry) {
    config.entry = entry;
    openLink += defaultEntry + '.html';
  }
  Object.keys(config.entry).forEach(e => {
    config.entry[e].unshift(`webpack-dev-server/client?${URL}`, 'webpack/hot/dev-server');
  });
  config.devServer.publicPath = config.output.publicPath;
  config.devtool = 'inline-source-map';
  const server = new WebpackDevServer(webpack(config), config.devServer);
  server.listen(port, host, (err, result) => {
    if (err) log('# webpack-error #', err);
    log('# webpack-dev-server #', URL);
    callback();
  });
});

gulp.task('webpack-build', callback => {
  log(productAscii);
  process.env.NODE_ENV = 'production';
  const config = require('./webpack.config');
  webpack(config, (err, stats) => {
    if (err) log('# webpack-error #', err);
    log('# webpack-build #', stats.toString({
      colors: true,
      chunkModules: false
    }));
    callback();
  });
});

gulp.task('default', () => sequence('imagemin', 'watch', 'webpack-dev-server'));

gulp.task('m', ['imagemin']);

gulp.task('d', ['default'], () => {
  return gulp.src('./')
    .pipe($.open({
      uri: openLink + '?debug=medialand'
    }));
});

gulp.task('p', () => sequence('imagemin', 'webpack-build'));
