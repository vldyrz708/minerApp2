const mongoose = require('mongoose');

const lugarSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  categoria: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  images: [{ type: String }],
  // Coordenadas opcionales
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

const Lugar = mongoose.model('Lugar', lugarSchema);
module.exports = Lugar;
