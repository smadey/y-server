const path = require('path');

const chalk = require('chalk');
const express = require('express');
const logger = require('morgan');

const config = require('./config');
const port = config.port;

const app = express();

const resolve = file => path.join(__dirname, file);

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(logger('dev'));

app.use(require('./middlewares/cors.js')());

app.use(require('./middlewares/static.js')({
  staticPaths: {
    '/lbf': 'http://devqidian.gtimg.com/lbf',
    '/middlewares': resolve('./middlewares'),
    '/qd_boss': 'https://oaqidian.gtimg.com/qd_boss',
  },
}));

app.use(require('./middlewares/router.js')({
  apiPaths: ['/ajax/*', '/majax/*', '/meajax/*', '/page/*', '/mpage/*', '/mepage/*', '/:site/page/*', '/:site/ajax/*'],

  viewDir: resolve('./views'),
  // masterHost: 'boss.qidian.com',
  routes: {
    '/': { view: 'index.html', cgi: '/page/index' },
    '/welcome': { view: 'index.html', cgi: '/page/general/welcome/index' },
  },
  renderResultResolver: (d) => {
    d.rendered = true;
    return d;
  },

  requestServer: 'https://boss.qidian.com',
  requestOptions: {
    query: {
      nologin: 1,
      nocsrf: 1,
    },
    headers: {
      cookie: 'boss_session=eyJpdiI6InFJZm5DRERvVjJsME4xWHFXTytTQ0E9PSIsInZhbHVlIjoiXC9oRUhjUHRBUWF4MDVVbWh2ODh5c3pVSDg0aW9CeHlRYzdQSDhVTDB1Mnk0bjkrVVhlVnR1aHVqMUQyUVJaR1FjUkV4cVFBNkhjN3U4bjgxZkhmZkNBPT0iLCJtYWMiOiJlYzdkMGU0MDY2NWE5MDVjNGQ2ZWU3NDlhM2JhYzYxZmZiNzExNTgwZGU4ZWRmZDdjYmYxOTcyY2E1MDk3OTZlIn0%3D'
    },
  },

  mockEnable: true,
  mockJsonDir: resolve('../json'),
  mockResultResolver: resolve('../json/resultResolver.js'),
}));

app.use(require('./middlewares/404.js')({
  view: resolve('./views/404.html'),
}));

app.use(require('./middlewares/500.js')({
  view: resolve('./views/500.html'),
}));

app.listen(port, () => {
  console.log(chalk.green(`[服务器启动],端口: ${port}`)); // eslint-disable-line no-console
});
