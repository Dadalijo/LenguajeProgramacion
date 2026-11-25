import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
mkdirSync(new URL('./data/',import.meta.url),{recursive:true});
export const db=new DatabaseSync(process.env.STUDYPLAN_TEST_DB==='1'?':memory:':new URL('./data/studyplan.db',import.meta.url));
db.exec(`PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS usuarios(id INTEGER PRIMARY KEY,nombre TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sesiones(token TEXT PRIMARY KEY,usuario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,vence INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS cursos(id INTEGER PRIMARY KEY,usuario INTEGER NOT NULL REFERENCES usuarios(id),nombre TEXT NOT NULL,docente TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS actividades(id INTEGER PRIMARY KEY,curso INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,nombre TEXT NOT NULL,tipo TEXT NOT NULL,fecha TEXT NOT NULL,prioridad TEXT NOT NULL,estado TEXT NOT NULL,descripcion TEXT DEFAULT '');
`);
 // Migración compatible con las bases de datos de versiones anteriores.
if(!db.prepare('PRAGMA table_info(usuarios)').all().some(c=>c.name==='rol')){
 db.exec("ALTER TABLE usuarios ADD COLUMN rol TEXT NOT NULL DEFAULT 'estudiante' CHECK(rol IN ('estudiante','docente'))");
}
db.exec(`CREATE TABLE IF NOT EXISTS registros_academicos(
 id INTEGER PRIMARY KEY, docente_id INTEGER NOT NULL REFERENCES usuarios(id),
 estudiante TEXT NOT NULL, email TEXT DEFAULT '', curso TEXT NOT NULL,
 nota REAL NOT NULL CHECK(nota BETWEEN 0 AND 20), asistencia REAL NOT NULL CHECK(asistencia BETWEEN 0 AND 100)
);
CREATE TABLE IF NOT EXISTS historial_analisis(
 id INTEGER PRIMARY KEY, docente_id INTEGER NOT NULL REFERENCES usuarios(id),
 titulo TEXT NOT NULL, fecha TEXT NOT NULL, resultado TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_registros_docente ON registros_academicos(docente_id);
CREATE INDEX IF NOT EXISTS idx_historial_docente ON historial_analisis(docente_id);
`);