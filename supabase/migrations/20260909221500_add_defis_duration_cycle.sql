-- Migration déjà appliquée au projet Supabase Becomingtherealme.
-- Distingue le temps du défi de ses observations comportementales.

alter table public.defis
  add column if not exists started_at timestamptz,
  add column if not exists ended_at timestamptz;

create or replace function public.demarrer_defi(p_defi_id integer)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare
  v_user_id uuid := auth.uid();
  v_defi public.defis%rowtype;
begin
  if v_user_id is null then raise exception 'Utilisateur non authentifie'; end if;
  select * into v_defi from public.defis where id=p_defi_id and user_id=v_user_id for update;
  if not found then raise exception 'Defi introuvable'; end if;

  update public.defis set status='disponible'
  where user_id=v_user_id and status='en cours' and id<>p_defi_id;

  update public.defis
  set status='en cours', progress=0, started_at=now(), ended_at=null
  where id=p_defi_id and user_id=v_user_id;

  return jsonb_build_object('success',true,'defiId',p_defi_id,'status','en cours','progress',0,'startedAt',now());
end;
$function$;

revoke all on function public.demarrer_defi(integer) from public, anon;
grant execute on function public.demarrer_defi(integer) to authenticated;
