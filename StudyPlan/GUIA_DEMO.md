# Guía de instalación y demostración de StudyPlan

## 1. Requisitos
- Git, Visual Studio Code, Node.js 22.13+ (recomendado 24 LTS) y Python 3.11+.
- SWI-Prolog para la demostración formal del paradigma lógico: https://www.swi-prolog.org/download/stable
- Conexión a Internet para instalar dependencias. No se necesita MySQL, XAMPP ni hosting.

Verifica en una terminal:
```bash
node -v
npm -v
python --version
swipl --version
```
Si swipl no aparece, agrega SWI-Prolog al PATH y reinicia Visual Studio Code. Sin Prolog se ejecutan reglas equivalentes en Python, pero no sirve para demostrar la ejecución formal de Prolog.

## 2. Descargar o actualizar
Si todavía no clonaste el repositorio:
```bash
git clone https://github.com/Dadalijo/LenguajeProgramacion.git
cd LenguajeProgramacion/StudyPlan
```
Si ya lo clonaste, detén el servidor con Ctrl+C, entra a StudyPlan y ejecuta:
```bash
git pull origin main
```
Si Git informa conflictos, no uses reset --hard: revisa tus cambios locales antes de continuar.

## 3. Instalar e iniciar con datos incluidos
Dentro de StudyPlan:
```bash
npm install
python -m pip install -r analisis/requirements.txt
npm run dev:completo
```
Abre http://localhost:5173. Se ejecutan Vite (5173), Express (3000) y Flask (5001). Si 5173 está ocupado, usa la dirección que muestra Vite. Si Python no está disponible como python, inicia Flask mediante el comando correspondiente (por ejemplo, py analisis/app.py) en una terminal y npm run dev en otra.

El primer inicio del backend genera automáticamente la base SQLite local backend/data/studyplan.db y añade cuentas ficticias, 15 registros académicos (12 del docente y 3 de la tutora), cuatro cursos y diez actividades de Ana. No sobrescribe datos existentes. Los siguientes inicios no duplican ni restaura datos ni contraseñas: si ya se ejecutó, conserva los cambios. Si detecta un correo demo existente antes de la primera carga, cancela toda la carga; no borres cuentas reales para resolverlo.

## 4. Cuentas de demostración
Contraseña inicial de todas: **StudyPlanDemo2026!**

| Perfil | Correo | Uso |
|---|---|---|
| Administrador | admin@studyplan.test | Crear cuentas y restablecer contraseñas |
| Docente | docente@studyplan.test | 12 registros, 6 estudiantes |
| Tutora | tutora@studyplan.test | 3 registros independientes |
| Estudiante | ana@studyplan.test | 4 cursos, 10 actividades, 3 notas |
| Estudiante | luis@studyplan.test | 3 notas |
| Estudiante | maria@studyplan.test | 3 notas |
| Estudiante | carlos@studyplan.test | 2 notas |
| Estudiante | lucia@studyplan.test | 2 notas |
| Estudiante | diego@studyplan.test | 2 notas |

Las cuentas y contraseñas son exclusivamente para una exposición local con datos ficticios. No publicar este entorno ni reutilizar esa contraseña. Para una cuenta administrativa propia, usa npm run crear-admin.

## 5. Recorrido de la exposición y pruebas manuales

