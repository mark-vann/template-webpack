/* eslint-disable import/no-webpack-loader-syntax */

import TheModel from './js/TheModel';

require('./css/main');
require('./css/index');
require('./html/index');
require('!!raw-loader!./html/index.pug');

window.TheModel = TheModel;
