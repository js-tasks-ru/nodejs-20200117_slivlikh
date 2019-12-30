function sum(a, b) {
  if (
    typeof a !== 'number' ||
    Number.isNaN(a) ||
    typeof b !== 'number' ||
    Number.isNaN(b)
  ) {
    throw new TypeError();
  }

  return a + b;
}

module.exports = sum;
