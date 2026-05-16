-- =============================================================================
-- ÁLBUM DIGITAL PANINI / 3 REYES — Schema completo
-- Versión: Fase 2
-- Ejecutar en: Supabase SQL Editor (Project Settings → SQL Editor)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSIONES
-- -----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";


-- =============================================================================
-- TABLAS DE CATÁLOGO (solo lectura, compartidas por todos los usuarios)
-- =============================================================================

create table if not exists albums_catalog (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,        -- "panini-2024", "3reyes-2024"
  name          text not null,               -- "Mundial 2024"
  year          int  not null,
  publisher     text not null,               -- "Panini", "3 Reyes"
  total_stickers int not null,
  created_at    timestamptz default now()
);

create table if not exists stickers_catalog (
  id        uuid primary key default gen_random_uuid(),
  album_id  uuid not null references albums_catalog(id) on delete cascade,
  number    int  not null,
  name      text not null,
  section   text not null,
  image_url text,
  unique(album_id, number)
);

-- Índices para búsquedas frecuentes por sección y número
create index if not exists idx_stickers_catalog_album_id  on stickers_catalog(album_id);
create index if not exists idx_stickers_catalog_section   on stickers_catalog(album_id, section);
create index if not exists idx_stickers_catalog_number    on stickers_catalog(album_id, number);


-- =============================================================================
-- TABLAS DE USUARIO (RLS habilitado)
-- =============================================================================

create table if not exists user_albums (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  album_catalog_id  uuid not null references albums_catalog(id),
  name              text not null default 'Mi Album',  -- nombre personalizado
  status            text not null default 'active'     -- active | completed | archived
    check (status in ('active', 'completed', 'archived')),
  started_at        timestamptz default now(),
  updated_at        timestamptz default now()
  -- Sin unique(user_id, album_catalog_id) → permite múltiples instancias del mismo álbum
);

create table if not exists user_stickers (
  id                  uuid primary key default gen_random_uuid(),
  user_album_id       uuid not null references user_albums(id) on delete cascade,
  sticker_catalog_id  uuid not null references stickers_catalog(id),
  state               text not null
    check (state in ('owned', 'repeated')),
  quantity            int  not null default 1 check (quantity >= 1),
  marked_at           timestamptz default now(),
  unique(user_album_id, sticker_catalog_id)
);

-- Índices
create index if not exists idx_user_albums_user_id       on user_albums(user_id);
create index if not exists idx_user_albums_status        on user_albums(user_id, status);
create index if not exists idx_user_stickers_album_id    on user_stickers(user_album_id);
create index if not exists idx_user_stickers_state       on user_stickers(user_album_id, state);


-- =============================================================================
-- TRIGGER: updated_at automático en user_albums
-- =============================================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_albums_updated_at on user_albums;
create trigger trg_user_albums_updated_at
  before update on user_albums
  for each row execute function set_updated_at();


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- albums_catalog y stickers_catalog: lectura pública, escritura solo admins
alter table albums_catalog   enable row level security;
alter table stickers_catalog enable row level security;

create policy "catalogs_read_all"
  on albums_catalog for select using (true);

create policy "stickers_catalog_read_all"
  on stickers_catalog for select using (true);

-- user_albums: cada usuario solo ve y modifica los suyos
alter table user_albums enable row level security;

create policy "user_albums_owner"
  on user_albums for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_stickers: acceso vía el user_album_id que les pertenece
alter table user_stickers enable row level security;

create policy "user_stickers_owner"
  on user_stickers for all
  using (
    user_album_id in (
      select id from user_albums where user_id = auth.uid()
    )
  )
  with check (
    user_album_id in (
      select id from user_albums where user_id = auth.uid()
    )
  );


-- =============================================================================
-- SEED: álbumes del catálogo
-- (los stickers se insertan desde el script seed_stickers.sql)
-- =============================================================================

insert into albums_catalog (slug, name, year, publisher, total_stickers) values
  ('panini-2024', 'Mundial 2024',    2024, 'Panini',  145),
  ('3reyes-2024', 'Liga Argentina',  2024, '3 Reyes', 150)
on conflict (slug) do update set
  name           = excluded.name,
  year           = excluded.year,
  publisher      = excluded.publisher,
  total_stickers = excluded.total_stickers;


-- =============================================================================
-- FUNCIÓN HELPER: estadísticas de un user_album
-- Útil para queries desde el cliente sin exponer lógica en JS.
-- =============================================================================

create or replace function album_stats(p_user_album_id uuid)
returns table (
  total    bigint,
  owned    bigint,
  repeated bigint,
  missing  bigint,
  progress numeric
) language sql stable security definer as $$
  with counts as (
    select
      count(*) filter (where us.state = 'owned')    as owned,
      count(*) filter (where us.state = 'repeated') as repeated,
      ac_total.total_stickers
    from user_albums ua
    join albums_catalog ac  on ac.id = ua.album_catalog_id
    join (
      select album_id, count(*) as total_stickers
      from stickers_catalog group by album_id
    ) ac_total on ac_total.album_id = ac.id
    left join user_stickers us on us.user_album_id = ua.id
    where ua.id = p_user_album_id
      and ua.user_id = auth.uid()
    group by ac_total.total_stickers
  )
  select
    total_stickers                                       as total,
    owned,
    repeated,
    total_stickers - owned - repeated                    as missing,
    round((owned + repeated)::numeric / total_stickers * 100, 1) as progress
  from counts;
$$;
