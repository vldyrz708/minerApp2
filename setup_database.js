// Script ejecutable para MongoDB - MinerApp
// Uso: mongosh minerAppDB < setup_database.js

print("🚀 Iniciando setup de base de datos MinerApp...");
print("📅 " + new Date().toISOString());

// Usar la base de datos
use minerAppDB;

print("\n📊 Creando colecciones e índices...");

// ====================================
// 1. COLECCIÓN ADMINS
// ====================================
print("👨‍💼 Configurando colección 'admins'...");
db.createCollection("admins");

db.admins.createIndex({ "username": 1 }, { unique: true });
db.admins.createIndex({ "email": 1 }, { unique: true });
db.admins.createIndex({ "createdAt": -1 });

print("✅ Índices de admins creados");

// ====================================
// 2. COLECCIÓN USERS
// ====================================
print("👥 Configurando colección 'users'...");
db.createCollection("users");

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "name": 1 });

print("✅ Índices de users creados");

// ====================================
// 3. COLECCIÓN CATEGORIAS
// ====================================
print("📂 Configurando colección 'categorias'...");
db.createCollection("categorias");

db.categorias.createIndex({ "nombre": 1 }, { unique: true });
db.categorias.createIndex({ "slug": 1 }, { unique: true });
db.categorias.createIndex({ "activa": 1 });
db.categorias.createIndex({ "createdAt": -1 });

print("✅ Índices de categorias creados");

// ====================================
// 4. COLECCIÓN LUGARES (PRINCIPAL)
// ====================================
print("📍 Configurando colección 'lugares'...");
db.createCollection("lugares");

// Índices simples
db.lugares.createIndex({ "nombre": 1 });
db.lugares.createIndex({ "categoria": 1 });
db.lugares.createIndex({ "activo": 1 });
db.lugares.createIndex({ "destacado": 1 });
db.lugares.createIndex({ "createdAt": -1 });
db.lugares.createIndex({ "creadoPor": 1 });

// Índices compuestos
db.lugares.createIndex({ "categoria": 1, "activo": 1, "createdAt": -1 });
db.lugares.createIndex({ "categoria": 1, "tags": 1 });
db.lugares.createIndex({ "activo": 1, "destacado": 1 });
db.lugares.createIndex({ "activo": 1, "createdAt": -1 });

// Índice geoespacial
db.lugares.createIndex({ "location": "2dsphere" });

// Índice de texto completo
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
});

print("✅ Índices de lugares creados");

print("\n📝 Insertando datos de prueba...");

// ====================================
// 5. INSERTAR ADMINISTRADORES
// ====================================
print("👨‍💼 Insertando administradores...");

const adminInserts = db.admins.insertMany([
    {
        username: "admin_minerapp",
        password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
        email: "admin@minerapp.com",
        createdAt: new Date()
    },
    {
        username: "moderador",
        password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
        email: "moderador@minerapp.com",
        createdAt: new Date()
    }
]);

print("✅ " + adminInserts.insertedIds.length + " administradores insertados");

// ====================================
// 6. INSERTAR CATEGORÍAS
// ====================================
print("📂 Insertando categorías...");

const categoriaInserts = db.categorias.insertMany([
    {
        nombre: "Historia",
        slug: "historia",
        descripcion: "Sitios históricos y patrimoniales",
        icono: "fas fa-landmark",
        color: "#8B4513",
        activa: true,
        createdAt: new Date()
    },
    {
        nombre: "Cultura",
        slug: "cultura",
        descripcion: "Tradiciones, eventos y manifestaciones culturales",
        icono: "fas fa-theater-masks",
        color: "#9932CC",
        activa: true,
        createdAt: new Date()
    },
    {
        nombre: "Naturaleza",
        slug: "naturaleza",
        descripcion: "Parques, senderos y áreas naturales",
        icono: "fas fa-tree",
        color: "#228B22",
        activa: true,
        createdAt: new Date()
    },
    {
        nombre: "Gastronomía",
        slug: "gastronomia",
        descripcion: "Restaurantes, comida típica y experiencias culinarias",
        icono: "fas fa-utensils",
        color: "#FF6347",
        activa: true,
        createdAt: new Date()
    },
    {
        nombre: "Aventura",
        slug: "aventura",
        descripcion: "Actividades de aventura y deportes extremos",
        icono: "fas fa-mountain",
        color: "#FF8C00",
        activa: true,
        createdAt: new Date()
    },
    {
        nombre: "Hospedaje",
        slug: "hospedaje",
        descripcion: "Hoteles, cabañas y opciones de alojamiento",
        icono: "fas fa-bed",
        color: "#4682B4",
        activa: true,
        createdAt: new Date()
    }
]);

