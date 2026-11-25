// Carga reproducible de datos ficticios para la exposición local.
// No usar en producción. No borra ni reemplaza usuarios ni datos existentes.
import {randomBytes,scryptSync} from 'node:crypto';
import {db} from './database.js';
if(process.env.NODE_ENV==='production'){console.error('La carga demo no está permitida en producción.');db.close();process.exit(1)}
const clave='StudyPlanDemo2026!';
const cuentas=[
 ['Administrador Demo','admin@studyplan.test','estudiante',1],
 ['Docente Demo','docente@studyplan.test','docente',0],
 ['Tutora Demo','tutora@studyplan.test','docente',0],
 ['Ana Demo','ana@studyplan.test','estudiante',0],
 ['Luis Demo','luis@studyplan.test','estudiante',0],
 ['María Demo','maria@studyplan.test','estudiante',0],
 ['Carlos Demo','carlos@studyplan.test','estudiante',0],
 ['Lucía Demo','lucia@studyplan.test','estudiante',0],
 ['Diego Demo','diego@studyplan.test','estudiante',0]
];
const notas=[
 ['Ana','ana',16,90,18,95],['Luis','luis',9,65,10,70],
 ['María','maria',13,82,14,88],['Carlos','carlos',15,92,17,94],
 ['Lucía','lucia',11,72,12,78],['Diego','diego',8,90,10,85]
];
const materias=['Ingeniería de Software','Base de Datos','Gestión de Proyectos','Redes y Comunicaciones'];
const actividades=[
 [0,'Informe de requisitos','Trabajo',0,'Alta','En proceso'],
 [1,'Examen de SQL','Examen',1,'Alta','Pendiente'],
 [2,'Cronograma del proyecto','Tarea',2,'Media','Pendiente'],
 [3,'Laboratorio de redes','Tarea',-2,'Alta','Pendiente'],
 [0,'Diagrama de casos de uso','Tarea',-4,'Media','Completado'],
 [1,'Modelo entidad relación','Trabajo',-3,'Alta','Completado'],
 [2,'Exposición de riesgos','Exposición',4,'Alta','En proceso'],
 [3,'Configuración de router','Tarea',6,'Baja','Pendiente'],
 [0,'Prototipo de interfaz','Trabajo',8,'Media','Pendiente'],
 [2,'Acta de constitución','Trabajo',-5,'Baja','Completado']
];
function fecha(dias){const d=new Date();d.setDate(d.getDate()+dias);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
db.exec('CREATE TABLE IF NOT EXISTS cargas_demo (nombre TEXT PRIMARY KEY, fecha TEXT NOT NULL)');
try{
 db.exec('BEGIN');
 if(db.prepare('SELECT nombre FROM cargas_demo WHERE nombre=?').get('studyplan-v1')){
  db.exec('COMMIT');console.log('La demostración ya fue instalada. Se conservan todos los cambios y contraseñas.'); 
 }else{
  // Si alguno de los correos ya existe, se cancela toda la operación.
  for(const [,email] of cuentas)if(db.prepare('SELECT id FROM usuarios WHERE email=?').get(email))throw new Error('Correo demo ya existente: '+email+'. No se modificó ninguna cuenta.');
  const ids={};
  for(const [nombre,email,rol,admin] of cuentas){
   const salt=randomBytes(16).toString('hex');
   ids[email]=Number(db.prepare('INSERT INTO usuarios(nombre,email,password,rol,es_admin) VALUES(?,?,?,?,?)').run(nombre,email,salt+':'+scryptSync(clave,salt,64).toString('hex'),rol,admin).lastInsertRowid);
  }
  const insertar=db.prepare('INSERT INTO registros_academicos(docente_id,estudiante,email,curso,nota,asistencia) VALUES(?,?,?,?,?,?)');
  for(const [nombre,correo,n1,a1,n2,a2] of notas){
   const email=correo+'@studyplan.test';
   insertar.run(ids['docente@studyplan.test'],nombre+' Demo',email,'Base de Datos',n1,a1);
   insertar.run(ids['docente@studyplan.test'],nombre+' Demo',email,'Programación',n2,a2);
  }
  for(const [nombre,correo,nota,asistencia] of [['Ana','ana',15,90],['Luis','luis',12,80],['María','maria',17,95]]){
   insertar.run(ids['tutora@studyplan.test'],nombre+' Demo',correo+'@studyplan.test','Gestión de Proyectos',nota,asistencia);
  }
  const cursos=materias.map(nombre=>Number(db.prepare('INSERT INTO cursos(usuario,nombre,docente) VALUES(?,?,?)').run(ids['ana@studyplan.test'],nombre,'Docente de ejemplo').lastInsertRowid));
  for(const [i,n,t,d,p,e] of actividades)db.prepare('INSERT INTO actividades(curso,nombre,tipo,fecha,prioridad,estado,descripcion) VALUES(?,?,?,?,?,?,?)').run(cursos[i],n,t,fecha(d),p,e,'Actividad ficticia para la exposición.');
  db.prepare('INSERT INTO cargas_demo VALUES(?,?)').run('studyplan-v1',new Date().toISOString());
  db.exec('COMMIT');
  console.log('Demostración creada: 1 administrador, 2 docentes, 6 estudiantes, 15 calificaciones, 4 cursos y 10 actividades.');
  console.log('Consulta GUIA_DEMO.md para las cuentas y el recorrido de pruebas.');
 }
}catch(e){if(db.isTransaction)db.exec('ROLLBACK');console.error(e.message);process.exitCode=1}finally{db.close()}
