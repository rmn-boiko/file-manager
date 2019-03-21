const config = require('../config');
const fs = require('fs');
const fileDirectory = process.cwd() + config.filesDirectory + '/';

module.exports = function(req, res, next) {
  const regTest = /[.]{2}|[/]/g;
  if (regTest.test(req.params.fileName || req.body.fileName)) {
    return res.status(400).send({ error: 'Bad file name' });
  }
  if (!req.params.fileName && fs.existsSync(fileDirectory + req.body.fileName)) {
    return res.status(400).send({ error: 'File already exist' });
  }
  if (req.params.fileName && !fs.existsSync(fileDirectory + req.params.fileName)) {
    return res.status(404).send({ error: 'File doesnt exist' });
  }
  next();
};
