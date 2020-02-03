function createServer() {
  return new MicroExpress();
}

function isBaseMiddleware(middleware) {
  return middleware.length <= 3;
}

class MiddlewareRepo {
  constructor() {
    this.middlewares = [];
  }

  addMiddleware(middleware) {
    this.middlewares.push(middleware);
  }

  getMiddlewares() {
    return [...this.middlewares];
  }
}

class MicroExpress {
  constructor() {
    this.baseMiddlewaresRepo = new MiddlewareRepo();
    this.errorMiddlewaresRepo = new MiddlewareRepo();
  }

  use(middleware) {
    this.registerMiddleware(middleware);
  }

  handler() {
    return (req, res) => {
      this.execute(req, res);
    };
  }

  execute(req, res) {
    (async () => {
      const baseMiddlewares = this.baseMiddlewaresRepo.getMiddlewares();
      const error = await this.executeMiddlewares(baseMiddlewares, req, res, undefined);
      if (error === undefined) {
        return;
      }
      const errorMiddlewares = this.errorMiddlewaresRepo.getMiddlewares();
      const errorFromErrMW = await this.executeMiddlewares(errorMiddlewares, req, res, error);
      if (errorFromErrMW !== undefined) {
        throw new Error();
      }
    })();
  }

  executeMiddlewares(middlewares, req, res, err) {
    return new Promise(async (resolve, reject) => {
      for (const middleware of middlewares) {
        const error = await this.executeMiddleware(middleware, req, res, err);
        if (error !== undefined) {
          resolve(error);
          return;
        }
      }

      resolve();
    });
  }

  executeMiddleware(middleware, req, res, err) {
    return new Promise((resolve) => {
      try {
        const passArguments = [req, res, (asyncErr) => {
          if (asyncErr === undefined) {
            resolve();
            return;
          }
          resolve(asyncErr);
        }];
        if (err !== undefined) {
          passArguments.unshift(err);
        }
        middleware(...passArguments);
      } catch (e) {
        resolve(e);
      }
    });
  }

  registerMiddleware(middleware) {
    if (isBaseMiddleware(middleware)) {
      this.baseMiddlewaresRepo.addMiddleware(middleware);
      return;
    }
    this.errorMiddlewaresRepo.addMiddleware(middleware);
  }
}

module.exports = createServer;
