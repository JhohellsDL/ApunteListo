---
name: craft-build-data
description: "Implementar adaptadores de datos, clientes HTTP, almacenamiento local y mapeo de contratos (DTOs a entidades)."
---

# craft-build-data

1. Leer contratos de repositorio e interfaces de entidades definidas en la capa de dominio (`domain/models.ts`).
2. Diseñar DTOs (*Data Transfer Objects*) que reflejen fielmente la respuesta cruda de la API o base de datos externa.
3. Implementar mappers explícitos (funciones puras) para transformar DTOs en entidades de dominio limpias; prohibido pasar DTOs crudos a hooks o pantallas.
4. Implementar adaptadores de red y persistencia (Fetch/Axios, MMKV, AsyncStorage o SecureStore) con manejo de timeouts, señales de cancelación y errores tipados.
5. Gestionar tokens de autenticación de forma segura (cifrado en Keychain/Keystore) y manejar respuestas `401 Unauthorized` para renovación o cierre de sesión limpio.

Consultar [criterios y guía de datos](references/criteria.md) al implementar adaptadores y repositorios.

