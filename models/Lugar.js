const mongoose = require('mongoose');

const LugarSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  imagen: { type: String }, // Ruta de la imagen
  categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
});

module.exports = mongoose.model('Lugar', LugarSchema);
