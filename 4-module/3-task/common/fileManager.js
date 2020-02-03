const fs = require('fs');


function removeFile(req, res, path) {
  const errorsCode = ['ENOENT'];
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      reject(new Error());
      if (!err) {
        res.statusCode = 200;
        res.end();
        return resolve();
      }
      if (errorsCode.includes(err.code)) {
        res.statusCode = 404;
        res.end();
        return resolve();
      }
      reject(err);
    });
  });
}

module.exports = {
  removeFile,
};
