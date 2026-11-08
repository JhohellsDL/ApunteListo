# Criterios para la Capa de Datos (Data Layer) en React Native

Esta guía establece el protocolo técnico para implementar adaptadores de API, clientes HTTP, almacenamiento local y mapeo de datos en proyectos móviles.

---

## 1. Separación Estricta: DTOs vs Entidades de Dominio

En aplicaciones móviles, el backend suele evolucionar de forma independiente o devolver formatos heredados (`snake_case`, IDs numéricos, estructuras redundantes).
- **DTO (*Data Transfer Object*)**: Representa exactamente la respuesta cruda de la API o base de datos externa.
- **Entidad de Dominio**: El modelo limpio, tipado y validado que utiliza la aplicación.

### Regla de oro del Mapeo:
**Prohibido pasar DTOs crudos a los hooks o pantallas.** Toda respuesta debe pasar por un mapper explícito antes de salir de la capa `data/`.

```typescript
// data/order.dto.ts
export interface OrderDto {
  order_id: string;
  total_amount: number;
  created_at_utc: string;
  status_code: 'PEN' | 'CMP' | 'CAN';
}

// domain/models.ts
export interface Order {
  id: string;
  total: number;
  createdAt: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

// data/order.mapper.ts
import type { OrderDto } from './order.dto';
import type { Order } from '../domain/models';

export function toDomainOrder(dto: OrderDto): Order {
  const statusMap = {
    PEN: 'pending',
    CMP: 'completed',
    CAN: 'cancelled',
  } as const;

  return {
    id: dto.order_id,
    total: dto.total_amount,
    createdAt: new Date(dto.created_at_utc),
    status: statusMap[dto.status_code] ?? 'pending',
  };
}
```

---

## 2. Resiliencia de Red y Errores Tipados

En dispositivos móviles, las conexiones se degradan o interrumpen frecuentemente (túneles, ascensores, cambio de Wi-Fi a 4G).
- **Timeouts obligatorios**: Toda petición debe tener un timeout máximo (ej. 10–15 segundos) mediante `AbortSignal.timeout()` o configuración de cliente.
- **Clasificación de errores**:
  ```typescript
  export class NetworkError extends Error {
    constructor(message = 'Sin conexión a internet') {
      super(message);
      this.name = 'NetworkError';
    }
  }

  export class UnauthorizedError extends Error {
    constructor(message = 'Sesión expirada') {
      super(message);
      this.name = 'UnauthorizedError';
    }
  }
  ```
- **Manejo de `401 Unauthorized`**:
  - Si la API responde 401, el cliente debe intentar renovar el token con el *Refresh Token* o disparar un evento global de cierre de sesión para redirigir al login limpiamente.

---

## 3. Estrategia de Almacenamiento Local Móvil

No todo almacenamiento es igual en React Native:

| Tipo de Dato | Destino Recomendado | Razón |
|---|---|---|
| **Tokens JWT, Refresh Tokens, Credenciales** | `expo-secure-store` / `react-native-keychain` | Cifrado por hardware (iOS Keychain / Android Keystore). Prohibido guardarlos en storage plano. |
| **Caché de datos, Preferencias, Flags** | `react-native-mmkv` / `@react-native-async-storage` | Almacenamiento rápido en disco / memoria clave-valor. |
| **Colecciones offline grandes** | `WatermelonDB` / `op-sqlite` | Bases de datos relacionales locales para modo offline-first. |

---

## 4. Implementación del Repositorio de Datos

La clase o módulo en `data/` implementa la interfaz declarada en `domain/models.ts`:

```typescript
// data/order.repository.ts
import type { Order, OrderRepository } from '../domain/models';
import type { OrderDto } from './order.dto';
import { toDomainOrder } from './order.mapper';

export class ApiOrderRepository implements OrderRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly getAuthToken: () => Promise<string | null>
  ) {}

  async getOrders(): Promise<Order[]> {
    const token = await this.getAuthToken();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      });

      if (response.status === 401) {
        throw new Error('Sesión expirada');
      }

      if (!response.ok) {
        throw new Error(`Error en servidor: ${response.status}`);
      }

      const dtos: OrderDto[] = await response.json();
      return dtos.map(toDomainOrder);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
```

---

## 5. Checklist de la Capa de Datos
- [ ] ¿Los DTOs están claramente tipados y separados de las entidades de dominio?
- [ ] ¿Existe una función mapper que transforme los datos antes de exponerlos al caso de uso o hook?
- [ ] ¿Las peticiones HTTP tienen timeout y cancelan señales activas?
- [ ] ¿Los tokens sensibles se guardan en almacenamiento cifrado (Keychain/Keystore)?
- [ ] ¿La clase o módulo de repositorio implementa la interfaz del dominio sin acoplar la UI a la API?

