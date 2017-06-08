module.exports = (result, req, res) => {
  if (req.path.indexOf('ajax') > -1) {
    return result;
  }

  if (result.code == null) {
    result = { code: 0, data: result };
  }

  if (result.data == null) {
    result.data = {};
  }

  if (result.user == null) {
    result.user = require('./common/user.json');
  }

  return result;
};
