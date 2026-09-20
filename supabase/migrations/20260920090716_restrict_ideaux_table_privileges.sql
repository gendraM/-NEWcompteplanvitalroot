revoke all on table public.ideaux from anon, authenticated;
revoke all on table public.seances_reelles from anon, authenticated;
grant select, insert, update, delete on table public.ideaux to authenticated;
grant select, insert, update, delete on table public.seances_reelles to authenticated;
grant usage, select on sequence public.seances_reelles_id_seq to authenticated;
