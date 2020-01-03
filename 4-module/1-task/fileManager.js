const fs = require('fs');

const getFile = function(uri) {
  return new fs.createReadStream(uri);
};


module.exports = {
  getFile,
};