# Mi Álbum — Copa del Mundo 2026

Aplicación web para gestionar el inventario digital de los álbumes de figuritas **Panini** y **3 Reyes** del Mundial 2026. Permite marcar figuras como conseguidas o repetidas, ver el progreso y compartir el álbum públicamente.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Base de datos + Auth | Supabase (PostgreSQL + Google OAuth) |
| Estado servidor | TanStack Query (caché, optimistic updates) |
| Estado UI | Zustand |
| Estilos | Tailwind CSS + CSS custom properties |
| Hosting | Vercel |

---

## Inicio rápido

### 1. Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

### 2. Instalar y correr

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
npx tsc --noEmit   # verificar tipos
```

---

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Autenticado | Dashboard con los álbumes del usuario |
| `/login` | Público | Login con Google via Supabase OAuth |
| `/album/[albumId]` | Autenticado | Vista completa del álbum: progreso, filtros, grid de figuras |
| `/share/[instanceId]` | Autenticado (dueño) | Panel para compartir: genera enlace público y textos de WhatsApp |
| `/external-share/[albumId]` | Público | Vista de solo lectura del álbum compartido |

---

## Estructura de carpetas

```
src/
├── middleware.ts              # Auth guard, UUID gate, security headers
├── app/
│   ├── (auth)/login/          # Página de login
│   ├── (app)/                 # Rutas autenticadas
│   │   ├── page.tsx           # Dashboard
│   │   └── album/[albumId]/   # Vista del álbum
│   ├── share/[token]/         # Compartir (dueño)
│   └── external-share/[albumId]/  # Vista pública + OG image
├── components/
│   ├── album/                 # FiguriteCard, FiguriteGrid, ProgressHeader, …
│   ├── dashboard/             # AlbumCover, CreateAlbumModal
│   └── share/                 # ShareAlbumView (AlbumStatsCard, StickerGrid)
├── hooks/                     # Toda la lógica de datos (ver sección Arquitectura)
├── lib/
│   ├── catalogHelpers.ts      # Helpers puros: merge, stats, filtros, buildInventoryMap
│   ├── sectionColors.ts       # Colores por sección
│   └── supabase/              # Clientes browser y server
├── store/
│   └── uiStore.ts             # Zustand: filter, búsqueda, tamaño de card
├── data/
│   ├── panini.json            # Catálogo Panini (145 figuras)
│   └── treyes.json            # Catálogo 3 Reyes (706 figuras)
└── types/
    └── index.ts               # Sticker, StickerWithState, InventoryMap, …
```

---

## Arquitectura de datos

> **Regla fundamental**: ningún componente cliente accede a Supabase directamente.
> Toda lectura y escritura pasa por los hooks de `src/hooks/`.

### Capas

```
Supabase (PostgreSQL)
    │
    ├── src/hooks/          ← única puerta de entrada a datos remotos
    │
    ├── src/lib/catalogHelpers.ts  ← transformaciones puras (sin red)
    │
    └── src/store/uiStore.ts       ← estado de UI volátil (no persiste)
