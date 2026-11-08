# Criterios para Componentes React Native

## 1. Tipado Moderno y Contratos de Props
- **Funciones estándar**: Declarar componentes como funciones tradicionales con interfaz explícita. **Evitar `React.FC`**:
  ```typescript
  interface ActionButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
  }
  export function ActionButton({ ... }: ActionButtonProps) { ... }
  ```
- **Evitar la explosión de booleanos (*Prop Explosion*)**: En lugar de banderas contradictorias (`isPrimary`, `isOutline`, `isDanger`), usar uniones de literales (`variant`, `size`).
- **Nomenclatura consistente**:
  - Props de eventos: siempre con prefijo **`on[Acción]`** (`onPress`, `onValueChange`, `onDismiss`).
  - Handlers internos dentro del componente: prefijo **`handle[Acción]`** (`handlePress`).

---

## 2. Componentes Presentacionales Puros (*Dumb Components*)
- **Sin efectos colaterales de navegación ni red**: Prohibido invocar `useNavigation()`, `useSelector()`, queries o clientes HTTP dentro del componente.
- **Flujo unidireccional**: Los datos entran exclusivamente por `props` y los eventos salen por callbacks. El padre (pantalla o contenedor) es quien decide si navega, persiste o llama a una API.
- **Reutilización y ubicación**:
  - Si el componente es de uso exclusivo de una pantalla, mantenerlo en su **subcarpeta local** (`<ScreenName>/Subcomponent.tsx`).
  - Solo promover a la carpeta compartida/global cuando tenga un contrato estable y consumidores reales en más de un flujo.

---

## 3. Estilos y Rendimiento en React Native
- **`StyleSheet.create` estático**: Definir estilos siempre fuera del cuerpo del componente para evitar recrear objetos de estilo en cada render.
- **Variantes dinámicas**: Mapear estilos mediante diccionarios estáticos combinados en arrays:
  ```typescript
  style={[styles.base, variantStyles[variant], style]}
  ```
- **Prop `style` externa**: Aceptar siempre `style?: StyleProp<ViewStyle>` para permitir márgenes y alineación desde el contenedor padre sin romper el encapsulamiento visual del componente.

---

## 4. Ergonomía Táctil y Accesibilidad (A11y)
- **Área táctil mínima (44x44 pt)**: En botones pequeños o basados en íconos (< 44 pt), aplicar siempre **`hitSlop`**:
  ```typescript
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  ```
- **Etiquetas accesibles**: Incluir `accessibilityRole` (`"button"`, `"header"`, `"image"`) y `accessibilityLabel` obligatorio cuando el botón o elemento no contenga texto visible directo.

---

## 5. Plantilla de Referencia Canónica

```tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface ActionCardProps {
  title: string;
  description?: string;
  variant?: 'primary' | 'neutral';
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ActionCard({
  title,
  description,
  variant = 'neutral',
  disabled = false,
  onPress,
  style,
}: ActionCardProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        variantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  neutral: {
    backgroundColor: '#f5f5f5',
  },
  primary: {
    backgroundColor: '#e3f2fd',
  },
});
```
