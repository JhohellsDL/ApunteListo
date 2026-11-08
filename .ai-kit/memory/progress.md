# progress

- **Fecha:** 2026-11-08
- **Cambios realizados:**
  - Diversificación de tipos de preguntas en `src/study/domain/questions.ts`:
    - **Preguntas de Autores y Pensadores (`group: 'author'`):** Reconoce patrones como `[Autor] sostiene que / plantea que / formuló [Tesis]`, formula preguntas del tipo `¿Qué autor sostiene que...?` y usa a otros autores del mismo texto como alternativas de opción múltiple.
    - **Preguntas Interrogativas Directas (`¿Qué concepto...?` y `¿A qué concepto corresponde...?`):** Transforma definiciones y elementos de tablas a preguntas en lenguaje natural en lugar de depender únicamente de rellenar espacios (`___`).
    - **Preguntas Condicionales (`group: 'condition'`):** Detecta oraciones de causa-efecto `Si [Condición], entonces [Consecuencia]` formulando preguntas sobre la consecuencia esperada.
  - Se añadieron pruebas unitarias para preguntas de autores y condicionales en `__tests__/domain.test.ts`.
- **Comprobaciones:**
  - TypeScript: `npx tsc --noEmit` completado con 0 errores.
  - Jest: `npx jest --no-watchman` 2 suites pasadas (12/12 pruebas exitosas).
  - ESLint: `pnpm lint` completado con 0 errores y 0 warnings.
- **Siguiente paso:**
  - Subir los cambios a GitHub (`git push`).
