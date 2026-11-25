import {reactive} from 'vue';
export const store=reactive({usuario:null,cursos:[],tareas:[]});
export async function api(path,method='GET',body){const r=await fetch('/api'+path,{method,headers:{'Content-Type':'application/json'},credentials:'same-origin',...(body===undefined?{}:{body:JSON.stringify(body)})});const data=await r.json();if(!r.ok)throw new Error(data.error||'Error de conexión');return data}
export async function cargar(){if(store.usuario?.rol==='docente'){store.cursos=[];store.tareas=[];return}[store.cursos,store.tareas]=await Promise.all([api('/cursos'),api('/actividades')])}
export function hoy(d=new Date()){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
export function estado(t){return t.estado!=='Completado'&&t.fecha<hoy()?'Vencida':t.estado}
export function nombreCurso(id){return store.cursos.find(c=>c.id===id)?.nombre||'Sin curso'}
export function porcentaje(ts){return ts.length?Math.round(ts.filter(t=>t.estado==='Completado').length/ts.length*100):0}
export function diasRestantes(t){return Math.round((Date.parse(t.fecha+'T00:00:00Z')-Date.parse(hoy()+'T00:00:00Z'))/86400000)}
export function alertas(){return store.tareas.filter(t=>t.estado!=='Completado'&&diasRestantes(t)<=3).sort((a,b)=>a.fecha.localeCompare(b.fecha))}
export function plazo(t){const n=diasRestantes(t);return n<0?'Vencida hace '+(-n)+' d':n===0?'Vence hoy':n===1?'Vence mañana':'En '+n+' días'}
export async function cargarDemo(){await api('/demo','POST',{fecha:hoy()});await cargar()}
export async function cambiarEstado(t,estado){await api('/actividades/'+t.id,'PUT',{...t,estado});await cargar()}
