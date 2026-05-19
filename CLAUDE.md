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
- `/external-share/<albumId>` — vista pública de solo lectura (sin auth), protegida con security headers y metadatos OG dinámicos
- UI con tema oscuro, World Cup identity (logos, colores, animaciones)
- SEO completo: robots.txt, sitemap.xml, metadatos globales, OG dinámico por álbum, JSON-LD

## Convenciones de idioma

- Todo el texto de la UI y los comentarios de código se escriben en **español neutro (estándar)**
- No usar voseo ni expresiones rioplatenses: usar "tú", imperativo estándar ("revisa", "indica"), sin regionalismos
- En la UI: "figura/s" (no "sticker/s" ni "figurita/s"); en keywords SEO se puede mantener "figuritas" para cobertura de búsqueda

## Estructura de carpetas

```
src/
├── middleware.ts                         # Auth guard + security headers /external-share (toda la lógica aquí, no en proxy)
├── app/
│   ├── layout.tsx                        # Root layout: Geist, Providers, metadatos SEO globales, OG, JSON-LD
│   ├── providers.tsx                     # QueryClientProvider + SessionProvider
│   ├── globals.css                       # Design tokens, animaciones CSS, clases utilitarias
│   ├── robots.ts                         # /robots.txt — permite / y /login, bloquea rutas privadas
│   ├── sitemap.ts                        # /sitemap.xml — expone /login con prioridad 1.0
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx                  # Login page: responsive con clamp(), JSON-LD WebApplication, feature cards
│   │       └── LoginButton.tsx           # Botón Google OAuth via Supabase
│   ├── (app)/
│   │   ├── layout.tsx                    # Layout autenticado: navbar sticky, aurora blobs, logo ghost (next/image)
│   │   ├── page.tsx                      # Dashboard: WCHero banner + grid de álbumes
│   │   ├── HeaderActions.tsx             # Avatar de usuario + indicador de sesión en navbar
│   │   ├── NavMenu.tsx                   # Menú hamburguesa (navegación lateral/dropdown)
│   │   ├── LogoutButton.tsx              # Botón cerrar sesión
│   │   └── album/[albumId]/page.tsx      # Vista de álbum: progreso, filtros, grid de figuritas
│   ├── share/[token]/page.tsx            # Vista compartir del propietario (requiere sesión)
│   ├── external-share/[albumId]/
│   │   ├── layout.tsx                    # Server Component: generateMetadata dinámico (título, OG, noindex)
│   │   ├── page.tsx                      # Vista pública de solo lectura (sin auth, next/image)
│   │   └── opengraph-image.tsx           # Imagen OG 1200×630 generada en edge runtime con next/og
│   └── api/
│       └── auth/callback/route.ts        # Callback OAuth de Supabase
├── components/
│   ├── album/
│   │   ├── FiguriteCard.tsx              # Tarjeta de figurita con animaciones (bounce, shine, stamp)
│   │   ├── FiguriteGrid.tsx              # Cuadrícula de figuritas (virtualizada para 600+ items)
│   │   ├── SectionNav.tsx                # Nav horizontal de secciones; pills con checkbox toggle
│   │   ├── AlbumToolbar.tsx              # Solo filtros (Todas/Tengo/Faltan/Repetidas)
│   │   ├── ProgressHeader.tsx            # Header: barra top segmentada, % grande, tres pills
│   │   ├── AddOwnedModal.tsx             # Modal para marcar figuritas como "tengo" en lote (exporta ModalSheet, SectionGroup)
│   │   └── AddRepeatedModal.tsx          # Modal para marcar figuritas como "repetidas" con cantidad
│   ├── dashboard/
│   │   ├── AlbumCover.tsx                # Portada de álbum (Panini: blobs; 3 Reyes: bandas diagonales)
│   │   ├── CreateAlbumModal.tsx          # Modal para crear un nuevo álbum de la colección
│   │   └── StatCard.tsx                  # Tarjeta de métrica genérica (no usada actualmente)
│   ├── cargar/
│   │   ├── BatchInput.tsx                # Ingreso de números por lote (ej: "12,45,78-90")
│   │   ├── GridSelector.tsx              # Cuadrícula para marcar figuritas clic a clic
│   │   └── SectionSelector.tsx           # Marcar sección completa de una vez
│   ├── share/
│   │   ├── ShareAlbumView.tsx            # Componentes compartidos: AlbumStatsCard, StickerGrid, ShareFooter
│   │   └── ShareModal.tsx                # Modal de compartir (legacy)
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── SearchInput.tsx               # Buscador de figuritas por número o nombre
├── hooks/
│   ├── useSession.ts                     # Sesión Supabase (user, loading)
│   ├── useUserAlbums.ts                  # CRUD de álbumes del usuario + AVAILABLE_ALBUMS
│   ├── useInventory.ts                   # CRUD de figuritas del inventario contra Supabase
│   ├── useExternalAlbum.ts               # Fetch público de álbum para /external-share (anon client, UUID gate)
│   ├── useAlbumData.ts                   # Carga catálogo JSON del álbum (panini/3reyes)
│   ├── useAlbumStats.ts                  # useMemo wrapper sobre getStats(stickers)
│   ├── useFilters.ts                     # Aplica filtros + búsqueda al listado de figuritas
│   └── useShare.ts                       # Genera y decodifica URL de intercambio (legacy)
├── store/
│   └── uiStore.ts                        # Zustand: filter, activeSection, cardSize, searchQuery
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # createBrowserClient de @supabase/ssr
│   │   └── server.ts                     # createServerClient para Server Components
│   ├── shareEncoder.ts                   # Serializa inventario a base64url para URL pública
│   ├── sectionColors.ts                  # Mapa sección → color (para pills y badges)
│   └── catalogHelpers.ts                 # mergeWithInventory, getStats, getSections, getSectionStats
├── data/
│   ├── panini.json                       # Catálogo Panini (id, number, name, section)
│   └── treyes.json                       # Catálogo 3 Reyes
└── types/
    └── index.ts                          # Sticker, StickerWithState, UserAlbumInstance, etc.

public/
└── images/
    ├── world-cup-logo.png                # Logo 1: trofeo FIFA, fondo BLANCO
    ├── world-cup-logo-2.png              # Logo 2: esfera "26", fondo OSCURO
    └── favicon.png                       # Ícono de la app (navbar + favicon)
```

