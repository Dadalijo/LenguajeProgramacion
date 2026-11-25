# StudyPlan

Análisis inteligente del rendimiento académico estudiantil usando programación multiparadigma. Prototipo universitario local para docentes, tutores y estudiantes.

## Tecnologías
Vue 3, Vue Router, Bootstrap 5, Vite, Express 5, SQLite, Python, Flask, pandas, NumPy y SWI-Prolog. Autenticación con cookies HttpOnly, contraseñas con scrypt y control de acceso por roles en el servidor.

## Instalación y arranque
Requisitos: Node.js 22.13+ (preferiblemente 24 LTS), Python 3.11+ y, para el paradigma lógico formal, SWI-Prolog con swipl disponible en PATH.

Desde StudyPlan:
```bash
npm install
python -m pip install -r analisis/requirements.txt
npm run crear-admin
```
El último comando solicita nombre, correo y contraseña del administrador local. No existen credenciales predeterminadas. Ejecutarlo una vez con un correo que no esté registrado. Las cuentas y actividades anteriores se conservan: la migración agrega campos y tablas sin borrar la base SQLite.

Terminal 1: `python analisis/app.py`
Terminal 2: `npm run dev`
Abrir http://localhost:5173. El frontend redirige /api a Express (3000); este consulta Flask (5001). Para iniciar la versión compilada, usar INICIAR.bat en Windows o npm run build y npm start con Flask ejecutándose aparte.

## Roles y demostración
- Administrador: entra con la cuenta creada por consola; crea docentes y estudiantes, consulta sus cuentas y restablece contraseñas. El autorregistro está deshabilitado.
- Docente: gestiona registros de estudiantes y calificaciones; analiza el CSV de ejemplo, un CSV propio o sus registros; consulta historial, alertas de riesgo y exporta el diagnóstico CSV. El análisis se guarda por docente.
- Estudiante: consulta notas vinculadas por correo, administra sus cursos, actividades, planificador, calendario y alertas. En una cuenta sin cursos, Cargar demostración crea cuatro cursos y diez actividades.
Para demostrar la vinculación, crea un estudiante desde administración, ingresa como docente y registra una nota con el mismo correo del estudiante; luego inicia sesión como estudiante y abre Mis calificaciones. Usa datos ficticios. La importación CSV de análisis genera un informe, no crea cuentas ni publica calificaciones automáticamente.

## Paradigmas
Funcional: funciones puras, filter y reduce. Orientado a objetos: Registro y Analizador. Lógico: predicados de riesgo y consulta en analisis/reglas.pl mediante SWI-Prolog. Si swipl no está disponible, se utilizan reglas equivalentes en Python y la interfaz informa explícitamente ese modo. Para sustentar Prolog, instala SWI-Prolog, verifica swipl --version y comprueba que el resultado indique SWI-Prolog. No es un modelo predictivo validado.

pandas procesa el CSV y agrupa; NumPy calcula media, mediana y desviación poblacional. Umbrales 11, 14 y 75% son supuestos del prototipo; el riesgo se calcula por estudiante y la aprobación por registro. El CSV tiene columnas estudiante, curso, nota (0–20), asistencia (0–100).

## Estructura y datos
frontend/src/views: módulos por perfil. backend/server.js: API REST y permisos; database.js: migraciones; crear-admin.js: cuenta administrativa local. analisis: motor, reglas, servicio Flask y CSV ficticio. Base local backend/data/studyplan.db: usuarios, sesiones, cursos, actividades, registros_academicos e historial_analisis. No se sube la base al repositorio.

## Pruebas
npm test: pruebas de integración con SQLite en memoria, tres roles, CRUD y acceso a calificaciones. npm run build: compilación Vue. Desde analisis, python -m unittest test_motor. Las pruebas no modifican datos reales.

## Alcance y seguridad
Prototipo para exposición local, no listo para producción. El administrador asigna cuentas sin verificación institucional; no existe matrícula por sección ni asignación formal de docentes a estudiantes. El docente solo consulta sus registros e informes, y el estudiante las notas asociadas a su correo. Las alertas se muestran en la interfaz, no por correo ni cuando está cerrada. Para producción se requieren verificación de identidades, autorización por matrícula, HTTPS, auditoría y políticas de tratamiento de datos. GitHub Pages no ejecuta Express ni Flask.

Proyecto desarrollado con asistencia de IA.
