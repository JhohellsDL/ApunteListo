# decisions

## 2026-11-08: Descomposición de Pantallas y Custom Hooks en Presentación
- **Contexto:** Las pantallas de `src/study/presentation` estaban concentradas en archivos compuestos (`StudyLibrary.tsx`, `StudySession.tsx`) y acoplaban lógica de efectos, OCR y selección de imágenes dentro de componentes JSX.
- **Decisión:** 
  - Descomponer cada pantalla en un archivo individual bajo `src/study/presentation/screens/` (`StudyHomeScreen`, `QuizDetailScreen`, `QuizMaterialScreen`, `StudySessionScreen`, `StudyResultScreen`, `QuizBuilderScreen`).
  - Extraer lógica de estado y mutación a hooks dedicados en `src/study/presentation/hooks/` (`useQuizBuilder`, `useStudySession`).
  - Agregar soporte nativo de `RefreshControl` en `Screen` (`ui.tsx`) y eliminar estilos inline en favor de `StyleSheet`.
- **Motivo:** Cumplir con los lineamientos de Thin Screen de `craft-build-screens`, mejorar la testeabilidad aislada de la lógica de interfaz y garantizar el estándar de ESLint sin warnings.
- **Estado:** Vigente.
