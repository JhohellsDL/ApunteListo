# Plantilla y Scaffolding Canónico de Arquitectura

Usa esta plantilla como referencia estándar al crear una funcionalidad que requiera **Nivel 3 (Lógica de negocio rica o desacoplada)** en React Native. Para requerimientos más sencillos, consulta primero el **Semáforo de Complejidad** en [criteria.md](criteria.md).

---

## 1. Estructura de carpetas recomendada (Feature-Driven)

```text
src/features/<feature-name>/
├── domain/                          # LÓGICA PURA (TypeScript sin React)
│   ├── models.ts                    # Entidades, tipos e interfaces del contrato
│   └── use-<action>.ts              # Casos de uso (funciones puras orquestadoras)
├── data/                            # ACCESO A DATOS (APIs, Storage, Mappers)
│   ├── <feature>.api.ts             # Cliente HTTP / endpoint remoto
│   └── <feature>.repository.ts      # Implementación del contrato del repositorio
├── dependencies.ts                  # COMPOSICIÓN / INYECCIÓN (Resuelve instancias reales)
└── presentation/                    # INTERFAZ Y REACT (Vistas y estado)
    ├── components/                  # Componentes atómicos visuales puros
    │   └── <FeatureItem>.tsx
    ├── hooks/                       # Custom hooks que adaptan datos a la UI
    │   └── use<FeatureName>.ts
    └── <FeatureName>Screen.tsx      # Pantalla orquestadora de la vista
```

> **Regla de oro de dependencias**:
> - `presentation` -> consume `domain` y usa la composición de `dependencies.ts`.
> - `data` -> implementa contratos definidos en `domain`.
> - `domain` -> **no depende de nadie** (prohibido importar React, hooks, Axios o Storage).
> - `Screen.tsx` -> **nunca hace `new ApiRepository()` directamente** dentro de la vista.

---

## 2. Esqueletos de código mínimos de referencia

### Capa de Dominio (`domain/`)
```typescript
// domain/models.ts
export interface Item {
  id: string;
  title: string;
  completed: boolean;
}

export interface ItemRepository {
  fetchItems(): Promise<Item[]>;
  toggleItem(id: string): Promise<Item>;
}

// domain/use-toggle-item.ts
import type { Item, ItemRepository } from './models';

export async function executeToggleItem(
  id: string,
  repository: ItemRepository
): Promise<Item> {
  if (!id) throw new Error('ID de elemento requerido');
  return repository.toggleItem(id);
}
```

### Capa de Datos (`data/`)
```typescript
// data/item.repository.ts
import type { Item, ItemRepository } from '../domain/models';

export class ApiItemRepository implements ItemRepository {
  constructor(private readonly baseUrl: string) {}

  async fetchItems(): Promise<Item[]> {
    const res = await fetch(`${this.baseUrl}/items`);
    if (!res.ok) throw new Error('Error al obtener elementos');
    return res.json();
  }

  async toggleItem(id: string): Promise<Item> {
    const res = await fetch(`${this.baseUrl}/items/${id}/toggle`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al actualizar');
    return res.json();
  }
}
```

### Inyección de Dependencias / Composición (`dependencies.ts`)
```typescript
// dependencies.ts
import { ApiItemRepository } from './data/item.repository';
import type { ItemRepository } from './domain/models';

// Instancia única o factoría configurada para producción
export const defaultItemRepository: ItemRepository = new ApiItemRepository(
  process.env.API_URL ?? 'https://api.ejemplo.com'
);
```

### Capa de Presentación (`presentation/`)
```typescript
// presentation/hooks/useItemsList.ts
import { useState, useEffect, useCallback } from 'react';
import type { Item, ItemRepository } from '../../domain/models';
import { executeToggleItem } from '../../domain/use-toggle-item';
import { defaultItemRepository } from '../../dependencies';

// Inyección por parámetro con valor por defecto:
// - Producción: useItemsList() usa automáticamente defaultItemRepository.
// - Tests unitarios: useItemsList(mockRepo) permite pruebas aisladas sin mocks globales de red.
export function useItemsList(repository: ItemRepository = defaultItemRepository) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    repository.fetchItems()
      .then(data => { if (active) setItems(data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [repository]);

  const onToggle = useCallback(async (id: string) => {
    try {
      const updated = await executeToggleItem(id, repository);
      setItems(prev => prev.map(it => (it.id === id ? updated : it)));
    } catch (err: any) {
      setError(err.message);
    }
  }, [repository]);

  return { items, loading, error, onToggle };
}
```

```tsx
// presentation/ItemsScreen.tsx
import React from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useItemsList } from './hooks/useItemsList';
import { ItemRow } from './components/ItemRow';

export function ItemsScreen() {
  // La vista no sabe nada de APIs, URLs ni clases de datos
  const { items, loading, error, onToggle } = useItemsList();

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ItemRow item={item} onToggle={() => onToggle(item.id)} />}
      />
    </View>
  );
}
```

---

## 3. Fijación de la convención en el proyecto

Cuando definas esta estructura por primera vez en un proyecto:
1. Registra la decisión en `.ai-kit/memory/decisions.md` con formato ADR:
   - **Fecha**: YYYY-MM-DD
   - **Contexto**: Estructura de carpetas e inyección para nuevas funcionalidades.
   - **Decisión**: Estructura modular `src/features/<nombre>/{domain,data,presentation}` con punto de composición `dependencies.ts` y defaults en hooks.
   - **Motivo**: Mantener consistencia entre sesiones del asistente, evitar sobreingeniería y permitir testeo unitario directo.
   - **Estado**: Vigente.
2. En las siguientes sesiones o tareas, el asistente leerá esta decisión y replicará la estructura sin improvisar.
