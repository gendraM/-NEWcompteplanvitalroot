# Rapport migration user_id — Avant/Après

---

## 1. pages/jeune.js

### Avant correction

```javascript
// ...
const bilan = {
  user_id: null, // À remplir si Supabase auth activé
  // ...
};
// ...
// NO AUTH : utiliser l'ID fixe 'laurelle_test_user'
const userId = 'laurelle_test_user';
// ...
programmeSauvegarde = await genererEtSauvegarderProgramme(userId, { ... });
// ...
```

### Après correction

```javascript
// ...
// Récupérer le user_id dynamique depuis Supabase Auth
const { data: { user } } = await supabase.auth.getUser();
const user_id = user?.id || null;
const bilan = {
  user_id,
  // ...
};
// ...
// AUTH : utiliser le vrai user_id Supabase
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id || null;
// ...
programmeSauvegarde = await genererEtSauvegarderProgramme(userId, { ... });
// ...
```

---

## 2. lib/cristallisationAPI_INCORRECT_NO_AUTH.js

### Avant correction

```javascript
/**
 * ============================================================================
 * API CRISTALLISATION - Supabase
 * ============================================================================
 * 
 * Gestion phase cristallisation (45 jours post-reprise)
 * Pattern: NO AUTH (user_id fixe: 'laurelle_test_user')
 * Inspiré de journalSpirituelAPI.js
 * 
 * Date: 26 Décembre 2025
 * 
 * ============================================================================
 */
const getLocalUserId = () => {
  // Version FIXE pour test mono-utilisateur
  return 'laurelle_test_user';
};
// ...utilisation de getLocalUserId() dans toutes les requêtes...
```

### Après correction (archivage)

```javascript
/**
 * ============================================================================
 * ARCHIVÉ : API CRISTALLISATION (NO AUTH, user_id fixe)
 * ============================================================================
 *
 * ⚠️ Ce fichier est obsolète et ne doit plus être utilisé.
 * Il utilisait un user_id fixe ('laurelle_test_user') et n'est PAS compatible avec l'authentification multi-utilisateur Supabase.
 *
 * → Utiliser cristallisationAPI.js pour toute nouvelle intégration.
 *
 * Date d'archivage : 12 janvier 2026
 * ============================================================================
 */
// ARCHIVÉ : Ce fichier n'est plus maintenu. Voir cristallisationAPI.js
```

---

## 3. lib/journalSpirituelAPI.js & lib/parcoursJeuneAPI.js

- Tous les usages de getLocalUserId ou user_id fixe ont été supprimés.
- Toutes les fonctions requièrent désormais un userId dynamique passé en paramètre.

---

**Traçabilité assurée : chaque zone modifiée est documentée avant/après.**
