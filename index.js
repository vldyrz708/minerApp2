const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const conection = require('./database/conection');

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'minerapp-secret',
    resave: false,
    saveUninitialized: false
}));

// Conectar a MongoDB
conection();

// Importar router de Admin (ahora exportado desde Admin/index.admin.js)
const adminRouter = require('./Admin/index.admin');

// Ruta principal (User)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/User/index.html'));
});

// Rutas de Admin (solo accesibles mediante /admin/...)
app.use('/admin', adminRouter);

// Archivos estáticos para User
// Servir carpeta pública (css compilado, uploads, etc.) y la carpeta User
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'User')));

// Servir archivos subidos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log(`Panel Admin en http://localhost:${port}/admin`);
});
