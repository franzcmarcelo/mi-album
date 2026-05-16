# Álbum Digital Panini / 3 Reyes

Aplicación web para gestionar el inventario digital de álbumes de figuritas Panini y 3 Reyes.

## Stack

- **Framework**: Next.js 14+ con App Router
- **Hosting**: Vercel (free tier)
- **BD + Auth**: Supabase (PostgreSQL + Google OAuth)
- **Estado cliente**: Zustand (UI local) + TanStack Query (datos del servidor)
- **Estilos**: Tailwind CSS
- **Lenguaje**: TypeScript

## Estructura de carpetas

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          # Pantalla de login con Google
│   ├── (app)/
│   │   ├── layout.tsx              # Layout con nav, requiere sesión
│   │   ├── page.tsx                # Dashboard / home
│   │   ├── album/[albumId]/page.tsx  # Vista álbum con grid 3D
│   │   ├── repetidas/page.tsx      # Mis repetidas + intercambio
│   │   └── cargar/page.tsx         # Carga manual de figuritas
│   ├── share/[token]/page.tsx      # Vista pública (sin auth)
│   └── api/
│       └── auth/callback/route.ts  # Callback OAuth de Supabase
├── components/
│   ├── album/
│   │   ├── FiguriteGrid.tsx        # Cuadrícula virtualizada de figuritas
│   │   ├── FiguriteCard.tsx        # Flip-card 3D (CSS transform3d)
│   │   ├── SectionNav.tsx          # Navegación por sección del álbum
│   │   ├── FilterBar.tsx           # Filtros: tengo / me falta / repetidas
│   │   └── ProgressHeader.tsx      # Barra de progreso + contadores
│   ├── dashboard/
│   │   ├── AlbumCover.tsx          # Portada animada del álbum
│   │   └── StatCard.tsx            # Tarjeta de métrica (pegadas, faltantes)
│   ├── cargar/
│   │   ├── BatchInput.tsx          # Ingreso de números por lote (ej: "12,45,78-90")
│   │   ├── GridSelector.tsx        # Cuadrícula para marcar clic a clic
│   │   └── SectionSelector.tsx     # Marcar sección completa de un tirón
│   ├── share/
│   │   ├── ShareModal.tsx          # Modal con enlace + botón WhatsApp
│   │   └── WhatsAppButton.tsx      # Abre wa.me con mensaje pre-armado
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── SearchInput.tsx
├── hooks/
│   ├── useInventory.ts             # CRUD de figuritas contra Supabase
│   ├── useAlbumData.ts             # Carga catálogo JSON del álbum activo
│   ├── useFilters.ts               # Estado de filtros activos
│   └── useShare.ts                 # Genera y decodifica URL de intercambio
├── store/
│   └── uiStore.ts                  # Zustand: filtros, modal abierto, álbum activo
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient de @supabase/ssr
│   │   └── server.ts               # createServerClient para Server Components
│   ├── shareEncoder.ts             # Serializa inventario a base64url para URL pública
│   └── catalogHelpers.ts           # Utilidades: diff catálogo vs inventario
├── data/
│   ├── panini.json                 # Catálogo completo Panini (id, numero, nombre, seccion, imagen_url)
│   └── treyes.json                 # Catálogo completo 3 Reyes
└── types/
    └── index.ts                    # Tipos globales: Sticker, StickerState, UserAlbum, etc.
```

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

create table stickers_catalog (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references albums_catalog(id),
  number int not null,
  name text not null,
  section text not null,
  image_url text,
  unique(album_id, number)
);

-- Datos de usuario (RLS activo)
create table user_albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  album_catalog_id uuid references albums_catalog(id),
  status text default 'active',        -- active | completed | archived
  started_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, album_catalog_id)
);

create table user_stickers (
  id uuid primary key default gen_random_uuid(),
  user_album_id uuid references user_albums(id) on delete cascade,
  sticker_catalog_id uuid references stickers_catalog(id),
  state text not null,                 -- owned | repeated
  quantity int default 1,
  marked_at timestamptz default now(),
  unique(user_album_id, sticker_catalog_id)
);

-- RLS: cada usuario solo ve y escribe sus propios datos
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

## Objetivos principales

1. **Inventario**: saber qué figuritas tengo, cuáles me faltan y cuáles están repetidas
2. **Exhibición**: UI visualmente destacada con flip-card 3D (CSS transform3d, sin Three.js), estado del álbum, progreso por sección
3. **Compartir**: URL pública compartible por WhatsApp con inventario codificado (base64url), sin backend para la vista pública

## Reglas de negocio clave

- Una figurita puede tener estado `owned`, `repeated`, o no existir en `user_stickers` (= faltante)
- Las figuritas faltantes se calculan por diferencia entre el catálogo y `user_stickers`
- El enlace público codifica el inventario completo en la URL (`?s=<base64url>`) — funciona sin login
- Al primer login con Google se migra automáticamente el inventario de localStorage a Supabase
- `FiguriteCard` usa CSS `transform-style: preserve-3d` y `rotateY(180deg)` — sin librerías 3D externas
- La cuadrícula de figuritas usa virtualización para manejar 600+ items sin degradar rendimiento

## Variables de entorno necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Fases del proyecto

- **Fase 1** (actual): frontend solo, localStorage, URL compartible sin backend ✓
- **Fase 2** (en desarrollo): Google Auth + Supabase BD + carga manual de figuritas
- **Fase 3** (futura): intercambios entre usuarios, notificaciones, grupos

## Comandos útiles

```bash
npx create-next-app@latest panini-album --typescript --tailwind --app
npm install @supabase/ssr @supabase/supabase-js zustand @tanstack/react-query
npx supabase init
npx supabase start   # BD local para desarrollo
```
