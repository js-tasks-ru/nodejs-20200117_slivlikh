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

const errorsCode = ['LIMIT_EXCEEDED'];

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
  console.log(req.headers);
  if (Number(contentLength) === 0) {
    res.setHeader('Connection', 'close');
    res.statusCode = 409;
    res.end();
    next();
    return;
  }
  const fileUri = path.join(path.resolve(__dirname), FILES_DIR, `${req.params.fileName}.${req.params.fileExpansion}`);
  console.log(fileUri);
  const isExist = await isFileExist(fileUri);
  if (isExist) {
    res.setHeader('Connection', 'close');
    res.statusCode = 409;
    res.end();
    return;
  }

  const transformStream = new LimitSizeStream({limit: 1024 * 1024});
  transformStream.on('error', (err) => {
    console.log('error tr');
    next(err);
  });
  const wrightStream = writeFile(fileUri);
  wrightStream.on('error', (err) => {
    console.log('error w');
    next(err);
  }).on('finish', () => {
    console.log('fin');
    wrightStream.close(() => {
      res.statusCode = 201;
      res.end();
    });
  });
  req.on('close', async (e) => {
    await removeFile(fileUri).catch((err) => {
      next(err);
    });
  }).on('error', (error) => {
    console.log('error req');
    next(error);
  });

  req.pipe(transformStream).pipe(wrightStream);
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
