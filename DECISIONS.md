# Decisiones de arquitectura — Auth & Integración GCP

## 1. Proveedor de autenticación: Supabase Auth con Google OAuth

### Decisión
Se usa **Supabase Auth** como capa de autenticación, con Google como único proveedor OAuth (por ahora).

### Por qué Supabase Auth y no Firebase / Auth0 / NextAuth
- **Cero infraestructura extra**: Supabase ya es el backend de base de datos; agregar un segundo servicio de auth sería overhead operativo innecesario.
- **RLS nativo**: Las políticas de Row Level Security de PostgreSQL usan `auth.uid()` directamente. Con un JWT externo habría que escribir middleware de validación manual.
- **`@supabase/ssr`**: El paquete oficial maneja automáticamente el refresh de tokens en SSR/RSC, cookies httpOnly y el flujo PKCE. No hay que implementar nada de eso a mano.

### Por qué solo Google OAuth (no email/password)
- El target es uso familiar/personal: todos tienen cuenta Google.
- Evita implementar recuperación de contraseña, verificación de email, y el riesgo de credenciales débiles.
- Se puede agregar más providers en Supabase sin cambios en el código de la app.

---

## 2. Configuración de Google Cloud Platform (GCP)

### Pasos realizados / a realizar

#### En Google Cloud Console
1. Crear proyecto en [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: "Album Digital"
   - Authorized domains: `supabase.co` + tu dominio de Vercel
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     https://<project-ref>.supabase.co/auth/v1/callback
     ```
   - Para desarrollo local, agregar también:
     ```
     http://localhost:3000/api/auth/callback
     ```
     _(aunque Supabase maneja el callback internamente, es buena práctica tenerlo)_

#### En Supabase Dashboard
1. **Authentication → Providers → Google** → Enable
2. Pegar **Client ID** y **Client Secret** de GCP
3. **Authentication → URL Configuration**:
   - Site URL: `https://tu-app.vercel.app` (producción) o `http://localhost:3000` (dev)
   - Redirect URLs (lista de permitidos):
     ```
     http://localhost:3000/**
     https://tu-app.vercel.app/**
     ```

### Variables de entorno necesarias
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```
Solo estas dos. El Client ID/Secret de Google **no va en el frontend** — Supabase los guarda en su backend.

---

## 3. Flujo de autenticación en el código

```
Usuario hace clic "Continuar con Google"
  → LoginButton.tsx llama supabase.auth.signInWithOAuth({ provider: 'google' })
  → Redirige a accounts.google.com
  → Google redirige a https://<project>.supabase.co/auth/v1/callback
  → Supabase valida, crea/actualiza el user en auth.users, emite JWT
  → Redirige a /api/auth/callback?code=...  (nuestra app)
  → route.ts llama exchangeCodeForSession(code) — guarda el JWT en cookies httpOnly
  → Redirige a /  (dashboard)
```

### Por qué PKCE (Authorization Code + Code Verifier)
`@supabase/ssr` usa PKCE por defecto. Es más seguro que Implicit Flow porque:
- El `code` solo sirve una vez y es de corta duración
- El `code_verifier` nunca sale del browser
- Funciona bien con SSR donde no hay `window` en el servidor

### Cookies httpOnly vs localStorage para el JWT
- El JWT se guarda en **cookies httpOnly** (manejado por `@supabase/ssr`), no en `localStorage`.
- Esto protege contra XSS: JavaScript no puede leer ni robar el token.
- El `proxy.ts` (middleware) refresca el token en cada request para que los Server Components siempre vean la sesión actualizada.

---

## 4. Modelo de datos: múltiples instancias del mismo álbum

### Decisión
`user_albums` **no** tiene `UNIQUE(user_id, album_catalog_id)`.

### Por qué
Un usuario puede querer trackear su propio álbum Y el de su hijo, ambos siendo "Panini Mundial 2024". Cada instancia tiene un `name` personalizado ("Mi Album", "Album de Mateo") y su propio inventario en `user_stickers`.

### Consecuencia en la UI
El routing es `/album/[instanceId]` (UUID de `user_albums.id`), no `/album/[slug]`. La página busca la instancia por ID y de ahí obtiene el slug para cargar el catálogo.

---

## 5. Migración localStorage → Supabase en el primer login

### Decisión
Al primer login con Google, `useMigrateToSupabase` copia automáticamente el inventario de `localStorage` a Supabase. Solo ocurre una vez (flag `supabase_migrated_v1` en localStorage).

### Flujo
```
1. Detectar que userId es no-null (primer render post-login)
2. Leer user_album_instances de localStorage
3. Por cada instancia:
   a. Buscar albums_catalog.id por slug en Supabase
   b. INSERT en user_albums (con el name personalizado)
   c. Leer inventory_{instanceId} de localStorage
   d. Mapear número de figurita → stickers_catalog.id
   e. Bulk INSERT en user_stickers
4. Marcar supabase_migrated_v1=true → no vuelve a correr
```

### Por qué no borrar localStorage después
- Funciona como caché offline si el usuario pierde conexión.
- Si la migración falla a mitad, se puede reintentar (borrando el flag).

---

## 6. RLS: seguridad a nivel de base de datos

Todas las tablas de usuario tienen RLS activo. Las políticas son:

| Tabla | Política | Condición |
|-------|----------|-----------|
| `albums_catalog` | SELECT público | `true` |
| `stickers_catalog` | SELECT público | `true` |
| `user_albums` | ALL | `auth.uid() = user_id` |
| `user_stickers` | ALL | `user_album_id IN (SELECT id FROM user_albums WHERE user_id = auth.uid())` |

Incluso si alguien obtiene la ANON_KEY (que es pública por diseño), no puede leer ni escribir datos de otro usuario. La ANON_KEY solo identifica el proyecto, la identidad del usuario la provee el JWT firmado por Supabase.

---

## 7. Decisiones pendientes (Fase 3)

- **Intercambios**: necesitará una tabla `exchange_requests` con FK a los dos `user_albums` y RLS que permita leer requests donde seas destinatario.
- **Notificaciones**: Supabase Realtime (canales de Postgres) o un webhook a un servicio de email.
- **Service Role Key**: nunca exponer en el frontend. Solo usarla en funciones Edge de Supabase para operaciones admin (ej. seed de catálogos).