| ID | Perfil | Acción | Resultado esperado |
|---|---|---|---|
| P01 | Todos | Introducir contraseña incorrecta | Acceso rechazado |
| P02 | Admin | Iniciar sesión | Gestión de usuarios; 2 docentes y 6 estudiantes al inicio |
| P03 | Admin | Crear un estudiante con correo nuevo | Cuenta visible en la tabla y acceso disponible |
| P04 | Admin | Intentar repetir el correo | Rechazo por correo registrado |
| P05 | Admin | Restablecer contraseña de la cuenta nueva | La contraseña anterior deja de funcionar |
| P06 | Docente | Entrar como docente@studyplan.test | 6 estudiantes y 12 registros |
| P07 | Docente | Rendimiento > Analizar calificaciones registradas | 6 estudiantes, 12 registros, promedio 12.75, aprobación 66.7%, riesgo alto 2, medio 2 y bajo 2 |
| P08 | Docente | Analizar datos de ejemplo | Mismos estadísticos de P07; crea un informe adicional |
| P09 | Docente | Descargar CSV de prueba e importarlo | Mismo resultado; se procesa el archivo |
| P10 | Docente | Importar un CSV con nota 21 | Mensaje de validación y sin nuevo informe |
| P11 | Docente | Filtrar riesgo alto | Luis y Diego (nombres con sufijo Demo en registros) |
| P12 | Docente | Revisar motor lógico del resultado | SWI-Prolog si está instalado y ejecutándose |
| P13 | Docente | Exportar diagnóstico CSV | Archivo con promedio, asistencia, riesgo y recomendación |
| P14 | Docente | Historial > Abrir informe | Resultados conservados tras recargar |
| P15 | Docente | Crear, editar y eliminar una calificación de prueba | CRUD persistente; ejecutar después de P07–P09 para no alterar los resultados base |
| P16 | Tutora | Iniciar sesión y consultar registros e historial | Solo sus 3 registros, sin informes del primer docente |
| P17 | Ana | Ingresar a Resumen | 4 cursos, 10 actividades, 3 completadas, 30% de avance |
| P18 | Ana | Abrir Alertas | Vencidas y próximas a vencer, calculadas respecto a la fecha actual |
| P19 | Ana | Abrir Planificador y cambiar una actividad a Completado | Se actualiza el estado y el porcentaje |
| P20 | Ana | Abrir Calendario y elegir una fecha con entrega | Agenda del día seleccionado |
| P21 | Ana | Mis calificaciones | Base de Datos 16, Programación 18 y Gestión de Proyectos 15 |
| P22 | Luis | Iniciar sesión y consultar notas | Solo sus tres registros (9, 10 y 12) |
| P23 | Estudiante | Abrir directamente /#/admin o /#/analisis | Redirección al panel de estudiante |
| P24 | Todos | Cerrar sesión, reiniciar y volver a entrar | Se conservan los datos |
| P25 | Docente | Desde el navegador, abrir /#/admin | Redirección al panel docente |

Prueba las cifras base antes de modificar las notas y actividades. Los vencimientos cambian conforme pasan los días. La clasificación es orientativa: promedio menor de 11 = riesgo alto; entre los demás, asistencia menor a 75% o promedio menor a 14 = medio; resto = bajo. La aprobación se calcula por registro, no por estudiante.

## 6. Pruebas técnicas
Desde StudyPlan, con dependencias instaladas:
```bash
npm test
npm run build
python -m unittest discover -s analisis -p "test_*.py"
```
El test de Node utiliza SQLite en memoria. Los tests Python validan el CSV, reglas y resultados. El indicador SWI-Prolog del aplicativo debe verificarse durante la exposición. No confundir los resultados esperados de esta guía con pruebas ya ejecutadas.

## 7. Guardar cambios propios
Desde StudyPlan, revisa primero git status. Añade únicamente los archivos de código que deseas guardar, luego git commit y git push origin main. No publiques backend/data, node_modules, dist ni credenciales reales: están excluidos o deben mantenerse fuera del repositorio.

## 8. Solución de problemas
- Motor de análisis no disponible: comprueba Flask en http://127.0.0.1:5001/health.
- No abre la página: revisa la URL de Vite en terminal y que los tres procesos estén activos.
- Contraseña incorrecta tras cambiarla: utiliza la nueva o restablécela desde administración; reiniciar el servidor no la reinicia.
- Puerto ocupado: cierra servidores anteriores y vuelve a iniciar.
- No hay alertas esperadas: las fechas se generaron al instalar la demo; consulta el calendario o crea una entrega con fecha actual.
- No hay datos en GitHub: SQLite es local. Se generan automáticamente en cada computadora al arrancar.

La carga automática se deshabilita con STUDYPLAN_DEMO=0 o NODE_ENV=production. No reutilices una base demo para producción.

La demostración no requiere alojamiento online. El autorregistro está deshabilitado y administración crea los usuarios.