```

### Hooks — referencia rápida

| Hook | Expone | Páginas que lo usan |
|---|---|---|
| `useSession()` | `{ user, loading }` | todas las páginas autenticadas + `HeaderActions` + `NavMenu` |
| `useUserAlbums(user)` | `{ instances, addAlbum, removeAlbum, renameAlbum, getInstanceById }` | `DashboardPage`, `AlbumPage` |
| `useAlbumData(slug)` | `{ data: Sticker[] }` | `DashboardPage` (vía `AlbumCard`), `AlbumPage` |
| `useInventory(instanceId, userId, opts?)` | `{ data: InventoryMap, update }` | `DashboardPage` (vía `AlbumCard`, lectura), `AlbumPage` (lectura + escritura) |
| `useAlbumStats(stickers)` | `{ total, owned, repeated, missing, progress }` | `DashboardPage` (vía `AlbumCard`), `AlbumPage`, `ExternalSharePage` |
| `useFilters(stickers)` | `StickerWithState[]` | `AlbumPage` |
| `useExternalAlbum(albumId)` | `{ data: { albumName, ownerName, stickers } }` | `ExternalSharePage` |

#### Comportamiento de caché y red

| Hook | queryKey | staleTime | Notas |
|---|---|---|---|
| `useSession` | `['session']` | 60 s | 1 sola petición compartida. `onAuthStateChange` vive en `AuthSync` (providers.tsx), no en el hook |
| `useUserAlbums` | `['user-albums', userId]` | default | Invalidado tras crear/archivar/renombrar |
| `useAlbumData` | `['catalog', slug]` | Infinity | JSON local; nunca refetchea |
| `useInventory` — prefix | `['album-prefix', instanceId]` | Infinity | `initialData` desde `slug` conocido — 0 peticiones de red |
| `useInventory` — catalog ID | `['album-catalog-id', instanceId]` | Infinity | `initialData` desde `albumCatalogId` conocido — 0 peticiones de red |
| `useInventory` — UUID map | `['catalog-uuids', instanceId]` | Infinity | **Lazy**: solo se fetcha en la primera escritura |
| `useInventory` — inventario | `['inventory', instanceId, userId]` | 30 s | Optimistic updates + debounce 300 ms en `onSettled` |
| `useExternalAlbum` | `['external-album', albumId]` | 60 s | Sin sesión requerida |

#### Firma completa de `useInventory`

```ts
useInventory(
  instanceId: string,
  userId: string | null,
  opts?: { slug?: string; albumCatalogId?: string }
)
```

Pasar `slug` y `albumCatalogId` (siempre disponibles desde `UserAlbumInstance`) evita queries extra a `user_albums`.

---

### Caché y recarga de página

TanStack Query almacena su caché **en memoria**. Eso tiene dos implicaciones importantes:

| Situación | Resultado |
|---|---|
| **Navegación cliente** (Link / router.push) | La caché está viva → los hooks devuelven datos al instante; solo refetchean si el `staleTime` expiró |
| **Recarga dura** (F5 / Ctrl+R / abrir URL directa) | La caché se destruye → la página ejecuta su conjunto completo de peticiones de red como si fuera la primera visita |

Esto significa que los tiempos de carga que se describen abajo corresponden a la primera visita **o a cualquier recarga**. Al navegar entre páginas en la misma sesión, la mayoría de los datos ya están en caché y no generan tráfico.

#### Qué carga siempre al levantar la página (cualquier ruta autenticada)

`Providers` monta `AuthSync` la primera vez que el árbol React se inicializa. Esto dispara:

```
GET /auth/v1/user    ← useSession (queryKey ['session'], staleTime 60s)
```

Todas las demás queries dependen de que este valor esté disponible.

---

### Peticiones de red por página

Mapa de qué se solicita, en qué orden y por qué hook, al cargar cada ruta por primera vez (o tras recarga).

#### `/` — Dashboard

```
1. GET /auth/v1/user                          useSession (AuthSync — 1 vez global)
2. GET user_albums?select=id,name,...         useUserAlbums.fetchInstances
   — devuelve slug + albumCatalogId por álbum; alimenta initialData de useInventory

Por cada tarjeta de álbum (en paralelo):
3. GET user_stickers?...                      useInventory.fetchInventory (inventario para stats)
   — prefix y albumCatalogId vienen de initialData, sin queries extra
   — UUID map (stickers_catalog) NO se carga aquí: es lazy
```

> Con N álbumes: **2 + N peticiones**.

#### `/album/[albumId]` — Álbum completo

```
1. GET /auth/v1/user                          useSession (cache hit si viene del dashboard)
2. GET user_albums?select=id,name,...         useUserAlbums.fetchInstances (devuelve slug + albumCatalogId)
   — useInventory espera a que instance resuelva antes de disparar sus queries
3. import @/data/treyes.json (o panini)       useAlbumData — bundle local, sin red
4. GET user_stickers?...                      useInventory.fetchInventory
   — prefix y albumCatalogId vienen de initialData (slug/albumCatalogId ya conocidos)
