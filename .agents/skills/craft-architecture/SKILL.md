---
name: craft-architecture
description: "Decidir ubicación, dependencias y límites de responsabilidades al introducir o reorganizar una funcionalidad."
---

# craft-architecture

1. Inspeccionar estructura, decisiones vigentes y dependencias reales antes de proponer cambios.
2. Clasificar la complejidad con el semáforo (Nivel 1 UI pura, Nivel 2 CRUD directo, Nivel 3 Dominio desacoplado). No sobrearquitecturar requerimientos simples ni migrar legacy sin solicitud.
3. Para Nivel 3, separar dominio independiente de React, acceso a datos y presentación; resolver dependencias en composición (`dependencies.ts`) o defaults sin instanciar clientes en la vista JSX.
4. Explicar la decisión de ubicación y dependencias. Al definir o introducir una estructura por primera vez en el proyecto, registrar el patrón elegido en `.ai-kit/memory/decisions.md` para garantizar consistencia en sesiones posteriores.
5. Entregar mapa de archivos y razones, con alternativas solo cuando cambien la decisión.

Consultar [criterios y ejemplos](references/criteria.md) y la [plantilla de scaffolding](references/scaffolding.md) al tomar estas decisiones.
