# Repaso Offline · MVP React Native

Módulo en TypeScript para integrar en una app base de React Native CLI. Convierte hasta tres fotos, capturas o páginas de texto en un quiz reutilizable. La interfaz está en español y el procesamiento ocurre en el teléfono.

## Integración

1. Copia `src/study` a la carpeta `src` de tu app.
2. Instala las dependencias nativas que falten. Estas son las versiones que se usaron en la revisión de tipos con React Native 0.81.5.

   ```sh
   npm install react-native-image-picker@8.2.1 rn-mlkit-ocr@0.3.1 @react-native-async-storage/async-storage@2.2.0 react-native-safe-area-context@5.6.2
   ```

   Si tu app ya usa alguna dependencia, conserva una sola instalación y comprueba su compatibilidad con los imports del módulo. El código usa la API por defecto de AsyncStorage. Utiliza el gestor de paquetes y las versiones nativas que ya maneje tu proyecto.

3. Monta `StudyApp` como pantalla. Si tu app ya tiene un `SafeAreaProvider` arriba en el árbol, monta solo `<StudyApp />`. Como prueba, puedes usar temporalmente este `App.tsx`.

   ```tsx
   import { SafeAreaProvider } from 'react-native-safe-area-context';
   import { StudyApp } from './src/study';

   export default function App() {
     return (
       <SafeAreaProvider>
         <StudyApp />
       </SafeAreaProvider>
     );
   }
   ```

   Si lo integras en React Navigation, puedes ocultar el encabezado del navegador y pasar `onExit={() => navigation.goBack()}` para salir desde la portada. Monta una sola instancia del módulo y permite que su navegación interna maneje Atrás mientras la pantalla esté activa.

### Android

En el `buildscript { ext { … } }` que ya tienes en `android/build.gradle`, agrega estas propiedades. `ocrUseBundled` hace que el modelo latino esté incluido en el build y disponible desde el primer uso en modo avión.

```groovy
ocrModels = ["latin"]
ocrUseBundled = true
```

Agrega el permiso al `android/app/src/main/AndroidManifest.xml` si todavía no existe, como hijo directo de `<manifest>`. El módulo solicita el permiso cuando el usuario toca **Tomar foto**.

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

La galería usa el selector de fotos del sistema. Si tu base tiene un `minSdkVersion` menor que 30 y aún no incluye AndroidX Activity 1.9 o posterior, sigue la configuración de [Photo Picker retrocompatible](https://github.com/react-native-image-picker/react-native-image-picker#targeting-android-api-levels-below-30). Si el selector permite elegir más imágenes de las disponibles, el módulo aplica el límite al recibirlas y pide volver a seleccionar.

Reconstruye con `npm run android` o el script equivalente de tu proyecto. El paquete OCR requiere Android API 23 o superior y pueden aplicar requisitos más altos de tu versión de React Native.

### iOS

En `ios/Podfile`, selecciona el modelo latino antes de `use_react_native!` y verifica que el *deployment target* sea iOS 15.5 o superior.

```ruby
$ReactNativeOcrSubspecs = ['latin']
```

Dentro del `<dict>` de `Info.plist` agrega las descripciones de permisos si faltan.

```xml
<key>NSCameraUsageDescription</key>
<string>Toma fotos de tus páginas para crear material de estudio.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Selecciona capturas o fotos de tus páginas de estudio.</string>
```

Ejecuta `bundle exec pod install` desde `ios` (o `pod install`, según tu proyecto), reconstruye y verifica la cámara en un dispositivo físico.

## Flujo

- **Crear un quiz.** Ponle nombre, agrega fotos o capturas de hasta tres páginas, y revisa o pega el texto. Puedes reordenar las páginas, corregir el OCR y retirar preguntas antes de guardar. El ejemplo incluido permite recorrer el flujo sin cámara.
- **Simulacro.** Mezcla preguntas y opciones al empezar. Permite volver atrás, entregar con preguntas pendientes mediante confirmación y ver la nota y las fuentes al final.
- **Repasar errores.** Practica los errores pendientes con retroalimentación inmediata. Una respuesta correcta retira esa pregunta de la lista al terminar el intento.
- **Marcar y repasar.** Las estrellas se guardan al tocarlas. Puedes practicar las marcadas o verlas en modo tarjeta.
- **Tarjetas.** Intenta recordar la respuesta, voltéala para verla con su fuente y navega entre tarjetas. Puedes usar el quiz completo o solo tus marcadas.

## Qué se guarda

El almacenamiento local conserva cada quiz, el texto revisado por página, las estrellas, los errores pendientes y hasta 30 intentos completos por quiz. La pantalla de detalle muestra los cinco más recientes. La imagen sirve como referencia durante la importación. El quiz guarda el texto y la evidencia, sin copiar las fotos al almacenamiento permanente. Si sales de un simulacro o repaso antes de entregarlo, las respuestas del intento en curso se descartan y las estrellas se conservan.

El generador usa reglas en español y devuelve hasta 15 preguntas. Identifica definiciones, años y frases para completar. Para selección única usa términos o años que aparecen en el mismo material y recurre a completar cuando faltan alternativas compatibles. Las reglas pueden producir preguntas poco útiles con textos ambiguos o OCR deficiente. La revisión antes de guardar permite retirarlas. Para completar se compara la respuesta con el fragmento esperado, tolerando mayúsculas, tildes agudas y artículos iniciales. Se conserva la distinción entre ñ y n.

## Organización

| Carpeta | Contenido |
| --- | --- |
| `domain` | Tipos, generación de preguntas, calificación, selección de preguntas de repaso y ejemplo |
| `data` | Cámara, galería, OCR local y persistencia |
| `presentation` | Pantallas, navegación del módulo y componentes visuales |

## Validación en tu app

1. Instala un build limpio, activa el modo avión **antes de usar el OCR**, toma una foto impresa y selecciona dos capturas locales. Comprueba que puedas leerlas y ordenar las páginas.
2. Revisa el texto, genera el quiz y guarda. Cierra y vuelve a abrir la app. Confirma que el quiz y sus fuentes sigan disponibles.
3. Entrega un simulacro con un error, márcalo, repásalo y aciértalo. Comprueba que desaparezca de errores pendientes y siga visible entre las marcadas.
4. Entra a tarjetas, voltea una y verifica que la respuesta y la fuente aparezcan solo al revelarla.
5. Prueba denegar el permiso de cámara y usar una captura borrosa. Comprueba que la galería, la edición de texto y la opción de volver a intentar sigan disponibles.

Documentación de las dependencias: [ML Kit en Android](https://developers.google.com/ml-kit/vision/text-recognition/v2/android), [wrapper OCR](https://github.com/ahmeterenodaci/rn-mlkit-ocr), [Image Picker](https://github.com/react-native-image-picker/react-native-image-picker) y [AsyncStorage 2.x](https://react-native-async-storage.github.io/2.0/Usage/).
