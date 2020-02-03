const fs = require('fs');
const LimitSizeStream = require('../LimitSizeStream');
const LimitExceededError = require('../LimitExceededError');


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


    // eq.on('close', async (e) => {
    //   if (res.writableEnded) {
    //     return;
    //   }
    //   fs.unlink(path, (err) => {});
    // })
    // it has passed test when node 12.14, but has crashed when 12.4

    req.on('aborted', async (e) => {
      fs.unlink(path, (err) => {});
    }).on('error', (error) => {
      transformStream.destroy();
      writeStream.destroy();
      fs.unlink(path, (err) => {});
      reject(error);
    });

    req.pipe(transformStream).pipe(writeStream);
  });
}

module.exports = {
  writeFile,
};
