begin;

alter table public.suivi_periodes_estimees
  drop constraint if exists suivi_periodes_estimees_statut_check;

alter table public.suivi_periodes_estimees
  add constraint suivi_periodes_estimees_statut_check
  check (statut in ('a_completer', 'reconstituee', 'reportee', 'ignoree'));

comment on column public.suivi_periodes_estimees.statut is
  'Cycle du trou de suivi : a_completer, reportee, reconstituee ou ignoree.';

commit;
