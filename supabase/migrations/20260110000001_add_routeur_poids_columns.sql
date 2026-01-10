-- Migration : Ajout colonnes routeur poids à la table profil
-- Date : 10 janvier 2026
-- Phase 0 : Infrastructure routeur poids

-- Ajout colonnes sexe et niveau_activite à la table profil
ALTER TABLE profil 
ADD COLUMN IF NOT EXISTS sexe TEXT CHECK (sexe IN ('M', 'F')),
ADD COLUMN IF NOT EXISTS niveau_activite TEXT CHECK (niveau_activite IN ('sedentaire', 'modere', 'actif', 'intense'));

-- Commentaires pour documentation
COMMENT ON COLUMN profil.sexe IS 'Sexe de l''utilisateur : M (Homme) ou F (Femme) - utilisé pour calcul BMR';
COMMENT ON COLUMN profil.niveau_activite IS 'Niveau d''activité physique : sedentaire/modere/actif/intense - utilisé pour calcul TDEE';

-- Index pour performance (optionnel, utile si requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_profil_sexe ON profil(sexe);
CREATE INDEX IF NOT EXISTS idx_profil_niveau_activite ON profil(niveau_activite);

-- Note : Les colonnes acceptent NULL pour utilisateurs existants
-- Les nouveaux utilisateurs auront ces champs OBLIGATOIRES dans le formulaire
