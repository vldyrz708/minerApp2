# Esquemas de Mongoose - MinerApp

## Configuración y Modelos de Datos

### Conexión a MongoDB

```javascript
// database/connection.js
const mongoose = require("mongoose");

const connection = async () => {
  console.log("Conectando a la base de datos...");
  
  try {
    await mongoose.connect("mongodb://localhost:27017/minerAppDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("::: Conectado a la base de datos MongoDB :::");
  } catch (error) {
    console.log("Error en la conexión a la base de datos");
    throw new Error("::: ERROR No se ha podido conectar a la base de datos :::");
  }
};

module.exports = connection;
```

---

## Modelos de Mongoose

### 1. Admin Model

```javascript
// Admin/model/admin.model.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
        unique: true,
        trim: true,
        minlength: [3, 'El username debe tener al menos 3 caracteres'],
        maxlength: [20, 'El username no puede exceder 20 caracteres']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
        // TODO: Implementar hash con bcrypt
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
    collection: 'admins'
});

// Índices
adminSchema.index({ username: 1 }, { unique: true });
adminSchema.index({ email: 1 }, { unique: true });

// Middleware pre-save para hash de contraseña (cuando se implemente)
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    // TODO: Implementar bcrypt
    // this.password = await bcrypt.hash(this.password, 12);
    next();
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
```

### 2. User Model

```javascript
// User/model/user.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    passwordHash: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'users'
});

// Índices
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });

// Método para verificar contraseña (cuando se implemente bcrypt)
UserSchema.methods.comparePassword = async function(candidatePassword) {
    // return await bcrypt.compare(candidatePassword, this.passwordHash);
    return candidatePassword === this.passwordHash; // Temporal
};

module.exports = mongoose.model('User', UserSchema);
```

### 3. Categoria Model

```javascript
// Admin/model/categoria.model.js
const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la categoría es obligatorio'],
        unique: true,
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [30, 'El nombre no puede exceder 30 caracteres']
    },
    slug: {
        type: String,
        required: [true, 'El slug es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9-]+$/, 'El slug solo puede contener letras, números y guiones']
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [200, 'La descripción no puede exceder 200 caracteres']
    },
    icono: {
        type: String,
        trim: true,
        default: 'fas fa-map-marker-alt' // Font Awesome icon class
    },
    color: {
        type: String,
        trim: true,
        match: [/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido'],
        default: '#6B7280'
    },
    activa: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'categorias'
});

// Índices
CategoriaSchema.index({ nombre: 1 }, { unique: true });
CategoriaSchema.index({ slug: 1 }, { unique: true });
CategoriaSchema.index({ activa: 1 });

// Middleware pre-save para generar slug automático
CategoriaSchema.pre('save', function(next) {
    if (this.isModified('nombre') && !this.slug) {
        this.slug = this.nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
            .trim()
            .replace(/\s+/g, '-'); // Espacios a guiones
    }
    next();
});

module.exports = mongoose.model('Categoria', CategoriaSchema);
```

### 4. Lugar Model ⭐ (Principal)

