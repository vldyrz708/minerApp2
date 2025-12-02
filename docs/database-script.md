# Script Completo de Base de Datos - MinerApp

Este archivo contiene todos los scripts necesarios para crear y poblar la base de datos MongoDB de MinerApp.

## 1. Configuración Inicial

### Conexión a MongoDB
```javascript
// Conectar a MongoDB
use minerAppDB

// Verificar la conexión
db.runCommand({ connectionStatus: 1 })
```

### Eliminar base de datos existente (opcional)
```javascript
// ⚠️ CUIDADO: Esto eliminará toda la base de datos
// db.dropDatabase()
```

## 2. Creación de Colecciones e Índices

### Colección: admins
```javascript
// Crear colección de administradores
db.createCollection("admins")

// Crear índices
db.admins.createIndex({ "username": 1 }, { unique: true })
db.admins.createIndex({ "email": 1 }, { unique: true })
db.admins.createIndex({ "createdAt": -1 })
```

### Colección: users
```javascript
// Crear colección de usuarios
db.createCollection("users")

// Crear índices
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "createdAt": -1 })
db.users.createIndex({ "name": 1 })
```

### Colección: categorias
```javascript
// Crear colección de categorías
db.createCollection("categorias")

// Crear índices
db.categorias.createIndex({ "nombre": 1 }, { unique: true })
db.categorias.createIndex({ "slug": 1 }, { unique: true })
db.categorias.createIndex({ "activa": 1 })
db.categorias.createIndex({ "createdAt": -1 })
```

### Colección: lugares (Principal)
```javascript
// Crear colección de lugares
db.createCollection("lugares")

// Crear índices simples
db.lugares.createIndex({ "nombre": 1 })
db.lugares.createIndex({ "categoria": 1 })
db.lugares.createIndex({ "activo": 1 })
db.lugares.createIndex({ "destacado": 1 })
db.lugares.createIndex({ "createdAt": -1 })
db.lugares.createIndex({ "creadoPor": 1 })

// Crear índices compuestos
db.lugares.createIndex({ "categoria": 1, "activo": 1, "createdAt": -1 })
db.lugares.createIndex({ "categoria": 1, "tags": 1 })
db.lugares.createIndex({ "activo": 1, "destacado": 1 })
db.lugares.createIndex({ "activo": 1, "createdAt": -1 })

// Crear índice geoespacial
db.lugares.createIndex({ "location": "2dsphere" })

// Crear índice de texto completo
db.lugares.createIndex({ 
    "nombre": "text", 
    "descripcion": "text", 
    "tags": "text" 
}, {
    weights: {
        "nombre": 10,
        "descripcion": 5,
        "tags": 1
    },
    name: "lugares_text_index"
})
```

## 3. Datos de Prueba

### Insertar Administradores
```javascript
// Administrador principal
db.admins.insertOne({
    _id: ObjectId(),
    username: "admin_minerapp",
    password: "$2b$10$YourHashedPasswordHere", // Reemplazar con hash real
    email: "admin@minerapp.com",
    createdAt: new Date()
})

// Administrador secundario
db.admins.insertOne({
    _id: ObjectId(),
    username: "moderador",
    password: "$2b$10$YourHashedPasswordHere", // Reemplazar con hash real
    email: "moderador@minerapp.com",
    createdAt: new Date()
})
```

