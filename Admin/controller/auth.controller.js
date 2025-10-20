const Admin = require('../model/admin.model');

// Mostrar formulario de login
exports.showLoginForm = (req, res) => {
    res.sendFile(require('path').join(__dirname, '../views/login.html'));
};

// Procesar login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validaciones básicas
        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Usuario y contraseña son requeridos' 
            });
        }

        // Buscar admin
        const admin = await Admin.findOne({ username });

        if (!admin || admin.password !== password) { // En producción, usar bcrypt.compare
            return res.status(401).json({ 
                message: 'Credenciales inválidas' 
            });
        }

        // Crear sesión
        req.session.adminId = admin._id;
        req.session.username = admin.username;

        res.status(200).json({ 
            message: 'Login exitoso' 
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            message: 'Error al iniciar sesión' 
        });
    }
};

// Cerrar sesión
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            if (req.accepts('html')) return res.redirect('/admin/login?error=logout');
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        // Si la petición espera HTML, redirigimos al formulario de login
        if (req.accepts('html')) return res.redirect('/admin/login');
        res.status(200).json({ message: 'Sesión cerrada exitosamente' });
    });
};

// Middleware para verificar si está autenticado
exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    }
    // Si la petición espera HTML, redirigir al formulario de login
    if (req.accepts('html')) {
        return res.redirect('/admin/login');
    }
    // Para peticiones API, devolver 401 JSON
    res.status(401).json({ message: 'No autorizado' });
};