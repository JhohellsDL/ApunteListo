---
name: craft-implement-feature
description: "Implementar funcionalidades o correcciones; coordinar los skills necesarios según las responsabilidades afectadas."
---

# craft-implement-feature

1. Leer reglas locales, memoria, código y catálogo de skills existentes del proyecto.
2. Respetar procedimientos específicos del proyecto. Tratar el kit como complemento; si se contradicen, explicar y resolver antes de actuar.
3. Coordinar los skills en su secuencia lógica según responsabilidades: craft-architecture (diseño y límites) -> craft-build-data (APIs, mappers y storage) -> craft-write-hooks (lógica y estado) -> craft-build-components (componentes Dumb) -> craft-build-screens (pantalla orquestadora).
4. Leer realmente los SKILL.md seleccionados y sus referencias relevantes. Una mención no equivale a haberlos usado.
5. Proponer el plan de cambios (archivos a crear o modificar, responsabilidades y enfoque) antes de editar código. Esperar confirmación cuando el cambio sea estructural, afecte múltiples archivos o toque código legacy; luego implementar el cambio mínimo y coherente sin refactorizar fuera de alcance.
6. Verificar con rigor técnico real: ejecutar typecheck (`npx tsc --noEmit`), linter y pruebas automatizadas (craft-write-tests). Distinguir honestamente comprobado de pendiente; consultar craft-review-ui / craft-review-code para auto-revisión final.
7. Registrar avance en `.ai-kit/memory/progress.md` con la plantilla estándar (fecha, objetivo, archivos, skills usados, comprobaciones reales y siguiente paso).

Consultar [flujo de trabajo y ciclo de vida](references/workflow.md) al coordinar funcionalidades.
