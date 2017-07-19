const argv = require('./argv.js');

if (argv.hot) {
  require('./cli-hot.js');
} else {
  require('./cli.js');
}
