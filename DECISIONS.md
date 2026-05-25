# Álbum Digital — Decisiones técnicas y estado del proyecto

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Autenticación: Supabase Auth + Google OAuth](#2-autenticación-supabase-auth--google-oauth)
3. [Configuración GCP](#3-configuración-gcp)
4. [Flujo de autenticación en el código](#4-flujo-de-autenticación-en-el-código)
5. [Modelo de datos](#5-modelo-de-datos)
6. [Inventario: mapeo local ↔ Supabase](#6-inventario-mapeo-local--supabase)
7. [Migración localStorage → Supabase](#7-migración-localstorage--supabase)
8. [RLS: seguridad a nivel de base de datos](#8-rls-seguridad-a-nivel-de-base-de-datos)
9. [Actualizaciones optimistas](#9-actualizaciones-optimistas)
10. [URL compartible](#10-url-compartible)
11. [Seguridad: análisis y riesgos](#11-seguridad-análisis-y-riesgos)
12. [Deuda técnica](#12-deuda-técnica)
13. [Próximos pasos (Fase 3)](#13-próximos-pasos-fase-3)

---

## 1. Arquitectura general

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Framework | Next.js 16 App Router | SSR nativo, route groups, Server Components para nav con sesión |
| Auth + BD | Supabase (PostgreSQL + Auth) | Un solo proveedor para auth y datos; RLS nativo con `auth.uid()` |
| Estado servidor | TanStack Query | Caché, stale-while-revalidate, mutaciones con rollback optimista |
| Estado UI | Zustand | Filtros, sección activa, modal — estado efímero sin boilerplate |
| Estilos | Tailwind CSS | Utilidades inline, sin CSS extra |
| Hosting | Vercel (previsto) | Next.js first-class, preview deployments automáticos |

### Rutas actuales

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard — lista de álbumes del usuario |
| `/album/[albumId]` | Detalle de álbum — tabs Vista/Editar, grid de Figuras, filtros, ShareModal |
| `/login` | Login con Google |
| `/external-share/[albumId]` | Vista pública de solo lectura (sin auth); reemplaza la antigua `/share/[token]` |

Las rutas `/cargar` y `/repetidas` fueron eliminadas: la carga se hace directamente desde el grid del álbum y la info de repetidas/faltantes vive en el modal de compartir. El `BottomNav` fue eliminado junto con `/repetidas` (con una sola ruta principal no aportaba valor).

### Fases completadas

- **Fase 1** ✅ — Frontend solo, localStorage, flip-card 3D, URL compartible por WhatsApp
- **Fase 2** ✅ — Google OAuth, Supabase DB, migración automática, múltiples álbumes por usuario
- **Fase 2.5** ✅ — UI overhaul: NavMenu hamburger, AlbumToolbar unificada, ShareModal con 3 secciones, skeleton loaders, limpieza de rutas
- **Fase 2.8** ✅ — Tabs Vista/Editar, resumen por filtro en StickerGrid, SectionHeader unificado, exportación PNG con CompactExport + html-to-image
- **Fase 3** ⏳ — Intercambios entre usuarios (ver sección 13)

---

## 2. Autenticación: Supabase Auth + Google OAuth

### Por qué Supabase Auth y no Firebase / Auth0 / NextAuth

- **Cero infraestructura extra**: Supabase ya es el backend de base de datos; un segundo proveedor de auth sería overhead operativo innecesario.
- **RLS nativo**: Las políticas de PostgreSQL usan `auth.uid()` directamente. Con un JWT externo habría que validar el token en cada query manualmente.
- **`@supabase/ssr`**: Maneja refresh de tokens en SSR/RSC, cookies httpOnly y flujo PKCE sin código extra.

### Por qué solo Google OAuth (no email/password)

- El target es familiar: todos tienen cuenta Google.
- Evita implementar recuperación de contraseña, verificación de email y riesgo de credenciales débiles.
- Se pueden agregar más providers en Supabase sin cambios en el código de la app.

---

## 3. Configuración GCP

### En Google Cloud Console

1. Crear proyecto en [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: "Album Digital"
   - Authorized domains: `supabase.co` + dominio de Vercel
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     https://<project-ref>.supabase.co/auth/v1/callback
     http://localhost:3000/api/auth/callback
     ```

### En Supabase Dashboard

1. **Authentication → Providers → Google** → Enable
2. Pegar **Client ID** y **Client Secret** de GCP
3. **Authentication → URL Configuration**:
   - Site URL: `https://tu-app.vercel.app`
   - Redirect URLs permitidas:
     ```
     http://localhost:3000/**
     https://tu-app.vercel.app/**
     ```

### Variables de entorno

```env
# .env.local — solo estas dos, el Client Secret de Google queda en Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## 4. Flujo de autenticación en el código

```
Usuario → "Continuar con Google"
  → LoginButton llama supabase.auth.signInWithOAuth({ provider: 'google' })
  → Redirige a accounts.google.com
  → Google redirige a https://<project>.supabase.co/auth/v1/callback
  → Supabase valida, crea/actualiza el user en auth.users, emite JWT
  → Redirige a /api/auth/callback?code=...
  → route.ts llama exchangeCodeForSession(code) — guarda JWT en cookies httpOnly
  → Redirige a /  (dashboard)
  → useMigrateToSupabase() detecta userId por primera vez → migra localStorage
```

### Por qué PKCE

`@supabase/ssr` usa PKCE por defecto:
- El `code` sirve una sola vez y tiene vida corta
- El `code_verifier` nunca sale del browser
- Funciona en SSR donde no hay `window`

### Cookies httpOnly vs localStorage para el JWT

- JWT en **cookies httpOnly** (manejado por `@supabase/ssr`), no en localStorage
- JavaScript no puede leer ni robar el token → protege contra XSS
- `proxy.ts` (middleware) refresca el token en cada request para que los Server Components vean la sesión actualizada

---

## 5. Modelo de datos

### Por qué no `UNIQUE(user_id, album_catalog_id)` en user_albums

Un usuario puede trackear su álbum propio Y el de su hijo, ambos siendo "Panini Mundial 2024". Cada instancia tiene `name` personalizado ("Mi Album", "Album de Mateo") e inventario independiente en `user_stickers`.

### Routing por instanceId

El routing es `/album/[instanceId]` (UUID de `user_albums.id`), no `/album/[slug]`. La página resuelve el slug desde la instancia para cargar el catálogo JSON.

### Estados de un sticker

| Estado | Significado | En DB |
|--------|-------------|-------|
| `owned` | La tengo pegada | Fila en `user_stickers` con `state='owned'` |
| `repeated` | La tengo repetida | Fila en `user_stickers` con `state='repeated'` |
| (ausente) | Me falta | Sin fila en `user_stickers` |

Ciclo de click: sin fila → `owned` → `repeated` → eliminar fila

---

## 6. Inventario: mapeo local ↔ Supabase

### El problema

El catálogo local (JSON) usa IDs como `"panini-1"`, `"treyes-5"`. Supabase usa UUIDs en `stickers_catalog.id`. `mergeWithInventory` busca por el ID local. Si el mapa de inventario está keyed por UUID, nunca hay match.

### La solución

`useInventory` mantiene dos queries:

1. **`['inventory', instanceId, userId]`** — Fetches `user_stickers` con join a `stickers_catalog` para obtener el `number` y el slug del álbum. Reconstruye el ID local como `"${prefix}-${number}"` (donde prefix es `panini` o `treyes`). El mapa queda keyed por ID local → funciona con `mergeWithInventory` sin cambios.

2. **`['catalog-uuids', instanceId]`** — Fetches `stickers_catalog` completo para el álbum (via `user_albums → albums_catalog`). Construye `localId → UUID`. `staleTime: Infinity` porque el catálogo nunca cambia. Usado por el toggle para obtener el UUID antes de escribir en DB.

### Por qué la query de UUIDs es separada y no un ref

Un `useRef` se pierde cuando TanStack Query retorna datos del caché (saltea el `queryFn`). La query separada con `staleTime: Infinity` persiste en el caché de TanStack Query independientemente de remounts.

### Actualizaciones optimistas + upsert correcto

El toggle usa `onMutate` para actualizar el caché inmediatamente (sin esperar la DB). El upsert especifica `onConflict: 'user_album_id,sticker_catalog_id'` para que Supabase genere `INSERT ... ON CONFLICT DO UPDATE` en vez de un POST plano que retornaría 409.

---

## 7. Migración localStorage → Supabase

### Flujo

```
1. Detectar userId no-null (primer render post-login)
2. Leer user_album_instances de localStorage
3. Por cada instancia:
   a. Buscar albums_catalog.id por slug en Supabase
   b. INSERT en user_albums con name personalizado
   c. Leer inventory_{instanceId} de localStorage
   d. Dynamic import de panini.json / treyes.json para mapear ID local → number
   e. Mapear number → stickers_catalog.id
   f. Bulk UPSERT en user_stickers
4. Marcar supabase_migrated_v1=true → no vuelve a correr
```

### Por qué no borrar localStorage post-migración

- Funciona como caché offline si el usuario pierde conexión
- Si la migración falla a mitad, se puede reintentar borrando el flag

### Gotcha: dynamic import de JSON

`await import('@/data/panini.json')` retorna un módulo ES, la data está en `.default` no en `.data`. Bug que fue corregido en la implementación inicial.

---

## 8. RLS: seguridad a nivel de base de datos

| Tabla | Política | Condición |
|-------|----------|-----------|
| `albums_catalog` | SELECT público | `true` |
| `stickers_catalog` | SELECT público | `true` |
| `user_albums` | ALL | `auth.uid() = user_id` |
| `user_stickers` | ALL | `user_album_id IN (SELECT id FROM user_albums WHERE user_id = auth.uid())` |

La política de `user_stickers` incluye `WITH CHECK` además de `USING`, lo que impide escribir en álbumes ajenos incluso con una petición manipulada.

La ANON_KEY es pública por diseño (identifica el proyecto). La identidad del usuario la provee el JWT firmado por Supabase, y RLS la enforcea en cada query.

---

## 9. Actualizaciones optimistas

### Por qué

Sin optimismo, el usuario espera el roundtrip de red (~200–500ms) para ver la figurita cambiar de estado. Inaceptable en una UI de clicks rápidos.

### Implementación

```
onMutate  → cancelQueries + snapshot + setQueryData (nuevo estado)
mutationFn → escribe en DB (async, usuario no espera)
onError   → setQueryData (snapshot anterior) + invalidateQueries (sync con server)
```

`onSettled` fue eliminado deliberadamente: disparaba un refetch que llegaba con el estado anterior (antes de que el write del segundo click se completara), causando un flicker visible donde la figurita volvía a "T" por un instante.

---

## 10. URL compartible y modal de compartir

### URL `/share/[token]`

Codifica el inventario completo en base64url:

```json
{ "albumSlug": "panini-2024", "owned": [1,3,5], "repeated": [12,45] }
```

- No requiere backend ni auth para verse
- Es una vista de solo lectura (no permite modificar)
- Funciona como link de WhatsApp con inventario embebido en la URL

**Limitación**: el token no está firmado — cualquiera puede construir un token falso. Para esta app (compartir colección personal) es aceptable. Si se usara para validar intercambios, habría que firmar el payload.

### ShareModal — 3 modos de compartir

El modal de compartir del detalle de álbum expone 3 secciones independientes, cada una con botón Copiar y botón WhatsApp:

| Sección | Contenido | WhatsApp |
|---------|-----------|----------|
| 🔗 Enlace del álbum | URL `/share/[token]` con inventario completo | Abre wa.me con la URL |
| ❌ Mis faltantes | Texto con números por sección + firma "Álbum: Panini" | Abre wa.me con el texto |
| 🔄 Mis repetidas | Texto con números por sección + firma "Álbum: Panini" | Abre wa.me con el texto |

Las secciones de faltantes/repetidas solo se muestran si hay Figuras en ese estado. El texto está en español LATAM estándar (sin voseo argentino).

---

## 11. Seguridad: análisis y riesgos

### ✅ Protegido correctamente

| Vector | Mitigación |
|--------|-----------|
| JWT theft via XSS | Token en cookies httpOnly; JS no puede leerlo |
| Acceso a datos de otro usuario | RLS con `auth.uid()` en todas las tablas de usuario; enforceado en DB, no solo en código |
| SQL injection | Supabase client usa queries parametrizadas; nunca concatenación de strings |
| PKCE downgrade | `@supabase/ssr` usa PKCE por defecto; no se puede degradar a Implicit Flow |
| Escalada de privilegios via ANON_KEY | La key es pública por diseño; sin JWT válido, RLS bloquea todo acceso a datos de usuario |

### ⚠️ Riesgos aceptables o pendientes

| Riesgo | Descripción | Mitigación sugerida |
|--------|-------------|---------------------|
| **Share token sin firma** | Un token base64url puede ser construido manualmente o modificado. La vista `/share` no verifica autenticidad. | Aceptable para vista de solo lectura. Si se usa en intercambios, firmar con HMAC usando la Service Role Key en una Edge Function. |
| **localStorage manipulable** | Un usuario malintencionado puede editar `user_album_instances` en su propio localStorage antes de hacer login, forzando la migración de datos falsos a Supabase. | Impacto bajo (solo afecta sus propios datos). El schema tiene `CHECK (state IN ('owned','repeated'))` y `CHECK (quantity >= 1)` que rechazan valores inválidos. |
| **Dynamic import path no validado en useMigrateToSupabase** | El slug de la instancia local determina qué JSON se importa. El path está hardcodeado a `'treyes'` o `'panini'` según `startsWith('3reyes')`, no usa el slug directamente. | No hay riesgo de path traversal por la construcción condicional, pero debería ser explícito con un `switch`. |
| **Ausencia de rate limiting** | El endpoint `/api/auth/callback` y las mutaciones de Supabase no tienen rate limiting propio. | Supabase aplica rate limiting por defecto en auth. Para las mutaciones, agregar rate limiting en Vercel Edge si hay abuso. |
| **Service Role Key** | No está en el frontend. Si se necesitara para operaciones admin, solo debe usarse en Supabase Edge Functions, nunca en `NEXT_PUBLIC_*`. | Documentado como restricción permanente. |
| **Función `album_stats()` con SECURITY DEFINER** | Corre con permisos del creador (postgres), no del usuario que la llama. Si el llamador no es el dueño del álbum, retorna vacío (tiene `WHERE ua.user_id = auth.uid()`), pero conviene auditar periódicamente. | El filtro `auth.uid()` está presente. Revisar si se agrega lógica más compleja. |

---

## 12. Deuda técnica

### Alta prioridad

| Item | Descripción |
|------|-------------|
| **Sin paginación/virtualización en catálogo** | `FiguriteGrid` renderiza todos los stickers del álbum (145–150 items). Funciona hoy, pero si los álbumes crecen a 600+ items se degradará. Implementar `@tanstack/react-virtual`. |
| **Tipos de Supabase no generados** | Los tipos de las tablas están escritos a mano (`as unknown as { slug: string }`). Usar `supabase gen types typescript` para tipos seguros end-to-end. |
| **Sin manejo de error en UI** | Si `useInventory` o `useUserAlbums` fallan, no hay feedback al usuario (toast, banner). Solo se loggea en consola. |
| **`FilterBar.tsx` huérfano** | El componente original `FilterBar` quedó en el repo pero ya no se usa (reemplazado por `AlbumToolbar`). Eliminar para evitar confusión. |

### Media prioridad

| Item | Descripción |
|------|-------------|
| **Sincronización multi-tab** | Si el usuario abre dos tabs y marca stickers, la segunda tab no se actualiza. Implementar Supabase Realtime o `BroadcastChannel` para sincronizar tabs. |
| **Migración parcial sin retry UI** | Si `useMigrateToSupabase` falla a mitad, el flag `supabase_migrated_v1` no se setea, entonces reintenta en el próximo login. Pero no hay forma para el usuario de saber que falló ni de forzar un retry manual. |
| **Estado `completed` de álbum no implementado** | El schema tiene `status: 'active' | 'completed' | 'archived'` pero la UI solo usa `active` y `archived`. Falta la lógica de "álbum completado" (progress === 100%). |
| **`quantity` siempre 1** | El campo `quantity` en `user_stickers` existe pero siempre se inserta como 1. No hay UI para incrementar cantidad de repetidas (útil para intercambios: "tengo 3 de esta"). |

### Baja prioridad

| Item | Descripción |
|------|-------------|
| **`backface-hidden` clase Tailwind no estándar** | `FiguriteCard` usa `className="... backface-hidden"` pero Tailwind no tiene esa utility por defecto. Funciona gracias al inline style duplicado. Limpiar con `[backface-visibility:hidden]` o config de Tailwind. |
| **Sin tests** | No hay tests unitarios ni de integración. Priorizar tests para `catalogHelpers`, `shareEncoder` y `useInventory` (lógica de toggle). |
| **`useSession` no sincroniza en multi-device** | `onAuthStateChange` detecta cambios en la misma tab, pero un logout desde otro dispositivo no invalida la sesión hasta que expire el JWT. Supabase maneja el refresh automáticamente pero la tab abierta no sabrá que la sesión fue revocada. |

---

## 13. Próximos pasos (Fase 3)

### Intercambios entre usuarios

**Modelo de datos propuesto:**

```sql
create table exchange_requests (
  id              uuid primary key default gen_random_uuid(),
  from_user_id    uuid references auth.users(id),
  to_user_id      uuid references auth.users(id),
  offered_sticker uuid references stickers_catalog(id),
  wanted_sticker  uuid references stickers_catalog(id),
  status          text default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at      timestamptz default now()
);
```

**RLS requerida:** SELECT donde `from_user_id = auth.uid() OR to_user_id = auth.uid()`.

### Directorio público de repetidas

Una página pública `/buscar` donde cualquier usuario pueda ver qué stickers tienen otros usuarios como repetidos para contactarlos. Requiere un campo `public_profile` opt-in en `auth.users` (via `user_metadata`).

### Notificaciones

Opciones en orden de complejidad:
1. **Supabase Realtime** — suscribirse a cambios en `exchange_requests` donde `to_user_id = userId`
2. **Email via Resend** — llamado desde una Supabase Edge Function en trigger de DB
3. **Push notifications** — Service Worker + Web Push API (solo web)

### Múltiples años / ediciones

El catálogo está hardcodeado a Panini 2024 y 3 Reyes 2024. Para agregar nuevas ediciones, generar el seed SQL desde los JSON y aplicar la migración. No requiere cambios en el código si se respeta la estructura de `albums_catalog` + `stickers_catalog`.

### Imagen real de stickers

`stickers_catalog.image_url` existe pero está vacío. Para agregar imágenes:
- Supabase Storage para las imágenes (bucket público `sticker-images`)
- Script de seed que suba las imágenes y actualice `image_url`
- `FiguriteCard` ya tiene soporte para mostrar imagen si está presente

### Modo offline completo (PWA)

- `next-pwa` o service worker manual para cachear el app shell
- Los datos de localStorage ya funcionan offline
- Para usuarios autenticados, cachear el último inventario conocido en IndexedDB
