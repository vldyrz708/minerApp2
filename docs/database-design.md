# Diseño de Base de Datos - MinerApp

## Información General

**Proyecto:** MinerApp - Guía Turística de Real del Monte  
**Tipo de Base de Datos:** No Relacional (NoSQL)  
**Sistema de Gestión:** MongoDB  
**ODM:** Mongoose (Node.js)  
**Nombre de la Base de Datos:** `minerAppDB`

---

## Modelo No Relacional

### Características del Diseño NoSQL

- **Flexibilidad de Esquema:** Permite agregar nuevos campos sin modificar documentos existentes
- **Documentos JSON/BSON:** Estructura natural para aplicaciones web modernas
- **Escalabilidad Horizontal:** Preparado para crecimiento futuro
- **Consultas Eficientes:** Optimizado para operaciones de lectura frecuentes en turismo
- **Embebido vs Referencias:** Combinación estratégica según el caso de uso

---

## Colecciones y Documentos

### 1. Colección: `users`
**Propósito:** Gestión de usuarios finales de la aplicación

```json
{
  "_id": ObjectId("..."),
  "name": "Juan Pérez",
  "email": "juan.perez@email.com",
  "passwordHash": "$2b$10$...",
  "createdAt": ISODate("2025-10-21T...")
}
```

**Campos:**
- `_id`: Identificador único automático (ObjectId)
- `name`: Nombre completo del usuario (String, requerido)
- `email`: Correo electrónico (String, único, requerido)
- `passwordHash`: Contraseña hasheada (String, requerido)
- `createdAt`: Fecha de registro (Date, automático)

**Índices:**
- `email`: Único, para autenticación rápida
- `createdAt`: Para consultas por fecha de registro

---

### 2. Colección: `admins`
**Propósito:** Gestión de administradores del panel de control

```json
{
  "_id": ObjectId("..."),
  "username": "admin_usuario",
  "password": "password_hasheado",
  "email": "admin@minerapp.com",
  "createdAt": ISODate("2025-10-21T...")
}
```

**Campos:**
- `_id`: Identificador único automático (ObjectId)
- `username`: Nombre de usuario (String, único, requerido)
- `password`: Contraseña (String, requerido) *[Nota: Pendiente hashear]*
- `email`: Correo electrónico (String, único, requerido)
- `createdAt`: Fecha de creación (Date, automático)

**Índices:**
- `username`: Único, para login rápido
- `email`: Único, para recuperación de contraseña

---

### 3. Colección: `categorias`
**Propósito:** Clasificación de lugares turísticos

```json
{
  "_id": ObjectId("..."),
  "nombre": "Historia",
  "slug": "historia",
  "createdAt": ISODate("2025-10-21T...")
}
```

**Campos:**
- `_id`: Identificador único automático (ObjectId)
- `nombre`: Nombre de la categoría (String, único, requerido)
- `slug`: URL amigable (String, único, requerido)
- `createdAt`: Fecha de creación (Date, automático)

**Categorías Predefinidas:**
- Historia
- Cultura
- Naturaleza
- Gastronomía
- Arquitectura
- Recreación

**Índices:**
- `nombre`: Único
- `slug`: Único, para URLs amigables

---

### 4. Colección: `lugares` ⭐ *Principal*
**Propósito:** Información detallada de lugares turísticos

```json
{
  "_id": ObjectId("..."),
  "nombre": "Panteón Inglés",
  "descripcion": "Cementerio histórico con tumbas de mineros británicos...",
  "categoria": "Historia",
  "tags": ["cementerio", "británico", "mineros", "histórico"],
  "images": [
    "/uploads/panteon_1.jpg",
    "/uploads/panteon_2.jpg"
  ],
  "location": {
    "lat": 20.1234,
    "lng": -98.5678
  },
  "googleMapsLink": "https://goo.gl/maps/9Y3z5Z9h9z72",
  "creadoPor": ObjectId("..."), // Referencia a Admin
  "createdAt": ISODate("2025-10-21T..."),
  "updatedAt": ISODate("2025-10-21T...")
}
```

**Campos:**
- `_id`: Identificador único automático (ObjectId)
- `nombre`: Nombre del lugar (String, requerido)
- `descripcion`: Descripción detallada (String)
- `categoria`: Categoría del lugar (String)
- `tags`: Etiquetas para búsqueda (Array de Strings)
- `images`: Rutas de imágenes (Array de Strings)
- `location`: Coordenadas geográficas (Objeto embebido)
  - `lat`: Latitud (Number)
  - `lng`: Longitud (Number)
- `googleMapsLink`: Enlace a Google Maps (String)
- `creadoPor`: Referencia al administrador creador (ObjectId)
- `createdAt`: Fecha de creación (Date, automático)

**Índices:**
- `nombre`: Para búsquedas por nombre
- `categoria`: Para filtros por categoría
- `tags`: Para búsquedas por etiquetas
- `location`: Geoespacial 2dsphere para búsquedas por proximidad

---

## Relaciones entre Colecciones

### Tipo de Relaciones Implementadas

