import {createInterface} from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
import {randomBytes,scryptSync} from 'node:crypto';
import {db} from './database.js';
const rl=createInterface({input:stdin,output:stdout});
try{
 const nombre=(await rl.question('Nombre del administrador: ')).trim();
 const email=(await rl.question('Correo: ')).trim().toLowerCase();
 // Se solicita una clave nueva; no hay contraseña predeterminada en el repositorio.
 const password=await rl.question('Contraseña (8 a 128 caracteres; visible en esta terminal): ');
 if(!nombre||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8||password.length>128)throw new Error('Datos inválidos.');
 if(db.prepare('SELECT id FROM usuarios WHERE email=?').get(email))throw new Error('El correo ya existe; utiliza otro correo.');
 const salt=randomBytes(16).toString('hex');
 db.prepare("INSERT INTO usuarios(nombre,email,password,rol,es_admin) VALUES(?,?,?,'estudiante',1)").run(nombre,email,salt+':'+scryptSync(password,salt,64).toString('hex'));
 console.log('Administrador creado. Puedes iniciar sesión desde StudyPlan.');
}catch(e){console.error(e.message);process.exitCode=1}finally{rl.close();db.close()}
