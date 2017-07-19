'use strict';

const express = require('express');

/**
 * 路由中间件
 * @param {Object} options 配置
 * @param {Array} options.apiPaths Api路径
 *
 * @param {String} options.viewDir 模板目录
 * @param {Object} options.masterHost 主域名, 在 路径没有配置host(以非"/"开头) 或 没有匹配到域名 是用此域名
 * @param {Object} options.routes 页面路由
 * @param {String|Function} options.renderResultResolver 模板数据处理器
 *
 * @param {String} options.requestServer 请求服务器地址
 * @param {Object} options.requestOptions 请求配置
 *
 * @param {Boolean} options.mockEnable 数据模拟开关
 * @param {String} options.mockDir 模拟数据目录
 * @param {String|Function} options.mockResultResolver 模拟数据处理器
 * @param {Boolean} options.throwMockError 抛出Api模拟数据错误开关
 * @return {Function} 中间件方法
 */
module.exports = (options) => {
  if (!options) {
    // 返回空方法
    return (req, res, next) => next();
  }

  const router = express.Router();

  router.use(require('./api.js')(options));
  router.use(require('./template.js')(options));

  return router;
};
