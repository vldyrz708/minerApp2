const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lugar: { type: mongoose.Schema.Types.ObjectId, ref: 'Lugar', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ user: 1, lugar: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
