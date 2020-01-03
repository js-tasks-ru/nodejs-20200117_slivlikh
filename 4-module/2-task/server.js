const http = require('http');
const path = require('path');
const microExpress = require('../common/MicroExpress');
const MicroRouter = require('../common/MicroRouter');
const {getFile, writeFile} = require('../common/fileManager');
const LimitSizeStream = require('./LimitSizeStream');

const app = microExpress();
const router = new MicroRouter();
const server = http.createServer(app.handler());
const FILES_DIR = 'files';

const errorsCode = ['LIMIT_EXCEEDED'];

app.use(router.middleware());

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_EXCEEDED') {
    res.statusCode = 413;
  } else if (err.code === 'ZERO') {

  } else {
    console.log(err);
    res.statusCode = 500;
  }
  res.end(JSON.stringify(err));
});


router.post('/(:fileName).(:fileExpansion)', (req, res, next) => {
  const contentLength = req.headers['content-length'];
  // console.log(req.headers);
  if (Number(contentLength) === 0) {
    res.statusCode = 409;
    res.end();
    next();
    return;
  }
  const transformStream = new LimitSizeStream({limit: 1024 * 1024});
  transformStream.on('error', (err) => {
    next(err);
  });
  const fileUri = path.join(path.resolve(__dirname), FILES_DIR, `${req.params.fileName}.${req.params.fileExpansion}`);
  const wrightStream = writeFile(fileUri);
  wrightStream.on('error', (err) => {
    next(err);
  });
  req.on('error', (error) => {
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


router.get('/(:fileName).(:fileExpansion)', (req, res, next) => {
  const fileUri = path.join(path.resolve(__dirname), FILES_DIR, `${req.params.fileName}.${req.params.fileExpansion}`);
  getFile(fileUri)
      .on('error', (err) => {
        if (errorsCode.indexOf(err.code) !== -1) {
          res.statusCode = 404;
          res.end(`${req.params.fileName}.${req.params.fileExpansion}`);
          return;
        }

        next(err);
      })
      .on('end', () => {
        next();
      })
      .pipe(res);
});

process.on('error', (err) => {
  console.log(err);
});
module.exports = server;
