# Diagrama de Colecciones y Documentos - MinerApp

## Vista General de la Arquitectura NoSQL

```
                    MINERAPP DATABASE (MongoDB)
                    ═══════════════════════════════
    
    ┌─────────────────────────────────────────────────────────────────────┐
    │                        BASE DE DATOS: minerAppDB                    │
    └─────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
         ┌──────▼──────┐    ┌───────▼──────┐    ┌──────▼──────┐
         │   ADMINS    │    │    USERS     │    │ CATEGORIAS  │
         │             │    │              │    │             │
         │ Collection  │    │ Collection   │    │ Collection  │
         └─────────────┘    └──────────────┘    └─────────────┘
                │                                       │
                │                                       │
                └───────────────┐               ┌───────┘
                                │               │
                         ┌──────▼───────────────▼──────┐
                         │        LUGARES              │
                         │      (Principal)            │
                         │      Collection             │
                         └─────────────────────────────┘
```

## Estructura Detallada por Colección

### 1. COLECCIÓN: `admins`

```
┌─────────────────────────────────────────────────────────────┐
│                        ADMINS                               │
├─────────────────────────────────────────────────────────────┤
│  📋 Propósito: Gestión de administradores del sistema      │
│  📊 Cardinalidad: ~5-10 documentos                         │
│  🔍 Consultas: Por username, email                         │
└─────────────────────────────────────────────────────────────┘

Documento Ejemplo:
{
  "_id": ObjectId("671c1a2b3d4e5f6789abcdef"),
  "username": "admin_minerapp",
  "password": "$2b$10$rHk5...", // [TODO: Hashear]
  "email": "admin@minerapp.com",
  "createdAt": ISODate("2025-10-21T10:30:00Z")
}

📍 Índices:
• username (unique): Autenticación rápida
• email (unique): Recuperación de contraseña
```

### 2. COLECCIÓN: `users`

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                              │
├─────────────────────────────────────────────────────────────┤
│  📋 Propósito: Usuarios finales de la aplicación           │
│  📊 Cardinalidad: ~100-1000+ documentos                    │
│  🔍 Consultas: Por email, fecha de registro                │
└─────────────────────────────────────────────────────────────┘

Documento Ejemplo:
{
  "_id": ObjectId("671c1a2b3d4e5f6789abcd00"),
  "name": "María González",
  "email": "maria.gonzalez@email.com",
  "passwordHash": "$2b$10$aBc123...",
  "createdAt": ISODate("2025-10-21T14:15:30Z")
}

📍 Índices:
• email (unique): Login único por correo
• createdAt: Análisis temporal de registros
```

### 3. COLECCIÓN: `categorias`

```
┌─────────────────────────────────────────────────────────────┐
│                      CATEGORIAS                            │
├─────────────────────────────────────────────────────────────┤
│  📋 Propósito: Clasificación de lugares turísticos         │
│  📊 Cardinalidad: ~6-10 documentos                         │
│  🔍 Consultas: Por nombre, slug                            │
└─────────────────────────────────────────────────────────────┘

Documento Ejemplo:
{
  "_id": ObjectId("671c1a2b3d4e5f6789abcd11"),
  "nombre": "Historia",
  "slug": "historia",
  "createdAt": ISODate("2025-10-21T09:00:00Z")
}

📋 Categorías Predefinidas:
├─ Historia (sitios históricos, museos)
├─ Cultura (tradiciones, eventos)
├─ Naturaleza (parques, senderos)
├─ Gastronomía (restaurantes, especialidades)
├─ Arquitectura (edificios, monumentos)
└─ Recreación (actividades, entretenimiento)

📍 Índices:
• nombre (unique): Evitar duplicados
• slug (unique): URLs amigables
```

### 4. COLECCIÓN: `lugares` ⭐ (PRINCIPAL)

```
┌─────────────────────────────────────────────────────────────┐
│                        LUGARES                             │
├─────────────────────────────────────────────────────────────┤
│  📋 Propósito: Información completa de sitios turísticos   │
│  📊 Cardinalidad: ~50-200+ documentos                      │
│  🔍 Consultas: Por nombre, categoría, tags, ubicación      │
└─────────────────────────────────────────────────────────────┘

Documento Ejemplo Completo:
{
  "_id": ObjectId("671c1a2b3d4e5f6789abcd22"),
  "nombre": "Panteón Inglés",
  "descripcion": "Cementerio histórico que alberga las tumbas de mineros británicos que llegaron a Real del Monte en el siglo XIX. Rodeado de un paisaje único con árboles centenarios.",
  "categoria": "Historia",
  "tags": [
    "cementerio",
    "británico", 
    "mineros",
    "histórico",
    "siglo XIX"
  ],
  "images": [
    "/uploads/panteon_entrada.jpg",
    "/uploads/panteon_tumbas.jpg",
    "/uploads/panteon_paisaje.jpg"
  ],
  "location": {
    "lat": 20.123456,
    "lng": -98.567890
  },
  "googleMapsLink": "https://goo.gl/maps/9Y3z5Z9h9z72",
  "creadoPor": ObjectId("671c1a2b3d4e5f6789abcdef"),
  "createdAt": ISODate("2025-10-21T11:45:00Z"),
  "updatedAt": ISODate("2025-10-21T16:30:00Z")
}

