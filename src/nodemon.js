const path = require('path');

const nodemon = require('nodemon');

const resolve = file => path.join(__dirname, file);

const argv = require('./process.argv.js');
const config = require('./config.js');
const middlewares = config.middlewares;

const watchFiles = [config.__filename];

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
  script: resolve('./index.js'),
  watch: watchFiles,
  ext: 'js json html',
  env: {
    argv: argv.__string,
  },
});

process.once('exit', () => server.emit('exit'));
process.once('SIGINT', () => process.exit(0));

// server.on('log', (log) => {
//   console.log(log);
// });
