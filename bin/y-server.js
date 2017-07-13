#!/usr/bin/env node

const argv = require('../src/argv.js');

if (argv.hot) {
  require('../src/nodemon.js');
} else {
  require('../src/index.js');
}
