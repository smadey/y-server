const spawn = require('child_process').spawn;
const path = require('path');

const abs = file => path.join(__dirname, file);

const bins = {
  'y-server': abs('./index'),
};

module.exports = (script) => {
  return new Promise((resolve) => {
    const args = script.split(' ').map(arg => bins[arg] || arg);
    const child = spawn('node', args, { stdio: 'inherit' });

    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    process.once('SIGINT', () => process.exit(0));
    process.once('exit', () => child.kill());

    resolve();
  });
};
