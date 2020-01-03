const url = require('url');
const UrlPattern = require('url-pattern');

const ReqMethods = {
  GET: 'get',
  POST: 'post',
};


class MicroRouter {
  constructor() {
    this.getController = new MethodController();
    this.postController = new MethodController();
  }

  get(url, handler) {
    this.getController.registerHandler(url, handler);
  }

  post(url, handler) {
    this.postController.registerHandler(url, handler);
  }

  middleware() {
    return (req, res, next) => {
      const controller = this.resolveController(req);
      controller.executeHandler(req, res, next);
    };
  }

  resolveController(req) {
    switch (req.method.toLowerCase()) {
      case ReqMethods.GET:
        return this.getController;
      case ReqMethods.POST:
        return this.postController;
      default:
        console.warn(`There is not repo for ${req.method} method`);
    }
  }
}


class HandlersRepo {
  constructor() {
    this.handlersRepo = new Map();
  }

  addHandler(key, handler) {
    const pattern = new UrlPattern(key);
    this.handlersRepo.set(pattern, handler);
  }
  getHandler(key) {
   return this.handlersRepo.get(key);
  }

  keys() {
    return this.handlersRepo.keys();
  }
}

class Selector {
  constructor(repo) {
    this.repo = repo;
  }
  selectHandlersByKey(key, params) {
    const handlers = new Map();
    Array.from(this.repo.keys()).forEach((pattern) => {
      if (params.length === handlers.size) {
        return;
      }
      const result = pattern.match(key);
      if (result) {
        handlers.set(this.repo.getHandler(pattern), result);
      }
    });

    return handlers;
  }
}

class MethodController {
  constructor() {
    this.handlersRepo = new HandlersRepo();
    this.repoSelector = new Selector(this.handlersRepo);
  }

  registerHandler(url, handler) {
    this.handlersRepo.addHandler(url, handler);
  }

  async executeHandler(req, res, next) {
    const pathname = url.parse(req.url).pathname;
    const handlersMap = this.repoSelector.selectHandlersByKey(pathname, {length: 1});
    const handlers = Array.from(handlersMap.keys());

    for (const handler of handlers) {
      if (this.isSyncHandler(handler)) {
        const error = this.executeSyncHandler(req, res, handler, handlersMap.get(handler));
        if (error !== undefined) {
          next(error);
          return;
        }
      } else {
        const error = await this.executeAsyncHandler(req, res, handler, handlersMap.get(handler));
        if (error !== undefined) {
          next(error);
          return;
        }
      }
    }
    next();
  }

  executeAsyncHandler(req, res, handler, params) {
    this.addParamsToRequest(req, params);

    return new Promise((resolve) => {
      try {
        handler(req, res, (err) => {
          if (!err) {
            return resolve();
          }
          return resolve(err);
        });
      } catch (e) {
        resolve(e);
      }
    });
  }

  executeSyncHandler(req, res, handler, params) {
    this.addParamsToRequest(req, params);
    try {
      handler(req, res);
    } catch (e) {
      return e;
    }
  }

  isSyncHandler(handler) {
    return handler.length < 3;
  }

  addParamsToRequest(req, params) {
    req.params = params;
  }
}

module.exports = MicroRouter;
