# Documentación de Base de Datos - MinerApp

## Índice de Documentación NoSQL

Esta carpeta contiene la documentación completa del diseño de base de datos no relacional para **MinerApp**, una aplicación de turismo enfocada en Real del Monte, Hidalgo.

---

## 📁 Archivos de Documentación

### 1. [database-design.md](./database-design.md)
**Diseño General de Base de Datos NoSQL**
- Información general del proyecto
- Modelo no relacional y características
- Descripción detallada de todas las colecciones
- Estrategias de diseño NoSQL (embebido vs referencias)
- Consideraciones de rendimiento e índices
- Escalabilidad y futuras extensiones

### 2. [collections-diagram.md](./collections-diagram.md) 
**Diagrama de Colecciones y Documentos**
- Vista arquitectónica general
- Estructura detallada por colección
- Diagrama de relaciones entre colecciones
- Patrones de acceso a datos
- Consultas frecuentes y agregaciones
- Ejemplos de documentos completos

### 3. [mongoose-schemas.md](./mongoose-schemas.md)
**Esquemas de Mongoose**
- Modelos de datos completos con validaciones
- Configuración de conexión a MongoDB
- Middleware y hooks de Mongoose
- Índices y optimizaciones
- Métodos estáticos y de instancia
- Validaciones personalizadas

### 4. [nosql-vs-sql-analysis.md](./nosql-vs-sql-analysis.md)
**Análisis Comparativo NoSQL vs SQL**
- Justificación de la elección NoSQL
- Comparación estructura SQL hipotética vs NoSQL implementada
- Ventajas y desventajas de cada enfoque
- Casos de uso específicos para MinerApp
- Métricas de decisión técnica

---

## 🎯 Resumen Ejecutivo

### Información del Proyecto
- **Proyecto**: MinerApp - Guía Turística de Real del Monte
- **Tipo de BD**: NoSQL (MongoDB)
- **ODM**: Mongoose (Node.js)
- **Base de Datos**: `minerAppDB`

### Colecciones Principales
1. **`lugares`** ⭐ - Información de sitios turísticos (principal)
2. **`admins`** - Administradores del sistema
3. **`users`** - Usuarios finales de la aplicación  
4. **`categorias`** - Clasificación de lugares turísticos

### Características Clave del Diseño
- **Flexibilidad de Esquema**: Evolución sin migraciones complejas
- **Datos Geoespaciales**: Soporte nativo para ubicaciones (GeoJSON)
- **Arrays Embebidos**: Tags e imágenes en el mismo documento
- **Desnormalización Controlada**: Optimizado para consultas de lectura
- **Índices Estratégicos**: Optimización para búsquedas frecuentes

---

## 🔧 Tecnologías Utilizadas

| Componente | Tecnología | Versión |
|------------|------------|---------|
| **Base de Datos** | MongoDB | 6.0+ |
| **ODM** | Mongoose | 8.19.1 |
| **Backend** | Node.js + Express | 5.1.0 |
| **Validación** | Mongoose Validators | Integrado |
| **Índices** | MongoDB Native | Nativo |

---

## 📊 Modelo de Datos Resumido

```
MINERAPP - Modelo NoSQL
═══════════════════════

┌─────────────┐      ┌─────────────────────────┐
│   ADMINS    │ 1:N  │        LUGARES          │ ⭐
│ ─────────── │────→ │ ─────────────────────── │
│ • username  │      │ • nombre                │
│ • password  │      │ • categoria (String)    │
│ • email     │      │ • tags []               │
└─────────────┘      │ • images []             │
                     │ • location (GeoJSON)    │
┌─────────────┐      │ • creadoPor (ObjectId)  │
│ CATEGORIAS  │      └─────────────────────────┘
│ ─────────── │              │
│ • nombre ◄──┼──────────────┘ (categoria: String)
│ • slug      │
└─────────────┘

┌─────────────┐      [Futuras Relaciones]
│    USERS    │      • favoritos
│ ─────────── │      • comentarios  
│ • name      │      • calificaciones
│ • email     │
└─────────────┘
```

---

## 🚀 Consultas Principales Optimizadas

### 1. Buscar Lugares por Categoría
```javascript
db.lugares.find({ categoria: "Historia", activo: true })
```

### 2. Búsqueda Geoespacial
```javascript
db.lugares.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [-98.567, 20.123] },
      $maxDistance: 1000
    }
  }
})
```

### 3. Búsqueda de Texto Completo
```javascript
db.lugares.find({ $text: { $search: "minero británico" } })
```

### 4. Filtros Combinados
```javascript
db.lugares.find({
  categoria: "Historia",
  tags: { $in: ["británico"] },
  activo: true
}).sort({ createdAt: -1 })
```

---

## 📈 Ventajas del Modelo NoSQL para MinerApp

### ✅ Beneficios Principales
1. **Flexibilidad**: Esquema evolutivo sin migraciones
2. **Rendimiento**: Consultas optimizadas para lecturas frecuentes
3. **Geoespacial**: Soporte nativo para coordenadas y mapas
4. **Simplicidad**: Menos JOINs, consultas más directas
5. **Escalabilidad**: Preparado para crecimiento horizontal
6. **JSON Nativo**: Integración natural con APIs REST

### 🎯 Casos de Uso Optimizados
- Búsqueda de lugares turísticos por categoría
- Localización de sitios cercanos a una ubicación
- Filtrado por múltiples tags y características
- Carga rápida de información completa de lugares
- Búsquedas de texto en nombres y descripciones

---

## 📋 Checklist de Implementación

### ✅ Completado
- [x] Diseño de colecciones principales
- [x] Modelos Mongoose con validaciones
- [x] Índices para optimización de consultas
- [x] Conexión y configuración de MongoDB
- [x] Relaciones entre colecciones definidas
- [x] Documentación técnica completa

### 🔄 En Desarrollo
- [ ] Hash de contraseñas con bcrypt
- [ ] Middleware de auditoría
- [ ] Validaciones avanzadas personalizadas
- [ ] Sistema de caché con Redis

### 🚀 Futuras Extensiones
- [ ] Colección de `favoritos` (usuario ↔ lugares)
- [ ] Colección de `comentarios` y ratings
- [ ] Colección de `rutas` turísticas
- [ ] Sistema de notificaciones
- [ ] Analytics y métricas avanzadas

---

## 👥 Información del Proyecto

- **Institución**: Universidad Tecnológica de la Sierra Hidalguense (UTSH)
- **Proyecto**: MinerApp - Guía Turística Digital
- **Enfoque**: Real del Monte (Mineral del Monte), Hidalgo
- **Tecnología**: Node.js + MongoDB + Express
- **Tipo**: Aplicación Web de Turismo

---

## 📞 Contacto y Mantenimiento

Para consultas sobre la base de datos o modificaciones al esquema, consultar con el equipo de desarrollo del proyecto MinerApp.

*Documentación generada: Octubre 2025*  
*Versión: 1.0*  
*Estado: Activa*