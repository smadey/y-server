'use strict';
require('colors');

const fs = require('fs');
const path = require('path');

const argv = require('./argv.js');

const relativeConfigFileName = argv.config || 'y-server.config.js';
const absoluteConfigFileName = path.resolve(relativeConfigFileName);

let config;

if (fs.existsSync(absoluteConfigFileName)) {
  config = require(absoluteConfigFileName);
  config = Object.assign({}, config, { __filename: absoluteConfigFileName });
} else {
  console.log(`配置文件 '${relativeConfigFileName}' 未找到`.red);
  process.exit(0);
}

module.exports = config;
