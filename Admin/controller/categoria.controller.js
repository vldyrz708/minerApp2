const Categoria = require('../model/categoria.model');

exports.list = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 }).lean();
    // responder JSON para ser consumido por UI
    return res.json(categorias);
  } catch (err) {
    console.error('Error listando categorias', err);
    return res.status(500).json({ message: 'Error listando categorias' });
  }
};

exports.showListView = (req, res) => {
  // servir una vista simple para administrar categorias
  return res.sendFile(require('path').join(__dirname, '../views/categorias.html'));
};

exports.create = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });
    const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cat = new Categoria({ nombre, slug });
    await cat.save();
    return res.status(201).json(cat);
  } catch (err) {
    console.error('Error creando categoria', err);
    return res.status(500).json({ message: 'Error creando categoria' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await Categoria.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Eliminada' });
  } catch (err) {
    console.error('Error eliminando categoria', err);
    return res.status(500).json({ message: 'Error eliminando categoria' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });
    const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cat = await Categoria.findByIdAndUpdate(id, { nombre, slug }, { new: true });
    if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' });
    return res.status(200).json(cat);
  } catch (err) {
    console.error('Error actualizando categoria', err);
    return res.status(500).json({ message: 'Error actualizando categoria' });
  }
};
