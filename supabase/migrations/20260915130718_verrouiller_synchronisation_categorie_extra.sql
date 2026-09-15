create or replace function public.synchroniser_statut_extra_repas()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if lower(btrim(coalesce(new.categorie, ''))) = 'extra' then
    new.est_extra := true;
  end if;

  return new;
end;
$$;

drop trigger if exists repas_reels_synchroniser_statut_extra on public.repas_reels;

create trigger repas_reels_synchroniser_statut_extra
before insert or update of categorie, est_extra
on public.repas_reels
for each row
execute function public.synchroniser_statut_extra_repas();

update public.repas_reels
set est_extra = true
where lower(btrim(coalesce(categorie, ''))) = 'extra'
  and est_extra is distinct from true;