```javascript
// Admin/model/lugar.model.js
const mongoose = require('mongoose');

const lugarSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del lugar es obligatorio'],
        trim: true,
        minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        trim: true,
        enum: {
            values: ['Historia', 'Cultura', 'Naturaleza', 'Gastronomía', 'Arquitectura', 'Recreación'],
            message: '{VALUE} no es una categoría válida'
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [20, 'Cada tag no puede exceder 20 caracteres']
    }],
    images: [{
        type: String,
        trim: true,
        match: [/\.(jpg|jpeg|png|gif|webp)$/i, 'Formato de imagen no válido']
    }],
    
    // Ubicación geográfica
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        }
    },
    
    // Coordenadas alternativas (legacy)
    lat: {
        type: Number,
        min: [-90, 'Latitud debe estar entre -90 y 90'],
        max: [90, 'Latitud debe estar entre -90 y 90']
    },
    lng: {
        type: Number,
        min: [-180, 'Longitud debe estar entre -180 y 180'],
        max: [180, 'Longitud debe estar entre -180 y 180']
    },
    
    // Link de Google Maps (preferido)
    googleMapsLink: {
        type: String,
        trim: true,
        match: [/^https:\/\/(goo\.gl\/maps|maps\.google|google\.com\/maps)/, 'Link de Google Maps inválido']
    },
    
    // Información adicional
    horarios: {
        type: String,
        trim: true,
        maxlength: [200, 'Los horarios no pueden exceder 200 caracteres']
    },
    precio: {
        type: String,
        trim: true,
        maxlength: [100, 'El precio no puede exceder 100 caracteres']
    },
    telefono: {
        type: String,
        trim: true,
        match: [/^[\+]?[0-9\s\-\(\)]{7,15}$/, 'Formato de teléfono inválido']
    },
    sitioWeb: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, 'URL inválida']
    },
    
    // Metadatos
    activo: {
        type: Boolean,
        default: true
    },
    destacado: {
        type: Boolean,
        default: false
    },
    creadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    
    // Estadísticas (futuro)
    vistas: {
        type: Number,
        default: 0,
        min: 0
    },
    likes: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true, // createdAt, updatedAt automáticos
    collection: 'lugares'
});

// Índices
lugarSchema.index({ nombre: 1 });
lugarSchema.index({ categoria: 1 });
lugarSchema.index({ tags: 1 });
lugarSchema.index({ activo: 1 });
lugarSchema.index({ destacado: 1 });
lugarSchema.index({ createdAt: -1 });
lugarSchema.index({ creadoPor: 1 });

// Índice geoespacial para búsquedas por proximidad
lugarSchema.index({ location: '2dsphere' });

// Índice de texto completo para búsquedas
lugarSchema.index({
    nombre: 'text',
    descripcion: 'text',
    tags: 'text'
}, {
    weights: {
        nombre: 10,
        descripcion: 5,
        tags: 1
    },
    name: 'busqueda_texto'
});

// Índice compuesto para consultas frecuentes
lugarSchema.index({ categoria: 1, activo: 1, createdAt: -1 });

// Virtual para URL amigable
lugarSchema.virtual('slug').get(function() {
    return this.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
});

// Middleware pre-save para coordenadas
lugarSchema.pre('save', function(next) {
    // Si hay lat/lng, crear location Point
    if (this.lat && this.lng && !this.location.coordinates.length) {
        this.location = {
            type: 'Point',
            coordinates: [this.lng, this.lat] // MongoDB usa [lng, lat]
        };
    }
    next();
});

// Método estático para búsqueda por proximidad
lugarSchema.statics.findByProximity = function(lng, lat, maxDistance = 1000) {
    return this.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: maxDistance
            }
        },
        activo: true
    });
};

// Método para incrementar vistas
lugarSchema.methods.incrementarVistas = function() {
    this.vistas += 1;
    return this.save();
};

const Lugar = mongoose.model('Lugar', lugarSchema);
module.exports = Lugar;
```

---

## Validaciones y Middleware

### Validaciones Personalizadas

```javascript
// Validación personalizada para coordenadas
const coordenadasValidas = function(location) {
    if (!location || !location.coordinates) return true;
    const [lng, lat] = location.coordinates;
    return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
};

lugarSchema.path('location').validate(coordenadasValidas, 'Coordenadas inválidas');

// Validación para máximo de imágenes
const maxImagenes = function(images) {
    return images.length <= 10;
};

lugarSchema.path('images').validate(maxImagenes, 'Máximo 10 imágenes permitidas');
```

### Middleware de Auditoría

```javascript
// Middleware para tracking de cambios
const auditSchema = new mongoose.Schema({
    modelo: String,
    documentoId: mongoose.Schema.Types.ObjectId,
    accion: String,
    cambios: mongoose.Schema.Types.Mixed,
    usuario: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now }
});

const Audit = mongoose.model('Audit', auditSchema);

// Aplicar a todos los modelos principales
['save', 'remove', 'findOneAndUpdate'].forEach(method => {
    lugarSchema.post(method, function(doc) {
        if (this.isModified && this.isModified()) {
            Audit.create({
                modelo: 'Lugar',
                documentoId: doc._id,
                accion: method,
                cambios: this.getChanges(),
                usuario: this.creadoPor
            });
        }
    });
});
```

---

## Conexión y Configuración

### Variables de Entorno

```javascript
// .env
MONGODB_URI=mongodb://localhost:27017/minerAppDB
MONGODB_URI_TEST=mongodb://localhost:27017/minerAppDB_test
NODE_ENV=development
SESSION_SECRET=minerapp_secret_key_super_secure
BCRYPT_ROUNDS=12
```

### Configuración Avanzada

```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Máximo 10 conexiones
            serverSelectionTimeoutMS: 5000, // Timeout después de 5s
            socketTimeoutMS: 45000, // Cerrar sockets después de 45s
            family: 4 // Usar IPv4, skip IPv6
        });

        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
        
        // Configurar eventos
        mongoose.connection.on('error', err => {
            console.error('❌ Error de MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB desconectado');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB desconectado por terminación de app');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Error de conexión:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

---

*Esquemas de Mongoose - MinerApp v1.0*  
*Modelos de datos con validaciones y optimizaciones*  
*Octubre 2025*