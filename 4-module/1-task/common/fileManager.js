const fs = require('fs');

function getFile(req, res, path) {
  const errorsCode = ['ENOENT', 'ENOTDIR'];
  return new Promise((resolve, reject) => {
    new fs.createReadStream(path).on('error', (err) => {
      if (errorsCode.includes(err.code)) {
        res.statusCode = 404;
        res.end();
        resolve();
        return;
      }
      reject(err);
    }).on('end', () => {
      resolve();
    }).pipe(res);
  });
}

module.exports = {
  getFile,
};
