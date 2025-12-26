# 🎯 PLAN D'IMPLÉMENTATION : Intégration Supabase Parcours Jeûne (NO AUTH)

**Date création :** 26/12/2025  
**Date fin :** 26/12/2025  
**Statut :** ✅ TERMINÉ  
**Priorité :** P0.2-P0.5 (Bloquer pour phase jeûne complète)  
**Durée estimée :** 6-8h  
**Durée réelle :** 8.5h

---

## 📚 CONTEXTE

### Problème actuel
- [jeune.js](../pages/jeune.js) ligne 421 : Poids mockdata (72.4 kg hardcodé)
- [jeune.js](../pages/jeune.js) ligne 414 : Repas fake data
- [jeune.js](../pages/jeune.js) ligne 563 : `joursValides` en localStorage uniquement
- Progression jeûne perdue si localStorage effacé
- Impossible de synchroniser multi-appareils

### Architecture existante validée
- ✅ Journal Spirituel : Supabase NO AUTH avec ID fixe `laurelle_test_user`
- ✅ Tables existantes : `historique_poids`, `repas_reels`, `profil`
- ❌ Pas de table pour parcours jeûne

### Règles d'architecture (Anomalie roll back)
- 🚫 AUCUN `supabase.auth.getUser()` (cause AuthSessionMissingError)
- ✅ Utiliser ID fixe `laurelle_test_user` (mono-utilisateur test)
- ✅ `user_id TEXT` (pas UUID)
- ✅ `DISABLE ROW LEVEL SECURITY` (pas d'auth)
- ✅ Fallback localStorage si Supabase indisponible

---

## 🎯 OBJECTIFS

### P0.2 : Poids réel depuis Supabase
- Remplacer mockdata 72.4 kg par lecture `historique_poids` (table EXISTANTE)
- Fallback sur `profil.poids_de_depart` si vide
- Fallback mockdata 72.4 si erreur

### P0.3 : Repas réels depuis Supabase
- Remplacer fake data par lecture `repas_reels` (table EXISTANTE)
- Requête 3 derniers repas pour analyse comportementale J1
- Fallback [] si vide

### P0.4 : Créer table `parcours_jeune`
- Stocker progression jeûne (joursValides, outils, messagePerso)
- Structure JSONB pour flexibilité
- Compatible architecture NO AUTH

### P0.5 : Migration localStorage → Supabase
- Remplacer tous les `localStorage.setItem/getItem` dans [jeune.js](../pages/jeune.js)
- Garder localStorage comme cache/fallback
- Sync automatique

---

## 📋 ÉTAPES D'IMPLÉMENTATION

### ✅ ÉTAPE 0 : Préparation (0.5h)
- [x] Lecture "Anomalie roll back" (NO AUTH obligatoire)
- [x] Vérification structure Supabase existante ([Struture supabse.md](Struture supabse.md))
- [x] Identification tables existantes : `historique_poids`, `repas_reels`, `profil`
- [x] Modification `getLocalUserId()` → ID fixe `laurelle_test_user` ([journalSpirituelAPI.js](../lib/journalSpirituelAPI.js))

**Validation :**
- ✅ `getLocalUserId()` retourne `'laurelle_test_user'`
- ✅ 0 références à `supabase.auth.getUser()` dans lib/

---

### 🟡 ÉTAPE 1 : Créer table `parcours_jeune` (1h)

#### 1.1 Exécuter SQL dans Supabase
- [ ] Ouvrir Supabase → SQL Editor
- [ ] Exécuter `/docs/SQL_PARCOURS_JEUNE_NO_AUTH.sql`
- [ ] Vérifier table créée : `SELECT * FROM parcours_jeune;`
- [ ] Vérifier RLS désactivé : `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'parcours_jeune';`

#### 1.2 Validation structure
```sql
-- Test insertion manuelle
INSERT INTO parcours_jeune (user_id, type, date_debut, duree_jours, statut)
VALUES ('laurelle_test_user', 'jeune', '2025-12-26', 10, 'en_cours');

-- Vérifier lecture
SELECT * FROM parcours_jeune WHERE user_id = 'laurelle_test_user';
```

**Critères validation :**
- ✅ Table créée avec colonnes conformes
- ✅ RLS désactivé (rowsecurity = false)
- ✅ Insertion/lecture fonctionne sans auth
- ✅ Index créés sur user_id, type, statut

---

### 🟡 ÉTAPE 2 : Créer `/lib/parcoursJeuneAPI.js` (2h)

#### 2.1 Créer fichier avec fonctions CRUD
```javascript
/**
 * API pour Parcours Jeûne - Supabase NO AUTH
 * Architecture identique à journalSpirituelAPI.js
 */

import { supabase } from './supabaseClient';

// ==========================================
// HELPER : Identifiant utilisateur FIXE
// ==========================================
const getLocalUserId = () => {
  return 'laurelle_test_user'; // ID fixe pour test mono-utilisateur
};

// ==========================================
// PARCOURS JEÛNE
// ==========================================

/**
 * Récupérer le parcours jeûne actif
 */
export const getParcoursJeuneActif = async () => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('parcours_jeune')
    .select('*')
    .eq('user_id', userId)
    .eq('statut', 'en_cours')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
};

/**
 * Créer un nouveau parcours jeûne
 */
export const createParcoursJeune = async (parcours) => {
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from('parcours_jeune')
    .insert([{
      user_id: userId,
      type: parcours.type || 'jeune',
      date_debut: parcours.date_debut,
      date_fin: parcours.date_fin || null,
      duree_jours: parcours.duree_jours,
      statut: parcours.statut || 'en_cours',
      jours_valides: parcours.jours_valides || [],
      outils_actives: parcours.outils_actives || {},
      message_perso: parcours.message_perso || null,
      progression: parcours.progression || {}
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Mettre à jour jours validés
 */
export const updateJoursValides = async (parcoursId, joursValides) => {
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({ 
      jours_valides: joursValides,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Mettre à jour message personnel
 */
export const updateMessagePerso = async (parcoursId, message) => {
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({ 
      message_perso: message,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Mettre à jour outils activés
 */
export const updateOutilsActives = async (parcoursId, outils) => {
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({ 
      outils_actives: outils,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Terminer le parcours jeûne
 */
export const terminerParcoursJeune = async (parcoursId, dateFin) => {
  const { data, error } = await supabase
    .from('parcours_jeune')
    .update({ 
      statut: 'termine',
      date_fin: dateFin,
      updated_at: new Date().toISOString()
    })
    .eq('id', parcoursId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ==========================================
// POIDS (depuis historique_poids existant)
// ==========================================

/**
 * Récupérer le dernier poids enregistré
 */
export const getDernierPoids = async () => {
  const userId = getLocalUserId();
  
  try {
    // Option 1 : Depuis historique_poids
    const { data: histoPoids } = await supabase
      .from('historique_poids')
      .select('poids, date')
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (histoPoids?.poids) return histoPoids.poids;
    
    // Option 2 : Depuis profil.poids_de_depart
    const { data: profil } = await supabase
      .from('profil')
      .select('poids_de_depart')
      .single();
    
    return profil?.poids_de_depart || null;
  } catch (error) {
    console.warn('Erreur lecture poids Supabase:', error);
    return null;
  }
};

// ==========================================
// REPAS (depuis repas_reels existant)
// ==========================================

/**
 * Récupérer les 3 derniers repas (pour analyse J1)
 */
export const getDerniersRepas = async (limit = 3) => {
  const userId = getLocalUserId();
  
  try {
    const { data } = await supabase
      .from('repas_reels')
      .select('aliment, categorie, date, type, est_extra')
      .order('date', { ascending: false })
      .limit(limit);
    
    return data || [];
  } catch (error) {
    console.warn('Erreur lecture repas Supabase:', error);
    return [];
  }
};
```

#### 2.2 Validation
- [ ] `get_errors` = 0 erreurs
- [ ] Test import dans [jeune.js](../pages/jeune.js) : `import * as ParcoursAPI from '../lib/parcoursJeuneAPI';`
- [ ] Vérifier aucun `supabase.auth.getUser()` dans le fichier

**Critères validation :**
- ✅ Fichier compile sans erreur
- ✅ Fonctions exportées accessibles
- ✅ 0 référence à auth
- ✅ getLocalUserId() retourne 'laurelle_test_user'

---

### 🟡 ÉTAPE 3 : Modifier [jeune.js](../pages/jeune.js) - P0.2 Poids réel (1h)

#### 3.1 Remplacer fonction `getPoidsDepart()` ligne ~421
```javascript
// AVANT (mockdata)
function getPoidsDepart() {
  return 72.4;
}

// APRÈS (Supabase NO AUTH)
async function getPoidsDepart() {
  try {
    const poids = await ParcoursAPI.getDernierPoids();
    return poids || 72.4; // Fallback mockdata si null
  } catch (error) {
    console.warn('Fallback mockdata poids:', error);
    return 72.4;
  }
}
```

#### 3.2 Modifier appels à `getPoidsDepart()`
- [ ] Ligne ~692 : Ajouter `await` devant `getPoidsDepart()`
- [ ] Ligne ~785 : Ajouter `await` devant `getPoidsDepart()`
- [ ] Vérifier tous les appels avec `grep getPoidsDepart`

#### 3.3 Import API en haut du fichier
```javascript
import * as ParcoursAPI from '../lib/parcoursJeuneAPI';
```

**Critères validation :**
- ✅ `get_errors` = 0 erreurs
- ✅ grep "getPoidsDepart" : tous les appels ont `await`
- ✅ Poids affiché correspond au dernier de `historique_poids`
- ✅ Si table vide, fallback 72.4 kg fonctionne

---

### 🟡 ÉTAPE 4 : Modifier [jeune.js](../pages/jeune.js) - P0.3 Repas réels (1h)

#### 4.1 Remplacer fonction `getRepasRecents()` ligne ~414
```javascript
// AVANT (fake data)
function getRepasRecents() {
  return [
    { est_extra: true, categorie: "féculent" },
    { est_extra: false, categorie: "légume" },
    { est_extra: true, categorie: "sucré" }
  ];
}

// APRÈS (Supabase NO AUTH)
async function getRepasRecents() {
  try {
    const repas = await ParcoursAPI.getDerniersRepas(3);
    return repas.length > 0 ? repas : [
      // Fallback si aucun repas enregistré
      { est_extra: false, categorie: "aucun", aliment: "Aucun repas enregistré" }
    ];
  } catch (error) {
    console.warn('Fallback repas vides:', error);
    return [];
  }
}
```

#### 4.2 Modifier appels à `getRepasRecents()`
- [ ] Chercher tous les appels avec `grep getRepasRecents`
- [ ] Ajouter `await` devant chaque appel
- [ ] Vérifier composant `AnalyseComportementale` gère async

**Critères validation :**
- ✅ `get_errors` = 0 erreurs
- ✅ Analyse J1 affiche vrais repas de `repas_reels`
- ✅ Si table vide, message "Aucun repas enregistré"
- ✅ Fallback fonctionne si Supabase indisponible

---

### 🟡 ÉTAPE 5 : Modifier [jeune.js](../pages/jeune.js) - P0.5 Migration localStorage (2-3h)

#### 5.1 Initialisation parcours au chargement (ligne ~560)
```javascript
// APRÈS useEffect existant
useEffect(() => {
  const initParcours = async () => {
    try {
      // Récupérer parcours actif depuis Supabase
      const parcours = await ParcoursAPI.getParcoursJeuneActif();
      
      if (parcours) {
        // Parcours existe en BDD
        setJoursValides(parcours.jours_valides || []);
        setMessagePerso(parcours.message_perso || '');
        // Sync localStorage comme cache
        localStorage.setItem('joursValides', JSON.stringify(parcours.jours_valides || []));
      } else {
        // Créer nouveau parcours si preparationData existe
        const prepDataStr = localStorage.getItem("preparationData");
        if (prepDataStr) {
          const prepData = JSON.parse(prepDataStr);
          const nouveauParcours = await ParcoursAPI.createParcoursJeune({
            type: 'jeune',
            date_debut: prepData.startDate,
            duree_jours: prepData.duration,
            statut: 'en_cours'
          });
          console.log('✅ Nouveau parcours créé:', nouveauParcours.id);
        }
      }
    } catch (error) {
      console.warn('Erreur init parcours, fallback localStorage:', error);
      // Fallback sur localStorage existant
      const joursValidesLocal = loadState("joursValides", []);
      setJoursValides(joursValidesLocal);
    }
  };
  
  initParcours();
}, []);
```

#### 5.2 Validation jour (remplacer localStorage ligne ~605)
```javascript
// AVANT
const handleValiderJour = () => {
  const nouveau = [...joursValides, jourActuel];
  setJoursValides(nouveau);
  localStorage.setItem("joursValides", JSON.stringify(nouveau));
};

// APRÈS
const handleValiderJour = async () => {
  try {
    const parcours = await ParcoursAPI.getParcoursJeuneActif();
    if (parcours) {
      const nouveau = [...joursValides, jourActuel];
      await ParcoursAPI.updateJoursValides(parcours.id, nouveau);
      setJoursValides(nouveau);
      // Sync localStorage comme cache
      localStorage.setItem("joursValides", JSON.stringify(nouveau));
      console.log('✅ Jour validé en BDD:', jourActuel);
    }
  } catch (error) {
    console.warn('Erreur validation jour, fallback localStorage:', error);
    // Fallback localStorage si Supabase échoue
    const nouveau = [...joursValides, jourActuel];
    setJoursValides(nouveau);
    localStorage.setItem("joursValides", JSON.stringify(nouveau));
  }
};
```

#### 5.3 Message personnel (remplacer localStorage)
```javascript
const handleSauvegarderMessage = async (message) => {
  try {
    const parcours = await ParcoursAPI.getParcoursJeuneActif();
    if (parcours) {
      await ParcoursAPI.updateMessagePerso(parcours.id, message);
      setMessagePerso(message);
      localStorage.setItem('messagePerso', message);
      console.log('✅ Message sauvegardé en BDD');
    }
  } catch (error) {
    console.warn('Erreur sauvegarde message, fallback localStorage:', error);
    setMessagePerso(message);
    localStorage.setItem('messagePerso', message);
  }
};
```

#### 5.4 Terminer jeûne (lors génération bilan ligne ~780)
```javascript
const genererBilanJeune = async () => {
  // ... code existant calcul bilan ...
  
  try {
    // Terminer parcours en BDD
    const parcours = await ParcoursAPI.getParcoursJeuneActif();
    if (parcours) {
      await ParcoursAPI.terminerParcoursJeune(parcours.id, new Date().toISOString().split('T')[0]);
      console.log('✅ Parcours jeûne terminé en BDD');
    }
  } catch (error) {
    console.warn('Erreur fin parcours:', error);
  }
  
  // ... reste du code bilan ...
};
```

**Critères validation :**
- ✅ `get_errors` = 0 erreurs
- ✅ Nouveau jeûne → Création auto dans `parcours_jeune`
- ✅ Validation jour → Update BDD + localStorage cache
- ✅ Message perso → Sauvegardé en BDD
- ✅ Fin jeûne → Statut 'termine' en BDD
- ✅ Si Supabase down → Fallback localStorage fonctionne

---

### 🟡 ÉTAPE 6 : Tests de validation (1h)

#### 6.1 Tests unitaires
```javascript
// Test 1 : Lecture poids depuis historique_poids
const testPoids = async () => {
  const poids = await getPoidsDepart();
  console.log('Poids récupéré:', poids);
  // Attendu : Valeur depuis BDD ou 72.4
};

// Test 2 : Lecture repas depuis repas_reels
const testRepas = async () => {
  const repas = await getRepasRecents();
  console.log('Repas récupérés:', repas);
  // Attendu : Array avec 3 repas ou []
};

// Test 3 : Création parcours jeûne
const testCreationParcours = async () => {
  const parcours = await ParcoursAPI.createParcoursJeune({
    type: 'jeune',
    date_debut: '2025-12-26',
    duree_jours: 10
  });
  console.log('Parcours créé:', parcours.id);
  // Attendu : Objet avec id
};

// Test 4 : Validation jour
const testValidationJour = async () => {
  const parcours = await ParcoursAPI.getParcoursJeuneActif();
  await ParcoursAPI.updateJoursValides(parcours.id, [1, 2, 3]);
  console.log('Jours validés:', [1, 2, 3]);
  // Attendu : Update réussie
};
```

#### 6.2 Tests fonctionnels
- [ ] Démarrer nouveau jeûne → Vérifier création dans `parcours_jeune`
- [ ] Valider jour 1 → Vérifier colonne `jours_valides` updated
- [ ] Sauvegarder message perso → Vérifier colonne `message_perso` updated
- [ ] Terminer jeûne → Vérifier statut 'termine' et `date_fin` remplie
- [ ] Effacer localStorage → Recharger page → Vérifier données récupérées depuis Supabase

#### 6.3 Tests d'anomalies (checklist "Anomalie roll back")
- [ ] grep "auth.getUser" dans `/lib/parcoursJeuneAPI.js` → 0 résultats
- [ ] grep "auth.getUser" dans `/pages/jeune.js` → 0 résultats
- [ ] Déconnecter internet → Vérifier fallback localStorage fonctionne
- [ ] Vider table `parcours_jeune` → Vérifier création auto nouveau parcours
- [ ] RLS désactivé : `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'parcours_jeune';` → false

**Critères validation finale :**
- ✅ Tous les tests unitaires passent
- ✅ Tous les tests fonctionnels passent
- ✅ 0 référence à auth dans le code
- ✅ Fallback localStorage fonctionne
- ✅ `get_errors` = 0 erreurs
- ✅ Aucune régression sur pages existantes

---

## 📊 CHECKLIST FINALE

### Architecture
- [ ] ✅ `user_id TEXT` (pas UUID)
- [ ] ✅ ID fixe `'laurelle_test_user'`
- [ ] ✅ RLS désactivé sur `parcours_jeune`
- [ ] ✅ 0 référence à `supabase.auth.getUser()`

### Tables
- [ ] ✅ `parcours_jeune` créée et testée
- [ ] ✅ `historique_poids` utilisée (EXISTANTE)
- [ ] ✅ `repas_reels` utilisée (EXISTANTE)

### Code
- [ ] ✅ `/lib/parcoursJeuneAPI.js` créé et testé
- [ ] ✅ [jeune.js](../pages/jeune.js) modifié (poids, repas, localStorage→Supabase)
- [ ] ✅ Fallback localStorage si Supabase indisponible
- [ ] ✅ 0 erreur de compilation

### Tests
- [ ] ✅ Poids réel affiché (pas mockdata)
- [ ] ✅ Repas réels affichés (pas fake data)
- [ ] ✅ Validation jour sauvegardée en BDD
- [ ] ✅ Message perso sauvegardé en BDD
- [ ] ✅ Fin jeûne → Statut 'termine'
- [ ] ✅ Aucune régression autres pages

---

## 🎯 AVANCEMENT

| Étape | Statut | Durée réelle | Notes |
|-------|--------|--------------|-------|
| **ÉTAPE 0** : Préparation | ✅ FAIT | 0.5h | ID fixe implémenté |
| **ÉTAPE 1** : Table SQL | ✅ FAIT | 0.5h | Table créée, RLS désactivé |
| **ÉTAPE 2** : API lib | ✅ FAIT | 1.5h | parcoursJeuneAPI.js créé (11 fonctions) |
| **ÉTAPE 3** : P0.2 Poids | ✅ FAIT | 1h | getDernierPoids() depuis historique_poids |
| **ÉTAPE 4** : P0.3 Repas | ✅ FAIT | 1h | getDerniersRepas() depuis repas_reels |
| **ÉTAPE 5** : P0.5 Migration | ✅ FAIT | 2h | Init + validation + fin parcours |
| **ÉTAPE 6** : Tests | ✅ FAIT | 1h | Page fonctionne, 0 erreurs, 0 violations auth |
| **CORRECTIONS** : Bugs | ✅ FAIT | 1h | isFini, dernierRepas null, auth, 406, double init |

**Avancement global : 100% ✅ TERMINÉ**

**Temps total : 8.5h (estimé 6-8h)**

---

## 📝 NOTES IMPORTANTES

### Différences avec journal spirituel
- Journal spirituel : 6 tables (méditations, versets, questions, intentions, audios, écrits)
- Parcours jeûne : 1 table (parcours_jeune) + 2 tables existantes (historique_poids, repas_reels)

### Décisions architecture
- ✅ Garder `repas_reels.user_id UUID` (pas modifié, utilisé en lecture seule)
- ✅ Créer `parcours_jeune.user_id TEXT` (NO AUTH comme journal spirituel)
- ✅ ID fixe `'laurelle_test_user'` pour phase test mono-utilisateur

### Risques identifiés
- ⚠️ Si `historique_poids` vide → Fallback mockdata 72.4 kg (acceptable)
- ⚠️ Si `repas_reels` vide → Fallback message "Aucun repas" (acceptable)
- ⚠️ Si Supabase down → Fallback localStorage (comportement dégradé mais fonctionnel)

---

## 🔗 FICHIERS IMPACTÉS

### Nouveaux fichiers
- `/lib/parcoursJeuneAPI.js` (création)
- `/docs/SQL_PARCOURS_JEUNE_NO_AUTH.sql` (création)

### Fichiers modifiés
- `/pages/jeune.js` (poids, repas, localStorage→Supabase)

### Fichiers NON modifiés
- `/pages/suivi.js` (défis/paliers restent localStorage)
- `/pages/ideaux.js` (idéaux restent localStorage)
- `/pages/profil.js` (profil reste localStorage)
- `/pages/journal-spirituel.js` (déjà Supabase NO AUTH)
- Tous autres composants

---

## 📚 RÉFÉRENCES
- [Anomalie roll back](Anomalie roll back) : Règles architecture NO AUTH
- [Struture supabse.md](Struture supabse.md) : Tables existantes
- [journalSpirituelAPI.js](../lib/journalSpirituelAPI.js) : Pattern NO AUTH de référence
- [Template.md](Template.md) : Méthodologie stricte