## Middleware (`src/middleware.ts`)

Toda la lógica de middleware vive directamente en `middleware.ts`. No existe archivo `proxy.ts`.

Next.js ejecuta exclusivamente el archivo llamado `middleware.ts` en la raíz de `src/`. Cualquier indirección (re-export desde otro archivo) es innecesaria.

**Lo que hace el middleware:**
1. **UUID gate** para `/external-share/*`: rutas con path no-UUID devuelven 404 sin consultar Supabase
2. **Security headers** en `/external-share/*`: `X-Frame-Options: DENY`, `Content-Security-Policy`, `X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`
3. **Cookie refresh de Supabase** en todas las demás rutas (patrón `getAll` / `setAll`)
4. **Protección de rutas**: `/`, `/album/*`, `/share/*` redirigen a `/login?redirect=<path>` si no hay sesión
5. **Redirect inverso**: `/login` redirige a `/` si ya hay sesión activa

## SEO y Open Graph

### Metadatos globales (`app/layout.tsx`)
- `metadataBase`: apunta al dominio de producción para que las URLs relativas de OG sean absolutas
- Title template: `%s | Mi Álbum`
- Keywords incluyen "figuritas" para mayor cobertura de búsqueda aunque la UI use "figuras"
- `og:image`, Twitter card, canonical

### Página de login (`app/(auth)/login/page.tsx`)
- Metadata específica de página (título, descripción, canonical)
- JSON-LD `WebApplication` schema para indexación enriquecida en Google
- Sección de 4 feature cards debajo del login card (visibles e indexables por crawlers)

### robots.ts / sitemap.ts
- `robots.ts`: permite `/` y `/login`; bloquea `/album/` y `/share/`
- `sitemap.ts`: expone `/login` con prioridad `1.0`

