# Noctua

Se trata de un proyecto personal, pretende ser una versión independiente de algun framework HTTP ya existente, solo que usando el enfoque de decoradores por una cuestion personal.

No busca ser un framework para uso en entornos de producción, es principalmente por hobbie.

- [x] Servidor HTTP Bun
- [x] RegExp Router (Gracias [HonoJs](https://hono.dev/)], tome su implementación, unicamente la adapte a linter que usa el proyecto)
- [x] Parsear contexto de la petición (body, headers, params, queryParams, status, path, url, hostname, ip principalmente)
- [x] Crear decoradores de argumentos
- [x] Resolver parametros de las funciones
- [x] Validación con Zod
- [x] Error handler
- [ ] Implementar middlewares
- [ ] Validaciones
- [ ] API para decoradores custom
- [ ] Test de integración basicos
- [ ] OAuth y JWT
- [ ] Render con Svelte
- [ ] Fileupload
- [x] Response file
  - [ ] Validar la existencia del archivo
  - [ ] Permitir enviar ficheros que esten alojados en base de datos (blob)
- [ ] WS
- [ ] CLI para generación de codigo
- [ ] Template para proyecto
- [ ] ORM sobre drizzle
