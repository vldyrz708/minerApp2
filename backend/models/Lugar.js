const mongoose = require('mongoose');

const lugarSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  imagen: { type: String, required: true },
  categoria: {
    nombre: { type: String, required: true },
  },
});

module.exports = mongoose.model('Lugar', lugarSchema);
