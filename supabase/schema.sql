-- ==============================================================================
-- Hike Fuel — Modelo de Datos y Esquema Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Perfil extendido de usuario (vinculado a auth.users de Supabase)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  weight_kg numeric(5,2),
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.profiles enable row level security;

create policy "Los usuarios pueden ver su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Los usuarios pueden actualizar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse en auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Catálogo de Snacks (Alimentos genéricos del sistema o personalizados de usuario)
create table if not exists public.snacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade, -- null si es genérico del sistema
  name text not null,
  brand text,
  is_generic boolean not null default false,
  serving_size_g numeric not null default 100,
  calories_kcal numeric not null,
  carbs_g numeric not null default 0,
  sugars_g numeric not null default 0,
  fat_g numeric not null default 0,
  protein_g numeric not null default 0,
  sodium_mg numeric not null default 0,
  created_at timestamptz default now()
);

alter table public.snacks enable row level security;

-- Todos pueden leer alimentos genéricos del sistema o sus propios alimentos privados
create policy "Lectura de snacks públicos o propios"
  on public.snacks for select
  using (is_generic = true or auth.uid() = user_id);

-- Solo el usuario puede insertar/modificar sus propios snacks
create policy "Inserción de snacks propios"
  on public.snacks for insert
  with check (auth.uid() = user_id and is_generic = false);

create policy "Modificación de snacks propios"
  on public.snacks for update
  using (auth.uid() = user_id and is_generic = false);

create policy "Borrado de snacks propios"
  on public.snacks for delete
  using (auth.uid() = user_id and is_generic = false);


-- 3. Menús de ruta
create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,               -- Ej: "Ruta 1 día Pirineos"
  duration_type text not null,       -- 'half_day', 'single_day', 'multi_day'
  target_calories numeric,
  created_at timestamptz default now()
);

alter table public.menus enable row level security;

create policy "Gestión completa de menús propios"
  on public.menus for all
  using (auth.uid() = user_id);


-- 4. Elementos de cada Menú (Snack + Porciones)
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  snack_id uuid not null references public.snacks(id) on delete cascade,
  servings numeric not null default 1
);

alter table public.menu_items enable row level security;

create policy "Gestión de items de menú propios"
  on public.menu_items for all
  using (
    exists (
      select 1 from public.menus
      where menus.id = menu_items.menu_id and menus.user_id = auth.uid()
    )
  );


-- 5. Favoritos
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  snack_id uuid not null references public.snacks(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, snack_id)
);

alter table public.favorites enable row level security;

create policy "Gestión de favoritos propios"
  on public.favorites for all
  using (auth.uid() = user_id);