📍 Índices Estratégicos:
• nombre: Búsquedas por nombre de lugar
• categoria: Filtros por tipo de lugar
• tags: Búsquedas por palabras clave
• location (2dsphere): Búsquedas geoespaciales
• createdAt: Ordenamiento temporal
• Texto completo: nombre + descripcion + tags
```

## Diagrama de Relaciones entre Colecciones

```
    RELACIONES EN MINERAPP (NoSQL)
    ════════════════════════════════

    ┌─────────────┐
    │   ADMINS    │ 1
    │ ─────────── │ │
    │ _id (PK)    │ │ creadoPor
    │ username    │ │ (Reference)
    │ password    │ │
    │ email       │ │
    └─────────────┘ │
                    │
                    │ N
                    ▼
    ┌─────────────┐ ┌─────────────────────────┐
    │ CATEGORIAS  │ │        LUGARES          │ ⭐
    │ ─────────── │ │ ─────────────────────── │
    │ _id (PK)    │ │ _id (PK)                │
    │ nombre ◄────┼─┼─categoria (String)      │
    │ slug        │ │ nombre                  │
    └─────────────┘ │ descripcion             │
                    │ tags []                 │
         ┌─────────▲│ images []               │
         │          │ location {}             │
         │          │ googleMapsLink          │
         │          │ creadoPor (ObjectId)    │
         │          └─────────────────────────┘
         │
    ┌─────────────┐
    │    USERS    │
    │ ─────────── │  [Futuras Relaciones]
    │ _id (PK)    │  • favoritos
    │ name        │  • comentarios
    │ email       │  • calificaciones
    │ password    │
    └─────────────┘

    Leyenda:
    ════════
    PK = Primary Key (_id en MongoDB)
    ◄─ = Relación embebida (String)
    ──▶ = Referencia (ObjectId)
    [] = Array embebido
    {} = Objeto embebido
    ⭐ = Colección principal
```

## Patrones de Acceso a Datos

### 1. Consultas Frecuentes (Read-Heavy)

```
┌─────────────────────────────────────────────────────────────┐
│                    PATRONES DE CONSULTA                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 BÚSQUEDAS PRINCIPALES:                                 │
│                                                             │
│  1️⃣ Listar lugares por categoría                           │
│     db.lugares.find({categoria: "Historia"})               │
│                                                             │
│  2️⃣ Buscar lugares cerca de ubicación                      │
│     db.lugares.find({location: {$near: {...}}})           │
│                                                             │
│  3️⃣ Búsqueda de texto completo                            │
│     db.lugares.find({$text: {$search: "minero"}})         │
│                                                             │
│  4️⃣ Filtros combinados                                     │
│     db.lugares.find({                                       │
│       categoria: "Historia",                               │
│       tags: {$in: ["británico"]}                          │
│     })                                                      │
│                                                             │
│  5️⃣ Lugares recientes                                      │
│     db.lugares.find().sort({createdAt: -1}).limit(10)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Agregaciones para Dashboard

```javascript
// Top categorías más populares
db.lugares.aggregate([
  { $group: { _id: "$categoria", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Lugares por mes de creación
db.lugares.aggregate([
  { 
    $group: { 
      _id: { 
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      total: { $sum: 1 }
    }
  }
])
```

## Consideraciones Técnicas NoSQL

### 1. Ventajas del Modelo Elegido

```
✅ VENTAJAS NOSQL PARA MINERAPP:
└─ Flexibilidad de esquema para evolución rápida
└─ Consultas geoespaciales nativas (MongoDB)
└─ Escalabilidad horizontal futura
└─ Rendimiento optimizado para lecturas
└─ Estructura JSON natural para APIs REST
└─ Arrays embebidos para tags e imágenes
└─ Índices de texto completo integrados
```

### 2. Trade-offs y Decisiones de Diseño

```
⚖️ DECISIONES CLAVE:
├─ categoria como String vs ObjectId
│  └─ ✅ Elegido: String (menos joins, más rendimiento)
├─ images como Array vs Colección separada  
│  └─ ✅ Elegido: Array (menos complejidad)
├─ location embebido vs separado
│  └─ ✅ Elegido: Embebido (consultas geoespaciales)
└─ tags como Array vs Colección
   └─ ✅ Elegido: Array (flexibilidad, menos overhead)
```

### 3. Escalabilidad Futura

```
📈 PLAN DE CRECIMIENTO:
├─ Sharding por región geográfica
├─ Réplicas para alta disponibilidad  
├─ Índices parciales para optimización
├─ TTL para datos temporales
└─ Agregaciones pre-calculadas para métricas
```

---

## Datos de Ejemplo Representativos

### Documento Completo de Lugar Turístico

```json
{
  "_id": ObjectId("671c1a2b3d4e5f6789abcd22"),
  "nombre": "Museo de Minería",
  "descripcion": "Museo que exhibe la rica historia minera de Real del Monte, incluyendo herramientas, maquinaria y fotografías históricas de la época dorada de la minería de plata.",
  "categoria": "Historia",
  "tags": ["museo", "minería", "plata", "herramientas", "fotografías", "educativo"],
  "images": [
    "/uploads/museo_fachada.jpg",
    "/uploads/museo_herramientas.jpg", 
    "/uploads/museo_maquinaria.jpg",
    "/uploads/museo_salon_principal.jpg"
  ],
  "location": {
    "lat": 20.125789,
    "lng": -98.567123
  },
  "googleMapsLink": "https://goo.gl/maps/7Y3z5Z9h9z72",
  "creadoPor": ObjectId("671c1a2b3d4e5f6789abcdef"),
  "createdAt": ISODate("2025-10-15T09:30:00Z"),
  "updatedAt": ISODate("2025-10-20T14:45:00Z")
}
```

---

*Diagrama de Colecciones y Documentos - MinerApp v1.0*  
*Sistema NoSQL con MongoDB*  
*Octubre 2025 - UTSH*