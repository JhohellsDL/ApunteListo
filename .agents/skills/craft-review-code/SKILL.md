---
name: craft-review-code
description: "Revisar cambios, diffs o pull requests y detectar errores, riesgos y regresiones con evidencia."
---

# craft-review-code

1. Determinar alcance del diff y comportamiento previsto; leer código circundante y reglas locales.
2. Aplicar la checklist técnica de auditoría: ciclo de vida, fugas de memoria, condiciones de carrera asíncronas, null-safety, rendimiento en listas y seguridad.
3. Clasificar cada problema según la matriz de severidad: `[BLOQUEANTE]`, `[ADVERTENCIA]` o `[SUGERENCIA]`; omitir preferencias de estilo subjetivas sin impacto técnico.
4. Reportar hallazgos con el formato estándar: ubicación exacta (`archivo:línea`), condición disparadora, impacto en runtime y propuesta de corrección.
5. No modificar código durante una revisión salvo petición explícita del usuario.
6. Concluir con veredicto final (`Aprobado` o `Requiere Cambios`) declarando honestamente comprobaciones ejecutadas y límites de la verificación estática.

Consultar [guía y checklist de revisión](references/checklist.md) al auditar código.
