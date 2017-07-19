'use strict';
require('colors');

const getResolver = require('./utils/getResolver.js');

/**
 * 404中间件
 * @param {Object} options 配置
 * @param {String} options.view 404页面模版
 * @return {Function} 中间件方法
 */
module.exports = (options) => {
  if (!options) {
    options = {};
  }

  const renderResultResolver = getResolver(options.renderResultResolver);

  return (req, res, next) => {
    if (options.view) {
      console.log('[404]'.red, `"${req.path}"`);
      renderResultResolver({}, req, res).then((data) => {
        res.status(404).render(options.view, data);
      });
    } else {
      next();
    }
  };
};
