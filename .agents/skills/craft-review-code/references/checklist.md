# Guía y Checklist de Revisión de Código

Esta guía establece el protocolo técnico para auditorías de código, diffs y pull requests en proyectos React Native y TypeScript.

---

## 1. Matriz de Severidad de Hallazgos

Todo problema detectado debe clasificarse obligatoriamente bajo uno de estos tres niveles:

- **`[BLOQUEANTE]`**: Defectos críticos que impiden la integración del código.
  - Errores de ejecución (*runtime crashes*) o excepciones no capturadas.
  - Fugas de memoria evidentes (listeners sin remover, timers sin cancelar).
  - Secretos, API keys, tokens o datos sensibles expuestos en el código o logs.
  - Tipos rotos en TypeScript o uso de `any` que oculte errores de tipado graves.
- **`[ADVERTENCIA]`**: Riesgos técnicos y bugs latentes que deben corregirse.
  - Condiciones de carrera (*race conditions*) en llamadas asíncronas no canceladas.
  - Falta de validación defensiva ante respuestas nulas o vacías de APIs (`null/undefined`).
  - Problemas de rendimiento notables (re-renders masivos en listas `FlatList`).
- **`[SUGERENCIA]`**: Mejoras de calidad no bloqueantes.
  - Oportunidades de simplificación o legibilidad.
  - Nombres más claros o eliminación de código redundante.
  - *Regla estricta*: Si es solo una preferencia subjetiva de estilo sin impacto en rendimiento o mantenibilidad, no reportarla.

---

## 2. Checklist Técnica para React Native & TypeScript

### A. Ciclo de Vida y Fugas de Memoria (*Memory Leaks*)
- [ ] ¿Todos los `useEffect` que crean suscripciones, event listeners (`Dimensions`, `BackHandler`, `AppState`) o timers (`setTimeout`, `setInterval`) retornan su correspondiente función de limpieza (*cleanup*)?
- [ ] ¿Se limpian las referencias de controladores de animación si aplica?

### B. Asincronía y Condiciones de Carrera (*Race Conditions*)
- [ ] Si el componente se desmonta antes de que una llamada a una API responda, ¿se previene la actualización de estado sobre el componente desmontado (con banderas de cancelación o AbortController)?
- [ ] Si se disparan dos búsquedas seguidas, ¿se garantiza que la respuesta más lenta no sobreescriba a la más reciente?

### C. Robustez y Null-Safety
- [ ] ¿Hay accesos a propiedades anidadas potencialmente `undefined` o `null` sin encadenamiento opcional (`data?.user?.profile`)?
- [ ] ¿Se manejan adecuadamente los bloques `catch` de las promesas mostrando feedback al usuario en lugar de fallos silenciosos?

### D. Listas y Rendimiento Móvil
- [ ] En `FlatList` / `FlashList`, ¿el `keyExtractor` utiliza identificadores estables y únicos (nunca el índice del array)?
- [ ] ¿Se evita crear funciones u objetos inline complejos dentro de `renderItem` que fuercen re-renders innecesarios de todos los elementos?

### E. Seguridad Móvil y Datos Sensibles
- [ ] ¿Hay llamadas a `console.log` o logs de depuración imprimiendo contraseñas, tokens JWT, tarjetas o datos personales?
- [ ] ¿Se almacenan credenciales sensibles en storage seguro (Keychain / Keystore) en lugar de storage plano?

---

## 3. Formato Estándar para Cada Hallazgo

Cada problema debe reportarse con esta estructura exacta para ser accionable:

```markdown
### [SEVERIDAD] Título claro del hallazgo
- **Ubicación**: `ruta/al/archivo.ts:línea`
- **Condición disparadora**: Bajo qué escenario o acción del usuario se produce.
- **Impacto**: Consecuencia en runtime (crash, fuga de memoria, dato incorrecto).
- **Corrección propuesta**:
  ```typescript
  // Snippet de código con la solución sugerida
  ```
```

---

## 4. Veredicto Final del Revisor

Toda revisión debe concluir con una sección de resumen:
1. **Estado**:
   - `Aprobado`: Sin hallazgos o solo sugerencias menores.
   - `Requiere Cambios`: Al menos 1 hallazgo de tipo `[BLOQUEANTE]` o `[ADVERTENCIA]`.
2. **Límites de la revisión**: Indicar qué pruebas fueron verificadas (ej. typecheck en terminal) y qué riesgos no se pudieron validar estáticamente (ej. comportamiento nativo en dispositivos específicos).