### Insertar Categorías
```javascript
// Categorías principales
db.categorias.insertMany([
    {
        _id: ObjectId(),
        nombre: "Historia",
        slug: "historia",
        descripcion: "Sitios históricos y patrimoniales",
        icono: "fas fa-landmark",
        color: "#8B4513",
        activa: true,
        createdAt: new Date()
    },
    {
        _id: ObjectId(),
        nombre: "Cultura",
        slug: "cultura",
        descripcion: "Tradiciones, eventos y manifestaciones culturales",
        icono: "fas fa-theater-masks",
        color: "#9932CC",
        activa: true,
        createdAt: new Date()
    },
    {
        _id: ObjectId(),
        nombre: "Naturaleza",
        slug: "naturaleza",
        descripcion: "Parques, senderos y áreas naturales",
        icono: "fas fa-tree",
        color: "#228B22",
        activa: true,
        createdAt: new Date()
    },
    {
        _id: ObjectId(),
        nombre: "Gastronomía",
        slug: "gastronomia",
        descripcion: "Restaurantes, comida típica y experiencias culinarias",
        icono: "fas fa-utensils",
        color: "#FF6347",
        activa: true,
        createdAt: new Date()
    },
    {
        _id: ObjectId(),
        nombre: "Aventura",
        slug: "aventura",
        descripcion: "Actividades de aventura y deportes extremos",
        icono: "fas fa-mountain",
        color: "#FF8C00",
        activa: true,
        createdAt: new Date()
    },
    {
        _id: ObjectId(),
        nombre: "Hospedaje",
        slug: "hospedaje",
        descripcion: "Hoteles, cabañas y opciones de alojamiento",
        icono: "fas fa-bed",
        color: "#4682B4",
        activa: true,
        createdAt: new Date()
    }
])
```

