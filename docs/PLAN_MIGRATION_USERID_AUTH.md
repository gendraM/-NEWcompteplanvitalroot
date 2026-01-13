# 🟢 PLAN D’IMPLÉMENTATION — MIGRATION VERS MULTI-UTILISATEUR SUPABASE (REMPLACEMENT user_id LOCAL/FIXE)

**Date : 11/01/2026**
**Objectif :** Remplacer tous les usages de user_id local/fixe (ex : 'laurelle_test_user', getLocalUserId) par le vrai user_id Supabase Auth dans toute l’application, AVANT migration multi-utilisateur et association des anciennes données.

---

## **Description précise de la modification attendue**

- Identifier et corriger tous les fichiers/pages utilisant encore un user_id local ou codé en dur (mono-utilisateur)
- Remplacer ces usages par la récupération du user_id authentifié via Supabase Auth (ex : AuthContext, supabase.auth.getUser())
- S’assurer que chaque requête (lecture/écriture) utilise ce user_id dynamique
- Tester chaque page/fonctionnalité avec un vrai compte utilisateur
- Ne lancer la migration que lorsque tout le code est prêt

---



## **Fichiers concernés**
- `/lib/journalSpirituelAPI.js`
- `/lib/parcoursJeuneAPI.js`
- `/pages/jeune.js`
- `/lib/cristallisationAPI_INCORRECT_NO_AUTH.js` (à archiver/supprimer si non utilisé)
- `/scripts/test-reprise-alimentaire.js` (test uniquement)

---

## **Fichiers concernés (usages à corriger AVANT migration)**

1. `/lib/journalSpirituelAPI.js`
	- Utilise getLocalUserId() qui retourne 'laurelle_test_user'
	- Plusieurs appels à getLocalUserId() pour lecture/écriture

2. `/lib/parcoursJeuneAPI.js`
	- Utilise getLocalUserId() qui retourne 'laurelle_test_user'
	- Plusieurs appels à getLocalUserId() pour lecture/écriture

3. `/lib/cristallisationAPI_INCORRECT_NO_AUTH.js`
	- Utilise getLocalUserId() et 'laurelle_test_user'
	- (Ce fichier semble être une ancienne version, à archiver ou supprimer si non utilisé)

4. `/pages/jeune.js`
	- Ligne 963 : user_id: null, // À remplir si Supabase auth activé
	- Ligne 1100-1101 : const userId = 'laurelle_test_user';

5. `/scripts/test-reprise-alimentaire.js`
	- const TEST_USER_ID = 'TEST_USER';
	- (OK pour test, à ne pas utiliser en production)

**À faire** :
- Remplacer tous les usages de getLocalUserId() et 'laurelle_test_user' par la récupération du vrai user_id Supabase Auth (via AuthContext ou supabase.auth.getUser()).
- Vérifier qu’aucun autre fichier n’utilise un user_id codé en dur ou local.

---

### Etape 1 — **Audit des risques préalable**
1. Risque : Oubli d’un helper ou d’un usage local → données non visibles ou non isolées après migration
2. Risque : Mélange d’anciens et nouveaux patterns (user_id local + user_id auth) → incohérence, bugs
3. Risque : Suppression ou écrasement accidentel de données existantes (ex : migration trop tôt)
4. Risque : Perte d’accès aux anciennes données si migration faite avant correction du code
5. Risque : Régression fonctionnelle sur les pages concernées

---

### Etape 2 — **Sous-checklist à valider systématiquement**
- [ ] Tous les helpers/fonctions user_id local/fixe sont identifiés et remplacés
- [ ] Tous les imports AuthContext ou supabase.auth.getUser sont présents
- [ ] Chaque requête (lecture/écriture) utilise le user_id dynamique
- [ ] Tests manuels sur chaque page/fonctionnalité modifiée

---

### Etape 3 — **Checklist stricte sécurité & qualité**
- [ ] Lecture complète de chaque fichier concerné
- [ ] Initialisation du user_id AVANT toute utilisation
- [ ] Vérification que plus aucun user_id local/fixe n’est utilisé
- [ ] Test de rendu, création, modification, suppression sur chaque page
- [ ] Vérification que les anciennes données sont toujours visibles après migration
- [ ] Rollback immédiat si anomalie

---

### Etape 4 — **Contrôles conformité à réaliser**
1. Vérifier que toutes les entrées d’anomalies rollback sont lues et prises en compte
2. Créer une checklist de contrôle pour chaque fichier modifié
3. Tester chaque cas limite (user_id null, session expirée, etc.)
4. Documenter toute anomalie ou écart

---

### Etape 5 — **Mise à jour de l’avancement**
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : ____ %
- Historique des mises à jour : ___

---

### Etape 6 — **Point de vigilance**
- Risque de perte d’accès aux anciennes données si migration lancée avant correction
- Risque de bug si mélange de patterns user_id
- Risque de suppression accidentelle de données si script de migration exécuté trop tôt

---

### Etape 7 — **Proposition de rollback**
- Si anomalie détectée, rollback immédiat (restauration backup, retour code précédent)
- Ajout d’une entrée dans le fichier ANOMALIE rollback

---

### Etape 8 — **Rapport Markdown Copilot**
- Générer un rapport AVANT/APRÈS pour chaque fichier modifié
- Lister les changements, les risques, les tests réalisés

---

### Etape 9 — **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___

---

## **Risque si on laisse l’ancien code (user_id local/fixe) :**
- Les anciennes données enregistrées avec 'laurelle_test_user' ou un id local NE seront PAS visibles pour le nouvel utilisateur authentifié après migration.
- Si tu lances la migration sans avoir corrigé ces usages, tu risques de perdre l’accès à toutes les anciennes données (elles resteront orphelines, non rattachées à ton vrai user_id Supabase).
- **Il est donc impératif de corriger tout le code AVANT migration.**

---

**Aucune modification de code ne doit être faite avant validation explicite de ce plan.**
