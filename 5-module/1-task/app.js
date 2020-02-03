const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

class Broadcaster {
  constructor() {
    this.contexts = new Map();
  }

  on(ctx, cb) {
    this.contexts.set(ctx, cb);
  }

  off(ctx) {
    this.contexts.delete(ctx);
  }

  emmit(ctx) {
    const cb = this.contexts.get(ctx);
    cb(ctx);
  }
}

class Chat {
  constructor() {
    this.requestsRepo = new Set();
    this.broadcaster = new Broadcaster();
  }

  async subscribe(ctx) {
    let resolve;
    ctx.res.on('close', () => {
      this.broadcaster.off(ctx);
      this.requestsRepo.delete(ctx);
      resolve();
    });


    return new Promise((res) => {
      resolve = res;
      this.requestsRepo.add(ctx);
      this.broadcaster.on(ctx, () => {
        this.broadcaster.off(ctx);
        res();
      });
    });
  }

  send(message, response) {
    if (!message) {
      response.status = 200;
      response.body = '';
      return;
    }

    this.requestsRepo.forEach((savedCtx) => {
      savedCtx.status = 200;
      savedCtx.body = message;
      this.broadcaster.emmit(savedCtx);
      this.requestsRepo.delete(savedCtx);
    });

    response.status = 200;
    response.body = '';
  }
}

const chat = new Chat();

router.get('/subscribe', async (ctx, next) => {
  await chat.subscribe(ctx);
});

router.post('/publish', async (ctx, next) => {
  chat.send(ctx.request.body.message, ctx.response);
});

app.use(router.routes());

module.exports = app;
