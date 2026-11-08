# Criterios y Guía de Revisión de UI

Esta guía establece el protocolo técnico para auditar pantallas, componentes y flujos de interfaz de usuario en React Native.

---

## 1. Matriz de Severidad de UI

Todo defecto de interfaz detectado debe clasificarse obligatoriamente bajo uno de estos tres niveles:

- **`[BLOQUEANTE]`**: Problemas críticos que rompen la usabilidad o causan errores en runtime.
  - Vistas tapadas por el *notch*, la barra de estado o barras de navegación por falta de `SafeAreaView`.
  - Formularios bloqueados por el teclado en móvil (campos cubiertos sin posibilidad de scroll o sin poder descartar el teclado).
  - Pantallas asíncronas que no manejan estado de error ni ofrecen opción de reintento (*retry*), provocando bloqueos visuales.
  - Parámetros de navegación que envían objetos complejos en lugar de IDs primitivos, rompiendo deep linking o restauración de estado.
- **`[ADVERTENCIA]`**: Incumplimientos de buenas prácticas y deuda técnica móvil.
  - Pantallas monolíticas sobrecargadas (> 300–400 líneas) que mezclan lógica de estado y múltiples secciones visuales.
  - Ausencia de Estado Vacío (*Empty State*) en pantallas con listas o colecciones.
  - Componentes supuestamente reusables acoplados a `useNavigation()`, `useSelector()` o llamadas directas a APIs.
  - Elementos táctiles o botones de íconos pequeños (< 44x44 pt) sin propiedad `hitSlop`.
  - Estilos inline masivos en JSX en lugar de `StyleSheet.create` estático.
- **`[SUGERENCIA]`**: Mejoras de diseño, consistencia o ergonomía no bloqueantes.
  - Oportunidad de reemplazar booleanos contradictorios (`isPrimary`, `isDanger`) por uniones de literales (`variant`).
  - Oportunidad de extraer un subcomponente local menor para reducir anidación visual.
  - Ajustes menores de espaciado o consistencia con el Design System.

---

## 2. Checklist de Auditoría de UI

### A. Auditoría de Pantallas
- [ ] **Navegación**: ¿Los parámetros de ruta solo transportan identificadores primitivos (`id`, `uuid`)?
- [ ] **Los 4 Estados**: ¿Implementa Loading, Error con Reintento (*onRetry*), Empty State y Contenido?
- [ ] **Ergonomía Móvil**: ¿Usa `SafeAreaView` con `edges` adecuados? En formularios, ¿usa `KeyboardAvoidingView` y `keyboardShouldPersistTaps="handled"`?
- [ ] **Listas y Pull-to-Refresh**: En `FlatList`, ¿se incluye `RefreshControl` nativo conectado a la función de refresco?
- [ ] **Orquestador Delgado**: ¿La pantalla se mantiene en ~80–150 líneas delegando lógica al hook y vista a subcomponentes?

### B. Auditoría de Componentes
- [ ] **Componente Dumb / Presentacional**: ¿El componente carece de `useNavigation()`, stores globales y llamadas a red, recibiendo datos por props y acciones por callbacks `on[Acción]`?
- [ ] **Tipado**: ¿Usa funciones estándar tipadas en lugar de `React.FC`? ¿Usa uniones de variantes en vez de *prop explosion*?
- [ ] **Estilos**: ¿Los estilos están en `StyleSheet.create` estático fuera del render? ¿Acepta `style?: StyleProp<ViewStyle>` externa?
- [ ] **Accesibilidad y Área Táctil**: ¿Los interactivos pequeños tienen `hitSlop` asegurando 44x44 pt? ¿Tienen `accessibilityRole` y `accessibilityLabel` si no tienen texto visible?

---

## 3. Detección de Pantallas Monolíticas (> 300–400 líneas)

Al revisar pantallas complejas o heredadas (*legacy*), evaluar si sufren de sobrecarga de responsabilidades:
- **Síntomas de alerta**:
  - La pantalla supera las 300–400 líneas de código (o casos extremos de 800–1000 líneas).
  - Mezcla múltiples bloques de JSX largos correspondientes a secciones visualmente diferenciadas (formularios por pasos, tarjetas complejas, headers personalizados, modales embebidos).
  - Concentra múltiples `useState`, `useEffect` o handlers de eventos junto con el renderizado visual.

### Estrategia de Descomposición Recomendada:
1. **Extracción de Lógica a Custom Hook Local**:
   - Mover estados, efectos, llamadas asíncronas y callbacks a `use<ScreenName>.ts`.
   - El hook retorna solo el estado visual listo y los handlers de acción (`{ state, onAction }`).
2. **Subcomponentes Exclusivos (Subcarpeta de Pantalla)**:
   - **Regla estricta**: Si un componente solo sirve a esta pantalla, **no enviarlo a la carpeta compartida/global de componentes**.
   - Agruparlos en una subcarpeta local con el nombre de la pantalla:
     ```text
     presentation/
     ├── CheckoutScreen.tsx              # Orquestador limpio (~100 líneas)
     ├── hooks/
     │   └── useCheckoutScreen.ts        # Lógica, estados y efectos
     └── CheckoutScreen/                 # Subcomponentes locales exclusivos
         ├── CheckoutOrderSummary.tsx
         ├── CheckoutPaymentSection.tsx
         └── CheckoutShippingForm.tsx
     ```
3. **Pantalla como Orquestador Puro**:
   - La pantalla actúa como un compositor de nivel superior que delega el renderizado a sus subcomponentes locales.

---

## 4. Protocolo de Revisión: Proponer antes de Modificar

- **No editar código automáticamente**: En cualquier revisión o refactorización de UI, **siempre entregar primero el diagnóstico y la propuesta**.
- **Formato del reporte de hallazgo**:
  ```markdown
  ### [SEVERIDAD] Título del problema de UI
  - **Ubicación**: `src/screens/CheckoutScreen.tsx:45`
  - **Condición disparadora**: Ocurre en dispositivos con notch o al abrir el teclado en inputs inferiores.
  - **Impacto**: El teclado tapa el botón de confirmar y el usuario no puede enviar el formulario.
  - **Corrección recomendada**: Envolver en `KeyboardAvoidingView` y añadir `keyboardShouldPersistTaps="handled"`.
  ```
- **Espera de confirmación**: Solicitar la aprobación del usuario antes de crear o editar cualquier archivo.
