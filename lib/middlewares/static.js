'use strict';
require('colors');

const url = require('url');

const _ = require('lodash');
const express = require('express');

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

  const proxy = require('http-proxy-middleware');

  const router = express.Router();

  const REG_HTTP = /^(http|https):\/\//i;

  _.each(staticPaths, (staticPath, routePath) => {
    if (REG_HTTP.test(staticPath)) {
      // 以 http/https 开头的路径, 使用 express-http-proxy 进行代理
      console.log('[静态资源映射]'.blue, `"${routePath}"`, '->', `"${staticPath}"`);

      const staticUrlObj = url.parse(staticPath);

      const pathRewriteFrom = new RegExp(`^${routePath}`);
      const pathRewriteTo = staticUrlObj.pathname;

      staticUrlObj.pathname = null; // 当 routePath 与 staticUrlObj.pathname 不一致时不移除 pathname 会有问题

      router.use(routePath, proxy({
        target: url.format(staticUrlObj),
        changeOrigin: true,
        logLevel: 'warn',
        // 不用以下方法的原因是 SwitchyOmega 将 localsite.com 指向到 locahost:8080 时得到的 url 包含 host
        // pathRewrite: {
        //   [pathRewriteFrom]: pathRewriteTo,
        // },
        pathRewrite: (reqUrl) => {
          const reqUrlObj = url.parse(reqUrl);
          reqUrlObj.pathname = reqUrlObj.pathname.replace(pathRewriteFrom, pathRewriteTo);
          return url.format(reqUrlObj);
        },
      }));
    } else {
      router.use(routePath, express.static(staticPath));
    }
  });

  return router;
};
