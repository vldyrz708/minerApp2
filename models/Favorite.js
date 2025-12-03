const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lugar: { type: mongoose.Schema.Types.ObjectId, ref: 'Lugar', required: true },
  createdAt: { type: Date, default: Date.now }
});

FavoriteSchema.index({ user: 1, lugar: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
