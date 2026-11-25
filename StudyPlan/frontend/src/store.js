import {reactive} from 'vue';
export const store=reactive({usuario:null,cursos:[],tareas:[]});
export async function api(path,method='GET',body){const r=await fetch('/api'+path,{method,headers:{'Content-Type':'application/json'},credentials:'same-origin',...(body===undefined?{}:{body:JSON.stringify(body)})});const data=await r.json();if(!r.ok)throw new Error(data.error||'Error de conexión');return data}
export async function cargar(){[store.cursos,store.tareas]=await Promise.all([api('/cursos'),api('/actividades')])}
export function hoy(d=new Date()){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
export function estado(t){return t.estado!=='Completado'&&t.fecha<hoy()?'Vencida':t.estado}
export function nombreCurso(id){return store.cursos.find(c=>c.id===id)?.nombre||'Sin curso'}
export function porcentaje(ts){return ts.length?Math.round(ts.filter(t=>t.estado==='Completado').length/ts.length*100):0}