const http = require('http');
const microExpress = require('./MicroExpress');
const MicroRouter = require('./MicroRouter');

const app = microExpress();
const router = new MicroRouter();
const server = http.createServer(app.handler());
// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.end('Home Page');
// });
app.use(router.middleware());

app.use((err, req, res, next) => {
  console.log(err);
  res.statusCode = 500;
  res.end(JSON.stringify(err));
});

router.get('/', (req, res) => {
  res.statusCode = 200;
  res.end('Home Page 1');
});

router.get('/about', (req, res, next) => {
  setTimeout(() => {
    res.statusCode = 200;
    res.end('About Page');
    next();
  }, 2000);
});

router.get('/product(/:id)', (req, res, next) => {
  setTimeout(() => {
    res.statusCode = 200;
    res.end(`Product Page ${req.params.id}`);
    next();
  }, 2000);
});

router.get('(/:url)', (req, res, next) => {
  setTimeout(() => {
    res.statusCode = 200;
    res.end(`First ${req.params.url}`);
    next();
  }, 100);
});

router.get('(/:url)/*', (req, res, next) => {
  setTimeout(() => {
    res.statusCode = 501;
    res.end(`Deep url ${req.params.url} 501`);
    next();
  }, 100);
});

server.listen(3000, () => {
  console.log('server is listening on 3000 port');
});


process.on('error', (err) => {
  // console.log(err);
});
// const url = require('url');
// const http = require('http');
// const path = require('path');
// const stream = require('stream');
// const server = new http.Server();
//
//
//
// server.on('request', (req, res) => {
//   const pathname = url.parse(req.url).pathname.slice(1);
//
//   const filepath = path.join(__dirname, 'files', pathname);
//
//   switch (req.method) {
//     case 'GET':
//
//       break;
//
//     default:
//       res.statusCode = 501;
//       res.end('Not implemented');
//   }
// });
//
// server.on('error', (req, res) => {
//   res.statusCode = 500;
//   res.end('Internal server error 500');
// });
//
// module.exports = server;
