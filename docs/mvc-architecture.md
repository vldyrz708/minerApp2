# Arquitectura MVC - MinerApp

## Descripción General

MinerApp implementa el patrón arquitectónico **Model-View-Controller (MVC)** con una estructura modular que separa la aplicación en dos áreas principales:

- **Admin**: Panel de administración para gestionar lugares, categorías y contenido
- **User**: Interfaz pública para usuarios finales

## Estructura del Proyecto

```
minerApp2-main/
├── Admin/                      # Módulo de Administración
│   ├── controller/            # Controladores Admin
│   │   ├── auth.controller.js
│   │   ├── categoria.controller.js
│   │   ├── lugar.controller.js
│   │   └── register.controller.js
│   ├── model/                 # Modelos Admin
│   │   ├── admin.model.js
│   │   ├── categoria.model.js
│   │   └── lugar.model.js
│   ├── routes/                # Rutas Admin
│   │   ├── ai.routes.js
│   │   ├── auth.routes.js
│   │   ├── categoria.routes.js
│   │   ├── lugar.routes.js
│   │   └── partials.routes.js
│   ├── views/                 # Vistas Admin
│   │   ├── categorias.html
│   │   ├── dashboard.html
│   │   ├── login.html
│   │   ├── lugar_form.html
│   │   ├── lugares.html
│   │   ├── register.html
│   │   └── partials/
│   └── index.admin.js         # Router principal Admin
├── User/                      # Módulo de Usuario
│   ├── controller/            # Controladores User
│   │   └── auth.controller.js
│   ├── model/                 # Modelos User
│   │   └── user.model.js
│   ├── routes/                # Rutas User
│   │   └── auth.routes.js
│   ├── views/                 # Vistas User
│   │   ├── login.html
│   │   └── register.html
│   └── index.html             # Vista principal User
├── backend/                   # Backend alternativo
│   ├── controllers/
│   ├── models/
│   └── routes/
├── models/                    # Modelos compartidos
│   ├── Lugar.js
│   └── index.js
├── routes/                    # Rutas API públicas
│   └── api.js
├── database/                  # Configuración BD
│   └── conection.js
├── public/                    # Archivos estáticos
│   └── js/
├── uploads/                   # Archivos subidos
├── index.js                   # Servidor principal
└── app.js                     # Servidor alternativo
```

## Componentes MVC

### 1. **Models (Modelos)**

#### Admin Models
- **`Admin/model/admin.model.js`**: Modelo para administradores
- **`Admin/model/lugar.model.js`**: Modelo complejo de lugares con imágenes, categorías, coordenadas
- **`Admin/model/categoria.model.js`**: Modelo para categorías de lugares

#### User Models
- **`User/model/user.model.js`**: Modelo para usuarios finales

#### Shared Models
- **`models/Lugar.js`**: Modelo básico de lugar para API pública
- **`backend/models/Lugar.js`**: Modelo alternativo

**Características de los Modelos:**
- Esquemas de Mongoose para MongoDB
- Validaciones de datos
- Relaciones entre entidades
- Hooks y middleware de Mongoose

### 2. **Views (Vistas)**

#### Admin Views
- **Dashboard**: `Admin/views/dashboard.html` - Panel principal con vista previa y acciones rápidas
- **Gestión de Lugares**: `Admin/views/lugares.html`, `Admin/views/lugar_form.html`
- **Gestión de Categorías**: `Admin/views/categorias.html`
- **Autenticación**: `Admin/views/login.html`, `Admin/views/register.html`
- **Partials**: `Admin/views/partials/header.html` - Componentes reutilizables

#### User Views
- **Página Principal**: `User/index.html` - Landing page con lugares destacados
- **Autenticación**: `User/views/login.html`, `User/views/register.html`

**Características de las Vistas:**
- HTML5 con TailwindCSS
- JavaScript vanilla para interactividad
- Responsive design
- Componentes modulares

### 3. **Controllers (Controladores)**

#### Admin Controllers
- **`auth.controller.js`**: Autenticación de administradores
- **`lugar.controller.js`**: CRUD de lugares con filtros, paginación, imágenes
- **`categoria.controller.js`**: Gestión de categorías
- **`register.controller.js`**: Registro de administradores

#### User Controllers
- **`auth.controller.js`**: Autenticación de usuarios finales

#### Backend Controllers
- **`lugaresController.js`**: API controller alternativo

**Características de los Controladores:**
- Lógica de negocio
- Validación de datos
- Manejo de errores
- Middleware de autenticación
- Procesamiento de archivos (multer)

### 4. **Routes (Rutas)**

#### Admin Routes
- **`/admin/auth`**: Autenticación de administradores
- **`/admin/lugares`**: CRUD de lugares
- **`/admin/categorias`**: Gestión de categorías
- **`/admin/ai`**: Funcionalidades de IA
- **`/admin/partials`**: Componentes dinámicos

#### User Routes
- **`/user/auth`**: Autenticación de usuarios
- **`/api/lugares`**: API pública para lugares

**Características de las Rutas:**
- Express Router
- Middleware de autenticación
- Validación de parámetros
- Manejo de archivos
- CORS para API pública

## Flujo de Datos

### Admin Flow
```
Request → Admin Routes → Auth Middleware → Admin Controller → Admin Model → MongoDB
                                                ↓
Response ← Admin View ← Admin Controller ← Query Result ← MongoDB
```

### User Flow
```
Request → User Routes → User Controller → User Model → MongoDB
                              ↓
Response ← User View ← User Controller ← Query Result ← MongoDB
```

### API Flow
```
Request → API Routes → API Controller → Shared Model → MongoDB
                              ↓
JSON Response ← API Controller ← Query Result ← MongoDB
```

## Ventajas de esta Arquitectura

1. **Separación de Responsabilidades**: Cada componente tiene una función específica
2. **Modularidad**: Admin y User son módulos independientes
3. **Reutilización**: Modelos y utilidades compartidas
4. **Escalabilidad**: Fácil agregar nuevos módulos o funcionalidades
5. **Mantenibilidad**: Código organizado y fácil de mantener
6. **Testabilidad**: Componentes aislados facilitan las pruebas

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Database**: MongoDB con Mongoose ODM
- **Authentication**: Sessions, bcryptjs
- **File Upload**: Multer
- **Frontend**: HTML5, TailwindCSS, JavaScript vanilla
- **Architecture**: MVC Pattern

## Configuración de Base de Datos

La aplicación se conecta a MongoDB usando la configuración en `database/conection.js`:
- **Database**: `minerAppDB` o `minerApp`
- **Connection**: `mongodb://localhost:27017/minerAppDB`

## Puntos de Entrada

- **Admin Panel**: `/admin` → Redirige a `/admin/login`
- **User Interface**: `/` → `User/index.html`
- **API**: `/api/lugares` → Acceso público a lugares