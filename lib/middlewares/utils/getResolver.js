'use strict';

/**
 * 获取resolver方法
 * @param {String|Function} resolver 路径或方法
 * @return {Function} resolver方法
 */
module.exports = function (resolver) {
  if (typeof resolver === 'string') {
    try {
      resolver = require(resolver);
    } catch (ex) {
      resolver = null;
    }
  }
  if (typeof resolver !== 'function') {
    resolver = d => d;
  }
  return function () {
    let promise = resolver.apply(null, arguments);

    if (!promise || typeof promise.then !== 'function') {
      promise = Promise.resolve(promise);
    }

    return promise;
  };
};
