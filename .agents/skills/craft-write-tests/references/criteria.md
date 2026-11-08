# Criterios y Guía de Pruebas Unitarias para React Native

Esta guía establece el protocolo técnico para diseñar, escribir y estructurar pruebas automatizadas en proyectos React Native y TypeScript.

---

## 1. Los 3 Niveles de Testing

Para mantener una suite de pruebas rápida, fiable y mantenible, clasificar y estructurar las pruebas en 3 niveles:

```text
    ▲
   / \     Nivel 3: Componentes y Pantallas (UI / Interacción con RTL)
  /───\    Nivel 2: Custom Hooks (Lógica asíncrona con renderHook)
 /─────\   Nivel 1: Dominio y Casos de Uso (TypeScript puro, ultrarrápido)
```

1. **Nivel 1: Dominio y Casos de Uso (TypeScript Puro)**:
   - Prueban reglas de negocio, validaciones y transformaciones de datos.
   - No requieren React, JSX ni emuladores; se ejecutan en milisegundos.
2. **Nivel 2: Custom Hooks (`renderHook`)**:
   - Prueban la lógica asíncrona y transiciones de estado: carga inicial, error con reintento, actualización de datos y cancelación al desmontar.
3. **Nivel 3: Componentes y Pantallas (React Native Testing Library)**:
   - Prueban lo que el usuario ve y experimenta: textos en pantalla, estados visuales (Loading, Empty, Error) e interacción táctil (`fireEvent.press`).

---

## 2. Aislamiento Limpio con el Factory Pattern (Adiós al Mock Hell)

En lugar de mockear librerías globales de red (`jest.mock('axios')` o `global.fetch`), aprovechar la inyección de dependencias para crear repositorios simulados con el **Factory Pattern**:

```typescript
import type { OrderRepository } from '../domain/models';

export function createMockOrderRepository(
  overrides: Partial<OrderRepository> = {}
): OrderRepository {
  return {
    getOrders: jest.fn().mockResolvedValue([
      { id: '1', title: 'Pedido Test', total: 100 },
    ]),
    toggleOrder: jest.fn().mockResolvedValue({ id: '1', completed: true }),
    ...overrides,
  };
}
```
- **Ventaja**: Cada test define exactamente qué necesita simular sin contaminar el entorno global de otros archivos de prueba.

---

## 3. Principios de Calidad y Anti-Patrones

- **Prohibido el abuso de Snapshots masivos**:
  - `expect(tree).toMatchSnapshot()` está prohibido como única aserción de un test. Genera falsos positivos y se actualiza a ciegas.
  - Las aserciones deben validar comportamientos observables concretos:
    ```typescript
    expect(screen.getByText('Error de conexión')).toBeTruthy();
    expect(result.current.orders).toHaveLength(1);
    ```
- **Estructura AAA Estricta (Arrange - Act - Assert)**:
  - **Arrange**: Preparar datos, mocks y parámetros.
  - **Act**: Invocar la función, hook o disparar el evento.
  - **Assert**: Validar el resultado o estado esperado.
- **Protocolo de Regresiones (Corrección de Bugs)**:
  1. Escribir primero el test que reproduzca el bug reportado y **verificar que falle**.
  2. Aplicar el cambio mínimo coherente en el código.
  3. Ejecutar el test y confirmar que **ahora pasa con éxito**.

---

## 4. Plantillas Canónicas de Referencia

### Plantilla 1: Test de Caso de Uso de Dominio (Nivel 1)
```typescript
import { executeToggleItem } from '../domain/use-toggle-item';
import { createMockItemRepository } from './mocks/item-repository.mock';

describe('executeToggleItem', () => {
  it('debe actualizar el elemento cuando el ID es válido', async () => {
    // Arrange
    const mockRepo = createMockItemRepository();

    // Act
    const result = await executeToggleItem('item-123', mockRepo);

    // Assert
    expect(mockRepo.toggleItem).toHaveBeenCalledWith('item-123');
    expect(result.completed).toBe(true);
  });

  it('debe lanzar un error si el ID está vacío', async () => {
    const mockRepo = createMockItemRepository();

    await expect(executeToggleItem('', mockRepo)).rejects.toThrow('ID requerido');
    expect(mockRepo.toggleItem).not.toHaveBeenCalled();
  });
});
```

### Plantilla 2: Test de Custom Hook con `renderHook` (Nivel 2)
```typescript
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useOrdersScreen } from '../presentation/hooks/useOrdersScreen';
import { createMockOrderRepository } from './mocks/order-repository.mock';

describe('useOrdersScreen', () => {
  it('debe cargar los pedidos al iniciar y apagar el loading', async () => {
    // Arrange
    const mockRepo = createMockOrderRepository();

    // Act
    const { result } = renderHook(() => useOrdersScreen(mockRepo));

    // Assert inicial
    expect(result.current.loading).toBe(true);

    // Esperar resolución
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.orders).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('debe capturar el error y permitir reintentar', async () => {
    // Arrange
    const mockRepo = createMockOrderRepository({
      getOrders: jest.fn().mockRejectedValueOnce(new Error('Fallo de red')),
    });

    // Act
    const { result } = renderHook(() => useOrdersScreen(mockRepo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Fallo de red');

    // Reintentar (onRetry)
    await act(async () => {
      await result.current.onRetry();
    });

    expect(mockRepo.getOrders).toHaveBeenCalledTimes(2);
  });
});
```

### Plantilla 3: Test de Componente con RTL (Nivel 3)
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActionCard } from '../presentation/components/ActionCard';

describe('ActionCard', () => {
  it('debe renderizar título y disparar onPress al tocarlo', () => {
    // Arrange
    const handlePress = jest.fn();
    const { getByText, getByRole } = render(
      <ActionCard title="Comprar" onPress={handlePress} />
    );

    // Act
    const button = getByRole('button');
    fireEvent.press(button);

    // Assert
    expect(getByText('Comprar')).toBeTruthy();
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('no debe disparar onPress si está deshabilitado', () => {
    const handlePress = jest.fn();
    const { getByRole } = render(
      <ActionCard title="Comprar" disabled onPress={handlePress} />
    );

    fireEvent.press(getByRole('button'));

    expect(handlePress).not.toHaveBeenCalled();
  });
});
```

