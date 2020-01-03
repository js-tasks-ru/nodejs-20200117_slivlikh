const fs = require('fs');

const getFile = function(uri) {
  return new fs.createReadStream(uri);
};

const writeFile = function(destination) {
  return fs.createWriteStream(destination);
};

module.exports = {
  getFile,
  writeFile,
};