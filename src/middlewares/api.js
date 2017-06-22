'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');

const chalk = require('chalk');
const express = require('express');
const proxy = require('express-request-proxy');

const getMockData = require('../utils/getMockData.js');
const getResolver = require('../utils/getResolver.js');

/**
 * Api请求中间件
 * @param {Object} options 配置
 * @param {Array} options.apiPaths Api路径
 *
 * @param {String} options.proxyServer Api代理服务器地址
 * @param {Object} options.proxyOptions Api代理配置(express-request-proxy 配置)
 * @param {Object} options.proxyOptions.query 查询参数
 * @param {Object} options.proxyOptions.headers 请求headers
 *
 * @param {Boolean} options.mockEnable Api数据模拟开关
 * @param {String} options.mockDir Api模拟数据目录
 * @param {String|Function} options.mockResultResolver Api模拟数据处理器
 * @param {Boolean} options.throwMockError 抛出Api模拟数据错误开关
 * @return {Function} 中间件方法
 */
module.exports = (options) => {
  if (!options || !Array.isArray(options.apiPaths)) {
    // 返回空方法
    return (req, res, next) => next();
  }

  const router = express.Router();

  const apiPaths = options.apiPaths;

  const proxyServer = options.proxyServer || options.requestServer;
  const defaultProxyOptions = options.proxyOptions || options.requestOptions;
  const proxyRouterHandle = function (req) {
    const proxyOptions = Object.assign({
      url: `${proxyServer}${req.path}`,
    }, defaultProxyOptions);

    const urlObj = url.parse(`${proxyServer}${req.path}`, true, true);
    urlObj.query = Object.assign({}, proxyOptions.query, req.query);
    console.log(chalk.green('[Api请求映射]:'), `"${url.format(urlObj)}"`);

    proxy(proxyOptions).apply(null, arguments);
  };

  const mockEnable = options.mockEnable;
  const mockDir = options.mockDir;
  const mockResultResolver = getResolver(options.mockResultResolver);
  const throwMockError = options.throwMockError;
  const mockRouteHandle = function (req, res, next) {
    getMockData(path.join(mockDir, req.path), req, res).then((result) => {
      return mockResultResolver(result, req, res).then((data) => {
        res.send(data);
      });
    }).catch((err) => {
      if (throwMockError) {
        return next(err);
      }
      proxyRouterHandle.apply(this, arguments); // 注意这里的 this 和 arguments
    });
  };

  apiPaths.forEach((routePath) => {
    router.all(routePath, mockEnable ? mockRouteHandle : proxyRouterHandle);
  });

  return router;
};
