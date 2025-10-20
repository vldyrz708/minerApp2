const Lugar = require('../model/lugar.model');

// Listar lugares
exports.list = async (req, res) => {
  try {
    // Si la petición es HTML, enviar la vista (la UI hará las peticiones JSON con filtros)
    if (req.accepts('html')) {
      return res.sendFile(require('path').join(__dirname, '../views/lugares.html'));
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

    res.json({ data: docs, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    console.error('Error listando lugares:', err);
    res.status(500).json({ message: 'Error al listar lugares' });
  }
};

// Mostrar formulario para crear o editar
exports.showForm = (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/lugar_form.html'));
};

// Crear lugar
exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, tags, lat, lng } = req.body;
    if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

    const lugar = new Lugar({
      nombre,
      descripcion,
      categoria,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()) : []),
      images: [],
      location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
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
    const { nombre, descripcion, categoria, tags, lat, lng } = req.body;
    if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

    const update = {
      nombre,
      descripcion,
      categoria,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()) : []),
    };
    if (lat && lng) update.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
    // Si vienen archivos, adjuntarlos a images
    const lugar = await Lugar.findById(req.params.id);
    if (!lugar) return res.status(404).json({ message: 'Lugar no encontrado' });

    Object.assign(lugar, update);
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
