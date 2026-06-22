# dynamo — copia estática de comite-ideas.vercel.app

Copia fiel y **auto-contenida** de la app "Gestión de Ideas" (LINKTIC).
Abrir cualquier `.html` con doble clic (file://) y renderiza idéntico a la app,
sin conexión y sin login.

## Cómo funciona
- Los `.html` son el DOM **renderizado en vivo** de cada ruta (post-hidratación),
  con los assets locales y los `<script>` de Next.js **neutralizados** (si no, React
  se re-hidrataría, llamaría a APIs inexistentes offline y rompería el snapshot).
- Assets en `_next/` (CSS, JS, 6 fuentes woff2, SVG logos) + `favicon.ico`.
  El CSS referencia las fuentes con rutas relativas, así que todo resuelve local.
- `_raw/` = capturas originales **byte-fieles** (con sus scripts y rutas absolutas),
  por si necesitas el HTML exacto tal cual lo sirve Vercel.

## Páginas (flujo completo)
| Archivo | Ruta | Contenido |
|---|---|---|
| index.html | / | Dashboard (gráfico de resumen) |
| usuarios.html | /usuarios | Tabla de usuarios |
| usuarios-crear.html | /usuarios/crear | Form crear usuario |
| usuarios-editar.html | /usuarios/editar/:id | Form editar usuario |
| comites.html | /comites | Lista de comités |
| comites-nuevo.html | /comites/nuevo | Form crear comité |
| ideas-banco.html | /comites/ideas | Banco de ideas |
| ideas-preaprobar.html | /comites/ideas/preaprobar | Preaprobación |
| login.html | /login | Login (Continuar con Google) |

## Estados adicionales capturados
| Archivo | Estado |
|---|---|
| usuarios-crear--lleno.html | Form con datos (email + nombre) |
| usuarios-crear--rol-abierto.html | Dropdown de Rol abierto (Usuario / Administrador) |
| comites-nuevo--lleno-calendario.html | Título lleno + calendario de fecha abierto |
| comites-nuevo--estado-abierto.html | Dropdown de Estado abierto (Borrador / Activo) |
| ideas-banco--crear-modal.html | Modal "Crear idea nueva" abierto |

`shots/` contiene un PNG de cada estado.

## Scripts
- `capture.sh` — re-captura las rutas base desde la app en vivo (requiere sesión activa).
- `selfcontain.mjs` — reescribe rutas a relativas y neutraliza scripts (parte de `_raw/`).
