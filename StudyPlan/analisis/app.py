from flask import Flask, request, jsonify
from motor import Analizador
import os
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024

@app.get('/health')
def health():
    return jsonify(ok=True)

@app.post('/analizar')
def analizar():
    try:
        csv = request.get_json()['csv']
        if not isinstance(csv,str):
            raise ValueError('CSV inválido.')
        return jsonify(Analizador(csv).analizar())
    except (ValueError, KeyError, TypeError) as e:
        return jsonify(error=str(e)), 400

if __name__ == '__main__':
    app.run(host='127.0.0.1',port=int(os.getenv('ANALISIS_PORT','5001')))
