'use strict';

const fs = require('fs');
const path = require('path');

const chalk = require('chalk');

const readJSONFile = require('./readJsonFile.js');

/**
 * 读取JSON文件
 * @param {String} filePath 文件绝对路径
 * @return {Promise}
 */
module.exports = (filePath, req, res) => {
  const extname = path.extname(filePath);
  if (extname === '.json') {
    return readJSONFile(filePath);
  }
  if (!extname) {
    if (fs.existsSync(`${filePath}.js`)) {
      filePath += '.js';
    } else if (fs.existsSync(`${filePath}.json`)) {
      return readJSONFile(`${filePath}.json`);
    }
  }

  return new Promise((resolve, reject) => {
    fs.exists(filePath, (isExists) => {
      if (!isExists) {
        console.log(chalk.red('[获取模拟数据]'), `文件"${filePath}"不存在`);
        return reject(`文件"${filePath}"不存在`);
      }

      console.log(chalk.blue('[获取模拟数据]'), `开始读取"${filePath}"文件`);
      fs.readFile(filePath, 'utf-8', (err, result) => { // 这里不直接用 require 是为了避免缓存
        if (err) {
          console.log(chalk.red('[获取模拟数据]'), `读取文件"${filePath}"失败`);
          return reject(`读取文件"${filePath}"失败:\n${err.stack || err}`);
        }

        try {
          result = new Function('req', 'res', 'next', result);
        } catch (ex) {
          console.log(chalk.red('[获取模拟数据]'), `文件"${filePath}"转换为方法失败`);
          return reject(`文件"${filePath}"转换为方法失败, 内容:\n${result}`);
        }
        result(req, res, (err, result) => {
          if (err) {
            console.log(chalk.red('[获取模拟数据]'), `执行文件"${filePath}"转换的方法失败`);
            return reject(`执行文件"${filePath}"转换的方法失败:\n${err.stack || err}`);
          }
          console.log(chalk.green('[获取模拟数据]'), `执行文件"${filePath}"转换的方法成功`);
          resolve(result);
        });
      });
    });
  });
};
