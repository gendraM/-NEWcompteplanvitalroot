-- Les anciennes saisies pouvaient afficher la catégorie « extra » tout en
-- conservant est_extra = false. On aligne le champ canonique sans supprimer
-- ni déplacer aucune ligne historique.
update public.repas_reels
set est_extra = true
where lower(btrim(coalesce(categorie, ''))) = 'extra'
  and est_extra is distinct from true;
