const fs = require('fs/promises');
const path = require('path');
const Lugar = require('../model/lugar.model');
const Favorite = require('../../models/Favorite');
require('../../User/model/user.model');

async function safeDelete(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn('No se pudo eliminar la imagen', filePath, err.message);
    }
  }
}

// Listar lugares
exports.list = async (req, res) => {
  try {
    // Si la petición es HTML, enviar la vista (la UI hará las peticiones JSON con filtros)
    if (req.accepts('html')) {
      return res.sendFile(path.join(__dirname, '../views/lugares.html'));
    }

    // Parámetros de búsqueda y filtrado
    const { q, categoria, tag, page = 1, limit = 20, sort = 'createdAt:desc' } = req.query;

    const filter = {};
    if (categoria) filter.categoria = { $regex: categoria, $options: 'i' };
    if (tag) filter.tags = { $in: [new RegExp(tag, 'i')] };

    if (q) {
      // Buscar en nombre y descripción
      filter.$or = [
        { nombre: { $regex: q, $options: 'i' } },
        { descripcion: { $regex: q, $options: 'i' } }
      ];
    }

    // sort parsing (ej: createdAt:desc)
    const [sortField, sortDir] = (sort || 'createdAt:desc').split(':');
    const sortObj = {};
    sortObj[sortField || 'createdAt'] = sortDir === 'asc' ? 1 : -1;

    const skip = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(limit, 10);
    const docs = await Lugar.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit, 10));
    const total = await Lugar.countDocuments(filter);

    const plainDocs = docs.map(doc => doc.toObject());
    let favoriteMeta = {};
    if (plainDocs.length) {
      const lugarIds = plainDocs.map(doc => doc._id);
      const favorites = await Favorite.find({ lugar: { $in: lugarIds } })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

      favoriteMeta = favorites.reduce((acc, fav) => {
        const key = String(fav.lugar);
        if (!acc[key]) {
          acc[key] = { count: 0, sampleUsers: [] };
        }
        acc[key].count += 1;
        if (fav.user && acc[key].sampleUsers.length < 3) {
          acc[key].sampleUsers.push(fav.user.name || fav.user.email || 'Usuario');
        }
        return acc;
      }, {});
    }

    const data = plainDocs.map(doc => {
      const meta = favoriteMeta[doc._id.toString()] || { count: 0, sampleUsers: [] };
      return { ...doc, favoriteCount: meta.count, favoriteUsers: meta.sampleUsers };
    });

    res.json({ data, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    console.error('Error listando lugares:', err);
    res.status(500).json({ message: 'Error al listar lugares' });
  }
};

// Mostrar formulario para crear o editar
exports.showForm = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/lugar_form.html'));
};

// Crear lugar
exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, tags, lat, lng, googleMapsLink } = req.body;
    if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

    const lugar = new Lugar({
      nombre,
      descripcion,
      categoria,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()) : []),
      images: [],
      // preferir link si viene
      googleMapsLink: googleMapsLink && String(googleMapsLink).trim() ? String(googleMapsLink).trim() : undefined,
      location: (!googleMapsLink && lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
      creadoPor: req.session.adminId
    });

    // Adjuntar imágenes subidas (req.files desde multer)
    if (req.files && req.files.length) {
      req.files.forEach(f => lugar.images.push('/uploads/' + f.filename));
    }

    await lugar.save();
    res.status(201).json({ message: 'Lugar creado', lugar });
  } catch (err) {
    console.error('Error creando lugar:', err);
    res.status(500).json({ message: 'Error al crear lugar' });
  }
};

// Obtener un lugar
exports.get = async (req, res) => {
  try {
    const lugar = await Lugar.findById(req.params.id);
    if (!lugar) return res.status(404).json({ message: 'Lugar no encontrado' });
    res.json(lugar);
  } catch (err) {
    console.error('Error obteniendo lugar:', err);
    res.status(500).json({ message: 'Error al obtener lugar' });
  }
};

// Actualizar lugar
exports.update = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, tags, lat, lng, googleMapsLink } = req.body;
    if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

    const update = {
      nombre,
      descripcion,
      categoria,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()) : []),
    };
    if (googleMapsLink && String(googleMapsLink).trim()) {
      update.googleMapsLink = String(googleMapsLink).trim();
      // opcional: eliminar coordenadas si se actualiza con link
      update.location = undefined;
    } else if (lat && lng) {
      update.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
      update.googleMapsLink = undefined;
    }
    // Si vienen archivos, adjuntarlos a images
    const lugar = await Lugar.findById(req.params.id);
    if (!lugar) return res.status(404).json({ message: 'Lugar no encontrado' });

    Object.assign(lugar, update);

    const removeImagesInput = req.body.removeImages ?? req.body['removeImages[]'];
    const removeImages = Array.isArray(removeImagesInput)
      ? removeImagesInput
      : (typeof removeImagesInput === 'string' && removeImagesInput.trim()) ? [removeImagesInput.trim()] : [];

    if (removeImages.length) {
      const normalized = removeImages.map(src => String(src).trim()).filter(Boolean);
      if (normalized.length) {
        const deletionPromises = [];
        normalized.forEach((src) => {
          lugar.images = lugar.images.filter(existing => existing !== src);
          const relativePath = src.replace(/^\/+/, '');
          if (relativePath) {
            const absolutePath = path.join(__dirname, '../../', relativePath);
            deletionPromises.push(safeDelete(absolutePath));
          }
        });
        if (deletionPromises.length) {
          await Promise.allSettled(deletionPromises);
        }
      }
    }

    if (req.files && req.files.length) {
      req.files.forEach(f => lugar.images.push('/uploads/' + f.filename));
    }
    await lugar.save();
    res.json({ message: 'Lugar actualizado', lugar });
  } catch (err) {
    console.error('Error actualizando lugar:', err);
    res.status(500).json({ message: 'Error al actualizar lugar' });
  }
};

// Eliminar lugar
exports.remove = async (req, res) => {
  try {
    const lugar = await Lugar.findByIdAndDelete(req.params.id);
    if (!lugar) return res.status(404).json({ message: 'Lugar no encontrado' });
    res.json({ message: 'Lugar eliminado' });
  } catch (err) {
    console.error('Error eliminando lugar:', err);
    res.status(500).json({ message: 'Error al eliminar lugar' });
  }
};
