const stream = require('stream');
const os = require('os');

const isLastIndex = function(currentIndex, arr) {
  return currentIndex === arr.length - 1;
};
const getLastChar = function(string) {
  return string[string.length - 1];
};
const isLineBreakChar = function(char) {
  return char === os.EOL;
};

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.tail = '';
  }

  _transform(chunk, encoding, callback) {
    const string = this.tail + chunk.toString();
    if (string.indexOf(os.EOL) === -1) {
      this.tail = string;
      callback(null);
      return;
    }
    const splitted = string.split(os.EOL);
    splitted.forEach((line, index) => {
      if (!isLastIndex(index, splitted)) {
        this.push(line);
        return;
      }

      const lastChar = getLastChar(string);
      if (isLineBreakChar(lastChar)) {
        this.push(line);
        callback(null);
        return;
      }

      this.tail = line;
      callback(null);
    });
  }

  _flush(callback) {
    if (this.tail) {
      this.push(this.tail);
    }
    callback();
  }
}

module.exports = LineSplitStream;
