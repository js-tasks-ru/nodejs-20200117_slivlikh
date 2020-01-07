const http = require('http');
const path = require('path');
const microExpress = require('../common/MicroExpress');
const MicroRouter = require('../common/MicroRouter');
const {writeFile} = require('../common/fileManager');
const app = microExpress();
const router = new MicroRouter();
const server = http.createServer(app.handler());
const FILES_DIR = 'files';

app.use(router.middleware());

app.use((err, req, res, next) => {
  res.statusCode = 500;
  res.end(JSON.stringify(err));
});


router.post('/(:fileName).(:fileExpansion)', (req, res, next) => {
  const filePath = path.join(path.resolve(__dirname), FILES_DIR, `${req.params.fileName}.${req.params.fileExpansion}`);
  writeFile(req, res, filePath, {limit: 1024 * 1024}).then(() => {
    next();
  }).catch((err) => {
    next(err);
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
