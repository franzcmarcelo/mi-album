# Álbum Digital Panini / 3 Reyes

Aplicación web para gestionar el inventario digital de álbumes de figuritas Panini y 3 Reyes del Mundial 2026.

## Stack

- **Framework**: Next.js 15 con App Router
- **Hosting**: Vercel (free tier)
- **BD + Auth**: Supabase (PostgreSQL + Google OAuth)
- **Estado cliente**: Zustand (UI local) + TanStack Query (datos del servidor)
- **Estilos**: Tailwind CSS + CSS custom properties (design tokens en `globals.css`)
- **Lenguaje**: TypeScript

## Estado actual del proyecto

- **Fase 2 completa**: Google Auth + Supabase BD — autenticación obligatoria, sin localStorage
- Multi-álbum: el usuario puede tener varios álbumes activos (Panini y/o 3 Reyes)
- `/share/<instanceId>` — vista privada del propietario (requiere sesión); muestra enlace público a compartir
- `/external-share/<albumId>` — vista pública de solo lectura (sin auth), protegida con security headers
- UI con tema oscuro, World Cup identity (logos, colores, animaciones)

## Estructura de carpetas

```
src/
├── app/
│   ├── layout.tsx                      # Root layout: fuentes Geist, Providers, page-background div
│   ├── providers.tsx                   # QueryClientProvider + SessionProvider
│   ├── globals.css                     # Design tokens, animaciones CSS, clases utilitarias
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx                # Login page (logo WC, tarjeta centrada)
│   │       └── LoginButton.tsx         # Botón Google OAuth via Supabase
│   ├── (app)/
│   │   ├── layout.tsx                  # Layout autenticado: navbar sticky, aurora blobs, logo ghost
│   │   ├── page.tsx                    # Dashboard: WCHero banner + grid de álbumes
│   │   ├── HeaderActions.tsx           # Avatar de usuario + indicador de sesión en navbar
│   │   ├── NavMenu.tsx                 # Menú hamburguesa (navegación lateral/dropdown)
│   │   ├── LogoutButton.tsx            # Botón cerrar sesión
│   │   └── album/[albumId]/page.tsx    # Vista de álbum: progreso, filtros, grid de figuritas
│   ├── share/[token]/page.tsx          # Vista compartir del propietario (requiere sesión)
│   ├── external-share/[albumId]/page.tsx # Vista pública de solo lectura (sin auth, security headers)
│   └── api/
│       └── auth/callback/route.ts      # Callback OAuth de Supabase
├── components/
│   ├── album/
│   │   ├── FiguriteCard.tsx            # Tarjeta de figurita con animaciones (bounce, shine, stamp)
│   │   ├── FiguriteGrid.tsx            # Cuadrícula de figuritas (virtualizada para 600+ items)
│   │   ├── SectionNav.tsx              # Nav horizontal de secciones; pills con checkbox toggle (sin "Todas" fijo)
│   │   ├── AlbumToolbar.tsx            # Solo filtros (Todas/Tengo/Faltan/Repetidas); size toggle está en la página
│   │   ├── ProgressHeader.tsx          # Header: barra top segmentada, % grande, tres pills (Tengo/Repet./Faltan)
│   │   ├── AddOwnedModal.tsx           # Modal para marcar figuritas como "tengo" en lote (exporta ModalSheet, SectionGroup)
│   │   └── AddRepeatedModal.tsx        # Modal para marcar figuritas como "repetidas" con cantidad
│   ├── dashboard/
│   │   ├── AlbumCover.tsx              # Portada de álbum rediseñada (Panini: blobs de colores; 3 Reyes: bandas diagonales)
│   │   ├── CreateAlbumModal.tsx        # Modal para crear un nuevo álbum de la colección
│   │   └── StatCard.tsx               # Tarjeta de métrica genérica (no usada actualmente)
│   ├── cargar/
│   │   ├── BatchInput.tsx              # Ingreso de números por lote (ej: "12,45,78-90")
│   │   ├── GridSelector.tsx            # Cuadrícula para marcar figuritas clic a clic
│   │   └── SectionSelector.tsx        # Marcar sección completa de un tirón
│   ├── share/
│   │   └── ShareModal.tsx             # Modal de compartir (legacy — la lógica principal está en /share)
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── SearchInput.tsx             # Buscador de figuritas por número o nombre
├── hooks/
│   ├── useSession.ts                   # Sesión Supabase (user, loading)
│   ├── useUserAlbums.ts                # CRUD de álbumes del usuario + AVAILABLE_ALBUMS (solo Supabase)
│   ├── useInventory.ts                 # CRUD de figuritas del inventario contra Supabase (solo Supabase)
│   ├── useExternalAlbum.ts             # Fetch público de álbum para /external-share (anon client, UUID gate)
│   ├── useAlbumData.ts                 # Carga catálogo JSON del álbum (panini/3reyes)
│   ├── useAlbumStats.ts                # useMemo wrapper sobre getStats(stickers)
│   ├── useFilters.ts                   # Aplica filtros + búsqueda al listado de stickers
│   └── useShare.ts                     # Genera y decodifica URL de intercambio (legacy)
├── store/
│   └── uiStore.ts                      # Zustand: filter, activeSection, cardSize, searchQuery
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # createBrowserClient de @supabase/ssr
│   │   └── server.ts                   # createServerClient para Server Components
│   ├── shareEncoder.ts                 # Serializa inventario a base64url para URL pública
│   ├── sectionColors.ts                # Mapa sección → color (para pills y badges)
│   └── catalogHelpers.ts               # mergeWithInventory, getStats, getSections, getSectionStats
├── data/
│   ├── panini.json                     # Catálogo Panini (id, number, name, section)
│   └── treyes.json                     # Catálogo 3 Reyes
└── types/
    └── index.ts                        # Sticker, StickerWithState, UserAlbumInstance, etc.

public/
└── images/
    ├── world-cup-logo.png              # Logo 1: trofeo FIFA, fondo BLANCO
    ├── world-cup-logo-2.png            # Logo 2: esfera "26", fondo OSCURO
    └── favicon.png                     # Ícono de la app (navbar + favicon)
```

