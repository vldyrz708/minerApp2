const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Usar principalmente el modelo del admin que es más completo
const AdminLugar = require('../Admin/model/lugar.model');

// Configuración de multer para guardar archivos en la carpeta "uploads"
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath); // Crear la carpeta si no existe
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // Límite de 2 MB por archivo
});

// Endpoint para obtener lugares (compatible con admin)
router.get('/lugares', async (req, res) => {
  try {
    const lugares = await AdminLugar.find().sort({ createdAt: -1 });
    console.log('Lugares obtenidos:', lugares.length);
    res.json({ lugares });
  } catch (error) {
    console.error('Error al obtener lugares:', error);
    res.status(500).json({ error: 'Error al obtener lugares' });
  }
});

// Endpoint para obtener un lugar específico
router.get('/lugares/:id', async (req, res) => {
  try {
    const lugar = await AdminLugar.findById(req.params.id);
    if (!lugar) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }
    res.json({ lugar });
  } catch (error) {
    console.error('Error al obtener lugar:', error);
    res.status(500).json({ error: 'Error al obtener lugar' });
  }
});

// Endpoint para agregar un lugar con imagen (usando estructura admin)
router.post('/lugares', upload.array('images', 5), async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    console.log('Archivos recibidos:', req.files);

    const { nombre, descripcion, categoria, tags, googleMapsLink, lat, lng } = req.body;

    // Verifica que los datos requeridos estén presentes
    if (!nombre || !descripcion) {
      return res.status(400).json({ error: 'Nombre y descripción son obligatorios' });
    }

    const images = [];
    if (req.files && req.files.length) {
      req.files.forEach(f => images.push('/uploads/' + f.filename));
    }

    const nuevoLugar = new AdminLugar({
      nombre,
      descripcion,
      categoria,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()) : []),
      images,
      googleMapsLink: googleMapsLink && String(googleMapsLink).trim() ? String(googleMapsLink).trim() : undefined,
      location: (!googleMapsLink && lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined
    });

    await nuevoLugar.save();
    res.status(201).json({ lugar: nuevoLugar });
  } catch (error) {
    console.error('Error al agregar lugar:', error);
    res.status(500).json({ error: 'Error al agregar lugar' });
  }
});

module.exports = router;
