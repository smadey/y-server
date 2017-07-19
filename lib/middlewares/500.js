'use strict';
require('colors');

const getResolver = require('./utils/getResolver.js');

/**
 * 错误页中间件
 * @param {Object} options 配置
 * @param {String} options.view 错误页面模版
 * @return {Function} 中间件方法
 */
module.exports = (options) => {
  if (!options) {
    options = {};
  }

  const renderResultResolver = getResolver(options.renderResultResolver);

  return (err, req, res, next) => {
    if (options.view) {
      console.log('[500]'.red, err.stack || err);
      renderResultResolver({ msg: err }, req, res).then((data) => {
        res.status(500).render(options.view, data);
      });
    } else {
      next();
    }
  };
};
