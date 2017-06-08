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

  return (req, res, next) => {
    if (options.view) {
      res.status(500).render(options.view, { msg: err });
    } else {
      next();
    }
  };
};
