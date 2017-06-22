'use strict';

const chalk = require('chalk');
const express = require('express');

const config = require('../src/config.js');
const port = config.port;
const middlewares = config.middlewares;

const app = express();

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

middlewares.forEach((middleware) => {
  if (typeof middleware === 'function') {
    app.use(middleware);
  } else if (middleware.name) {
    app.use(require(`./middlewares/${middleware.name}.js`)(middleware.options));
  }
});

app.listen(port, () => {
  console.log(chalk.green(`[服务器启动],端口: ${port}`)); // eslint-disable-line no-console
});
