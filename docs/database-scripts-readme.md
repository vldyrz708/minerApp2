# Scripts de Base de Datos - MinerApp

## Archivos Disponibles

### 1. `setup_database.js` - Script Principal
Script ejecutable completo para configurar la base de datos con datos de prueba.

**Uso:**
```bash
# Ejecutar con mongosh
mongosh minerAppDB < setup_database.js

# O conectar y ejecutar
mongosh
use minerAppDB
load('setup_database.js')
```

### 2. `database-script.md` - Documentación Completa
Documentación detallada con todos los scripts, explicaciones y consultas de ejemplo.

### 3. Backup y Restore

**Hacer backup:**
```bash
# Backup completo
mongodump --db minerAppDB --out ./backup/$(date +%Y%m%d_%H%M%S)

# Backup solo de una colección
mongodump --db minerAppDB --collection lugares --out ./backup/lugares_$(date +%Y%m%d)
```

**Restaurar backup:**
```bash
# Restaurar completo
mongorestore --db minerAppDB ./backup/YYYYMMDD_HHMMSS/minerAppDB

# Restaurar una colección
mongorestore --db minerAppDB --collection lugares ./backup/lugares_YYYYMMDD/minerAppDB/lugares.bson
```

## Estructura de la Base de Datos

```
minerAppDB/
├── admins (2 documentos)
│   ├── admin_minerapp
│   └── moderador
├── users (3 documentos de prueba)
│   ├── maria@email.com
│   ├── juan@email.com
│   └── ana@email.com
├── categorias (6 documentos)
│   ├── Historia
│   ├── Cultura
│   ├── Naturaleza
│   ├── Gastronomía
│   ├── Aventura
│   └── Hospedaje
└── lugares (10 documentos)
    ├── Panteón Inglés ⭐
    ├── Museo de Minería ⭐
    ├── Centro Histórico ⭐
    ├── Parque Nacional El Chico ⭐
    ├── Peña del Aire
    ├── Casa del Paste ⭐
    ├── Restaurante El Minero
    ├── Teatro Juárez
    └── Hotel Real del Monte
```

## Credenciales de Prueba

### Administradores
- **Username:** `admin_minerapp`
- **Email:** `admin@minerapp.com`
- **Password:** `password`

- **Username:** `moderador`
- **Email:** `moderador@minerapp.com`
- **Password:** `password`

### Usuarios
- **Email:** `maria@email.com` - **Password:** `password`
- **Email:** `juan@email.com` - **Password:** `password`
- **Email:** `ana@email.com` - **Password:** `password`

## Verificación Rápida

```bash
# Contar documentos
mongosh minerAppDB --eval "
print('Lugares: ' + db.lugares.countDocuments());
print('Categorías: ' + db.categorias.countDocuments());
print('Admins: ' + db.admins.countDocuments());
print('Users: ' + db.users.countDocuments());
"

# Verificar índices
mongosh minerAppDB --eval "
print('Índices en lugares: ' + db.lugares.getIndexes().length);
"
```

## Consultas de Ejemplo

```javascript
// Buscar lugares por categoría
db.lugares.find({categoria: "Historia"}, {nombre: 1, categoria: 1});

// Buscar lugares destacados
db.lugares.find({destacado: true}, {nombre: 1, vistas: 1, likes: 1});

// Búsqueda geoespacial (lugares cercanos)
db.lugares.find({
    location: {
        $near: {
            $geometry: {type: "Point", coordinates: [-98.767000, 20.124500]},
            $maxDistance: 1000
        }
    }
}, {nombre: 1});

// Búsqueda de texto
db.lugares.find({$text: {$search: "minero británico"}}, {nombre: 1, score: {$meta: "textScore"}});

// Estadísticas por categoría
db.lugares.aggregate([
    {$group: {_id: "$categoria", total: {$sum: 1}}},
    {$sort: {total: -1}}
]);
```

## Notas Importantes

- ⚠️ Las contraseñas están hasheadas con bcrypt
- 🗺️ Todas las coordenadas están en formato GeoJSON
- 📊 Los índices están optimizados para las consultas más frecuentes
- 🔍 Búsqueda de texto configurada en español
- 📱 Preparado para escalabilidad horizontal

---

*Scripts de Base de Datos - MinerApp*  
*Configuración completa y datos de prueba*  
*Octubre 2025*