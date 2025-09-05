const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const userSchema = new mongoose.Schema({
  email: {type: String, unique: true},
  password: String
}, { timestamps: true }); // Added timestamps

const pdfSchema = new mongoose.Schema({
  uuid: {type: String, required: true, unique: true },
  filename: {type: String, required: true},
  originalName: {type: String, required: true}, // Added missing field
  userId: { type: ObjectId, ref: 'User', required: true },
  filePath: {type: String, required: true}
}, { timestamps: true }); // Added timestamps

const highlightSchema = new mongoose.Schema({
  pdfUuid: {
    type: String,
    required: true
  },
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  highlightedText: {
    type: String,
    required: true
  },
  boundingBox: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  position: {
    start: Number,
    end: Number
  }
}, { timestamps: true }); // Added timestamps

const userModel = mongoose.model('User', userSchema);
const pdfModel = mongoose.model('PDF', pdfSchema);
const highlightModel = mongoose.model('Highlight', highlightSchema);

module.exports = {
    userModel,
    pdfModel,
    highlightModel
}