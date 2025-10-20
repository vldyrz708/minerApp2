const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Categoria', CategoriaSchema);
