# StudyPlan

Aplicativo web para organizar actividades académicas, cursos y fechas de entrega.

## Tecnologías
Frontend: Vue 3, Vue Router, Bootstrap 5 y Vite. Backend: Node.js y Express 5. Base de datos: SQLite mediante node:sqlite. Autenticación: sesiones en SQLite, cookies HttpOnly y contraseñas con scrypt y salt.

## Requisitos
Node.js 22.13 o posterior (se recomienda Node 24 LTS) y npm.

## Ejecutar
Desde la carpeta StudyPlan:

```bash
npm install
npm run dev
```

Abrir http://localhost:5173. Vite redirige las solicitudes /api al servidor Express en el puerto 3000. Registrar una cuenta, crear un curso y registrar actividades. La base de datos se crea automáticamente en backend/data/studyplan.db.

## Compilar y ejecutar en un solo servidor
```bash
npm run build
npm start
```
Abrir http://localhost:3000. Para producción utilizar HTTPS y NODE_ENV=production. GitHub Pages no ejecuta el backend; se necesita un servidor Node con almacenamiento persistente.

## Estructura
- frontend/src/views: Inicio, Cursos, Actividades, Calendario y Progreso.
- frontend/src/App.vue: autenticación y navegación.
- frontend/src/store.js: estado compartido y cliente API.
- backend/server.js: API REST y autenticación.
- backend/database.js: creación de tablas y conexión SQLite.

## API
POST /api/registro, /api/login, /api/logout; GET /api/me; GET/POST /api/cursos y /api/actividades; PUT/DELETE /api/cursos/:id y /api/actividades/:id.

## Datos y límites
Cada usuario accede únicamente a sus cursos y actividades. Las tablas son usuarios, sesiones, cursos y actividades. Los datos de la versión anterior basada en LocalStorage no se migran automáticamente. Prototipo académico; antes de exponerlo a Internet requiere pruebas, límites de intentos de autenticación y revisión de seguridad. Proyecto desarrollado con asistencia de IA.
