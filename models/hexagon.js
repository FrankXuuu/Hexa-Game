const mongoose = require('mongoose');
const { Schema } = mongoose;

const hexagonSchema = new Schema({
  props: Object,
  q: Number,
  r: Number,
  s: Number,
  board: String
});

mongoose.model('hexagon', hexagonSchema);
