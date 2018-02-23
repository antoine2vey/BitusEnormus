const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

function init() {
  mongoose.connect('mongodb://localhost:27017/mappabot', { useMongoClient: true });
}

module.exports = init;
