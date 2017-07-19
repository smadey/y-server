'use strict';

const path = require('path');

const abs = file => path.join(__dirname, file);

module.exports = {
  setup: (app) => {
    app.set('view engine', 'ejs');
    app.engine('html', require('ejs').renderFile);
  },

  middlewares: [
    // require('morgan')('dev'),
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

        viewDir: abs('./views'),
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
        mockDir: abs('./json'), // 模拟数据根目录
        mockResultResolver: abs('./json/resultResolver.js'),
        throwMockError: true,
      },
    },
    {
      name: '404',
      options: {
        view: abs('./views/404.html'),
      },
    },
    {
      name: '500',
      options: {
        view: abs('./views/500.html'),
      },
    }
  ]
};
