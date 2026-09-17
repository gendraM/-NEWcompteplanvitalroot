-- Garantit qu'un même palier Extras ne peut être obtenu qu'une fois par utilisateur.
create unique index if not exists badges_user_code_unique
  on public.badges (user_id, code);
