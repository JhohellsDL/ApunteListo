# Criterios de Arquitectura

## Semáforo de Complejidad (Anti-Sobreingeniería)
Antes de proponer o crear archivos, clasificar el requerimiento en el nivel correspondiente:
- **Nivel 1 (Estático / UI pura)**: Pantallas informativas, modales simples, vistas estáticas o formularios básicos sin reglas de negocio.
  - *Estructura*: Solo `presentation/Screen.tsx` y subcomponentes locales. **Prohibido crear capas `domain/` o `data/` innecesarias.**
- **Nivel 2 (CRUD estándar / Flujo directo)**: Consultas o envíos a API sin transformaciones complejas, cálculos pesados ni almacenamiento offline.
  - *Estructura*: `Screen.tsx` + `hooks/use<Feature>.ts` consumiendo directamente un servicio de API o data source. No forzar casos de uso intermedios que solo deleguen sin aportar lógica.
- **Nivel 3 (Lógica de negocio rica / Múltiples fuentes / Offline-first)**: Reglas de validación complejas, sincronización local, cálculos de negocio o flujos independientes de la UI.
  - *Estructura*: Separación completa en 3 capas (`domain/`, `data/`, `presentation/`) siguiendo la plantilla de scaffolding.

---

## Límites y Ubicación
- Dominio: reglas y casos de uso sin hooks, navegación ni componentes de React.
- Data: adaptadores de API, persistencia y mapeo de contratos.
- Presentación: pantallas, componentes y hooks que adaptan datos a la interfaz.
- Una función pura no pertenece automáticamente a utils: clasificar por responsabilidad y ámbito.
- Un feature compartido no exige mover todo a global; compartir el contrato o capacidad mínima.
- Inyección limpia: resolver dependencias en un módulo de composición (`dependencies.ts`) o defaults en hooks para que la vista JSX no instancie clientes de datos directamente.
- En legacy, limitar el cambio al flujo solicitado; proponer migración por separado.
- Para el árbol canónico de carpetas y esqueletos de código mínimos para las 3 capas, consultar la [plantilla de scaffolding](scaffolding.md).
