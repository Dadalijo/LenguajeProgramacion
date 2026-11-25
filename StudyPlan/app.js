// Vue 3: datos reactivos, propiedades calculadas y métodos.
function cargar(clave){try{return JSON.parse(localStorage.getItem(clave)||'[]')}catch{return []}}
function fechaLocal(d=new Date()){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
Vue.createApp({
data(){return {menus:['Inicio','Cursos','Actividades','Calendario','Progreso'],pagina:'Inicio',cursos:cargar('studyplan.cursos'),tareas:cargar('studyplan.tareas'),curso:{nombre:'',docente:''},tarea:{},modal:false,mensaje:'',busqueda:'',filtroCurso:'',filtroEstado:'',mes:new Date()}},
computed:{
completadas(){return this.tareas.filter(t=>t.estado==='Completado').length},
porcentaje(){return this.tareas.length?Math.round(this.completadas/this.tareas.length*100):0},
proximas(){return this.tareas.filter(t=>t.estado!=='Completado'&&t.fecha>=fechaLocal()).sort((a,b)=>a.fecha.localeCompare(b.fecha))},
indicadores(){return [{nombre:'Pendientes',valor:this.tareas.length-this.completadas},{nombre:'Completadas',valor:this.completadas},{nombre:'Próximas entregas',valor:this.proximas.length},{nombre:'Vencidas',valor:this.tareas.filter(t=>this.estado(t)==='Vencida').length}]},
filtradas(){return this.tareas.filter(t=>t.nombre.toLowerCase().includes(this.busqueda.toLowerCase())&&(!this.filtroCurso||t.curso===this.filtroCurso)&&(!this.filtroEstado||this.estado(t)===this.filtroEstado)).sort((a,b)=>a.fecha.localeCompare(b.fecha))},
tituloMes(){return this.mes.toLocaleDateString('es-PE',{month:'long',year:'numeric'})},
dias(){const y=this.mes.getFullYear(),m=this.mes.getMonth(),inicio=(new Date(y,m,1).getDay()+6)%7,total=new Date(y,m+1,0).getDate();return [...Array(inicio).fill(null),...Array.from({length:total},(_,i)=>({numero:i+1,fecha:fechaLocal(new Date(y,m,i+1))}))]}
},
methods:{
id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)},
guardar(){try{localStorage.setItem('studyplan.cursos',JSON.stringify(this.cursos));localStorage.setItem('studyplan.tareas',JSON.stringify(this.tareas));this.mensaje='Cambios guardados.'}catch{this.mensaje='No se pudo guardar en el navegador.'}},
nombreCurso(id){return this.cursos.find(c=>c.id===id)?.nombre||'Sin curso'},
estado(t){return t.estado!=='Completado'&&t.fecha<fechaLocal()?'Vencida':t.estado},
claseEstado(t){return {'Completado':'text-bg-success','Vencida':'text-bg-danger','En proceso':'text-bg-primary','Pendiente':'text-bg-secondary'}[this.estado(t)]},
limpiarCurso(){this.curso={nombre:'',docente:''}},
guardarCurso(){if(!this.curso.nombre)return;if(this.cursos.some(c=>c.nombre.toLowerCase()===this.curso.nombre.toLowerCase()&&c.id!==this.curso.id)){this.mensaje='El curso ya existe.';return}if(this.curso.id){this.cursos=this.cursos.map(c=>c.id===this.curso.id?{...this.curso}:c)}else this.cursos.push({...this.curso,id:this.id()});this.limpiarCurso();this.guardar()},
eliminarCurso(c){if(this.tareas.some(t=>t.curso===c.id)){this.mensaje='El curso tiene actividades asociadas.';return}if(confirm('¿Eliminar curso?')){this.cursos=this.cursos.filter(x=>x.id!==c.id);if(this.curso.id===c.id)this.limpiarCurso();if(this.filtroCurso===c.id)this.filtroCurso='';this.guardar()}},
nuevaTarea(t=null){if(!this.cursos.length){this.pagina='Cursos';this.mensaje='Primero registra un curso.';return}this.tarea=t?{...t}:{nombre:'',curso:this.cursos[0].id,tipo:'Tarea',fecha:fechaLocal(),prioridad:'Media',estado:'Pendiente',descripcion:''};this.modal=true},
guardarTarea(){if(!this.tarea.nombre||!this.tarea.fecha||!this.cursos.some(c=>c.id===this.tarea.curso))return;if(this.tarea.id)this.tareas=this.tareas.map(t=>t.id===this.tarea.id?{...this.tarea}:t);else this.tareas.push({...this.tarea,id:this.id()});this.modal=false;this.guardar()},
completar(t){t.estado=t.estado==='Completado'?'Pendiente':'Completado';this.guardar()},
eliminarTarea(t){if(confirm('¿Eliminar actividad?')){this.tareas=this.tareas.filter(x=>x.id!==t.id);this.guardar()}},
cambiarMes(n){this.mes=new Date(this.mes.getFullYear(),this.mes.getMonth()+n,1)},
avanceCurso(id){const ts=this.tareas.filter(t=>t.curso===id);return ts.length?Math.round(ts.filter(t=>t.estado==='Completado').length/ts.length*100):0}
}
}).mount('#app');