### Insertar Lugares
```javascript
// Obtener el ID del admin para la referencia
const adminId = db.admins.findOne({username: "admin_minerapp"})._id;

// Lugares históricos
db.lugares.insertMany([
    {
        _id: ObjectId(),
        nombre: "Panteón Inglés",
        descripcion: "Cementerio histórico que alberga las tumbas de mineros británicos que llegaron a Real del Monte en el siglo XIX. Rodeado de un paisaje único con árboles centenarios y arquitectura funeraria distintiva.",
        categoria: "Historia",
        tags: ["cementerio", "británico", "mineros", "histórico", "siglo XIX", "arquitectura funeraria"],
        images: [
            "/uploads/panteon_entrada_principal.jpg",
            "/uploads/panteon_tumbas_britanicas.jpg", 
            "/uploads/panteon_paisaje_general.jpg"
        ],
        location: {
            type: "Point",
            coordinates: [-98.767890, 20.123456]
        },
        googleMapsLink: "https://goo.gl/maps/9Y3z5Z9h9z72",
        horarios: "Lunes a Domingo: 9:00 AM - 5:00 PM",
        precio: "Entrada libre",
        telefono: "+52 771 797 1234",
        sitioWeb: "",
        activo: true,
        destacado: true,
        creadoPor: adminId,
        vistas: 1247,
        likes: 89,
        createdAt: new Date("2025-10-15T09:30:00Z"),
        updatedAt: new Date("2025-10-20T14:45:00Z")
    },
    {
        _id: ObjectId(),
        nombre: "Museo de Minería",
        descripcion: "Un museo que muestra la historia minera de la región y su impacto en México. Exhibe herramientas, maquinaria y documentos históricos de la época dorada de la minería en Real del Monte.",
        categoria: "Historia",
        tags: ["museo", "minería", "plata", "educativo", "historia", "herramientas"],
        images: [
            "/uploads/museo_entrada.jpg",
            "/uploads/museo_herramientas.jpg",
            "/uploads/museo_exhibicion.jpg"
        ],
        location: {
            type: "Point",
            coordinates: [-98.767123, 20.125789]
        },
        googleMapsLink: "https://goo.gl/maps/7Y3z5Z9h9z72",
        horarios: "Martes a Domingo: 10:00 AM - 6:00 PM",
        precio: "$30 adultos, $15 niños",
        telefono: "+52 771 797 5678",
        sitioWeb: "https://museos.hidalgo.gob.mx/mineria",
        activo: true,
        destacado: true,
        creadoPor: adminId,
        vistas: 892,
        likes: 67,
        createdAt: new Date("2025-10-16T11:15:00Z"),
        updatedAt: new Date("2025-10-21T10:30:00Z")
    },
    {
        _id: ObjectId(),
        nombre: "Centro Histórico",
        descripcion: "El corazón de Real del Monte con calles empedradas, arquitectura colonial y una rica historia minera. Perfecto para caminar y descubrir la esencia del pueblo mágico.",
        categoria: "Historia",
        tags: ["centro histórico", "calles empedradas", "colonial", "pueblo mágico", "arquitectura"],
        images: [
            "/uploads/centro_plaza.jpg",
            "/uploads/centro_calles.jpg",
            "/uploads/centro_iglesia.jpg"
        ],
        location: {
            type: "Point",
            coordinates: [-98.767000, 20.124500]
        },
        googleMapsLink: "https://goo.gl/maps/8Y3z5Z9h9z72",
        horarios: "24 horas",
        precio: "Entrada libre",
        telefono: "",
        sitioWeb: "",
        activo: true,
        destacado: true,
        creadoPor: adminId,
        vistas: 1567,
        likes: 124,
        createdAt: new Date("2025-10-14T08:00:00Z"),
        updatedAt: new Date("2025-10-22T09:15:00Z")
    }
]);

// Lugares de naturaleza
db.lugares.insertMany([
    {
        _id: ObjectId(),
        nombre: "Parque Nacional El Chico",
        descripcion: "Un área natural protegida ideal para senderismo, ciclismo y disfrutar de la naturaleza. Cuenta con bosques de pino y encino, formaciones rocosas únicas y múltiples rutas de diferentes niveles.",
        categoria: "Naturaleza",
        tags: ["parque nacional", "senderismo", "ciclismo", "naturaleza", "bosque", "camping", "escalada"],
        images: [
            "/uploads/parque_entrada.jpg",
            "/uploads/parque_sendero.jpg",
            "/uploads/parque_vista.jpg",
            "/uploads/parque_camping.jpg"
        ],
        location: {
            type: "Point",
            coordinates: [-98.777000, 20.124000]
        },
        googleMapsLink: "https://goo.gl/maps/6Y3z5Z9h9z72",
        horarios: "6:00 AM - 6:00 PM",
        precio: "Entrada libre, camping $50 por persona",
        telefono: "+52 771 715 0123",
        sitioWeb: "https://www.conanp.gob.mx/elchico",
        activo: true,
        destacado: true,
        creadoPor: adminId,
        vistas: 2134,
        likes: 198,
        createdAt: new Date("2025-10-17T07:30:00Z"),
        updatedAt: new Date("2025-10-21T16:20:00Z")
    },
    {
        _id: ObjectId(),
        nombre: "Peña del Aire",
        descripcion: "Formación rocosa espectacular perfecta para escalada en roca y rappel. Ofrece vistas panorámicas impresionantes de la región y es un punto favorito para los amantes de la aventura.",
        categoria: "Aventura",
        tags: ["escalada", "rappel", "aventura", "roca", "vistas panorámicas", "deportes extremos"],
        images: [
            "/uploads/pena_aire_vista.jpg",
            "/uploads/pena_aire_escalada.jpg",
            "/uploads/pena_aire_panoramica.jpg"
        ],
        location: {
            type: "Point",
            coordinates: [-98.775500, 20.126800]
        },
        googleMapsLink: "https://goo.gl/maps/5Y3z5Z9h9z72",
        horarios: "7:00 AM - 5:00 PM (recomendado)",
        precio: "Entrada libre, equipo de renta disponible",
        telefono: "+52 771 797 9999",
        sitioWeb: "",
        activo: true,
        destacado: false,
        creadoPor: adminId,
        vistas: 456,
        likes: 78,
        createdAt: new Date("2025-10-18T10:45:00Z"),
        updatedAt: new Date("2025-10-20T14:00:00Z")
    }
]);

// Lugares gastronómicos
db.lugares.insertMany([
    {
        _id: ObjectId(),
        nombre: "Casa del Paste",
        descripcion: "Descubre la historia y el sabor del tradicional paste, un legado británico que se ha convertido en el platillo emblemático de Real del Monte. Auténticos pastes preparados con recetas familiares.",
        categoria: "Gastronomía",
        tags: ["paste", "gastronomía", "británico", "tradicional", "comida típica", "familiar"],
        images: [
            "/uploads/casa_paste_exterior.jpg",
            "/uploads/casa_paste_pastes.jpg",
            "/uploads/casa_paste_interior.jpg"
        ],
        location: {
            type: "Point",
            coordinates: [-98.766800, 20.124200]
        },
        googleMapsLink: "https://goo.gl/maps/4Y3z5Z9h9z72",
        horarios: "Lunes a Domingo: 8:00 AM - 8:00 PM",
        precio: "Pastes desde $25, menú completo desde $80",
        telefono: "+52 771 797 2345",
        sitioWeb: "",
        activo: true,
        destacado: true,
        creadoPor: adminId,
        vistas: 967,
        likes: 145,
        createdAt: new Date("2025-10-19T12:00:00Z"),
        updatedAt: new Date("2025-10-21T18:30:00Z")
    },
    {
        _id: ObjectId(),
        nombre: "Restaurante El Minero",
        descripcion: "Restaurante tradicional con ambiente minero que ofrece platillos regionales e internacionales. Conocido por sus cortes de carne y su extensa carta de bebidas.",
        categoria: "Gastronomía",
        tags: ["restaurante", "platillos regionales", "carnes", "ambiente minero", "bebidas"],
        images: [
            "/uploads/restaurante_minero_exterior.jpg",
            "/uploads/restaurante_minero_platillo.jpg",
            "/uploads/restaurante_minero_interior.jpg"
        ],
        location: {
            type: "Point",
            coordinates: [-98.766900, 20.124100]
        },
        googleMapsLink: "https://goo.gl/maps/3Y3z5Z9h9z72",
        horarios: "Miércoles a Lunes: 1:00 PM - 10:00 PM",
        precio: "Platillos desde $120, menú ejecutivo $180",
        telefono: "+52 771 797 3456",
        sitioWeb: "",
        activo: true,
        destacado: false,
        creadoPor: adminId,
        vistas: 534,
        likes: 89,
        createdAt: new Date("2025-10-20T15:30:00Z"),
        updatedAt: new Date("2025-10-21T20:15:00Z")
    }
]);

// Lugares culturales
db.lugares.insertMany([
    {
        _id: ObjectId(),
        nombre: "Teatro Juárez",
        descripcion: "Hermoso teatro histórico que alberga eventos culturales, obras de teatro, conciertos y presentaciones artísticas. Un espacio emblemático para la cultura local.",
        categoria: "Cultura",
        tags: ["teatro", "cultura", "eventos", "conciertos", "arte", "histórico"],
        images: [
            "/uploads/teatro_juarez_fachada.jpg",
            "/uploads/teatro_juarez_interior.jpg",
            "/uploads/teatro_juarez_escenario.jpg"
        ],
        location: {
            type: "Point",
            coordinates: [-98.766700, 20.124300]
        },
        googleMapsLink: "https://goo.gl/maps/2Y3z5Z9h9z72",
        horarios: "Según programación de eventos",
        precio: "Variable según evento",
        telefono: "+52 771 797 4567",
        sitioWeb: "https://cultura.hidalgo.gob.mx/teatro-juarez",
        activo: true,
        destacado: false,
        creadoPor: adminId,
        vistas: 312,
        likes: 45,
        createdAt: new Date("2025-10-21T09:00:00Z"),
        updatedAt: new Date("2025-10-21T21:00:00Z")
    }
]);

// Hospedaje
db.lugares.insertMany([
    {
        _id: ObjectId(),
        nombre: "Hotel Real del Monte",
        descripcion: "Hotel boutique en el corazón del pueblo mágico. Habitaciones cómodas con vista a las montañas, restaurant y servicios de primera calidad para una estancia memorable.",
        categoria: "Hospedaje",
        tags: ["hotel", "boutique", "montañas", "restaurant", "pueblo mágico"],
        images: [
            "/uploads/hotel_real_exterior.jpg",
            "/uploads/hotel_real_habitacion.jpg",
            "/uploads/hotel_real_restaurant.jpg"
        ],
        location: {
            type: "Point",
            coordinates: [-98.766600, 20.124400]
        },
        googleMapsLink: "https://goo.gl/maps/1Y3z5Z9h9z72",
        horarios: "24 horas (recepción)",
        precio: "Desde $800 por noche",
        telefono: "+52 771 797 5678",
        sitioWeb: "https://hotelrealdelmonte.com",
        activo: true,
        destacado: false,
        creadoPor: adminId,
        vistas: 678,
        likes: 92,
        createdAt: new Date("2025-10-22T06:00:00Z"),
        updatedAt: new Date("2025-10-22T06:00:00Z")
    }
]);
```

