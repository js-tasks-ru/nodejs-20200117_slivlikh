const fs = require('fs');

const getFile = function(path) {
  return new fs.createReadStream(path);
};

const writeFile = function(path) {
  return fs.createWriteStream(path, {
    flags: 'wx',
  });
};

const removeFile = function(path) {
  return new Promise((res, rej) => {
    fs.unlink(path, (err) => {
      if (err) {
        rej(err);
      }
      res();
    });
  });
};

const isFileExist = function(path) {
  return new Promise((res, rej) => {
    fs.access(path, fs.constants.F_OK, (err) => {
      if (err) {
        res(false);
        return;
      }
      res(true);
    });
  });
};

module.exports = {
  getFile,
  writeFile,
  removeFile,
  isFileExist,
};