print("✅ " + categoriaInserts.insertedIds.length + " categorías insertadas");

// ====================================
// 7. INSERTAR LUGARES
// ====================================
print("📍 Insertando lugares...");

// Obtener ID del admin para referencias
const adminId = db.admins.findOne({username: "admin_minerapp"})._id;

const lugaresInserts = db.lugares.insertMany([
    // LUGARES HISTÓRICOS
    {
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
    },
    
    // LUGARES DE NATURALEZA
    {
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
    },
    
    // LUGARES GASTRONÓMICOS
    {
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
    },
    
    // LUGARES CULTURALES
    {
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
    },
    
    // HOSPEDAJE
    {
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

print("✅ " + lugaresInserts.insertedIds.length + " lugares insertados");

// ====================================
// 8. INSERTAR USUARIOS DE PRUEBA
// ====================================
print("👥 Insertando usuarios de prueba...");

const usersInserts = db.users.insertMany([
    {
        name: "María González",
        email: "maria@email.com",
        passwordHash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
        createdAt: new Date("2025-10-20T10:30:00Z")
    },
    {
        name: "Juan Pérez",
        email: "juan@email.com",
        passwordHash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
        createdAt: new Date("2025-10-21T14:45:00Z")
    },
    {
        name: "Ana López",
        email: "ana@email.com",
        passwordHash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
        createdAt: new Date("2025-10-21T16:20:00Z")
    }
]);

print("✅ " + usersInserts.insertedIds.length + " usuarios insertados");

// ====================================
// 9. VERIFICACIONES
// ====================================
print("\n🔍 Verificando instalación...");

print("=== RESUMEN DE DATOS ===");
print("📋 Admins: " + db.admins.countDocuments());
print("👥 Users: " + db.users.countDocuments());
print("📂 Categorías: " + db.categorias.countDocuments());
print("📍 Lugares: " + db.lugares.countDocuments());

print("\n=== LUGARES POR CATEGORÍA ===");
db.lugares.aggregate([
    {$group: {_id: "$categoria", total: {$sum: 1}}},
    {$sort: {total: -1}}
]).forEach(function(result) {
    print("📌 " + result._id + ": " + result.total + " lugares");
});

print("\n=== VERIFICACIÓN GEOESPACIAL ===");
print("🗺️ Lugares con coordenadas: " + db.lugares.countDocuments({location: {$exists: true}}));

print("\n=== ÍNDICES CREADOS ===");
const indices = db.lugares.getIndexes();
print("📊 Total índices en lugares: " + indices.length);

print("\n=== TOP 3 LUGARES MÁS VISITADOS ===");
db.lugares.find({activo: true}, {nombre: 1, vistas: 1, likes: 1})
    .sort({vistas: -1})
    .limit(3)
    .forEach(function(lugar) {
        print("🏆 " + lugar.nombre + " - " + lugar.vistas + " vistas, " + lugar.likes + " likes");
    });

print("\n=== PRUEBA DE BÚSQUEDA GEOESPACIAL ===");
const lugaresNear = db.lugares.find({
    location: {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [-98.767000, 20.124500] // Centro histórico
            },
            $maxDistance: 1000 // 1km
        }
    }
}, {nombre: 1}).limit(3);

print("📍 Lugares cerca del Centro Histórico (1km):");
lugaresNear.forEach(function(lugar) {
    print("   • " + lugar.nombre);
});

print("\n=== PRUEBA DE BÚSQUEDA DE TEXTO ===");
const lugaresTexto = db.lugares.find({
    $text: {$search: "minero británico"}
}, {
    nombre: 1, 
    score: {$meta: "textScore"}
}).sort({
    score: {$meta: "textScore"}
}).limit(3);

print("🔍 Búsqueda 'minero británico':");
lugaresTexto.forEach(function(lugar) {
    print("   • " + lugar.nombre + " (relevancia: " + lugar.score.toFixed(2) + ")");
});

print("\n✨ ¡Setup completado exitosamente!");
print("🔑 Credenciales de prueba:");
print("   Admin: admin@minerapp.com / password");
print("   User: maria@email.com / password");
print("\n📚 Consulta la documentación en /docs/ para más información");
print("🌐 Inicia el servidor con: npm start");

print("\n" + "=".repeat(50));
print("✅ BASE DE DATOS MINERAPP LISTA PARA USAR");
print("=".repeat(50));