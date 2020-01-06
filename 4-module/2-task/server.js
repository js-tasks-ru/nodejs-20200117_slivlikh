const http = require('http');
const path = require('path');
const microExpress = require('../common/MicroExpress');
const MicroRouter = require('../common/MicroRouter');
const {writeFile, removeFile, isFileExist} = require('../common/fileManager');
const LimitSizeStream = require('./LimitSizeStream');
const app = microExpress();
const router = new MicroRouter();
const server = http.createServer(app.handler());
const FILES_DIR = 'files';

app.use(router.middleware());

app.use((err, req, res, next) => {
  // console.log(err);
  if (err.code === 'LIMIT_EXCEEDED') {
    res.statusCode = 413;
  } else if (err.code === 'ZERO') {

  } else {
    // console.log(err);
    res.statusCode = 500;
  }
  res.end(JSON.stringify(err));
});


router.post('/(:fileName).(:fileExpansion)', async (req, res, next) => {
  const contentLength = req.headers['content-length'];
  if (Number(contentLength) === 0) {
    res.setHeader('Connection', 'close');
    res.statusCode = 409;
    res.end();
    next();
    return;
  }
  const fileUri = path.join(path.resolve(__dirname), FILES_DIR, `${req.params.fileName}.${req.params.fileExpansion}`);
  const isExist = await isFileExist(fileUri);
  if (isExist) {
    res.setHeader('Connection', 'close');
    res.statusCode = 409;
    res.end();
    return;
  }

  const writeStream = writeFile(fileUri);
  const transformStream = new LimitSizeStream({limit: 1024 * 1024});
  transformStream.on('error', (err) => {
    next(err);
  });

  req.pipe(transformStream).pipe(writeStream);

  writeStream.on('error', (err) => {
    next(err);
  }).on('close', () => {
    res.statusCode = 201;
    res.end();
  });

  req.on('close', async (e) => {
    if (res.writableEnded) {
      return;
    }
    const error = await removeFile(fileUri);
    if (error) {
      next(error);
    }
  }).on('error', (error) => {
    next(error);
  });
});

router.post('(/:url)/*', (req, res) => {
  res.statusCode = 400;
  res.end(`Deep url ${req.params.url} 400`);
});

router.post('*/(:fileName).(:fileExpansion)', (req, res) => {
  res.statusCode = 400;
  res.end(`${req.params.fileName}.${req.params.fileExpansion} deep 400`);
});

process.on('error', (err) => {
  // console.log(err);
});
module.exports = server;
