'use strict';

const parseArgs = require('minimist');

const argv = process.argv.slice(2);
const envArgv = process.env.argv ? process.env.argv.split(' ') : [];

module.exports = Object.assign({
  __string: argv.join(' '),
}, parseArgs(envArgv), parseArgs(argv));
