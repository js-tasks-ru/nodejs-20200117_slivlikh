const fs = require('fs');
const LimitSizeStream = require('../2-task/LimitSizeStream');
const LimitExceededError = require('../2-task/LimitExceededError');

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

function writeFile(req, res, path, params) {
  return new Promise(async (resolve, reject) => {
    const contentLength = req.headers['content-length'];
    if (Number(contentLength) === 0) {
      res.setHeader('Connection', 'close');
      res.statusCode = 409;
      res.end();
      resolve();
      return;
    }


    const writeStream = fs.createWriteStream(path, {
      flags: 'wx',
    });

    const transformStream = new LimitSizeStream({limit: params.limit});
    transformStream.on('error', (err) => {
      fs.unlink(path, (err) => {});
      if (err instanceof LimitExceededError) {
        res.setHeader('Connection', 'close');
        res.statusCode = 413;
        res.end('err 413'); // without str in response test is failed, wtf?
        resolve();
        return;
      }
      reject(err);
    });

    writeStream.on('error', (err) => {
      if (err.code === 'EEXIST') {
        res.setHeader('Connection', 'close');
        res.statusCode = 409;
        res.end();
        resolve();
        return;
      }
      fs.unlink(path, (err) => {});
      reject(err);
    }).on('close', () => {
      res.statusCode = 201;
      res.end();
      resolve();
    });

    req.on('close', async (e) => {
      if (res.writableEnded) {
        return;
      }
      fs.unlink(path, (err) => {});
    }).on('error', (error) => {
      fs.unlink(path, (err) => {});
      reject(error);
    });

    req.pipe(transformStream).pipe(writeStream);
  });
}

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
  getFile,
  writeFile,
  removeFile,
};
