# progress

- **Fecha:** 2026-11-07
- **Cambios realizados:**
  - Se instalaron las dependencias requeridas por `src/`: `@react-native-async-storage/async-storage` (^2.2.0), `react-native-image-picker` (^8.3.0), y `rn-mlkit-ocr` (^0.3.1) usando `pnpm`.
  - Se configuró Android en `android/build.gradle` (`ocrModels = ["latin"]`, `ocrUseBundled = true`) y `android/app/src/main/AndroidManifest.xml` (permiso `CAMERA`).
  - Se configuró iOS en `ios/Podfile` (`$ReactNativeOcrSubspecs = ['latin']`) y `ios/ApunteListo/Info.plist` (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`).
  - Se actualizó `__tests__/App.test.tsx` para importar `StudyApp` y mockear los módulos nativos en Jest.
  - Se agregó `.eslintignore` para excluir `vendor/`.
- **Comprobaciones:**
  - TypeScript: `npx tsc --noEmit` completado sin errores (0 errores).
  - Jest: `npx jest --no-watchman` pasó exitosamente (1/1 suites).
  - ESLint: `pnpm lint` pasó con 0 errores.
- **Siguiente paso:**
  - Ejecutar `bundle exec pod install` en `ios/` si se va a compilar en iOS, y verificar la compilación nativa en emulador o dispositivo Android/iOS (`pnpm android` / `pnpm ios`).
