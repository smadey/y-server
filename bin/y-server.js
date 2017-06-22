#!/usr/bin/env node

const argv = require('../src/process.argv.js');

if (argv.nodemon) {
  require('../src/nodemon.js');
} else {
  require('../src/index.js');
}

