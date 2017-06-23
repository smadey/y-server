'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');

const _ = require('lodash');
const chalk = require('chalk');
const express = require('express');

const getMockData = require('./utils/getMockData.js');
const getResolver = require('./utils/getResolver.js');
const requestRemote = require('./utils/requestRemote.js');

/**
 * 转换路由
 * 将
 *   {
 *     'a.com/index': {},
 *     'b.com/index': {},
 *   }
 * 转换成
 *   {
 *     '/index': {
 *       'a.com': {},
 *       'b.com': {},
 *     },
 *   }
 * @param {Object} routes 路由对象
 * @param {String} masterHost 主域名
 * @return {Object} 转换后的路由
 */
function transformRoutes(routes, masterHost) {
  const transformedRoutes = {};

  _.each(routes, (routeConfig, routeUrl) => {
    const delimiterIndex = routeUrl.indexOf('/');

    const routeHost = routeUrl.slice(0, delimiterIndex) || masterHost;
    const routePath = routeUrl.slice(delimiterIndex);

    if (!transformedRoutes[routePath]) {
      transformedRoutes[routePath] = {};
    }

    transformedRoutes[routePath][routeHost] = routeConfig;
  });

  return transformedRoutes;
}

/**
 * Api请求中间件
 * @param {Object} options 配置
 * @param {String} options.viewDir 模板目录
 * @param {Object} options.masterHost 主域名, 在 路径没有配置host(以非"/"开头) 或 没有匹配到域名 是用此域名
 * @param {Object} options.routes 页面路由
 * @param {String|Function} options.renderResultResolver 模板数据处理器
 *
 * @param {String} options.apiServer 模板数据请求服务器地址
 * @param {Object} options.apiOptions 模板请求配置
 *
 * @param {Boolean} options.mockEnable 模板数据模拟开关
 * @param {String} options.mockDir 模板模拟数据目录
 * @param {String|Function} options.mockResultResolver 模板模拟数据处理器
 * @param {Boolean} options.throwMockError 抛出Api模拟数据错误开关
 * @return {Function} 中间件方法
 */
module.exports = (options) => {
  if (!options || !options.routes) {
    // 返回空方法
    return (req, res, next) => next();
  }

  const router = express.Router();

  const getView = view => path.join(options.viewDir, view);
  const masterHost = options.masterHost || 'default';
  const routes = options.routes;
  const renderResultResolver = getResolver(options.renderResultResolver);
  const render = (routeConfig, result, req, res) => {
    renderResultResolver(result, req, res).then((data) => {
      console.log(chalk.blue('[页面渲染]'), `"${req.path}" => "${getView(routeConfig.view)}"`);
      res.render(getView(routeConfig.view), data);
    });
  };

  const apiServer = options.apiServer || options.requestServer;
  const apiOptions = options.apiOptions || options.requestOptions || {};
  const defaultReqOptions = _.omit(apiOptions, 'query');
  const defaultReqQuery = apiOptions.query;
  const apiRouterHandle = function (routeConfig, req, res, next) {
    const urlObj = url.parse(`${apiServer}${routeConfig.cgi}`, true, true);
    urlObj.search = null; // 有 search 时 query 不生效
    urlObj.query = Object.assign({}, defaultReqQuery, req.query, urlObj.query, req.params);

    const reqOptions = Object.assign({
      url: urlObj,
    }, defaultReqOptions);

    requestRemote(reqOptions).then((result) => {
      render(routeConfig, result, req, res);
    }, next);
  };

  const mockEnable = options.mockEnable;
  const mockDir = options.mockDir;
  const mockResultResolver = getResolver(options.mockResultResolver);
  const throwMockError = options.throwMockError;
  const mockRouteHandle = function (routeConfig, req, res, next) {
    getMockData(path.join(mockDir, routeConfig.cgi), req, res).then((result) => {
      return mockResultResolver(result, req, res).then((data) => {
        render(routeConfig, data, req, res);
      });
    }).catch((err) => {
      if (throwMockError) {
        return next(err);
      }
      apiRouterHandle.apply(this, arguments); // 注意这里的 this 和 arguments
    });
  };

  // 先进行路由转换
  _.each(transformRoutes(routes, masterHost), (routeDomainsConfig, routePath) => {
    router.get(routePath, (req, res, next) => {
      const routeConfig = routeDomainsConfig[req.headers.host] || routeDomainsConfig[masterHost];

      if (!routeConfig) {
        return next();
      }

      if (!routeConfig.cgi) {
        return render(routeConfig, {}, req, res);
      }

      if (mockEnable) {
        mockRouteHandle(routeConfig, req, res, next);
      } else {
        apiRouterHandle(routeConfig, req, res, next);
      }
    });
  });

  return router;
};