#### 1. **One-to-Many: Admin → Lugares**
```
Un administrador puede crear múltiples lugares
• Tipo: Referencia (creadoPor: ObjectId)
• Cardinalidad: 1:N
• Implementación: Campo 'creadoPor' en lugares
```

#### 2. **One-to-Many: Categoria → Lugares**
```
Una categoría puede tener múltiples lugares
• Tipo: Embebido (categoria: String)
• Cardinalidad: 1:N
• Implementación: Campo 'categoria' como string
```

### Diagrama de Relaciones

```
┌─────────────┐      creadoPor      ┌─────────────┐
│   ADMINS    │────────────────────→│   LUGARES   │
│             │         1:N         │             │
│ • _id       │                     │ • _id       │
│ • username  │                     │ • nombre    │
│ • password  │                     │ • categoria │
│ • email     │                     │ • creadoPor │
└─────────────┘                     └─────────────┘
                                           │
                                    categoria (string)
                                           │
                                           ↓
┌─────────────┐                     ┌─────────────┐
│    USERS    │                     │ CATEGORIAS  │
│             │                     │             │
│ • _id       │                     │ • _id       │
│ • name      │                     │ • nombre    │
│ • email     │                     │ • slug      │
│ • password  │                     └─────────────┘
└─────────────┘
```

---

## Estrategias de Diseño NoSQL

### 1. **Datos Embebidos vs Referencias**

**Datos Embebidos:**
- `location` en lugares (lat, lng)
- `tags` array en lugares
- `images` array en lugares
- **Ventaja:** Una sola consulta, mejor rendimiento
- **Desventaja:** Documentos más grandes

**Referencias:**
- `creadoPor` en lugares → `admins._id`
- **Ventaja:** Normalización, consistencia
- **Desventaja:** Requiere populate/join

### 2. **Desnormalización Controlada**
- Campo `categoria` como string en lugar de ObjectId
- Permite consultas más rápidas sin joins
- Trade-off: Duplicación vs Rendimiento

### 3. **Flexibilidad de Esquema**
- Campos opcionales para futuras extensiones
- Estructura preparada para nuevos tipos de contenido
- Validación a nivel de aplicación (Mongoose)

---

## Consideraciones de Rendimiento

### Índices Estratégicos
```javascript
// Índices simples
db.lugares.createIndex({ "nombre": 1 })
db.lugares.createIndex({ "categoria": 1 })
db.lugares.createIndex({ "createdAt": -1 })

// Índice compuesto para búsquedas complejas
db.lugares.createIndex({ "categoria": 1, "tags": 1 })

// Índice geoespacial para búsquedas por proximidad
db.lugares.createIndex({ "location": "2dsphere" })

// Índice de texto para búsqueda full-text
db.lugares.createIndex({
  "nombre": "text",
  "descripcion": "text",
  "tags": "text"
})
```

### Consultas Optimizadas
```javascript
// Búsqueda por categoría
db.lugares.find({ categoria: "Historia" })

// Búsqueda geoespacial (lugares cerca de una ubicación)
db.lugares.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [-98.5678, 20.1234] },
      $maxDistance: 1000 // metros
    }
  }
})

// Búsqueda de texto completo
db.lugares.find({ $text: { $search: "minero británico" } })
```

---

## Escalabilidad y Futuras Extensiones

### Colecciones Futuras Planificadas

#### `favoritos` (Usuario → Lugares)
```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "lugarId": ObjectId("..."),
  "createdAt": ISODate("...")
}
```

#### `comentarios` (Usuario → Lugares)
```json
{
  "_id": ObjectId("..."),
  "lugarId": ObjectId("..."),
  "userId": ObjectId("..."),
  "comentario": "Excelente lugar para visitar...",
  "rating": 5,
  "createdAt": ISODate("...")
}
```

#### `rutas` (Rutas Turísticas)
```json
{
  "_id": ObjectId("..."),
  "nombre": "Ruta Histórica",
  "descripcion": "Recorrido por sitios históricos...",
  "lugares": [ObjectId("..."), ObjectId("...")],
  "duracion": "4 horas",
  "dificultad": "Fácil"
}
```

### Consideraciones de Crecimiento
- **Sharding:** Por región geográfica si se expande a otras zonas
- **Replicación:** Para alta disponibilidad
- **Archivado:** Política de retención para datos históricos
- **Cache:** Redis para consultas frecuentes

---

## Ventajas del Modelo NoSQL para MinerApp

1. **Flexibilidad:** Fácil agregar nuevos campos (horarios, precios, etc.)
2. **Rendimiento:** Consultas rápidas para aplicación de lectura intensiva
3. **Escalabilidad:** Preparado para crecimiento horizontal
4. **Desarrollo Ágil:** Esquema evolutivo sin migraciones complejas
5. **Datos Geoespaciales:** Soporte nativo para ubicaciones y mapas
6. **JSON Nativo:** Integración natural con APIs REST y frontend

---

*Documentación generada para MinerApp v1.0*  
*Fecha: Octubre 2025*  
*Autores: Estudiantes UTSH*