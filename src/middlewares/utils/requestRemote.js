'use strict';

const urlFormat = require('url').format;

const chalk = require('chalk');
const request = require('request');

/**
 * 读取JSON文件
 * @param {String} filePath 文件绝对路径
 * @return {Promise}
 */
module.exports = (requestOptions) => {
  return new Promise((resolve, reject) => {
    let uri = requestOptions.uri;

    if (!uri) {
        uri = requestOptions.uri = urlFormat(requestOptions.url);
    }

    console.log(chalk.blue('[数据请求]'), `请求"${uri}"开始`);
    request(requestOptions, (error, response, body) => {
      if (error) {
        console.log(chalk.red('[数据请求]'), `请求"${uri}"出错`);
        reject(error);
      } else if (response.statusCode !== 200) {
        console.log(chalk.red('[数据请求]'), `请求"${uri}"状态码非200`);
        reject(new Error(`Error status code "${response.statusCode}" form remote server`));
      } else {
        let result;
        try {
          result = JSON.parse(body);
        } catch (ex) {
          console.log(chalk.red('[数据请求]'), `请求"${uri}"结果非JSON格式`);
          return reject(`请求"${uri}"结果非JSON格式:\n${body}`);
        }
        console.log(chalk.green('[数据请求]'), `请求"${uri}"成功`);
        resolve(result);
      }
    });
  });
};