### OG dinámico por álbum (`external-share/[albumId]/`)
- `layout.tsx` (Server Component): `generateMetadata` hace fetch a Supabase REST para obtener nombre de álbum y dueño; genera título, descripción y URL de imagen específicos por álbum; establece `robots: noindex`
- `opengraph-image.tsx`: imagen `1200×630` generada en **edge runtime** con `next/og`; muestra publisher, nombre, dueño, barra de progreso segmentada (verde=tengo, ámbar=repetidas) y chips de stats; usa fetch directo a Supabase REST (no cookie client — incompatible con edge)

## Guía de uso de los logos

| Contexto | Imagen | Técnica |
|---|---|---|
| Navbar | favicon.png | `next/image`, 36×36px, `objectFit: contain` |
| Favicon / shortcut / apple icon | favicon.png | Metadata `icons` en `app/layout.tsx` |
| Dashboard WCHero | logo-1 (trofeo) | `grayscale + invert + brightness + opacity + screen` — copa ghost |
| Login card | logo-2 | `next/image`, `filter: drop-shadow(...)` sobre fondo oscuro, `priority` |
| Login watermark | logo-1 | `next/image`, `filter: grayscale(1) invert(1) brightness(2) opacity(0.07)` |
| Portada álbum Panini | logo-2 | centrado en overlay, sin blend mode |
| Portada álbum 3 Reyes | logo-2 | centrado en overlay, sin blend mode |
| External-share header | favicon.png | `next/image`, 28×28px |

### Tamaños responsivos con `clamp()`

- Navbar logo: `36×36px` fijo
- WCHero logo ghost: `clamp(100px, 34vw, 148px)`
- Portadas de álbum: `clamp(52px, 17vw, 88px)`
- Login logo: `clamp(64px, 18vw, 84px)`
- Login "2026" bg text: `clamp(100px, 38vw, 280px)`
- Login card padding: `clamp(24px, 6vw, 40px)` vertical, `clamp(20px, 6vw, 32px)` horizontal

## Página de login — diseño responsive

El layout usa un contenedor con `flexDirection: column` + `overflowX: hidden` (no `overflow: hidden`) para que el contenido sea scrollable en pantallas pequeñas. Card de login y feature cards están en un wrapper común con `maxWidth: 400px` y `gap` fluido.

Breakpoints cubiertos:
- **320px**: padding mínimo, logo 64px, fuentes comprimidas con `clamp()`
- **375px (iPhone SE/14)**: tamaños intermedios, todo visible sin scroll
- **≥480px (tablet/desktop)**: tamaños máximos, tarjeta centrada

## Animaciones CSS (`globals.css`)

| Clase / keyframe | Uso |
|---|---|
| `badge-pop` | Badge de qty en FiguriteCard, se activa con `key={qty}` |
| `card-owned-pop` | Bounce del card al marcar como "tengo" — **750ms** |
| `card-shine-sweep` | Destello diagonal al marcar como "tengo" — **820ms** |
| `check-stamp` | Sello ✓ al marcar como "tengo" |
| `foil-sweep` | Brillo metálico en álbumes completos |
| `aurora-drift-1/2` | Blobs de aurora en el layout |
| `skeleton` | Shimmer para estados de carga |
| `.pressable` | `scale(0.97)` en `:active` (feedback táctil) |
| `.card-hover` | `translateY(-3px)` en hover (portadas de álbum) |
| `.wc-stripes` | Líneas diagonales sutiles (identidad WC) |
| `.wc-hex` | Patrón hexagonal tipo balón de fútbol |

## Componentes compartidos de share (`ShareAlbumView.tsx`)

`AlbumStatsCard`, `StickerGrid` y `ShareFooter` son usados por ambas rutas de compartir.

- **`AlbumStatsCard`**: muestra publisher + catalogName + nombre del dueño (`ownerName`), nombre del álbum, %, barra de progreso y chips Tengo/Repetidas/Faltan/Total
- **`StickerGrid`**: grilla por secciones con control S/M/L; verde = tengo, ámbar (`#fbbf24`) = repetida con badge ×N, gris = falta
- **`groupBySection`**: helper exportado y usado también para generar textos de WhatsApp

