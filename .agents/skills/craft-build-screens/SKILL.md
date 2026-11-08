---
name: craft-build-screens
description: "Construir o dividir pantallas React Native, definir parámetros, estados visuales y ubicación de subcomponentes."
---

# craft-build-screens

1. Leer convenciones de rutas, arquitectura y navegación del proyecto; restringir parámetros de ruta a identificadores primitivos (deep linking ready).
2. Cubrir de forma explícita los 4 estados visuales canónicos: loading, error con reintento (*onRetry*), estado vacío (*empty state*) y contenido.
3. Componer la pantalla como un orquestador delgado (~80–150 líneas) con `SafeAreaView`; delegar lógica y efectos a un hook dedicado y componentes nuevos a craft-build-components.
4. Ubicar subcomponentes exclusivos en su subcarpeta local (`<ScreenName>/`); en pantallas legacy o extensas, proponer el plan de descomposición antes de editar código.
5. Integrar ergonomía móvil: soporte de pull-to-refresh (`RefreshControl`) en listas y gestión de teclado en formularios (`KeyboardAvoidingView`).

Consultar [criterios y ejemplos](references/criteria.md) al tomar estas decisiones.