### Insertar Usuarios de Ejemplo
```javascript
// Usuarios de prueba
db.users.insertMany([
    {
        _id: ObjectId(),
        name: "María González",
        email: "maria@email.com",
        passwordHash: "$2b$10$YourHashedPasswordHere", // Reemplazar con hash real
        createdAt: new Date("2025-10-20T10:30:00Z")
    },
    {
        _id: ObjectId(),
        name: "Juan Pérez",
        email: "juan@email.com",
        passwordHash: "$2b$10$YourHashedPasswordHere", // Reemplazar con hash real
        createdAt: new Date("2025-10-21T14:45:00Z")
    },
    {
        _id: ObjectId(),
        name: "Ana López",
        email: "ana@email.com",
        passwordHash: "$2b$10$YourHashedPasswordHere", // Reemplazar con hash real
        createdAt: new Date("2025-10-21T16:20:00Z")
    }
]);
```

## 4. Colecciones Futuras (Extensiones)

### Colección: favoritos
```javascript
// Crear colección para favoritos de usuarios
db.createCollection("favoritos")

// Crear índices
db.favoritos.createIndex({ "userId": 1, "lugarId": 1 }, { unique: true })
db.favoritos.createIndex({ "userId": 1 })
db.favoritos.createIndex({ "lugarId": 1 })
db.favoritos.createIndex({ "createdAt": -1 })

// Estructura del documento
/*
{
    _id: ObjectId(),
    userId: ObjectId(), // Referencia a users
    lugarId: ObjectId(), // Referencia a lugares
    createdAt: Date
}
*/
```

