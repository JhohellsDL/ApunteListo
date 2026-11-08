---
name: craft-write-tests
description: "Crear o mejorar pruebas para una funcionalidad, corrección de bug o regresión usando el stack existente."
---

# craft-write-tests

1. Leer los tests y scripts existentes del proyecto; identificar el nivel adecuado (Nivel 1 Dominio, Nivel 2 Hooks con `renderHook`, Nivel 3 Componentes con RTL).
2. Aislar dependencias usando el Factory Pattern tipado sobre interfaces de repositorio; evitar el "mock hell" y mocks globales de red.
3. Estructurar cada prueba con el patrón AAA (Arrange - Act - Assert); probar comportamientos observables y prohibir el abuso de snapshots masivos ciegos.
4. En correcciones de bugs, aplicar el protocolo de regresión: escribir primero el test que reproduzca el fallo, verificar que falle y luego comprobar que pase tras la corrección.
5. Ejecutar las pruebas en terminal y reportar el comando exacto y su resultado; no afirmar ejecución si no ocurrió en la sesión.

Consultar [criterios y plantillas de pruebas](references/criteria.md) para ejemplos canónicos de los 3 niveles.