## Guía de uso de los logos

| Contexto | Imagen | Técnica |
|---|---|---|
| Navbar | favicon.png | `objectFit: contain`, 36×36px, sin blend mode |
| Favicon / shortcut / apple icon | favicon.png | Metadata `icons` en `app/layout.tsx` |
| Dashboard WCHero | logo-1 (trofeo) | `grayscale + invert + brightness + opacity + screen` — copa ghost en esquina |
| Login card | logo-2 | `filter: drop-shadow(...)` sobre fondo oscuro |
| Portada álbum Panini | logo-2 | centrado en overlay, sin blend mode (fondo ya es oscuro) |
| Portada álbum 3 Reyes | logo-2 | centrado en overlay, sin blend mode |
| Watermark página (ghost) | logo-1 | `filter: grayscale(1) invert(1) brightness(X) opacity(Y)` |

### Tamaños responsivos con `clamp()`
- Navbar logo: `36×36px` fijo (pequeño, no necesita responsive)
- WCHero logo ghost: `clamp(100px, 34vw, 148px)`
- Portadas de álbum: `clamp(52px, 17vw, 88px)` — proporcional al grid de 2 columnas

## Animaciones CSS (globals.css)

| Clase / keyframe | Uso |
|---|---|
| `badge-pop` | Badge de qty en FiguriteCard, se activa con `key={qty}` |
| `card-owned-pop` | Bounce del card al marcar como "tengo" — **750ms** (via ref DOM) |
| `card-shine-sweep` | Destello diagonal al marcar como "tengo" — **820ms**, se muestra 900ms |
| `check-stamp` | Sello ✓ que aparece al marcar como "tengo" |
| `foil-sweep` | Brillo metálico en álbumes completos |
| `aurora-drift-1/2` | Blobs de aurora en el layout |
| `skeleton` | Shimmer para estados de carga |
| `.pressable` | `scale(0.97)` en `:active` (feedback táctil) |
| `.card-hover` | `translateY(-3px)` en hover (para portadas de álbum) |
| `.wc-stripes` | Líneas diagonales sutiles (identidad WC) |
| `.wc-hex` | Patrón hexagonal tipo balón de fútbol |

