const express = require('express');
const mongoose = require('mongoose');
const lugaresRoutes = require('./routes/lugaresRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a la base de datos
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a la base de datos'))
  .catch((error) => console.error('Error al conectar a la base de datos:', error));

// Middleware
app.use(express.json());

// Rutas
app.use('/api', lugaresRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
