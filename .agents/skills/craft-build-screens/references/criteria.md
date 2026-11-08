# Criterios para Pantallas React Native

## 1. Contrato de Navegación (Deep Linking Ready)
- **Solo identificadores primitivos**: Los parámetros de ruta solo deben transportar IDs (`{ orderId: string }`), nunca objetos complejos o pesados.
- **Tipado estricto**: Tipar explícitamente las props de navegación y parámetros de ruta con el navegador del proyecto (React Navigation o Expo Router).
- **Carga por ID**: La pantalla (a través de su hook) es responsable de cargar los datos frescos a partir del ID recibido, garantizando soporte de deep linking, restauración de estado tras matar la app en segundo plano y evitando datos desactualizados.

---

## 2. Cobertura de los 4 Estados Visuales Canónicos
Toda pantalla que dependa de datos asíncronos debe implementar de forma explícita:
1. **Loading**: Indicador de actividad centrado o skeleton layout; evitar pantallas en blanco que parpadean.
2. **Error con Reintento (*Retry*)**: Mensaje amigable y botón `onRetry` para que el usuario recupere la pantalla sin reiniciar la aplicación.
3. **Estado Vacío (*Empty State*)**: Vista explicativa cuando no hay elementos (ilustración/ícono, título descriptivo y acción sugerida).
4. **Contenido**: El flujo exitoso cuando existen datos.

---

## 3. Ergonomía de Dispositivo Móvil (Safe Area y Teclado)
- **Safe Area**: Usar `SafeAreaView` de `react-native-safe-area-context` con `edges={['top', 'left', 'right']}` para prevenir solapamiento con el *notch*, la barra de estado y los gestos de inicio.
- **Formularios e Inputs**:
  - Envolver en `KeyboardAvoidingView` configurando `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`.
  - Usar `ScrollView` o listas con `keyboardShouldPersistTaps="handled"` para permitir interacción con botones y descartar el teclado al tocar fuera.

---

## 4. Interacción Móvil: Pull-to-Refresh
- En pantallas basadas en listas (`FlatList`) o feeds de contenido, soportar siempre el gesto de actualización mediante `RefreshControl` nativo conectado a `refreshing` y `onRefresh` provenientes del hook de la pantalla.

---

## 5. Pantalla como Orquestador Delgado (*Thin Screen*)
- **Rol de la pantalla**: Debe limitarse a componer la vista (~80–150 líneas de código). Cero lógica de negocio, cálculos matemáticos o peticiones de red directas.
- **Extracción a Custom Hook**: La lógica, estados, efectos y callbacks se extraen a un hook dedicado (`use<ScreenName>.ts`).
- **Subcarpeta local (*Colocation*)**: Los subcomponentes que solo pertenecen a esta pantalla se ubican en una subcarpeta propia (`<ScreenName>/Subcomponent.tsx`). No enviarlos a la carpeta de componentes globales si no existe reutilización real en otros flujos.
- **Proponer antes de editar**: Al refactorizar pantallas extensas o legacy, presentar primero el plan de partición (hook y subcomponentes locales a crear) y esperar aprobación antes de modificar código.

---

## 6. Plantilla Canónica de Referencia

```tsx
import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrdersScreen } from './hooks/useOrdersScreen';
import { OrderHeader } from './OrdersScreen/OrderHeader';
import { OrderRow } from './OrdersScreen/OrderRow';
import { OrdersEmptyState } from './OrdersScreen/OrdersEmptyState';
import { OrdersErrorView } from './OrdersScreen/OrdersErrorView';

export function OrdersScreen() {
  const {
    orders,
    loading,
    refreshing,
    error,
    onRefresh,
    onRetry,
    onSelectOrder,
  } = useOrdersScreen();

  // 1. Estado Loading inicial
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  // 2. Estado de Error con Reintento
  if (error && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <OrdersErrorView message={error} onRetry={onRetry} />
      </SafeAreaView>
    );
  }

  // 3. Contenido y Estado Vacío
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <OrderHeader title="Mis Pedidos" />
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OrderRow order={item} onPress={() => onSelectOrder(item.id)} />
        )}
        ListEmptyComponent={<OrdersEmptyState onAction={onRefresh} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
```
