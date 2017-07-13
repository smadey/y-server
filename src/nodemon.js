'use strict';

const path = require('path');

const nodemon = require('nodemon');

const abs = file => path.join(__dirname, file);

const argv = require('./argv.js');
const config = require('./config.js');
const middlewares = config.middlewares;

let watchFiles = [config.__filename];

if (Array.isArray(config.watch)) {
  watchFiles = watchFiles.concat(config.watch);
} else if (typeof config.watch === 'string') {
  watchFiles.push(config.watch);
}

if (Array.isArray(middlewares)) {
  middlewares.forEach((middleware) => {
    if (['api', 'template', 'router'].indexOf(middleware.name) > -1 && middleware.options) {
      if (middleware.options.viewDir) {
        watchFiles.push(middleware.options.viewDir);
      }
      if (middleware.options.mockDir) {
        watchFiles.push(middleware.options.mockDir);
      }
    }
  });
}

const server = nodemon({
  script: abs('./index.js'),
  watch: watchFiles,
  ext: 'js html',
  env: {
    argv: argv.__string,
  },
});

process.once('exit', () => server.emit('exit'));
process.once('SIGINT', () => process.exit(0));

// server.on('log', (log) => {
//   console.log(log);
// });
