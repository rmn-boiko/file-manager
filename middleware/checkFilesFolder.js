const config = require('../config');
const fs = require('fs');
const fileDirectory = process.cwd() + config.filesDirectory + '/';

module.exports = function(req, res, next) {
  !fs.existsSync(fileDirectory) && fs.mkdirSync(fileDirectory);
  req.fileDirectory = fileDirectory;
  next();
};
