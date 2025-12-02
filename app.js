const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api'); // Importar las rutas de la API
const fs = require('fs');
const app = express();

// Crear la carpeta "uploads" si no existe
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Middleware para analizar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/minerApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Servir la carpeta "uploads" como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos del User
app.use('/user', express.static(path.join(__dirname, 'User')));

// Ruta para la página principal del usuario
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'User', 'index.html'));
});

// Rutas de la API
app.use('/api', apiRoutes); // Asegúrate de que esta línea esté presente

// Iniciar el servidor
const PORT = 3000; // Cambia el puerto si es necesario
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
