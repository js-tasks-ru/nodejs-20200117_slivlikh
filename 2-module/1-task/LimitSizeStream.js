const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.sizeLimit = options.limit;
    this.streamContentLength = 0;
  }

  _transform(chunk, encoding, callback) {
    const chunkString = chunk.toString();
    this.streamContentLength += chunkString.length;
    if (this.streamContentLength <= this.sizeLimit) {
      this.push(chunk);
      callback(null);
      return;
    }
    callback(new LimitExceededError());
  }
}

module.exports = LimitSizeStream;
