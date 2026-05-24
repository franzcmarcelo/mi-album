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

| Hook | Expone | Cuándo usarlo |
|---|---|---|
| `useSession()` | `{ user, loading }` | Verificar sesión activa |
| `useUserAlbums(user)` | `{ instances, addAlbum, removeAlbum, renameAlbum, getInstanceById }` | Listado y CRUD de álbumes del usuario |
| `useAlbumData(slug)` | `{ data: Sticker[] }` | Catálogo estático del álbum (JSON local) |
| `useInventory(instanceId, userId)` | `{ data: InventoryMap, update }` | Leer y escribir el inventario del usuario |
| `useAlbumStats(stickers)` | `{ total, owned, repeated, missing, progress }` | Estadísticas de progreso |
| `useFilters(stickers)` | `StickerWithState[]` | Grid de figuras con filtros, búsqueda y sección activa aplicados |
| `useExternalAlbum(albumId)` | `{ data: { albumName, ownerName, stickers } }` | Vista pública sin sesión |

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
const instance = getInstanceById(albumId);          // { id, slug, name }

const { data: catalog }   = useAlbumData(instance?.slug);
const { data: inventory, update } = useInventory(albumId, user?.id ?? null);

const stickers = useMemo(
  () => mergeWithInventory(catalog ?? [], inventory ?? {}),
  [catalog, inventory]
);

const stats    = useAlbumStats(stickers);   // { total, owned, missing, … }
const filtered = useFilters(stickers);      // aplica filtros de uiStore
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
