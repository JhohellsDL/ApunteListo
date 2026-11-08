---
name: craft-build-components
description: "Crear o extraer componentes React Native, definir props, variantes, accesibilidad y alcance de reutilización."
---

# craft-build-components

1. Revisar Design System y componentes existentes antes de crear uno nuevo.
2. Definir contrato de props con funciones estándar tipadas (sin `React.FC`); usar uniones de variantes en lugar de booleanos excluyentes y prefijos `on[Acción]` para callbacks.
3. Mantener el componente como presentacional puro (*Dumb Component*): sin navegación (`useNavigation`), store global ni llamadas a API incrustadas; recibir datos por props y emitir acciones por callbacks.
4. Elegir ubicación: subcarpeta local de pantalla si es exclusivo, feature si es compartido en el módulo, o global solo con consumidores reales.
5. Estandarizar estilos con `StyleSheet.create` estático, permitir prop `style` externa y asegurar accesibilidad móvil (`hitSlop` mínimo de 44x44, `accessibilityRole` y `accessibilityLabel`).

Consultar [criterios y ejemplos](references/criteria.md) al tomar estas decisiones.
