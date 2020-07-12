const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

module.exports = {
  hash: (password) => bcrypt.hash(password, SALT_ROUNDS),
  compare: (plaintext, hashed) => bcrypt.compare(plaintext, hashed),
};
