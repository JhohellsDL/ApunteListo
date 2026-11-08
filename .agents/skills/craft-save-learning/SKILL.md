---
name: craft-save-learning
description: "Guardar preferencias o decisiones confirmadas y promover aprendizajes generales a la base local y al proyecto actual, sin commit ni push."
---

# craft-save-learning

1. Leer reglas, memoria y catálogo existente. Clasificar avance, decisión puntual, preferencia local o criterio general.
2. Actualizar avance automáticamente al terminar tareas; no convertir correcciones puntuales en estándares permanentes.
3. Si el usuario ordenó guardar una regla general, esa orden autoriza base local y proyecto actual. Si la preferencia fue inferida, proponer redacción y alcance antes de guardar.
4. Buscar duplicados y contradicciones. Preferir ampliar una regla existente; luego una referencia del mismo skill; proponer skill nuevo solo para responsabilidad distinta, reutilizable y con activación clara.
5. Consultar [flujo de promoción](references/promotion.md). Para alcance local editar memoria o local-rules.md; no modificar archivos gestionados.
6. Para alcance general preparar propuesta y previsualizar promote. Revisar conflicto semántico antes de --apply. El CLI solo detecta conflictos de contenido.
7. Informar exactamente qué se guardó en cada destino, sin commit ni push; otros proyectos no cambian. No refactorizar código por guardar reglas.
8. Si falta acceso a la base, dejar la propuesta local y el comando pendiente; no afirmar guardado remoto o parcial inexistente.
