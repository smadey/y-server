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

  return (req, res, next) => {
    if (options.view) {
      res.status(404).render(options.view);
    } else {
      next();
    }
  };
};
