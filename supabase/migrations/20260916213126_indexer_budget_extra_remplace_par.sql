create index if not exists idx_extras_budget_remplace_par
  on public.extras_budget(remplace_par)
  where remplace_par is not null;
