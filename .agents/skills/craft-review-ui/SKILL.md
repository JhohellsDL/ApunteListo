---
name: craft-review-ui
description: "Revisar composición de pantallas, props, límites de componentes, reutilización y accesibilidad sin modificar código por defecto."
---

# craft-review-ui

1. Leer diff, contexto y criterios de craft-build-screens / craft-build-components según alcance.
2. Aplicar la checklist de auditoría de UI: verificar Safe Area, teclado, los 4 estados canónicos, navegación por ID, componentes presentacionales puros (Dumb), ergonomía táctil (`hitSlop`) y estilos con `StyleSheet`.
3. Clasificar cada problema con la matriz de severidad: `[BLOQUEANTE]`, `[ADVERTENCIA]` o `[SUGERENCIA]`; omitir preferencias subjetivas de estilo sin impacto técnico.
4. Al detectar pantallas monolíticas (> 300–400 líneas), proponer el plan de partición (extracción a custom hook y subcarpeta local `<ScreenName>/`) antes de editar.
5. Reportar hallazgos con formato estructurado: ubicación exacta (`archivo:línea`), condición disparadora, impacto en runtime y propuesta de corrección.
6. No modificar código sin solicitud ni aprobación previa del plan. Declarar honestamente límites de la inspección estática frente a validación visual en dispositivo.

Consultar [criterios y guía de revisión de UI](references/criteria.md) para pautas detalladas sobre pantallas sobrecargadas, checklist y matriz de severidad.
