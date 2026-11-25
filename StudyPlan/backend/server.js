import express from 'express';
import cookieParser from 'cookie-parser';
import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { db } from './database.js';
import { fileURLToPath } from 'node:url';
const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'1mb'}));app.use(cookieParser());
app.get('/api/health',(req,res)=>res.json({ok:true}));
// Límite básico de intentos de autenticación por IP.
const intentos=new Map();
function limitar(req,res,next){const ahora=Date.now();for(const [k,v] of intentos)if(v.vence<=ahora)intentos.delete(k);const key=req.ip;const v=intentos.get(key)||{cantidad:0,vence:ahora+60000};v.cantidad++;intentos.set(key,v);if(v.cantidad>20)return res.status(429).json({error:'Demasiados intentos. Intenta en un minuto.'});next()}
app.use(['/api/login','/api/registro'],limitar);
const hash=t=>createHash('sha256').update(t).digest('hex');
const passwordHash=(p,s)=>scryptSync(p,s,64).toString('hex');
const text=(v,n=200)=>typeof v==='string'?v.trim().slice(0,n):'';
const fail=(res,msg,status=400)=>res.status(status).json({error:msg});
const cookie={httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',maxAge:7*86400000,path:'/'};
function login(res,u){const token=randomBytes(32).toString('hex');db.prepare('DELETE FROM sesiones WHERE vence<?').run(Date.now());db.prepare('INSERT INTO sesiones VALUES(?,?,?)').run(hash(token),u.id,Date.now()+cookie.maxAge);res.cookie('studyplan',token,cookie).json({id:u.id,nombre:u.nombre,email:u.email,rol:u.rol})}
app.post('/api/registro',(req,res)=>{const nombre=text(req.body.nombre),email=text(req.body.email).toLowerCase(),p=req.body.password,rol=req.body.rol||'estudiante';if(!['estudiante','docente'].includes(rol))return fail(res,'Rol inválido');if(!nombre||!/^\S+@\S+\.\S+$/.test(email)||typeof p!=='string'||p.length<8||p.length>128)return fail(res,'Completa los datos. Contraseña de 8 a 128 caracteres.');if(db.prepare('SELECT id FROM usuarios WHERE email=?').get(email))return fail(res,'Correo registrado',409);const salt=randomBytes(16).toString('hex');const result=db.prepare('INSERT INTO usuarios(nombre,email,password,rol) VALUES(?,?,?,?)').run(nombre,email,salt+':'+passwordHash(p,salt),rol);login(res,{id:Number(result.lastInsertRowid),nombre,email,rol})});
app.post('/api/login',(req,res)=>{const u=db.prepare('SELECT * FROM usuarios WHERE email=?').get(text(req.body.email).toLowerCase()),p=req.body.password;if(!u||typeof p!=='string'||p.length>128)return fail(res,'Credenciales incorrectas',401);const [salt,key]=u.password.split(':');if(!timingSafeEqual(Buffer.from(key,'hex'),Buffer.from(passwordHash(p,salt),'hex')))return fail(res,'Credenciales incorrectas',401);login(res,u)});
app.use('/api',(req,res,next)=>{const token=req.cookies.studyplan;const u=token&&db.prepare('SELECT u.id,u.nombre,u.email,u.rol FROM sesiones s JOIN usuarios u ON u.id=s.usuario WHERE s.token=? AND s.vence>?').get(hash(token),Date.now());if(!u)return fail(res,'Inicia sesión',401);req.user=u;next()});
app.get('/api/me',(req,res)=>res.json(req.user));
app.post('/api/logout',(req,res)=>{db.prepare('DELETE FROM sesiones WHERE token=?').run(hash(req.cookies.studyplan));res.clearCookie('studyplan',{path:'/'}).json({ok:true})});
const docente=(req,res,next)=>req.user.rol==='docente'?next():fail(res,'Acceso exclusivo para docentes',403);
const estudiante=(req,res,next)=>req.user.rol==='estudiante'?next():fail(res,'Acceso exclusivo para estudiantes',403);
app.use(['/api/cursos','/api/actividades','/api/demo'],estudiante);
app.use(['/api/analisis','/api/registros','/api/historial'],docente);
app.get('/api/cursos',(req,res)=>res.json(db.prepare('SELECT id,nombre,docente FROM cursos WHERE usuario=? ORDER BY nombre').all(req.user.id)));
app.post('/api/cursos',(req,res)=>{const n=text(req.body.nombre);if(!n)return fail(res,'Nombre obligatorio');const r=db.prepare('INSERT INTO cursos(usuario,nombre,docente) VALUES(?,?,?)').run(req.user.id,n,text(req.body.docente));res.status(201).json({id:Number(r.lastInsertRowid)})});
app.put('/api/cursos/:id',(req,res)=>{const n=text(req.body.nombre);if(!n)return fail(res,'Nombre obligatorio');const r=db.prepare('UPDATE cursos SET nombre=?,docente=? WHERE id=? AND usuario=?').run(n,text(req.body.docente),req.params.id,req.user.id);r.changes?res.json({ok:true}):fail(res,'No encontrado',404)});
app.delete('/api/cursos/:id',(req,res)=>{const c=db.prepare('SELECT id FROM cursos WHERE id=? AND usuario=?').get(req.params.id,req.user.id);if(!c)return fail(res,'No encontrado',404);if(db.prepare('SELECT id FROM actividades WHERE curso=?').get(c.id))return fail(res,'El curso tiene actividades asociadas',409);db.prepare('DELETE FROM cursos WHERE id=?').run(c.id);res.json({ok:true})});
app.get('/api/actividades',(req,res)=>res.json(db.prepare('SELECT a.* FROM actividades a JOIN cursos c ON c.id=a.curso WHERE c.usuario=? ORDER BY a.fecha').all(req.user.id)));
function fechaValida(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return false;const x=new Date(d+'T00:00:00Z');return !Number.isNaN(x.getTime())&&x.toISOString().slice(0,10)===d}
function actividad(req,res){const b=req.body||{},n=text(b.nombre),d=text(b.fecha),c=db.prepare('SELECT id FROM cursos WHERE id=? AND usuario=?').get(Number(b.curso)||0,req.user.id);if(!c||!n||!fechaValida(d)||!['Tarea','Examen','Trabajo','Exposición'].includes(b.tipo)||!['Alta','Media','Baja'].includes(b.prioridad)||!['Pendiente','En proceso','Completado'].includes(b.estado)){fail(res,'Datos de actividad inválidos');return null}return [c.id,n,b.tipo,d,b.prioridad,b.estado,text(b.descripcion,1000)]}
app.post('/api/actividades',(req,res)=>{const v=actividad(req,res);if(!v)return;const r=db.prepare('INSERT INTO actividades(curso,nombre,tipo,fecha,prioridad,estado,descripcion) VALUES(?,?,?,?,?,?,?)').run(...v);res.status(201).json({id:Number(r.lastInsertRowid)})});
app.put('/api/actividades/:id',(req,res)=>{const v=actividad(req,res);if(!v)return;const r=db.prepare('UPDATE actividades SET curso=?,nombre=?,tipo=?,fecha=?,prioridad=?,estado=?,descripcion=? WHERE id=? AND curso IN (SELECT id FROM cursos WHERE usuario=?)').run(...v,req.params.id,req.user.id);r.changes?res.json({ok:true}):fail(res,'No encontrado',404)});
app.delete('/api/actividades/:id',(req,res)=>{const r=db.prepare('DELETE FROM actividades WHERE id=? AND curso IN (SELECT id FROM cursos WHERE usuario=?)').run(req.params.id,req.user.id);r.changes?res.json({ok:true}):fail(res,'No encontrado',404)});

// Datos de demostración: únicamente en cuentas vacías, sin sobrescribir información.
app.post('/api/demo',(req,res)=>{
const uid=req.user.id;
if(db.prepare('SELECT id FROM cursos WHERE usuario=?').get(uid))return fail(res,'La demostración solo se carga en cuentas sin cursos.',409);
const cursos=[['Ingeniería de Software','Docente de ejemplo'],['Base de Datos','Docente de ejemplo'],['Gestión de Proyectos','Docente de ejemplo'],['Redes y Comunicaciones','Docente de ejemplo']];
const tareas=[[0,'Informe de requisitos','Trabajo',0,'Alta','En proceso'],[1,'Examen de SQL','Examen',1,'Alta','Pendiente'],[2,'Cronograma del proyecto','Tarea',2,'Media','Pendiente'],[3,'Laboratorio de redes','Tarea',-2,'Alta','Pendiente'],[0,'Diagrama de casos de uso','Tarea',-4,'Media','Completado'],[1,'Modelo entidad relación','Trabajo',-3,'Alta','Completado'],[2,'Exposición de riesgos','Exposición',4,'Alta','En proceso'],[3,'Configuración de router','Tarea',6,'Baja','Pendiente'],[0,'Prototipo de interfaz','Trabajo',8,'Media','Pendiente'],[2,'Acta de constitución','Trabajo',-5,'Baja','Completado']];
const base=fechaValida(req.body?.fecha||'')?new Date(req.body.fecha+'T12:00:00Z'):new Date();
db.exec('BEGIN');
try{const ids=cursos.map(c=>Number(db.prepare('INSERT INTO cursos(usuario,nombre,docente) VALUES(?,?,?)').run(uid,...c).lastInsertRowid));for(const [i,n,t,d,p,e] of tareas){const fecha=new Date(base);fecha.setUTCDate(fecha.getUTCDate()+d);db.prepare('INSERT INTO actividades(curso,nombre,tipo,fecha,prioridad,estado,descripcion) VALUES(?,?,?,?,?,?,?)').run(ids[i],n,t,fecha.toISOString().slice(0,10),p,e,'Actividad de demostración académica.')}db.exec('COMMIT');res.status(201).json({cursos:4,actividades:10})}catch(e){db.exec('ROLLBACK');throw e}
});

// Registros de cada docente, independientes de los cursos personales del estudiante.
app.get('/api/registros',(req,res)=>res.json(db.prepare('SELECT id,estudiante,email,curso,nota,asistencia FROM registros_academicos WHERE docente_id=? ORDER BY estudiante,curso').all(req.user.id)));
function registroAcademico(req,res){const b=req.body||{},n=text(b.estudiante),c=text(b.curso),e=text(b.email).toLowerCase();if(!n||!c||typeof b.nota!=='number'||typeof b.asistencia!=='number'||!Number.isFinite(b.nota)||!Number.isFinite(b.asistencia)||b.nota<0||b.nota>20||b.asistencia<0||b.asistencia>100||(e&&!/^\S+@\S+\.\S+$/.test(e))){fail(res,'Verifica nombre, curso, nota (0–20), asistencia (0–100) y correo opcional');return null}return [n,e,c,b.nota,b.asistencia]}
app.post('/api/registros',(req,res)=>{const v=registroAcademico(req,res);if(!v)return;const r=db.prepare('INSERT INTO registros_academicos(docente_id,estudiante,email,curso,nota,asistencia) VALUES(?,?,?,?,?,?)').run(req.user.id,...v);res.status(201).json({id:Number(r.lastInsertRowid)})});
app.put('/api/registros/:id',(req,res)=>{const v=registroAcademico(req,res);if(!v)return;const r=db.prepare('UPDATE registros_academicos SET estudiante=?,email=?,curso=?,nota=?,asistencia=? WHERE id=? AND docente_id=?').run(...v,req.params.id,req.user.id);r.changes?res.json({ok:true}):fail(res,'No encontrado',404)});
app.delete('/api/registros/:id',(req,res)=>{const r=db.prepare('DELETE FROM registros_academicos WHERE id=? AND docente_id=?').run(req.params.id,req.user.id);r.changes?res.json({ok:true}):fail(res,'No encontrado',404)});
app.get('/api/mis-notas',estudiante,(req,res)=>res.json(db.prepare('SELECT r.id,r.curso,r.nota,r.asistencia,u.nombre AS docente FROM registros_academicos r JOIN usuarios u ON u.id=r.docente_id WHERE r.email=? ORDER BY r.curso').all(req.user.email)));
app.get('/api/historial',(req,res)=>res.json(db.prepare('SELECT id,titulo,fecha FROM historial_analisis WHERE docente_id=? ORDER BY id DESC').all(req.user.id)));
app.get('/api/historial/:id',(req,res)=>{const h=db.prepare('SELECT * FROM historial_analisis WHERE id=? AND docente_id=?').get(req.params.id,req.user.id);if(!h)return fail(res,'No encontrado',404);res.json({...h,resultado:JSON.parse(h.resultado)})});
app.delete('/api/historial/:id',(req,res)=>{const r=db.prepare('DELETE FROM historial_analisis WHERE id=? AND docente_id=?').run(req.params.id,req.user.id);r.changes?res.json({ok:true}):fail(res,'No encontrado',404)});
app.post('/api/analisis',async(req,res)=>{try{
let csv=req.body?.csv;
if(req.body?.origen==='registros'){const rows=db.prepare('SELECT estudiante,curso,nota,asistencia FROM registros_academicos WHERE docente_id=?').all(req.user.id);if(!rows.length)return fail(res,'Registra calificaciones primero');const quote=v=>'"'+String(v).replace(/"/g,'""')+'"';csv='estudiante,curso,nota,asistencia\n'+rows.map(r=>[r.estudiante,r.curso,r.nota,r.asistencia].map(quote).join(',')).join('\n')}
if(typeof csv!=='string'||!csv.trim())return fail(res,'Selecciona un CSV válido');
const respuesta=await fetch('http://127.0.0.1:5001/analizar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({csv}),signal:AbortSignal.timeout(30000)});const data=await respuesta.json();if(!respuesta.ok)return res.status(respuesta.status).json(data);
const titulo=text(req.body?.titulo,100)||'Análisis académico';const fecha=new Date().toISOString();const h=db.prepare('INSERT INTO historial_analisis(docente_id,titulo,fecha,resultado) VALUES(?,?,?,?)').run(req.user.id,titulo,fecha,JSON.stringify(data));res.json({...data,historial_id:Number(h.lastInsertRowid)});
}catch(e){console.error(e);fail(res,'No se pudo completar el análisis. Verifica el servicio Python.',503)}});
app.use('/api',(req,res)=>fail(res,'Ruta no encontrada',404));
app.use(express.static(fileURLToPath(new URL('../frontend/dist/',import.meta.url))));
app.use((err,req,res,next)=>{console.error(err);fail(res,'Error del servidor',500)});
const server=app.listen(Number(process.env.PORT||3000),()=>console.log('StudyPlan API: puerto '+server.address().port));
export {server};