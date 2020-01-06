const http = require('http');
const path = require('path');
const microExpress = require('../common/MicroExpress');
const MicroRouter = require('../common/MicroRouter');
const {getFile} = require('../common/fileManager');

const app = microExpress();
const router = new MicroRouter();
const server = http.createServer(app.handler());
const FILES_DIR = 'files';

const errorsCode = ['ENOENT', 'ENOTDIR'];

app.use(router.middleware());

app.use((err, req, res, next) => {
  console.log(err);
  res.statusCode = 500;
  res.end(JSON.stringify(err));
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

router.get('/', (req, res) => {
  res.statusCode = 200;
  res.end(`Home page 200`);
});

router.get('(/:url)/*', (req, res) => {
  res.statusCode = 400;
  res.end(`Deep url ${req.params.url} 400`);
});

router.get('*/(:fileName).(:fileExpansion)', (req, res) => {
  res.statusCode = 400;
  res.end(`${req.params.fileName}.${req.params.fileExpansion} deep 400`);
});

process.on('error', (err) => {
  // console.log(err);
});
module.exports = server;
