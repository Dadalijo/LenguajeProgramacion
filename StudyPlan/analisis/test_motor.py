import unittest
from pathlib import Path
from motor import Analizador, regla_riesgo

class Pruebas(unittest.TestCase):
    def test_ejemplo(self):
        csv=(Path(__file__).parent/'datos'/'ejemplo.csv').read_text()
        r=Analizador(csv).analizar()
        self.assertEqual(r['registros'],12)
        self.assertEqual(r['estudiantes'],6)
        self.assertEqual(r['riesgos'],{'Alto':2,'Medio':2,'Bajo':2})
    def test_reglas(self):
        self.assertEqual(regla_riesgo(10,90)[0],'Alto')
        self.assertEqual(regla_riesgo(18,60)[0],'Medio')
    def test_invalido(self):
        with self.assertRaises(ValueError):
            Analizador('estudiante,curso,nota,asistencia\nA,B,21,90')

if __name__=='__main__':
    unittest.main()
