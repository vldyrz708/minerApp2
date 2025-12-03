const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Usar principalmente el modelo del admin que es más completo
const AdminLugar = require('../Admin/model/lugar.model');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');
const User = require('../User/model/user.model');

function requireUser(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

router.get('/session', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({ authenticated: false });
    }
    const user = await User.findById(req.session.userId).select('name email');
    if (!user) {
      req.session.destroy(() => {});
      return res.json({ authenticated: false });
    }
    const favoriteIds = await Favorite.distinct('lugar', { user: req.session.userId });
    res.json({ authenticated: true, user, favoriteIds });
  } catch (error) {
    console.error('Error al obtener sesión', error);
    res.status(500).json({ error: 'Error al obtener sesión' });
  }
});

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
    let favoriteIds = [];
    if (req.session && req.session.userId) {
      favoriteIds = await Favorite.distinct('lugar', { user: req.session.userId });
    }
    res.json({ lugares, favoriteIds });
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

router.get('/favorites', requireUser, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.session.userId })
      .populate('lugar')
      .sort({ createdAt: -1 });
    res.json({ favorites });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

router.post('/favorites/:lugarId', requireUser, async (req, res) => {
  try {
    const lugarId = req.params.lugarId;
    const lugar = await AdminLugar.findById(lugarId);
    if (!lugar) return res.status(404).json({ error: 'Lugar no encontrado' });
    const existing = await Favorite.findOne({ user: req.session.userId, lugar: lugarId });
    if (existing) return res.json({ favorite: existing, message: 'Ya en favoritos' });
    const favorite = new Favorite({ user: req.session.userId, lugar: lugarId });
    await favorite.save();
    res.status(201).json({ favorite });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({ error: 'Error al agregar favorito' });
  }
});

router.delete('/favorites/:lugarId', requireUser, async (req, res) => {
  try {
    const lugarId = req.params.lugarId;
    await Favorite.findOneAndDelete({ user: req.session.userId, lugar: lugarId });
    res.json({ removed: true });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
});

router.get('/reviews', requireUser, async (req, res) => {
  try {
    const criteria = { user: req.session.userId };
    if (req.query.lugarId) {
      criteria.lugar = req.query.lugarId;
    }
    const reviews = await Review.find(criteria)
      .populate('lugar')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
});

router.post('/reviews', requireUser, async (req, res) => {
  try {
    const { lugarId, rating, comment } = req.body;
    if (!lugarId || !rating) {
      return res.status(400).json({ error: 'Lugar y calificación son obligatorios' });
    }
    const parsedRating = Number(rating);
    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }
    const lugar = await AdminLugar.findById(lugarId);
    if (!lugar) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }
    const review = new Review({
      user: req.session.userId,
      lugar: lugarId,
      rating: parsedRating,
      comment
    });
    await review.save();
    const populated = await review.populate('lugar');
    res.status(201).json({ review: populated });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
});

module.exports = router;
