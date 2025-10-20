const Admin = require('../model/admin.model');

// Mostrar formulario de registro
exports.showRegisterForm = (req, res) => {
    res.sendFile(require('path').join(__dirname, '../views/register.html'));
};

// Procesar registro
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validaciones básicas
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Verificar si el usuario ya existe
        const existingAdmin = await Admin.findOne({ 
            $or: [{ username }, { email }]
        });

        if (existingAdmin) {
            return res.status(400).json({ 
                message: 'Usuario o email ya registrado' 
            });
        }

        // Crear nuevo admin
        const admin = new Admin({
            username,
            email,
            password // Nota: En producción, hashear la contraseña
        });

        await admin.save();
        
        res.status(201).json({ 
            message: 'Administrador registrado exitosamente' 
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            message: 'Error al registrar administrador' 
        });
    }
};