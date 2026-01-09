# 🟢 PLAN D’IMPLÉMENTATION — MIGRATION SUPABASE & MULTI-UTILISATEUR

## Objectif
Migrer toutes les données critiques de l’application du localStorage vers Supabase, garantir la persistance multi-appareil, préparer la migration vers le multi-utilisateur/authentification, et éviter toute perte de données.

---

## 1. Actions à mener par l’utilisateur
- [x] Valider explicitement ce plan d’implémentation (aucune action de code requise).
- [x] Fournir, si besoin, des précisions sur les priorités ou les domaines à traiter en premier.
- [x] Tester l’application après migration (feedback sur la récupération des données, historique, profils, etc.).

## 2. Actions à mener par Copilot (automatisées)
- [ ] Lister toutes les clés localStorage critiques à migrer (par domaine : jeûne, préparation, reprise, cristallisation, profils, etc.).
- [ ] Pour chaque domaine, migrer la logique de lecture/écriture vers Supabase (avec user_id).
- [ ] Mettre en place une synchronisation automatique à la première connexion : transfert des données locales vers Supabase sous l’ID utilisateur.
- [ ] Prioriser la lecture/écriture sur Supabase, utiliser localStorage uniquement en cache/fallback temporaire.
- [ ] Préparer un script de migration pour mettre à jour les user_id lors du passage à l’authentification multi-utilisateur.
- [ ] Vérifier la cohérence et la traçabilité de toutes les migrations (logs, feedback UX, rollback possible).
- [ ] Générer un rapport Markdown avant/après chaque étape clé.
- [ ] Proposer un rollback immédiat en cas d’anomalie ou de perte de données.

---

## Checklist stricte (Copilot)
- Respect du template de planification Copilot fourni.
- Validation utilisateur obligatoire avant toute modification de code.
- Documentation complète de chaque étape, rollback, et rapport d’avancement.
- Tests multi-appareil et multi-utilisateur simulés.

---

## Validation
- [ ] Plan validé par l’utilisateur à la date : ____

