'use strict';

const express = require('express');

/**
 * 跨域中间件
 * @param {Object} options 配置
 * @param {Object} options.path 路径
 * @return {Function} 中间件方法
 */
module.exports = (options) => {
  if (!options) {
    options = {};
  }

  const router = express.Router();

  const corsPath = options.path || '*';

  router.all(corsPath, (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    if(req.method === 'OPTIONS') { /* 让options请求快速返回 */
      res.send(200);
    } else {
      next();
    }
  });

  return router;
};