### Colección: comentarios
```javascript
// Crear colección para comentarios y calificaciones
db.createCollection("comentarios")

// Crear índices
db.comentarios.createIndex({ "lugarId": 1 })
db.comentarios.createIndex({ "userId": 1 })
db.comentarios.createIndex({ "rating": 1 })
db.comentarios.createIndex({ "activo": 1 })
db.comentarios.createIndex({ "createdAt": -1 })
db.comentarios.createIndex({ "lugarId": 1, "activo": 1, "createdAt": -1 })

// Estructura del documento
/*
{
    _id: ObjectId(),
    lugarId: ObjectId(), // Referencia a lugares
    userId: ObjectId(), // Referencia a users
    nombreUsuario: String, // Desnormalizado para performance
    comentario: String,
    rating: Number, // 1-5 estrellas
    activo: Boolean,
    moderado: Boolean,
    createdAt: Date,
    updatedAt: Date
}
*/
```

### Colección: rutas
```javascript
// Crear colección para rutas turísticas
db.createCollection("rutas")

// Crear índices
db.rutas.createIndex({ "nombre": 1 })
db.rutas.createIndex({ "dificultad": 1 })
db.rutas.createIndex({ "activa": 1 })
db.rutas.createIndex({ "destacada": 1 })
db.rutas.createIndex({ "createdAt": -1 })

// Estructura del documento
/*
{
    _id: ObjectId(),
    nombre: String,
    descripcion: String,
    lugares: [ObjectId()], // Array de referencias a lugares
    duracion: String, // "2-3 horas", "1 día completo"
    dificultad: String, // "Fácil", "Moderado", "Difícil"
    distancia: Number, // en kilómetros
    tipo: String, // "Caminata", "Ciclismo", "Auto"
    puntoInicio: GeoJSON,
    puntoFin: GeoJSON,
    activa: Boolean,
    destacada: Boolean,
    creadoPor: ObjectId(),
    createdAt: Date,
    updatedAt: Date
}
*/
```

