# Promoción local
Resolver base mediante --source, .ai-kit/source.local.json, configuración personal o la ubicación del CLI, en ese orden. Configurar una vez con craft-agent config --source /ruta/base.

Guardar propuesta en .ai-kit/proposals/regla.md, sin secretos, código corporativo ni rutas personales dentro de la regla.

Ejemplo para ampliar pantallas:
```bash
craft-agent promote --project . --skill craft-build-screens --id componentes-locales --file .ai-kit/proposals/regla.md
craft-agent promote --project . --skill craft-build-screens --id componentes-locales --file .ai-kit/proposals/regla.md --apply
```
Sin --skill se guarda en content/rules/learned/. Con --skill se guarda una referencia dentro del skill existente y se enlaza desde SKILL.md. La actualización del proyecto actual es parte de --apply, no requiere otro update. Otros proyectos mantienen su versión.

Para revisar una regla existente: leer el destino y obtener el currentHash de la previsualización si el contenido es idéntico, o calcular SHA256 del archivo actual; comparar ambas redacciones y resolver contradicciones antes de usar --expected-hash SHA256 con la propuesta nueva. El hash evita reemplazar una versión distinta a la revisada; no evalúa semántica.

No crear un skill nuevo por cada preferencia. Si hace falta uno, proponer nombre, activación, alcance y ausencia de solapamiento. Con autorización, preparar la carpeta completa en la base y ejecutar update en este proyecto; no hacer commit ni push. Si no hay acceso, dejar carpeta propuesta para traslado manual, con instrucciones.

Si falta craft-agent global, usar node /ruta/base/cli/index.mjs. No solicitar permisos repetidos ya concedidos, pero respetar los permisos efectivos del IDE.
