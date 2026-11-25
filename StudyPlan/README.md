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

## Inicio rápido en Windows
Con Node instalado, ejecutar INICIAR.bat. Instala dependencias, compila e inicia el servidor. Si el navegador abre antes del servidor, actualizar la página.

## Pruebas
Ejecutar `npm test` después de `npm install`. Las pruebas de integración usan SQLite en memoria y verifican registro, sesión, CRUD, fechas inválidas y separación de usuarios. No modifican los datos reales.

## Comprobación
`GET /api/health` devuelve `{ "ok": true }` si el servidor está disponible. Se incluye límite básico de intentos de autenticación; para un despliegue público se requiere revisión adicional.

## Demostración y nuevas herramientas
En una cuenta sin cursos, abrir Resumen y pulsar Cargar demostración. Se guardan cuatro cursos y diez actividades en SQLite con fechas relativas al día actual. La carga no sobrescribe información y se rechaza si ya existen cursos. El centro de alertas muestra actividades vencidas y próximas en tres días; las alertas son internas, no correos ni notificaciones con la aplicación cerrada. El planificador permite cambiar estados, el calendario incluye agenda diaria y Actividades exporta el listado filtrado como CSV. Tras actualizar el repositorio ejecutar npm install para incorporar bootstrap-icons.