5. GET stickers_catalog?...                   useInventory.fetchCatalogUUIDs (lazy, solo 1ª vez)
```

> **5 peticiones** en primera visita o recarga; al navegar desde el dashboard: 1–2 (todo en caché).
>
> ⚠️ **Patrón anti-race-condition**: `useInventory` recibe `userId: null` mientras `instance`
> todavía no resolvió. Esto evita que sus queries internas se disparen sin `slug` /
> `albumCatalogId` y generen llamadas redundantes a `user_albums`. Patrón correcto:
> ```tsx
> const { data: inventory } = useInventory(
>   instanceId,
>   instance ? (user?.id ?? null) : null,  // espera a que instance resuelva
>   { slug: instance?.slug, albumCatalogId: instance?.albumCatalogId }
> );
> ```

#### `/share/[token]` — Panel de compartir (dueño)

```
Al recargar la página (mismas peticiones que /album/[albumId]):
1. GET /auth/v1/user                          useSession
2. GET user_albums?select=id,name,...         useUserAlbums.fetchInstances
3. import @/data/treyes.json (o panini)       useAlbumData
4. GET user_stickers?...                      useInventory.fetchInventory
   — useInventory espera a que instance resuelva (mismo patrón anti-race-condition)

Al navegar desde /album/[albumId]:
→ Todas las queries están en caché. 0 peticiones de red.
```

> **4 peticiones** en recarga. Al navegar desde el álbum: **0 peticiones**.

#### `/external-share/[albumId]` — Vista pública

```
1. GET user_albums?...                        useExternalAlbum (slug + userId del dueño)
2. GET profiles?...                           useExternalAlbum (nombre del dueño)
3. GET user_stickers?...                      useExternalAlbum (inventario del dueño)
   + import JSON local                        useExternalAlbum (catálogo)
```

> **3 peticiones**. Sin sesión requerida.

### Helpers puros (`catalogHelpers.ts`)

Se importan como funciones normales; no tienen estado ni efectos.

| Función | Qué hace |
|---|---|
| `mergeWithInventory(catalog, inventory)` | Combina catálogo JSON + InventoryMap → `StickerWithState[]` |
| `getStats(stickers)` | Calcula `{ total, owned, repeated, missing, progress }` |
| `getSectionStats(stickers, section)` | Stats filtradas por sección |
| `getSections(stickers)` | Lista de secciones únicas |
| `applyFilter(stickers, filter)` | Filtra por estado |
| `catalogPrefix(slug)` | Devuelve `'treyes'` o `'panini'` — nunca hardcodear |
| `buildInventoryMap(entries, prefix)` | Construye `InventoryMap` desde filas de Supabase — solo para hooks |

### Estado UI global (`uiStore`)

```ts
const { filter, setFilter,
        activeSection, setActiveSection,
        cardSize, setCardSize,
        searchQuery, setSearchQuery } = useUIStore();
```

Solo para preferencias de UI de sesión. **No almacenes datos de negocio aquí.**

---

## Recetas

### Página autenticada con álbum completo

```tsx
const { user } = useSession();
const { getInstanceById } = useUserAlbums(user);
const instance = getInstanceById(albumId);   // { id, slug, albumCatalogId, name }

const { data: catalog }   = useAlbumData(instance?.slug);

// ⚠️ Pasar `instance ? userId : null` evita la race condition:
// si useInventory recibe userId antes de que instance resuelva, dispara queries
// a user_albums sin slug/albumCatalogId, generando llamadas redundantes.
const { data: inventory, update } = useInventory(
  albumId,
  instance ? (user?.id ?? null) : null,
  { slug: instance?.slug, albumCatalogId: instance?.albumCatalogId }
);

const stickers = useMemo(
  () => mergeWithInventory(catalog ?? [], inventory ?? {}),
  [catalog, inventory]
);

