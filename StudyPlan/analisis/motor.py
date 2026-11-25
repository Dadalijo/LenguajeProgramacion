"""Motor multiparadigma de análisis académico. Escala peruana de 0 a 20."""
from dataclasses import dataclass
from functools import reduce
import io
import numpy as np
import pandas as pd

COLUMNAS = ['estudiante', 'curso', 'nota', 'asistencia']

# Paradigma funcional: funciones puras y transformación de colecciones.
def promedio(notas):
    return float(np.mean(notas))

def regla_riesgo(nota, asistencia):
    # Inferencia declarativa mediante reglas ordenadas (no un modelo predictivo).
    reglas = [
        (nota < 11 and asistencia < 75, 'Alto', 'Reforzar contenidos y mejorar asistencia'),
        (nota < 11, 'Alto', 'Programar tutoría académica'),
        (asistencia < 75 or nota < 14, 'Medio', 'Revisar avances y asistencia'),
        (True, 'Bajo', 'Mantener hábitos de estudio'),
    ]
    return next((nivel, consejo) for condicion, nivel, consejo in reglas if condicion)

@dataclass(frozen=True)
class Registro:
    estudiante: str
    curso: str
    nota: float
    asistencia: float

class Analizador:
    def __init__(self, csv):
        self.df = pd.read_csv(io.StringIO(csv), dtype={'estudiante': str, 'curso': str})
        if not set(COLUMNAS).issubset(self.df.columns):
            raise ValueError('Columnas requeridas: ' + ', '.join(COLUMNAS))
        self.df = self.df[COLUMNAS].copy()
        if self.df.empty or len(self.df) > 5000:
            raise ValueError('El CSV debe contener entre 1 y 5000 registros.')
        for c in ['estudiante', 'curso']:
            if self.df[c].isna().any() or self.df[c].str.strip().eq('').any():
                raise ValueError('Estudiante y curso son obligatorios.')
            self.df[c] = self.df[c].str.strip()
        for c, maximo in [('nota',20),('asistencia',100)]:
            self.df[c] = pd.to_numeric(self.df[c], errors='coerce')
            if not np.isfinite(self.df[c]).all() or not self.df[c].between(0,maximo).all():
                raise ValueError(f'{c}: valores numéricos entre 0 y {maximo}.')
        self.registros = [Registro(*fila) for fila in self.df.itertuples(index=False,name=None)]

    def analizar(self):
        notas = self.df.nota.to_numpy()
        aprobados = list(filter(lambda r:r.nota >= 11,self.registros))
        total = reduce(lambda acumulado,r:acumulado+1,self.registros,0)
        grupos = self.df.groupby('estudiante',sort=True).agg(nota=('nota','mean'),asistencia=('asistencia','mean')).reset_index()
        estudiantes = []
        for r in grupos.itertuples(index=False):
            nivel, consejo = regla_riesgo(r.nota,r.asistencia)
            estudiantes.append(dict(estudiante=r.estudiante,nota=round(r.nota,2),asistencia=round(r.asistencia,2),riesgo=nivel,recomendacion=consejo))
        cursos = self.df.groupby('curso').nota.mean()
        return dict(registros=total, estudiantes=len(estudiantes), promedio=round(promedio(notas),2),
                    mediana=round(float(np.median(notas)),2), desviacion=round(float(np.std(notas)),2),
                    minimo=float(np.min(notas)), maximo=float(np.max(notas)),
                    aprobacion=round(len(aprobados)/total*100,1),
                    riesgos={n:sum(e['riesgo']==n for e in estudiantes) for n in ['Alto','Medio','Bajo']},
                    cursos=[dict(curso=k,promedio=round(float(v),2)) for k,v in cursos.items()],
                    detalle=estudiantes)
