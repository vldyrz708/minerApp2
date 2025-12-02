const Lugar = require('../models/Lugar'); // Asegúrate de tener un modelo llamado Lugar

// Obtener todos los lugares
exports.getLugares = async (req, res) => {
  try {
    const lugares = await Lugar.find(); // Consulta la colección 'lugars'
    res.status(200).json({ lugares });
  } catch (error) {
    console.error('Error al obtener lugares:', error);
    res.status(500).json({ message: 'Error al obtener lugares' });
  }
};
