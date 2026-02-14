# Historique des échanges — Migration Supabase & Multi-utilisateur

## Contexte
- Objectif : Migrer toutes les données critiques de l’application du localStorage vers Supabase pour garantir la persistance multi-appareil, préparer la migration vers le multi-utilisateur/authentification, et éviter toute perte de données.
- Technologies : Next.js, React, Supabase, localStorage.

## Chronologie des échanges

1. **Début de la migration**
   - Problème : Les données (jeûne, bilans, etc.) n’étaient stockées que dans le localStorage, risquant la perte lors d’un changement d’appareil ou d’utilisateur.
   - Solution : Intégration de Supabase, liaison avec un user_id fixe (mono-utilisateur), correction des schémas SQL.

2. **Audit et diagnostic**
   - Audit du code pour vérifier que toutes les écritures/lectures utilisent bien Supabase et le user_id.
   - Découverte : Beaucoup de domaines (préparation, reprise, cristallisation, profils, etc.) utilisent encore massivement le localStorage, parfois sans synchronisation Supabase.

3. **Problématique multi-utilisateur**
   - Risque identifié : Si un nouvel utilisateur utilise l’app sur un appareil déjà utilisé, il pourrait voir les anciennes données locales (localStorage partagé par appareil).
   - Solution : Lors de la migration vers l’authentification, associer chaque donnée à un user_id unique et ne migrer que les données de l’utilisateur connecté.

4. **Planification de la migration**
   - Lister toutes les clés localStorage critiques à migrer.
   - Prévoir une synchronisation automatique à la première connexion.
   - Prioriser la lecture/écriture sur Supabase, localStorage en fallback temporaire.
   - Préparer un script de migration pour mettre à jour les user_id lors du passage à l’authentification.

5. **Validation utilisateur**
   - L’utilisateur a validé qu’il n’y a pas de risque de mélange de données car chaque utilisateur utilise son propre appareil.
   - Demande d’un plan d’implémentation détaillé, d’une todo priorisée, et d’un historique des échanges.

---

## Points clés
- Migration rétrocompatible, sans perte de données.
- Synchronisation automatique localStorage ➔ Supabase à la première connexion/auth.
- Sécurité : chaque donnée liée à un user_id unique.
- Validation utilisateur à chaque étape clé.

