const mongoose = require('mongoose');
const { Schema } = mongoose;

const boardSchema = new Schema({
  name: String,
  size: Number,
  rubyGoogleId: String,
  pearlGoogleId: String,
  nullSpaces: Array,
  redTotal: Number,
  blueTotal: Number,
  currPlayer: String,
  gameDone: { type: Boolean, default: false},
});

mongoose.model('board', boardSchema);
