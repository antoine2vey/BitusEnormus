import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  link: String,
})

module.exports = mongoose.model('photos', photoSchema)