### Colección: analytics
```javascript
// Crear colección para analíticas
db.createCollection("analytics")

// Crear índices
db.analytics.createIndex({ "lugarId": 1, "fecha": -1 })
db.analytics.createIndex({ "fecha": -1 })
db.analytics.createIndex({ "tipo": 1 })

// Estructura del documento
/*
{
    _id: ObjectId(),
    lugarId: ObjectId(),
    fecha: Date,
    vistas: Number,
    busquedas: Number,
    favoritos: Number,
    tipo: String, // "diario", "semanal", "mensual"
    origen: String, // "web", "api", "mobile"
    detalles: {
        navegador: String,
        dispositivo: String,
        ubicacion: String
    }
}
*/
```

## 5. Consultas de Verificación

### Verificar inserción de datos
```javascript
// Contar documentos en cada colección
print("=== VERIFICACIÓN DE DATOS ===")
print("Admins: " + db.admins.countDocuments())
print("Users: " + db.users.countDocuments())
print("Categorías: " + db.categorias.countDocuments())
print("Lugares: " + db.lugares.countDocuments())

// Verificar índices
print("\n=== ÍNDICES CREADOS ===")
print("Índices en lugares:")
db.lugares.getIndexes().forEach(function(index) {
    print("- " + index.name + ": " + JSON.stringify(index.key))
})

// Verificar datos geoespaciales
print("\n=== VERIFICACIÓN GEOESPACIAL ===")
print("Lugares con coordenadas: " + db.lugares.countDocuments({location: {$exists: true}}))

// Verificar categorías únicas
print("\n=== CATEGORÍAS DISPONIBLES ===")
db.categorias.find({activa: true}, {nombre: 1, descripcion: 1}).forEach(function(cat) {
    print("- " + cat.nombre + ": " + cat.descripcion)
})
```

### Consultas de ejemplo
```javascript
// Buscar lugares por categoría
print("\n=== LUGARES POR CATEGORÍA ===")
db.lugares.find({categoria: "Historia"}, {nombre: 1, categoria: 1}).forEach(function(lugar) {
    print("- " + lugar.nombre)
})

// Buscar lugares cercanos (ejemplo)
print("\n=== LUGARES CERCANOS AL CENTRO ===")
db.lugares.find({
    location: {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [-98.767000, 20.124500]
            },
            $maxDistance: 1000 // 1km
        }
    }
}, {nombre: 1}).forEach(function(lugar) {
    print("- " + lugar.nombre)
})

// Buscar por texto
print("\n=== BÚSQUEDA DE TEXTO: 'minero' ===")
db.lugares.find({
    $text: {$search: "minero"}
}, {
    nombre: 1, 
    score: {$meta: "textScore"}
}).sort({
    score: {$meta: "textScore"}
}).forEach(function(lugar) {
    print("- " + lugar.nombre + " (score: " + lugar.score + ")")
})
```

## 6. Scripts de Mantenimiento

### Actualizar estadísticas
```javascript
// Actualizar contadores de vistas aleatoriamente
db.lugares.find().forEach(function(lugar) {
    const randomVistas = Math.floor(Math.random() * 1000) + 100;
    const randomLikes = Math.floor(Math.random() * 200) + 10;
    
    db.lugares.updateOne(
        {_id: lugar._id},
        {
            $set: {
                vistas: randomVistas,
                likes: randomLikes,
                updatedAt: new Date()
            }
        }
    );
});
```