## Ruta `/share/[token]` (solo propietario)

Requiere sesión activa (redirect a `/login` si no hay usuario). Solo acepta UUIDs.

- Muestra breadcrumb: `Mi colección > Nombre álbum > Compartir`
- Panel con `CopyCard` que apunta a `/external-share/<instanceId>` (enlace público)
- Grid por secciones con ×N para repetidas (vista de propietario)
- `CopyCard`: botón copiar con flash 2s + botón WhatsApp

## Ruta `/external-share/[albumId]` (pública)

Accesible sin sesión. El `albumId` es el UUID de `user_albums` en Supabase.

- Página standalone (fuera del layout `(app)`) — sin navbar ni info del usuario
- Header mínimo: logo + "Mi Álbum · Copa del Mundo 2026" + badge "Solo lectura"
- `useExternalAlbum`: fetch con cliente anon de Supabase (las políticas RLS permiten SELECT público por UUID)
- UUID validation con regex antes de hacer la query (`enabled: isValidUUID`)
- Grid de figuritas por sección, solo lectura: verde = tengo, verde brillante + ×N = repetida, gris = falta
- `InvalidLink` component para UUIDs no encontrados o rutas inválidas
- Sin mutaciones, sin `onClick` handlers en las figuritas, `userSelect: 'none'`

### Security headers (middleware.ts)

El middleware intercepta `/external-share/*`:
- Non-UUID paths → 404 inmediato (sin consultar Supabase)
- `X-Frame-Options: DENY` — anti-clickjacking
- `Content-Security-Policy` — `form-action 'none'`, `frame-ancestors 'none'`
- `X-Robots-Tag: noindex, nofollow` — no indexar en buscadores
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`

## Esquema de base de datos (Supabase / PostgreSQL)

```sql
-- Catálogos estáticos (solo lectura)
create table albums_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,           -- "panini-2024", "3reyes-2024"
  name text not null,
  year int not null,
  publisher text,
  total_stickers int not null
);

-- Datos de usuario (RLS activo)
create table user_albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  album_catalog_id uuid references albums_catalog(id),
  name text,                           -- nombre personalizado del álbum
  status text default 'active',
  started_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table user_stickers (
  id uuid primary key default gen_random_uuid(),
  user_album_id uuid references user_albums(id) on delete cascade,
  sticker_catalog_id uuid references stickers_catalog(id),
  state text not null,                 -- 'owned' | 'repeated'
  quantity int default 1,
  marked_at timestamptz default now(),
  unique(user_album_id, sticker_catalog_id)
);

-- RLS
alter table user_albums enable row level security;
alter table user_stickers enable row level security;

create policy "users own albums" on user_albums
  for all using (auth.uid() = user_id);

create policy "users own stickers" on user_stickers
  for all using (
    user_album_id in (
      select id from user_albums where user_id = auth.uid()
    )
  );
