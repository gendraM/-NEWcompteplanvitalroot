# Diagnostic Erreur 400 Supabase

## Action requise

**Re-essaie de valider la semaine 2026-01-05 et copie-colle l'erreur complète ici :**

Dans la console, tu devrais voir :
```
[LOG BILAN] ❌ ERREUR Supabase:
  → Message: ...
  → Code: ...
  → Details: ...
  → Hint: ...
```

## Cause probable

L'erreur 400 signifie que **les 5 nouvelles colonnes n'existent pas encore dans la table `semaines_validees`** :

- `tendance_7j`
- `ecart_hebdo`
- `apports_totaux`
- `objectif_hebdo`
- `projection_poids`

## Solution

**Exécute ce SQL dans Supabase SQL Editor :**

```sql
ALTER TABLE semaines_validees 
ADD COLUMN IF NOT EXISTS tendance_7j TEXT,
ADD COLUMN IF NOT EXISTS ecart_hebdo INTEGER,
ADD COLUMN IF NOT EXISTS apports_totaux INTEGER,
ADD COLUMN IF NOT EXISTS objectif_hebdo INTEGER,
ADD COLUMN IF NOT EXISTS projection_poids INTEGER;
```

Puis re-essaie la validation !
