'use strict';

const fs = require('fs');
const url = require('url');

const chalk = require('chalk');
const request = require('request');

/**
 * 读取JSON文件
 * @param {String} filePath 文件绝对路径
 * @return {Promise}
 */
module.exports = (requestOptions) => {
  return new Promise((resolve, reject) => {
    const reqUrl = requestOptions.uri || url.format(requestOptions.url);

    console.log(chalk.blue('[数据请求]'), `请求"${reqUrl}"开始`);
    request(requestOptions, (error, response, body) => {
      if (error) {
        console.log(chalk.red('[数据请求]'), `请求"${reqUrl}"出错`);
        reject(error);
      } else if (response.statusCode !== 200) {
        console.log(chalk.red('[数据请求]'), `请求"${reqUrl}"状态码非200`);
        reject(new Error(`Error status code "${response.statusCode}" form remote server`));
      } else {
        let result;
        try {
          result = JSON.parse(body);
        } catch (ex) {
          console.log(chalk.red('[数据请求]'), `请求"${reqUrl}"结果非JSON格式`);
          return reject(`请求"${reqUrl}"结果非JSON格式:\n${body}`);
        }
        console.log(chalk.green('[数据请求]'), `请求"${reqUrl}"成功`);
        resolve(result);
      }
    });
  });
};
