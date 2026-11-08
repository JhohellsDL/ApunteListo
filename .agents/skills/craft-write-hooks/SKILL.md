---
name: craft-write-hooks
description: "Diseñar o refactorizar hooks React de navegación, consultas, estado y coordinación; separar lógica pura y dominio."
---

# craft-write-hooks

1. Identificar responsabilidad y definir un contrato de retorno tipado como objeto estructurado (`{ data, loading, refreshing, error, onAction }`).
2. Distinguir estados móviles: separar `loading` (carga inicial con spinner) de `refreshing` (recarga en segundo plano para pull-to-refresh).
3. Implementar cancelación asíncrona en efectos (`active = true; return () => { active = false; };`) para evitar condiciones de carrera y fugas de memoria al desmontar.
4. Memorizar con `useCallback` todos los handlers expuestos a la vista (`on[Acción]`) para evitar re-renders innecesarios en listas y subcomponentes.
5. Permitir inyección de dependencias por valor por defecto (`repository = defaultRepository`) para facilitar pruebas unitarias directas con `renderHook` sin mocks globales.

Consultar [criterios y plantilla](references/criteria.md) al diseñar o refactorizar hooks.
