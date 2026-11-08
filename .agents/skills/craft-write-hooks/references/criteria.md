# Criterios para Custom Hooks en React Native

Esta guía establece el protocolo técnico para diseñar, implementar y refactorizar Custom Hooks en React Native.

---

## 1. Cancelación Asíncrona y Prevención de Fugas de Memoria

Toda operación asíncrona dentro de un `useEffect` debe protegerse contra:
- **Actualización de estado en componente desmontado**: Si el usuario abandona la pantalla antes de que finalice la promesa.
- **Condiciones de carrera (*Race Conditions*)**: Si el usuario cambia de parámetros o filtros rápidamente, asegurando que respuestas desordenadas no sobreescriban el estado más reciente.

### Patrón canónico de cancelación:
```typescript
useEffect(() => {
  let active = true;

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const result = await repository.fetchData(id);
      if (active) {
        setData(result);
      }
    } catch (err: any) {
      if (active) {
        setError(err.message ?? 'Error inesperado');
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  loadData();

  return () => {
    active = false; // Cancela la asignación si se desmonta o cambia el id
  };
}, [repository, id]);
```

---

## 2. Separación de Estados de Carga Móvil: `loading` vs `refreshing`

En aplicaciones móviles la experiencia de actualización (*Pull-to-Refresh*) es distinta a la carga inicial:
- **`loading`**: Carga inicial cuando no hay datos en pantalla (activa el spinner central o skeleton).
- **`refreshing`**: Recarga en segundo plano mientras los datos anteriores siguen visibles (se vincula a la prop `refreshing` de `RefreshControl`).

```typescript
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  try {
    const freshData = await repository.fetchData(id);
    setData(freshData);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setRefreshing(false);
  }
}, [repository, id]);
```

---

## 3. Estabilidad de Callbacks con `useCallback`

Todos los handlers de eventos o acciones que el hook exponga a la pantalla o a subcomponentes deben memorizarse con `useCallback`:
- Previene que las filas de una `FlatList` o componentes envueltos en `React.memo` se re-rendericen innecesariamente en cada ciclo.
- Nomenclatura consistente: exponerlos con prefijo **`on[Acción]`** (`onRefresh`, `onRetry`, `onSelectItem`).

---

## 4. Inyección de Dependencias Limpia para Testing Unitario

El hook debe desacoplarse de la infraestructura concreta aceptando el repositorio o servicio como parámetro opcional con fallback a producción:

```typescript
import { defaultOrderRepository } from '../dependencies';
import type { OrderRepository } from '../domain/models';

export function useOrdersScreen(repository: OrderRepository = defaultOrderRepository) { ... }
```
- **En la app**: Se invoca `useOrdersScreen()` sin argumentos.
- **En pruebas unitarias**: Se ejecuta `renderHook(() => useOrdersScreen(mockRepo))` permitiendo testear estados de error, éxito y vacío sin simular llamadas de red globales.

---

## 5. Contrato de Retorno Tipado

- Para hooks de pantalla y coordinación: retornar siempre un **objeto estructurado** con tipado explícito (nunca arrays grandes propensos a errores de orden al desestructurar):
  ```typescript
  export interface UseOrdersResult {
    orders: Order[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    onRefresh: () => Promise<void>;
    onRetry: () => Promise<void>;
    onSelectOrder: (id: string) => void;
  }
  ```

---

## 6. Plantilla Canónica de Referencia

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderRepository } from '../domain/models';
import { defaultOrderRepository } from '../dependencies';

export function useOrdersScreen(
  repository: OrderRepository = defaultOrderRepository
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await repository.getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message ?? 'No se pudieron cargar los pedidos');
    }
  }, [repository]);

  // Carga inicial con cancelación
  useEffect(() => {
    let active = true;

    async function initialLoad() {
      setLoading(true);
      try {
        setError(null);
        const data = await repository.getOrders();
        if (active) setOrders(data);
      } catch (err: any) {
        if (active) setError(err.message ?? 'Error de conexión');
      } finally {
        if (active) setLoading(false);
      }
    }

    initialLoad();

    return () => {
      active = false;
    };
  }, [repository]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const onRetry = useCallback(async () => {
    setLoading(true);
    await fetchOrders();
    setLoading(false);
  }, [fetchOrders]);

  return {
    orders,
    loading,
    refreshing,
    error,
    onRefresh,
    onRetry,
  };
}
```
