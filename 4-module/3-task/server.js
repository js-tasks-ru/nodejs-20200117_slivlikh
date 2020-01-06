const http = require('http');
const path = require('path');
const microExpress = require('../common/MicroExpress');
const MicroRouter = require('../common/MicroRouter');
const {removeFile, isFileExist} = require('../common/fileManager');
const app = microExpress();
const router = new MicroRouter();
const server = http.createServer(app.handler());
const FILES_DIR = 'files';
const errorsCode = ['ENOENT'];

app.use(router.middleware());

app.use((err, req, res, next) => {
  if (err instanceof FileDoesNotExist) {
    res.statusCode = 404;
  } else {
    res.statusCode = 500;
  }
  res.end(JSON.stringify(err));
});

class FileDoesNotExist extends Error {}

router.delete('/(:fileName).(:fileExpansion)', async (req, res, next) => {
  const fileUri = path.join(path.resolve(__dirname), FILES_DIR, `${req.params.fileName}.${req.params.fileExpansion}`);
  const error = await removeFile(fileUri);
  if (error) {
    if (errorsCode.indexOf(error.code) !== -1) {
      next(new FileDoesNotExist());
      return;
    }
    next(error);
    return;
  }
  res.statusCode = 200;
  res.end();
});

router.delete('(/:url)/*', (req, res) => {
  res.statusCode = 400;
  res.end(`Deep url ${req.params.url} 400`);
});

router.delete('*/(:fileName).(:fileExpansion)', (req, res) => {
  res.statusCode = 400;
  res.end(`${req.params.fileName}.${req.params.fileExpansion} deep 400`);
});

process.on('error', (err) => {
  // console.log(err);
});
module.exports = server;