```

## Patrones de UI

### Layout del álbum (`album/[albumId]/page.tsx`)
- **AlbumToolbar**: solo filtros de estado (Todas / Tengo / Faltan / Repetidas)
- **Fila size + búsqueda**: `[S M L]` a la izquierda + `<SearchInput />` expandible a la derecha — inline en la página, no en AlbumToolbar
- **SectionNav**: pills de sección con checkbox toggle; sin botón "Todas" separado — clicar la sección activa la deselecciona
- **Controles de tamaño**: etiquetas S / M / L (no "SM" / "MD" / "LG")

### Modales (`ModalSheet` — compartido por AddOwnedModal y AddRepeatedModal)
- Bottom sheet en mobile (`items-end`), centrado en desktop (`sm:items-center`)
- `maxHeight: 88vh` con header fijo + área scrollable + footer fijo
- **Scroll lock**: `document.body.style.overflow = 'hidden'` via `useEffect` al montar; se restaura al desmontar
- **Scroll containment**: `overscrollBehavior: 'contain'` en el div scrollable — impide que el scroll se propague al body cuando llega al tope/fondo
- **Touch bleed prevention**: `onTouchMove` en el backdrop cancela el evento si el target es el propio overlay
- `ModalSheet` y `SectionGroup` se exportan desde `AddOwnedModal.tsx` para ser reutilizados por `AddRepeatedModal.tsx`

### Dashboard controls bar (`page.tsx`)
- Cuando hay múltiples publishers: `[pills flex-1] | [+ Nuevo álbum]`
- Cuando hay un solo publisher: solo `[+ Nuevo álbum]` con `marginLeft: auto`
- Sin spacer `flex:1` fijo — evita distorsión en distintos anchos de pantalla

### Portadas de álbum (`AlbumCover.tsx`)

Cada álbum tiene un `variant` (`'panini'` | `'3reyes'`) definido en `COVER_META`.

**Panini** (`variant: 'panini'`):
- Fondo: gradiente azul oscuro `#05112a → #0c2260 → #060e22`
- Decoración izquierda: tira vertical de 9 blobs de colores (`PANINI_BLOBS`), con `borderRadius: '0 45% 45% 0'`
- Decoración derecha: misma tira espejada con `opacity: 0.18`
- Centro: texto "OFFICIAL STICKER COLLECTION" (tiny caps) + "26" grande gradiente + logo-2 + "FIFA WORLD CUP"

**3 Reyes** (`variant: '3reyes'`):
- Fondo: gradiente verde oscuro `#021a07 → #053012 → #010e03`
- Decoración: 5 bandas diagonales (`transform: 'skewY(-18deg)'`) con `TREYES_STRIPES`, posición absoluta
- Centro: "COPA" pequeño + "26" verde gradiente grande + logo-2 + "MUNDIAL 2026"

**Info overlay** (común a ambas variantes):
- `position: absolute, bottom: 0` con gradiente `transparent → rgba(0,0,0,0.82)`
- Nombre del álbum, chips de stats (`StatChip`), mini barra de progreso segmentada (verde + amarillo)
- `MenuBtn` (⋯) para acciones de renombrar/eliminar

### ProgressHeader (`ProgressHeader.tsx`)

Estructura de arriba hacia abajo:
1. **Barra top de 3px** — flex: verde (`ownedPct%`) + amarillo (`repeatedPct%`) + gris (resto)
2. **Fila título + %**: nombre editable inline (pencil icon) a la izquierda; porcentaje 34px degradado a la derecha con `collected/total` debajo
3. **Barra de progreso de 7px** — segmentada: verde (owned) + amarillo (repeated), con `border-radius` condicional
4. **Tres pills** en fila:
   - 🟢 **Tengo** — número grande verde, sublabel "pegadas"
   - 🟡 **Repet.** — número grande amarillo, sublabel "a canjear"
   - ⬜ **Faltan** — número grande gris, sublabel "de X total"

## Reglas de negocio clave

- Estado de figurita: `owned` | `repeated` | `undefined` (= faltante, no está en `user_stickers`)
- Faltantes = catálogo total − (owned + repeated)
- Badge en FiguriteCard: `+N` en vista "tengo" (copias extra), `×N` en vista "repetidas"
- `useUserAlbums` expone `AVAILABLE_ALBUMS` con los slugs disponibles y metadata de cada álbum
- `mergeWithInventory(catalog, inventory)` produce `StickerWithState[]` con qty y userState
- `FiguriteCard` detecta transición missing→owned con `useRef(prevIsOwned)` para disparar animaciones
- Autenticación obligatoria: `useEffect(() => { if (!sessionLoading && !user) router.replace('/login') }, [...])`
- UUID del álbum actúa como token de acceso público en `/external-share/<albumId>`

## Variables de entorno necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Comandos útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npx tsc --noEmit     # Verificar tipos sin compilar
```

## Fases del proyecto

- **Fase 1** ✓: frontend solo, localStorage, URL compartible sin backend
- **Fase 2** ✓: Google Auth + Supabase BD + multi-álbum + autenticación obligatoria + share público `/external-share`
- **Fase 3** (futura): intercambios entre usuarios, notificaciones, grupos
