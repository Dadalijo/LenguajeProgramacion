:- use_module(library(http/json)).
:- initialization(main, main).

% Predicados declarativos mutuamente excluyentes.
riesgo(N,A,'Alto','Reforzar contenidos y mejorar asistencia') :- N < 11, A < 75.
riesgo(N,A,'Alto','Programar tutoría académica') :- N < 11, A >= 75.
riesgo(N,A,'Medio','Revisar avances y asistencia') :- N >= 11, (A < 75 ; A >= 75, N < 14).
riesgo(N,A,'Bajo','Mantener hábitos de estudio') :- N >= 14, A >= 75.

diagnosticar(D,R) :-
    once(riesgo(D.nota,D.asistencia,Nivel,Consejo)),
    R = _{riesgo:Nivel,recomendacion:Consejo}.

main :-
    json_read_dict(current_input, Datos),
    maplist(diagnosticar, Datos, Resultados),
    json_write_dict(current_output, Resultados), nl.