const stats    = useAlbumStats(stickers);   // { total, owned, missing, … }
const filtered = useFilters(stickers);      // aplica filtros de uiStore

// Para grids grandes (600+ figuras), diferir el render con useDeferredValue
// libera el hilo para que el header y las stats aparezcan de inmediato:
const deferredFiltered = useDeferredValue(filtered);
const isGridPending = deferredFiltered !== filtered;
```

### Página pública (sin sesión)

```tsx
const { data, isLoading, error } = useExternalAlbum(albumId);
// data.stickers ya viene como StickerWithState[] listo para renderizar
const stats = useAlbumStats(data?.stickers ?? []);
```

### Marcar una figura

```tsx
update.mutate({ stickerId: sticker.id, state: 'owned' });
update.mutate({ stickerId: sticker.id, state: 'repeated', quantity: 3 });
update.mutate({ stickerId: sticker.id, state: null });  // eliminar
```

### Anti-patrones — nunca hacer esto en un componente

```tsx
// ❌ acceso directo a Supabase
const supabase = createClient();
await supabase.from('user_stickers').select('*');

// ❌ importar catálogo JSON directamente
import catalog from '@/data/treyes.json';

// ❌ calcular estadísticas manualmente
const owned = stickers.filter(s => s.userState === 'owned').length;

// ❌ hardcodear el prefijo del álbum
const id = `treyes-${sticker.number}`;

// ✅ correcto: pasar por hooks y helpers
const { data: catalog } = useAlbumData(slug);
const { data: inventory, update } = useInventory(instanceId, userId);
const stickers = mergeWithInventory(catalog ?? [], inventory ?? {});
const stats    = useAlbumStats(stickers);
```

---

## Esquema de base de datos

```sql
-- Catálogos de álbumes (solo lectura)
albums_catalog   (id, slug, name, year, publisher, total_stickers)

-- Catálogo de figuras (solo lectura)
stickers_catalog (id, album_id, number, code, section, name, image_url, is_special)
  -- number: índice secuencial interno 1-N (nunca visible al usuario)
  -- code:   identificador visible ("33", "A", "T1", "E67")

-- Datos del usuario (RLS activo)
user_albums   (id, user_id, album_catalog_id, name, status, started_at)
user_stickers (id, user_album_id, sticker_catalog_id, state, quantity, marked_at)
  -- state: 'owned' | 'repeated'

-- Perfil público (para /external-share)
profiles (id → auth.users, display_name)
```

### RLS crítico

`user_albums` tiene política de **lectura pública** (para `/external-share`). Por eso `useUserAlbums` siempre filtra explícitamente con `.eq('user_id', userId)` — sin ese filtro todos los usuarios verían todos los álbumes.

---

## Catálogos

### Panini
145 figuras numeradas.

### 3 Reyes
706 figuras totales:

| Tipo | Cantidad | `code` |
|---|---|---|
| Figuras numeradas | 584 | `"1"` … `"580"` |
| Letras de sección (A-G) | 7 | `"A"` … `"G"` |
| REPECHAJE | 67 | `"E1"` … `"E67"` |
| ESCUDOS TROQUELADOS | 48 | `"T1"` … `"T48"` |

**80 figuras tienen `isSpecial: true`** — figuras foil verificadas contra el álbum físico. Reciben UI dorada diferenciada en `FiguriteCard`.

Las letras se intercalan dentro de la secuencia numérica de su país, por lo que `number ≠ code` numérico para cualquier figura posterior a la primera letra. El `id` local siempre es `treyes-{number}`.

---

## Convenciones

- **Idioma**: todo el texto de UI y comentarios en español neutro (estándar). Usar "figura/s" — no "sticker/s" ni "figurita/s".
- **IDs locales**: `panini-{number}` / `treyes-{number}` — derivados con `catalogPrefix(slug)`.
- **`number` vs `code`**: `number` es clave interna de orden; `code` es lo que ve el usuario. Nunca mostrar `number` en la UI.
- **Escritura a BD**: siempre via `update.mutate()` de `useInventory` — nunca directamente.
