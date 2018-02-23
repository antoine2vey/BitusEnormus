const Payment = require('./Payment');

class Rob extends Payment {
  getTargetId(id) {
    return id
      .replace(/<@/, '')
      .replace('!', '')
      .replace(/>/, '');
  }
}

module.exports = {
  rob: new Rob(),
};