### Limpiar datos de prueba
```javascript
// Función para limpiar datos de prueba (usar con cuidado)
function limpiarDatosPrueba() {
    print("⚠️ Eliminando datos de prueba...");
    
    // Eliminar usuarios de prueba
    const result1 = db.users.deleteMany({email: {$in: ["maria@email.com", "juan@email.com", "ana@email.com"]}});
    print("Usuarios eliminados: " + result1.deletedCount);
    
    // Eliminar lugares de prueba (opcional)
    // const result2 = db.lugares.deleteMany({});
    // print("Lugares eliminados: " + result2.deletedCount);
    
    print("✅ Limpieza completada");
}

// Descomentar para ejecutar:
// limpiarDatosPrueba();
```

### Backup y restore
```bash
# Comando para hacer backup (ejecutar en terminal)
mongodump --db minerAppDB --out ./backup/$(date +%Y%m%d_%H%M%S)

# Comando para restaurar (ejecutar en terminal)
mongorestore --db minerAppDB ./backup/YYYYMMDD_HHMMSS/minerAppDB
```

## 7. Configuración de Producción

### Configuración de seguridad
```javascript
// Crear usuario de aplicación
use admin
db.createUser({
    user: "minerapp_user",
    pwd: "secure_password_here", // Cambiar por password seguro
    roles: [
        { role: "readWrite", db: "minerAppDB" }
    ]
})

// Crear usuario de solo lectura
db.createUser({
    user: "minerapp_readonly",
    pwd: "readonly_password_here", // Cambiar por password seguro
    roles: [
        { role: "read", db: "minerAppDB" }
    ]
})
```

### Configuración de réplicas (producción)
```javascript
// Inicializar replica set
rs.initiate({
    _id: "minerapp-replica",
    members: [
        { _id: 0, host: "localhost:27017" }
    ]
})

// Verificar estado del replica set
rs.status()
```

## 8. Monitoreo y Estadísticas

### Consultas de estadísticas
```javascript
// Estadísticas generales
use minerAppDB

print("=== ESTADÍSTICAS GENERALES ===")
print("Total lugares: " + db.lugares.countDocuments())
print("Lugares activos: " + db.lugares.countDocuments({activo: true}))
print("Lugares destacados: " + db.lugares.countDocuments({destacado: true}))
print("Total categorías: " + db.categorias.countDocuments())
print("Categorías activas: " + db.categorias.countDocuments({activa: true}))

// Lugares por categoría
print("\n=== LUGARES POR CATEGORÍA ===")
db.lugares.aggregate([
    {$group: {_id: "$categoria", total: {$sum: 1}}},
    {$sort: {total: -1}}
]).forEach(function(result) {
    print(result._id + ": " + result.total + " lugares")
})

// Top lugares por vistas
print("\n=== TOP 5 LUGARES MÁS VISITADOS ===")
db.lugares.find({activo: true}, {nombre: 1, vistas: 1, likes: 1})
    .sort({vistas: -1})
    .limit(5)
    .forEach(function(lugar) {
        print(lugar.nombre + " - " + lugar.vistas + " vistas, " + lugar.likes + " likes")
    })
```

---

## Instrucciones de Uso

### 1. Ejecutar script completo:
```bash
# Conectar a MongoDB y ejecutar
mongosh minerAppDB < database_script.js
```

### 2. Ejecutar secciones individuales:
```bash
# Solo crear índices
mongosh minerAppDB --eval "load('crear_indices.js')"

# Solo insertar datos
mongosh minerAppDB --eval "load('insertar_datos.js')"
```

### 3. Verificar instalación:
```bash
# Verificar que todo esté correcto
mongosh minerAppDB --eval "
db.lugares.countDocuments();
db.lugares.getIndexes().length;
"
```

---

*Script de Base de Datos - MinerApp*  
*Versión completa con datos de prueba y configuración*  
*Octubre 2025*