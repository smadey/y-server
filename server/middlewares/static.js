const urlParse = require('url').parse;

const chalk = require('chalk');
const express = require('express');
const _ = require('lodash');

/**
 * 静态资源中间件
 * @param {Object} options 配置
 * @param {String|Object} options.staticPaths 静态资源路径配置
 * @return {Function} 中间件方法
 */
module.exports = (options) => {
  if (!options) {
    options = {};
  }

  const staticPaths = options.staticPaths;

  if (typeof staticPaths === 'string') {
    // 指向的是某一个具体路径
    return express.static(staticPaths);
  }
  if (typeof staticPaths !== 'object') {
    // 返回空方法
    return (req, res, next) => next();
  }

  const proxy = require('express-http-proxy');

  const router = express.Router();

  const REG_HTTP = /^(http|https):\/\//i;

  _.each(staticPaths, (staticPath, routePath) => {
    if (REG_HTTP.test(staticPath)) {
      const remoteUrl = staticPath;
      const remotePath = urlParse(remoteUrl).path;

      console.log(chalk.blue('[静态资源映射]'), `"${routePath}"`, '->', `"${remoteUrl}"`);

      // 以 http/https 开头的路径, 使用 express-http-proxy 进行代理
      router.use(routePath, proxy(remoteUrl, {
        proxyReqPathResolver: req => (remotePath + req.url),
      }));
    } else {
      router.use(routePath, express.static(staticPath));
    }
  });

  return router;
};