## Ruta `/share/[token]` (solo propietario)

Requiere sesión activa (redirect a `/login` si no hay usuario). Solo acepta UUIDs.

- Breadcrumb: `Mi colección > Nombre álbum > Compartir`
- Panel con `CopyCard` apuntando a `/external-share/<instanceId>`, texto faltantes y texto repetidas
- `ownerName` proviene de `user.user_metadata.full_name` (sesión activa)
- `CopyCard`: botón copiar con flash 2s + botón WhatsApp

## Ruta `/external-share/[albumId]` (pública)

Accesible sin sesión. El `albumId` es el UUID de `user_albums` en Supabase.

- Página standalone fuera del layout `(app)` — sin navbar ni info privada
- Header mínimo: logo (`next/image`) + "Mi Álbum · Copa del Mundo 2026"
- `useExternalAlbum`: fetch con cliente anon; trae `albumName`, `ownerName` (vía tabla `profiles`), `slug`, `stickers`
- UUID validation con regex antes de hacer la query (`enabled: isValidUUID`, `retry: false`)
- `InvalidLink` para UUIDs no encontrados o rutas inválidas
- Sin mutaciones, sin `onClick` en figuritas, `userSelect: 'none'`

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

-- Perfiles públicos (display_name del dueño para /external-share)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text
);

alter table profiles enable row level security;

create policy "profiles_public_read" on profiles for select using (true);
create policy "profiles_owner_update" on profiles for update using (auth.uid() = id);

-- Trigger: auto-crea perfil al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## Patrones de UI

### Layout del álbum (`album/[albumId]/page.tsx`)
- **AlbumToolbar**: solo filtros de estado (Todas / Tengo / Faltan / Repetidas)
- **Fila size + búsqueda**: `[S M L]` a la izquierda + `<SearchInput />` expandible a la derecha — inline en la página, no en AlbumToolbar
- **SectionNav**: pills de sección con checkbox toggle; sin botón "Todas" separado — hacer clic en la sección activa la deselecciona
- **Controles de tamaño**: etiquetas S / M / L (no "SM" / "MD" / "LG")

### Modales (`ModalSheet` — compartido por AddOwnedModal y AddRepeatedModal)
- Bottom sheet en mobile (`items-end`), centrado en desktop (`sm:items-center`)
- `maxHeight: 88vh` con header fijo + área scrollable + footer fijo
- **Scroll lock**: `document.body.style.overflow = 'hidden'` via `useEffect` al montar; se restaura al desmontar
- **Scroll containment**: `overscrollBehavior: 'contain'` en el div scrollable
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
   - 🟢 **Tengo** — número grande verde, sublabel "en el álbum"
   - 🟡 **Repet.** — número grande amarillo, sublabel "para intercambiar"
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

### Seguridad RLS crítica

`user_albums` tiene DOS políticas:
- `user_albums_owner` (ALL): solo el dueño puede escribir — `auth.uid() = user_id`
- `public_read_user_albums` (SELECT): lectura pública para `/external-share` — `true`

**IMPORTANTE**: Por la política de lectura pública, `fetchInstances` en `useUserAlbums.ts` DEBE filtrar explícitamente con `.eq('user_id', userId)`. Sin este filtro, todos los usuarios verían los álbumes de todos. El RLS solo controla permisos de acceso, NO filtra el resultado de SELECT cuando hay una política `using (true)`.

Lo mismo aplica a `user_stickers` (`public_read_user_stickers`): las mutaciones en `archiveInstance` y `renameInstance` siempre incluyen `.eq('user_id', user.id)` además del filtro por `id`, como segunda capa de protección.

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
- **Fase 2.5** ✓: SEO (robots, sitemap, metadatos globales, OG dinámico), seguridad (middleware consolidado, RLS fix), responsive login, español neutro en UI
- **Fase 3** (futura): intercambios entre usuarios, notificaciones, grupos
