-- Miroir versionné de la migration déjà appliquée au projet Supabase.
alter table public.reprises_repas_consommes
  add column if not exists client_id uuid,
  add column if not exists date_repas date,
  add column if not exists heure_repas time,
  add column if not exists saisie_retroactive boolean not null default false,
  add column if not exists kcal numeric,
  add column if not exists note text,
  add column if not exists ressenti text,
  add column if not exists evaluation_reprise jsonb,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists reprises_repas_consommes_user_client_unique
  on public.reprises_repas_consommes (user_id, client_id);

alter table public.reprises_alimentaires enable row level security;
alter table public.reprises_jours_valides enable row level security;
alter table public.reprises_repas_consommes enable row level security;

-- Les politiques owner déjà présentes dans Supabase restent la source d'autorisation.
