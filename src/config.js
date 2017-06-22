'use strict';

const fs = require('fs');
const path = require('path');

const argv = require('./process.argv.js');
const configFileName = path.resolve(argv.config || 'y-server.config.js');

const resolve = file => path.join(__dirname, file);

let config;

if (fs.existsSync(configFileName)) {
  config = require(configFileName);
  config = Object.assign({}, config, { __filename__: configFileName });
} else {
  config = {
    __filename: __filename,

    port: process.env.PORT || 8888,

    middlewares: [
      require('morgan')('dev'),
      {
        name: 'static',
        options: {
          staticPaths: {
            '/static': 'http://static.com'
          },
        },
      },
      {
        name: 'router',
        options: {
          apiPaths: ['/api/*'],

          viewDir: resolve('../views'),
          routes: {
            '/': { view: 'index.html', cgi: '/page/index' },
          },
          renderResultResolver: result => result,

          requestServer: 'http://api.com', // 联调模式的 server, 一般指向 dev 环境的 server, 也可以指向具体后端开发人员的本地环境
          requestOptions: {
            query: {},
            headers: {},
          },

          mockEnable: true, // 是否使用本地模拟数据
          mockDir: resolve('./json'), // 模拟数据根目录
          mockResultResolver: resolve('./json/resultResolver.js'),
          throwMockError: true,
        },
      },
      {
        name: '404',
        options: {
          view: resolve('./views/404.html'),
        },
      },
      {
        name: '500',
        options: {
          view: resolve('./views/500.html'),
        },
      }
    ],
  };
}

module.exports = config;
