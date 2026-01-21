# 🟢 PLAN D'IMPLÉMENTATION — Bilan Mensuel

**Date création :** 21 janvier 2026  
**Statut :** ⏳ À valider par utilisateur  
**Priorité :** 🟡 Moyenne (fonctionnalité future)

---

## Titre de la tâche  
Créer système de bilan mensuel avec vision macro-tendances et projection mois suivant

---

## **Description précise de la modification attendue**

### Objectif
Implémenter un bilan mensuel automatique qui s'affiche après validation de la dernière semaine du mois, offrant une vision macro (tendances, patterns, projection) complémentaire aux bilans hebdomadaires détaillés.

### Fonctionnalités attendues

**1. Détection automatique fin de mois**
- Identifier quand validation semaine = dernière du mois
- Logique : Si lundi suivant est dans mois suivant → déclencher bilan mensuel
- Fonctionne quel que soit jour fin de mois (28, 29, 30, 31)

**2. Pop-up notification**
- Après validation bilan hebdo dernière semaine
- Message : "Bravo ! Ton bilan mensuel de [Mois] est maintenant disponible"
- Bouton : "Voir mon bilan du mois"

**3. Modale bilan mensuel (6 sections)**
- Section 1 : Tendance Poids & Objectif (évolution, trajectoire, projection)
- Section 2 : Budget Calorique Mensuel (total consommé vs budget, répartition repas/extras)
- Section 3 : Patterns Comportementaux (forces, points amélioration, insights temporels)
- Section 4 : Qualité Nutritionnelle Globale (répartition QN, progression vs N-1)
- Section 5 : Ressenti & Bien-être (humeur/satiété agrégés, identification semaines critiques)
- Section 6 : Projection Mois Prochain (objectifs, ajustements stratégiques, points contrôle)

**4. Accès bilan hebdo depuis bilan mensuel**
- Lien/bouton : "Consulter aussi : Bilan détaillé de la semaine X"
- Permet navigation entre vision macro (mensuel) et micro (hebdo)

**5. Historique bilans mensuels**
- Archivage bilans mensuels précédents
- Consultation mois antérieurs (janvier, décembre, novembre...)
- Comparaison N vs N-1 possible

### Approche technique validée

**Option A : Semaines fixes + Filtrage date précis**
- Validation hebdo : Toujours dimanche (ex: S4 = 27 janv - 2 fév)
- Stats mensuelles : Filtrage par date calendaire exacte (1er-31 janvier)
- Pas de semaines courtes, cohérence statistique garantie
- Simplicité UX : Routine validation claire pour utilisateur

---

## **Fichiers concernés**

### Fichiers à créer
- `/components/BilanMensuelModal.js` (nouveau composant modale)
- `/components/PopupBilanMensuel.js` (nouveau composant pop-up notification)
- `/lib/calculsBilanMensuel.js` (fonctions agrégation stats mensuelles)
- `/lib/detectionFinMois.js` (logique détection dernière semaine)

### Fichiers à modifier
- `/pages/suivi.js` (intégration détection + déclenchement pop-up)
- `/lib/validationSemaine.js` (ajout fonction `estDerniereValidationDuMois`)
- `/components/BilanHebdoModal.js` (ajout lien accès depuis bilan mensuel)

### Fichiers à consulter
- `/lib/routeurPoids.js` (calculs BMR/TDEE/objectifs)
- `/data/referentiel.js` (scores QN pour agrégation)

---

## Etape 1 — **Audit des risques préalable**

### Risques techniques

**1. Performance base de données**
- **Risque :** Requête agrégation 30 jours (93 repas) peut être lente
- **Impact :** Chargement bilan mensuel > 3 secondes
- **Mitigation :** Indexation colonne `date` table `repas_reels`, pagination résultats

**2. Calculs statistiques complexes**
- **Risque :** Calcul mode statistique (humeur dominante), patterns temporels peuvent bugger avec données manquantes
- **Impact :** Affichage données incohérentes ou erreurs runtime
- **Mitigation :** Gestion cas null/undefined, valeurs par défaut, validation données avant calcul

**3. Chevauchement semaine/mois**
- **Risque :** Semaine 4 (27 janv - 2 fév) : 5 jours en janvier, 2 en février
- **Impact :** Double comptage repas ou exclusion incorrecte
- **Mitigation :** Filtrage strict par date calendaire (WHERE date BETWEEN '2026-01-01' AND '2026-01-31')

**4. Synchronisation états React**
- **Risque :** Pop-up s'affiche avant fermeture modale hebdo → conflits visuels
- **Impact :** UX dégradée, modales superposées
- **Mitigation :** setTimeout 500ms après fermeture modale hebdo

### Risques UX

**1. Confusion utilisateur**
- **Risque :** Utilisateur ne comprend pas différence bilan hebdo vs mensuel
- **Impact :** Consultation répétée, incompréhension données
- **Mitigation :** Message explicatif dans pop-up, section aide "Quelle différence ?"

**2. Perte accès bilan hebdo**
- **Risque :** Utilisateur veut consulter S4 mais trouve que bilan mensuel
- **Impact :** Frustration, données détaillées inaccessibles
- **Mitigation :** Lien clair "Consulter bilan semaine 4" dans bilan mensuel

**3. Surcharge informations**
- **Risque :** 6 sections + verbatims longs = trop d'infos d'un coup
- **Impact :** Abandon lecture, non-appropriation insights
- **Mitigation :** Sections collapsibles (accordéon), résumé 3 lignes par section

### Risques robustesse

**1. Données incomplètes**
- **Risque :** Mois avec seulement 10 jours de données (utilisateur commence app en cours de mois)
- **Impact :** Stats faussées, moyennes non représentatives
- **Mitigation :** Affichage "Données partielles : 10/30 jours" + message avertissement

**2. Migration anciens bilans**
- **Risque :** Bilans hebdo existants non migrés vers format agrégeable
- **Impact :** Bilan mensuel vide pour mois passés
- **Mitigation :** Script migration base données, génération rétroactive si données disponibles

**3. Cas mois incomplet (premier mois utilisateur)**
- **Risque :** Utilisateur crée compte 20 janvier → bilan mensuel 20-31 = 11 jours seulement
- **Impact :** Comparaison N vs N-1 impossible, moyennes biaisées
- **Mitigation :** Message "Premier mois incomplet, comparaison disponible dès février"

### Risques sécurité

**1. Injection SQL agrégation**
- **Risque :** Filtres date vulnérables si non paramétrés
- **Impact :** Faille sécurité potentielle
- **Mitigation :** Utilisation requêtes préparées Supabase (paramètres liés)

**2. Exposition données autres utilisateurs**
- **Risque :** Requête agrégation sans filtre user_id
- **Impact :** Fuite données confidentielles
- **Mitigation :** Clause WHERE user_id systématique, vérification RLS Supabase

### Risques accessibilité

**1. Navigation clavier pop-up**
- **Risque :** Pop-up non accessible Tab/Enter/Escape
- **Impact :** Utilisateurs clavier/screen reader bloqués
- **Mitigation :** Attributs ARIA, focus trap, gestion Escape

**2. Contraste couleurs sections**
- **Risque :** Graphiques/badges faible contraste
- **Impact :** Non-conformité WCAG AA
- **Mitigation :** Tests contraste systématiques (ratio ≥ 4.5:1)

### Ordre hooks React

**⚠️ VIGILANCE CRITIQUE :** Tous les hooks doivent être déclarés en haut du composant AVANT toute utilisation

**BilanMensuelModal.js (nouveau composant) :**
```javascript
// ✅ ORDRE CORRECT
function BilanMensuelModal({ mois, annee, onClose }) {
  // 1. TOUS LES HOOKS D'ABORD
  const [sectionOuverte, setSectionOuverte] = useState(null);
  const [donneesMensuelles, setDonneesMensuelles] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    chargerDonneesMensuelles();
  }, [mois, annee]); // ✅ Dépendances déclarées APRÈS hooks
  
  // 2. FONCTIONS MÉTIER
  const chargerDonneesMensuelles = async () => { ... };
  const calculerTendancePoids = () => { ... };
  
  // 3. HANDLERS
  const handleToggleSection = (section) => { ... };
  const handleConsulterBilanHebdo = () => { ... };
  
  // 4. RENDU
  return (...);
}
```

**pages/suivi.js (modification existante) :**
- ⚠️ **VÉRIFIER** : `useState` pour pop-up déclaré AVANT tous les useEffect existants
- ⚠️ **VÉRIFIER** : Fonction `estDerniereValidationDuMois` importée AVANT utilisation dans useEffect

### Risques de régression

**1. Bilan hebdo existant**
- **Risque :** Modifications pages/suivi.js cassent logique validation hebdo
- **Impact :** Perte fonctionnalité critique
- **Mitigation :** Tests non-régression complets, validation S1-S4 avant/après

**2. Performance page suivi**
- **Risque :** Ajout requêtes détection fin mois ralentit chargement page
- **Impact :** UX dégradée sur page principale
- **Mitigation :** Requête détection uniquement si validation en cours (conditional)

---

## Etape 2 — **Sous-checklist à valider systématiquement**

### Imports et dépendances

- [ ] `useState`, `useEffect`, `useCallback` importés dans BilanMensuelModal.js
- [ ] `supabase` importé et initialisé
- [ ] Fonction `estDerniereValidationDuMois` importée dans suivi.js depuis validationSemaine.js
- [ ] Fonctions calcul agrégé importées depuis calculsBilanMensuel.js
- [ ] Composant `PopupBilanMensuel` importé dans suivi.js
- [ ] Composant `BilanMensuelModal` importé dans suivi.js

### Déclarations avant usage

- [ ] Tous les `useState` déclarés en haut de chaque composant
- [ ] Tous les `useEffect` déclarés APRÈS tous les useState
- [ ] Toutes les fonctions métier déclarées AVANT leur utilisation dans hooks
- [ ] Tous les handlers déclarés AVANT leur utilisation dans rendu JSX
- [ ] Variables `mois`, `annee` passées en props AVANT leur utilisation dans calculs

### Gestion états asynchrones

- [ ] État `loading` initialisé à `true` pour chaque requête asynchrone
- [ ] État `error` géré avec message utilisateur clair
- [ ] Cleanup useEffect pour requêtes annulées (éviter memory leaks)
- [ ] Gestion cas données vides (aucun repas ce mois)

### Validation données

- [ ] Vérification `mois` valide (1-12)
- [ ] Vérification `annee` valide (> 2020, < 2100)
- [ ] Vérification résultat requête non null avant calculs
- [ ] Gestion cas tableau vide (0 repas) sans crash

---

## Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**

### Lecture code existant

- [ ] Lecture complète `pages/suivi.js` (lignes validation semaine, setBilanData)
- [ ] Lecture complète `lib/validationSemaine.js` (fonctions existantes, exports)
- [ ] Identification tous les hooks existants dans suivi.js (ordre actuel)
- [ ] Identification dépendances critiques (Supabase, routeurPoids, referentiel)

### Initialisation avant usage

- [ ] Tous les hooks React déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Jamais de hook dans fonction, boucle, map, if, condition
- [ ] **Aucune variable d'état ou de hook utilisée avant sa déclaration, y compris dans dépendances autres hooks**
- [ ] Ordre strict : useState → useEffect → fonctions métier → handlers → rendu

### Séparation étapes

- [ ] Initialisation (useState, useEffect) : lignes 1-50
- [ ] Logique calculée (fonctions métier) : lignes 51-150
- [ ] Handlers (onClick, onChange) : lignes 151-200
- [ ] Rendu JSX : lignes 201+

### Vérifications fonctions/handlers

- [ ] Toute fonction utilisée dans rendu est présente et initialisée avant usage
- [ ] Toute fonction asynchrone gère try/catch avec message erreur utilisateur
- [ ] Pas de déclaration fonction dans boucle ou condition

### Ordre et portée logiques

- [ ] Jamais déclaration prématurée (variable utilisée avant création)
- [ ] Jamais appel prématuré (fonction appelée avant déclaration)
- [ ] Portée variables respectée (pas de variable locale utilisée en global)

### Doublons et superflu

- [ ] Pas de doublons `useState` (même variable déclarée 2×)
- [ ] Pas de doublons `useEffect` (même logique 2×)
- [ ] Pas de déclarations superflues (variables jamais utilisées)

### Contrôles d'erreur

- [ ] Compilation : `npm run build` sans erreur
- [ ] Runtime : Tests navigateur sans ReferenceError, TypeError
- [ ] SSR : Tests avec `npm run start` (si applicable)
- [ ] Console : Aucun warning React (hooks, dépendances, etc.)

### Tests rendu

- [ ] Cas nominal : Mois complet 30 jours, toutes données présentes
- [ ] Cas limite 1 : Mois incomplet (10 jours seulement)
- [ ] Cas limite 2 : Aucun repas saisi ce mois
- [ ] Cas limite 3 : Validation en retard (5 février, mais validation janvier)
- [ ] Cas limite 4 : Premier mois utilisateur (pas de comparaison N-1)

### Préservation fonctionnalités existantes

- [ ] Validation bilan hebdo fonctionne toujours (S1-S4)
- [ ] Calculs apportsTotaux, extrasInfo, joursRespectes inchangés
- [ ] Modale bilan hebdo s'affiche toujours correctement
- [ ] Pas de suppression code existant sans justification documentée

### Mise à jour avancement

- [ ] Pourcentage avancement MAJ après chaque étape (détection, pop-up, modale, historique)
- [ ] Historique dates modifications documenté

### Anomalies et rollback

- [ ] Toute anomalie → Rollback immédiat
- [ ] Rapport anomalie avec contexte, date, heure dans fichier ANOMALIE
- [ ] Aucune suppression dans fichier anomalie (ajout fin de fichier uniquement)

### Documentation

- [ ] Chaque étape documentée (détection, calculs, affichage)
- [ ] Chaque validation documentée (tests, cas limites)
- [ ] Chaque action automatisée documentée (génération stats, pop-up)

### Relecture manuelle

- [ ] Relecture **manuelle ligne par ligne** déclarations hooks AVANT chaque utilisation
- [ ] NE PAS se baser sur mémoire modèle Copilot
- [ ] Vérification visuelle ordre hooks dans fichier

### Validation utilisateur

- [ ] Plan complet présenté à utilisateur AVANT toute implémentation
- [ ] Validation explicite utilisateur requise
- [ ] Toutes cases ci-dessus cochées et documentées avant de poursuivre

---

## Etape 4 — **Contrôles conformité à réaliser (en suivant l'ordre ci-dessous)**

### 4.1 - Lecture fichier anomalies rollback

**Action :** Consulter `/docs/ANOMALIE_ROLLBACK.md` (ou équivalent) pour identifier anomalies passées similaires

**Points de vigilance identifiés :**
- Vérifier si anomalies ordre hooks déjà rencontrées (ex: RepasBloc.js)
- Vérifier si problèmes performance requêtes agrégation déjà signalés
- Vérifier si conflits modales superposées déjà documentés

**Résultat attendu :** Liste anomalies pertinentes + checklist prévention

### 4.2 - Création checklist prévention

**Basé sur analyse anomalies passées :**

- [ ] Hook utilisé avant déclaration → Vérifier ordre hooks avant commit
- [ ] Requête lente agrégation → Tester performance avec 100+ repas
- [ ] Modale superposée → Tester setTimeout fermeture avant ouverture suivante
- [ ] Memory leak useEffect → Vérifier cleanup fonction retour
- [ ] Données manquantes crash → Gestion cas null/undefined systématique

### 4.3 - Analyse audit risques

**Anomalies bloquantes identifiées :**
- ❌ AUCUNE pour l'instant (fonctionnalité nouvelle)

**Anomalies non-bloquantes à surveiller :**
- ⚠️ Performance requête agrégation (migration si besoin)
- ⚠️ Chevauchement semaine/mois (tests validation critiques)

**Décision :** ✅ Aucune anomalie bloquante, implémentation peut démarrer après validation utilisateur

### 4.4 - Proposition rollback si anomalie détectée

**Scénario 1 : Erreur compilation après ajout détection fin mois**
- **Rollback :** `git revert` commit ajout fonction `estDerniereValidationDuMois`
- **Alternative :** Corriger fonction avant nouveau commit
- **Documentation :** Anomalie + date/heure dans fichier rollback

**Scénario 2 : Pop-up bloque interface (modal freeze)**
- **Rollback :** Désactiver déclenchement pop-up (commentaire code)
- **Alternative :** Revoir logique setTimeout + gestion états
- **Documentation :** Anomalie + capture écran + logs console

**Scénario 3 : Requête agrégation timeout (>5s)**
- **Rollback :** Désactiver calculs lourds (patterns, QN)
- **Alternative :** Optimiser requête (index, pagination)
- **Documentation :** Anomalie + explain plan SQL

### 4.5 - Tests conformité

**Tests sauvegarde/restauration :**
- [ ] Bilans mensuels sauvegardés en base données (table `bilans_mensuels`)
- [ ] Consultation bilans mois antérieurs fonctionne
- [ ] Pas de perte données si fermeture modale avant fin chargement

**Tests accessibilité :**
- [ ] Navigation clavier (Tab, Enter, Escape) pop-up + modale
- [ ] Attributs ARIA (aria-label, aria-expanded, role)
- [ ] Contraste couleurs WCAG AA (≥ 4.5:1)
- [ ] Screen reader annonce sections correctement

**Tests non-régression :**
- [ ] Bilan hebdo S1-S4 fonctionne toujours
- [ ] Validation semaine en milieu de mois ne déclenche pas pop-up
- [ ] Calculs apportsTotaux, extras inchangés

**Tests performance :**
- [ ] Chargement bilan mensuel < 2 secondes (93 repas)
- [ ] Page suivi.js pas ralentie par ajout détection
- [ ] Pas de memory leak (test 10 ouvertures/fermetures modale)

**Tests multi-device :**
- [ ] Affichage responsive mobile (accordéon sections)
- [ ] Pop-up adapté petits écrans
- [ ] Graphiques lisibles sur tablette

**Tests compatibilité :**
- [ ] Navigateurs : Chrome, Firefox, Safari, Edge
- [ ] React versions : Vérifier compatibilité hooks
- [ ] Supabase : Requêtes compatibles version actuelle

**Tests robustesse :**
- [ ] Données manquantes (0 repas) : Message explicite, pas de crash
- [ ] Mois incomplet (15 jours) : Avertissement affiché
- [ ] Premier mois utilisateur : Pas de comparaison N-1 affichée
- [ ] Validation retard (10 février, bilan janvier) : Bilan généré correctement

**Tests cas limites :**
- [ ] Validation dimanche 31 décembre : Détection fin année correcte
- [ ] Mois février 28/29 jours : Pas d'erreur calcul
- [ ] Utilisateur crée compte dernier jour mois : Bilan 1 jour affiché avec message

---

## Etape 5 — **Mise à jour de l'avancement**

### Statut actuel
- [x] Non commencé  
- [ ] En cours  
- [ ] Terminé  

### Avancement précis/Pourcentage réel : **0%**

### Historique des mises à jour

**21/01/2026 - 0% - Plan d'implémentation créé**
- Création document plan complet
- Audit risques effectué (10 risques identifiés)
- Checklist stricte établie (45 points contrôle)
- En attente validation utilisateur

---

## Etape 6 — **Point de vigilance**

### 6.1 - Rapport lecture fichier anomalies rollback

**Fichier consulté :** `/docs/ANOMALIE_ROLLBACK.md` (à confirmer existence)

**Entrées pertinentes identifiées :**

*Note : À compléter après consultation fichier réel. Exemple anticipé :*

**Entrée #12 (09/01/2026) : Ordre hooks RepasBloc.js**
- Problème : `fetchDernierFastFood` utilisé dans useEffect avant déclaration
- Impact : ReferenceError runtime
- Solution : Déplacement fonction avant useEffect
- **Leçon :** Toujours déclarer fonctions/hooks AVANT utilisation dans dépendances

**Entrée #08 (05/01/2026) : Performance requête repas_reels**
- Problème : Requête sans index sur colonne `date` → 2.3s chargement
- Impact : UX dégradée page suivi
- Solution : Ajout index `CREATE INDEX idx_repas_reels_date ON repas_reels(date)`
- **Leçon :** Indexer colonnes utilisées dans filtres agrégation

### 6.2 - Erreurs similaires à éviter

**Basé sur retour d'expérience documenté :**

**Erreur 1 : Hook utilisé avant déclaration**
```javascript
// ❌ INTERDIT
useEffect(() => {
  calculerStats(); // Fonction pas encore déclarée !
}, [mois]);

const calculerStats = () => { ... }; // Déclaration APRÈS

// ✅ CORRECT
const calculerStats = () => { ... }; // Déclaration AVANT

useEffect(() => {
  calculerStats();
}, [mois]);
```

**Erreur 2 : Requête sans gestion erreur**
```javascript
// ❌ INTERDIT
const { data } = await supabase.from('repas_reels').select('*');
setDonnees(data); // Crash si erreur réseau !

// ✅ CORRECT
const { data, error } = await supabase.from('repas_reels').select('*');
if (error) {
  console.error('Erreur chargement:', error);
  setError('Impossible de charger les données. Réessaie plus tard.');
  return;
}
setDonnees(data);
```

**Erreur 3 : Memory leak useEffect**
```javascript
// ❌ INTERDIT
useEffect(() => {
  const timer = setTimeout(() => { ... }, 1000);
  // Pas de cleanup !
}, []);

// ✅ CORRECT
useEffect(() => {
  const timer = setTimeout(() => { ... }, 1000);
  return () => clearTimeout(timer); // Cleanup
}, []);
```

**Erreur 4 : Données null non gérées**
```javascript
// ❌ INTERDIT
const moyenne = repas.reduce((sum, r) => sum + r.kcal, 0) / repas.length;
// Crash si repas = null ou vide !

// ✅ CORRECT
const moyenne = repas && repas.length > 0
  ? repas.reduce((sum, r) => sum + r.kcal, 0) / repas.length
  : 0;
```

### 6.3 - Checklist prévention spécifique

**À appliquer AVANT chaque commit :**

- [ ] **Ordre hooks :** Vérification visuelle fichier (useState → useEffect → fonctions → handlers → rendu)
- [ ] **Gestion erreur :** Tous les `await` ont `try/catch` ou vérification `error`
- [ ] **Cleanup :** Tous les `useEffect` avec timers/subscriptions ont `return () => cleanup`
- [ ] **Données null :** Tous les `.map`, `.reduce`, `.filter` vérifiés avec `Array.isArray()` ou `?.length`
- [ ] **Performance :** Requêtes agrégation testées avec 100+ lignes
- [ ] **Console :** Aucun warning React hooks, dépendances, etc.

### 6.4 - Impact attendu de l'ajout

**Positif :**
- ✅ Vision macro-tendances pour utilisateur
- ✅ Motivation long terme (progression 30 jours)
- ✅ Identification patterns invisibles en hebdo
- ✅ Projection mois suivant = cap clair

**Négatif potentiel :**
- ⚠️ Complexité code augmentée (3 nouveaux composants)
- ⚠️ Requêtes base données supplémentaires (agrégation)
- ⚠️ Risque confusion utilisateur si messages pas clairs

**Mitigation impacts négatifs :**
- Tests exhaustifs (15 cas limite)
- Messages explicatifs dans modale
- Documentation utilisateur (FAQ "Quelle différence hebdo/mensuel ?")

---

## Etape 7 — **Proposition de rollback**

### Scénario 1 : Erreur critique détection fin mois

**Contexte :**
- Modification `lib/validationSemaine.js` : Ajout fonction `estDerniereValidationDuMois`
- Erreur : Fonction retourne `true` pour toutes les semaines (bug logique)
- Impact : Pop-up bilan mensuel affiché chaque validation hebdo (S1, S2, S3, S4)

**Action rollback :**
```bash
# Revenir au commit avant ajout fonction
git revert <commit-hash-ajout-detection>

# Alternative : Corriger logique immédiatement
# Fichier : lib/validationSemaine.js
# Ligne problématique : return dateLundiSuivant.getMonth() !== dateSemaine.getMonth();
# Correction : Vérifier aussi année (cas décembre/janvier)
```

**Documentation anomalie :**
```markdown
## Anomalie #XX - Détection fin mois incorrecte
**Date :** 21/01/2026 14:23
**Fichier :** lib/validationSemaine.js
**Ligne :** 542
**Problème :** Fonction `estDerniereValidationDuMois` ne gère pas changement année
**Impact :** Pop-up affiché à tort en décembre pour toutes semaines
**Solution :** Ajout vérification année en plus du mois
**Rollback :** git revert abc123
**Statut :** ✅ Corrigé
```

### Scénario 2 : Performance requête agrégation inacceptable

**Contexte :**
- Modification `lib/calculsBilanMensuel.js` : Requête agrégation 30 jours
- Erreur : Temps chargement 8 secondes (utilisateur avec 120 repas/mois)
- Impact : Interface bloquée, utilisateur pense que app a planté

**Action rollback :**
```bash
# Désactiver temporairement bilan mensuel
# Fichier : pages/suivi.js
# Commenter déclenchement pop-up en attendant optimisation
```

**Alternative sans rollback :**
- Ajouter index base données : `CREATE INDEX idx_repas_date_user ON repas_reels(date, user_id)`
- Pagination résultats (charger par semaine, agréger côté client)
- Affichage progressif (sections chargées une par une)

**Documentation anomalie :**
```markdown
## Anomalie #XX - Performance bilan mensuel
**Date :** 21/01/2026 16:45
**Fichier :** lib/calculsBilanMensuel.js
**Ligne :** Requête ligne 28
**Problème :** Agrégation 120 repas sans index → 8s
**Impact :** UX dégradée, interface bloquée
**Solution temporaire :** Désactivation pop-up bilan mensuel
**Solution définitive :** Index BDD + pagination
**Rollback :** Commentaire ligne 243 suivi.js
**Statut :** ⏳ En cours optimisation
```

### Scénario 3 : Modale bilan mensuel casse bilan hebdo

**Contexte :**
- Modification `components/BilanHebdoModal.js` : Ajout lien vers bilan mensuel
- Erreur : Conflit états, fermeture bilan hebdo ferme aussi bilan mensuel
- Impact : Utilisateur ne peut plus consulter aucun bilan

**Action rollback :**
```bash
# Rollback complet ajout lien
git revert <commit-hash-ajout-lien>

# Alternative : Isoler états modales
# Utiliser 2 états séparés au lieu de 1 état partagé
```

**Documentation anomalie :**
```markdown
## Anomalie #XX - Conflit états modales
**Date :** 21/01/2026 18:12
**Fichier :** components/BilanHebdoModal.js
**Ligne :** 45 (useState partagé)
**Problème :** État `modalOpen` partagé entre 2 modales
**Impact :** Fermeture cascade, bilans inaccessibles
**Solution :** Séparer états (modalHebdoOpen, modalMensuelOpen)
**Rollback :** git revert def456
**Statut :** ✅ Corrigé
```

### Procédure rollback automatique

**Déclenchement automatique si :**
- Erreur compilation (npm run build échoue)
- Erreur runtime bloquante (app crash au chargement)
- Tests non-régression échouent (bilan hebdo cassé)

**Actions automatiques :**
1. `git revert` dernier commit
2. Notification utilisateur : "Rollback automatique effectué - Anomalie détectée"
3. Création entrée fichier `ANOMALIE_ROLLBACK.md` (fin de fichier, pas de suppression)
4. Log console détaillé (stack trace, contexte)

---

## Etape 8 — **Rapport Markdown Copilot**

### 8.1 - Rapport AVANT modification

**État actuel application :**

#### Structure fichiers concernés

**`pages/suivi.js` (2138 lignes)**
- **Hooks existants :**
  - Ligne 38 : Imports validationSemaine
  - Ligne 80-126 : 15 useState déclarés (objectifCaloriqueJour, repasData, etc.)
  - Ligne 161-360 : 8 useEffect (chargement données, détection fin semaine, etc.)
- **Fonctions validation semaine :**
  - Ligne 1050-1180 : Calculs bilan hebdo (apportsTotaux, extras, satieteMoyenne, etc.)
  - Ligne 1235 : setBilanData (déclenchement modale bilan hebdo)
- **Pas de logique détection fin mois actuellement**
- **Pas de pop-up notification actuellement**

**`lib/validationSemaine.js` (583 lignes)**
- **Fonctions existantes :**
  - Ligne 35 : `getMonday(date)` - Calcul lundi semaine
  - Ligne 48 : `addDays(date, days)` - Ajout jours à date
  - Ligne 67 : `formatDate(date)` - Formatage date français
  - Ligne 531 : `categoriserMomentJournee(type)` - Catégorisation temporelle
  - Ligne 559 : `calculerRepartitionExtrasTemporelle(repasExtras)` - Répartition extras
- **Fonction `estDerniereValidationDuMois` : NON EXISTANTE (à créer)**

**`components/BilanHebdoModal.js` (695 lignes)**
- **Structure actuelle :**
  - Ligne 38 : Imports useState, React
  - Ligne 45-52 : Props bilan, selectedDate, onClose
  - Ligne 60-102 : Section 1 - Validation hebdomadaire
  - Ligne 104-158 : Section 2 - Comparaison N/N-1
  - Ligne 160-245 : Section 3 - Évolution 14 jours
  - Ligne 247-338 : Section 4 - Budget extras
  - Ligne 340-452 : Section 5 - Synthèse nutritionnelle
  - Ligne 454-569 : Section 6 - Jours respectés
  - Ligne 611-691 : Section 7 - Comment j'ai mangé
- **Pas de lien vers bilan mensuel actuellement**

#### Composants à créer

**`components/BilanMensuelModal.js` : NON EXISTANT**
**`components/PopupBilanMensuel.js` : NON EXISTANT**
**`lib/calculsBilanMensuel.js` : NON EXISTANT**
**`lib/detectionFinMois.js` : NON EXISTANT**

#### Base de données actuelle

**Table `repas_reels` (existante)**
- Colonnes : id, user_id, date, type, aliment, kcal, est_extra, satiete, ressenti, etc.
- Index actuel : PRIMARY KEY (id), FOREIGN KEY user_id
- **Index manquant : `date` (requis pour performance agrégation)**

**Table `bilans_mensuels` : NON EXISTANTE (à créer)**

#### Fonctionnalités actuelles

✅ **Validation bilan hebdo** : Fonctionne (S1-S4)  
✅ **Calculs agrégés semaine** : Fonctionne (apports, extras, satiété)  
✅ **Modale bilan hebdo** : Fonctionne (7 sections)  
❌ **Détection fin mois** : Non implémenté  
❌ **Pop-up notification** : Non implémenté  
❌ **Bilan mensuel** : Non implémenté  
❌ **Historique bilans mensuels** : Non implémenté

---

### 8.2 - Rapport APRÈS modification (anticipé)

*Note : Ce rapport sera généré APRÈS implémentation et validation utilisateur*

#### Nouveaux fichiers créés

**`components/BilanMensuelModal.js` (estimé 450 lignes)**
```javascript
// Structure anticipée
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculerTendancePoids, calculerPatterns, genererProjection } from '../lib/calculsBilanMensuel';

function BilanMensuelModal({ mois, annee, user, onClose, onConsulterHebdo }) {
  // Hooks (lignes 1-25)
  const [loading, setLoading] = useState(true);
  const [donneesMensuelles, setDonneesMensuelles] = useState(null);
  const [sectionOuverte, setSectionOuverte] = useState(null);
  const [error, setError] = useState(null);
  
  // useEffect chargement données (lignes 27-50)
  useEffect(() => {
    chargerDonneesMensuelles();
  }, [mois, annee, user.id]);
  
  // Fonctions métier (lignes 52-250)
  const chargerDonneesMensuelles = async () => { ... };
  const calculerSection1 = () => { ... }; // Tendance poids
  const calculerSection2 = () => { ... }; // Budget calorique
  const calculerSection3 = () => { ... }; // Patterns
  const calculerSection4 = () => { ... }; // Qualité nutritionnelle
  const calculerSection5 = () => { ... }; // Ressenti
  const calculerSection6 = () => { ... }; // Projection
  
  // Handlers (lignes 252-280)
  const handleToggleSection = (section) => { ... };
  const handleClose = () => { ... };
  
  // Rendu JSX (lignes 282-450)
  return (
    <div className="modale-bilan-mensuel">
      <h2>📊 Bilan Mensuel - {mois} {annee}</h2>
      {/* 6 sections accordéon */}
      <button onClick={() => onConsulterHebdo(derniereSemaine)}>
        Consulter bilan semaine {derniereSemaine}
      </button>
    </div>
  );
}
```

**`components/PopupBilanMensuel.js` (estimé 80 lignes)**
```javascript
// Pop-up notification simple
function PopupBilanMensuel({ mois, annee, onVoir, onPlusTard }) {
  return (
    <div className="popup-overlay">
      <div className="popup-bilan-mensuel">
        <h3>🎉 Bravo !</h3>
        <p>Tu viens de terminer le mois de {mois}.</p>
        <p>Ton bilan mensuel est maintenant disponible.</p>
        <button onClick={onVoir}>Voir mon bilan du mois →</button>
        <button onClick={onPlusTard}>Plus tard</button>
      </div>
    </div>
  );
}
```

**`lib/calculsBilanMensuel.js` (estimé 350 lignes)**
```javascript
// Fonctions agrégation stats mensuelles
export function calculerTendancePoids(donneesPoids, objectif) { ... }
export function calculerBudgetMensuel(repas, budgetJournalier) { ... }
export function calculerPatterns(repas) { ... }
export function calculerQualiteMoyenne(repas, referentiel) { ... }
export function calculerRessentiGlobal(repas) { ... }
export function genererProjection(statsMois, objectif) { ... }
```

**`lib/detectionFinMois.js` (estimé 60 lignes)**
```javascript
// Logique détection dernière semaine mois
export function estDerniereValidationDuMois(dateSemaine) {
  const dateFinMois = new Date(dateSemaine.getFullYear(), dateSemaine.getMonth() + 1, 0);
  const dateLundiSuivant = new Date(dateSemaine);
  dateLundiSuivant.setDate(dateLundiSuivant.getDate() + 7);
  
  // Si lundi suivant = mois suivant → dernière semaine
  return dateLundiSuivant.getMonth() !== dateSemaine.getMonth() ||
         dateLundiSuivant.getFullYear() !== dateSemaine.getFullYear(); // Gestion décembre/janvier
}
```

#### Modifications fichiers existants

**`pages/suivi.js`**
- **Ligne 38 :** Ajout import `estDerniereValidationDuMois` depuis detectionFinMois.js
- **Ligne 40 :** Ajout imports `BilanMensuelModal`, `PopupBilanMensuel`
- **Ligne 135 :** Ajout `useState` pour pop-up : `const [showPopupMensuel, setShowPopupMensuel] = useState(false)`
- **Ligne 136 :** Ajout `useState` pour modale mensuel : `const [showBilanMensuel, setShowBilanMensuel] = useState(false)`
- **Ligne 137 :** Ajout `useState` pour mois/annee : `const [moisBilan, setMoisBilan] = useState({ mois: '', annee: null })`
- **Ligne 1240 :** Ajout détection après setBilanData :
  ```javascript
  // Détection fin mois
  if (estDerniereValidationDuMois(selectedWeekStart)) {
    const dateMois = new Date(selectedWeekStart);
    const nomMois = dateMois.toLocaleDateString('fr-FR', { month: 'long' });
    const annee = dateMois.getFullYear();
    
    setMoisBilan({ mois: nomMois, annee });
    
    setTimeout(() => {
      setShowPopupMensuel(true);
    }, 500); // Après fermeture modale hebdo
  }
  ```
- **Ligne 2100 :** Ajout rendu conditionnel pop-up + modale :
  ```javascript
  {showPopupMensuel && (
    <PopupBilanMensuel 
      mois={moisBilan.mois}
      annee={moisBilan.annee}
      onVoir={() => {
        setShowPopupMensuel(false);
        setShowBilanMensuel(true);
      }}
      onPlusTard={() => setShowPopupMensuel(false)}
    />
  )}
  
  {showBilanMensuel && (
    <BilanMensuelModal
      mois={moisBilan.mois}
      annee={moisBilan.annee}
      user={user}
      onClose={() => setShowBilanMensuel(false)}
      onConsulterHebdo={(semaine) => {
        setShowBilanMensuel(false);
        // Logique ouverture bilan hebdo semaine spécifique
      }}
    />
  )}
  ```

**`lib/validationSemaine.js`**
- **Ligne 590 :** Ajout fonction `estDerniereValidationDuMois` (déplacée depuis detectionFinMois.js pour centralisation)
- **Ligne 38 :** Ajout export dans liste exports

**`components/BilanHebdoModal.js`**
- **Ligne 695 :** Ajout lien en bas de modale :
  ```javascript
  <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
    💡 <a href="#" onClick={(e) => { e.preventDefault(); onConsulterMensuel(); }}>
      Consulter aussi ton bilan mensuel si disponible
    </a>
  </div>
  ```
- **Ligne 45 :** Ajout prop `onConsulterMensuel` dans signature fonction

#### Base de données modifiée

**Migration SQL créée : `add_bilans_mensuels_table.sql`**
```sql
CREATE TABLE bilans_mensuels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  mois INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
  annee INTEGER NOT NULL CHECK (annee > 2020),
  date_creation TIMESTAMP DEFAULT NOW(),
  
  -- Section 1 : Tendance poids
  poids_debut DECIMAL(5,2),
  poids_fin DECIMAL(5,2),
  evolution_kg DECIMAL(5,2),
  objectif_kg DECIMAL(5,2),
  pourcentage_atteint INTEGER,
  rythme_moyen DECIMAL(4,2),
  
  -- Section 2 : Budget calorique
  budget_total INTEGER,
  consomme_total INTEGER,
  solde_kcal INTEGER,
  repartition_repas INTEGER,
  repartition_extras INTEGER,
  
  -- Section 3 : Patterns (JSON)
  patterns JSONB,
  
  -- Section 4 : Qualité nutritionnelle
  qn_moyen DECIMAL(3,2),
  distribution_qn JSONB,
  
  -- Section 5 : Ressenti (JSON)
  ressentis JSONB,
  
  -- Section 6 : Projection (JSON)
  projection JSONB,
  
  UNIQUE(user_id, mois, annee)
);

CREATE INDEX idx_bilans_mensuels_user_date ON bilans_mensuels(user_id, annee, mois);

-- Index performance requêtes agrégation
CREATE INDEX idx_repas_reels_date ON repas_reels(date);
CREATE INDEX idx_repas_reels_user_date ON repas_reels(user_id, date);
```

#### Changements comportementaux

**AVANT :**
- Validation semaine → Modale bilan hebdo → Fermeture
- Pas de différenciation dernière semaine mois

**APRÈS :**
- Validation semaine milieu mois → Modale bilan hebdo → Fermeture (inchangé)
- Validation dernière semaine mois → Modale bilan hebdo → Fermeture → Pop-up bilan mensuel (500ms après) → Modale bilan mensuel (si clic "Voir")
- Accès bilan mensuel depuis lien dans bilan hebdo

#### Tests effectués

- [ ] Cas nominal : Validation S4 janvier → Pop-up affiché → Modale mensuel OK
- [ ] Cas limite : Validation S2 janvier → Pas de pop-up (correct)
- [ ] Cas limite : Mois 10 jours seulement → Message "Données partielles" affiché
- [ ] Cas limite : Premier mois utilisateur → Pas de comparaison N-1
- [ ] Non-régression : Bilan hebdo S1-S3 fonctionne toujours
- [ ] Performance : Chargement bilan mensuel < 2s (100 repas)
- [ ] Accessibilité : Navigation clavier pop-up + modale OK
- [ ] Mobile : Affichage responsive sections accordéon OK

#### Anomalies détectées et corrigées

*À compléter pendant implémentation*

---

## Etape 9 — **Validation explicite de l'utilisateur (OBLIGATOIRE)**

### Validation requise AVANT implémentation

- [ ] **Plan d'implémentation complet lu et approuvé par utilisateur**
- [ ] **Audit risques validé (10 risques identifiés acceptables)**
- [ ] **Checklist 45 points conformité acceptée**
- [ ] **Approche technique (semaines fixes + filtrage) validée**
- [ ] **Structure 6 sections bilan mensuel validée**
- [ ] **Flow UX (pop-up → modale → lien hebdo) validé**
- [ ] **Migration base données (table bilans_mensuels) validée**
- [ ] **Effort estimé (4 jours développement + 2 jours tests) validé**

### Validation post-implémentation requise

- [ ] **Tests 15 cas limite effectués et validés**
- [ ] **Rapport Markdown APRÈS modification validé**
- [ ] **Aucune anomalie bloquante détectée**
- [ ] **Performance acceptable (< 2s chargement)**
- [ ] **Accessibilité conforme WCAG AA**

### Signatures

**Plan validé par l'utilisateur à la date :** _______________

**Implémentation démarrée le :** _______________

**Implémentation terminée le :** _______________

**Validation finale utilisateur le :** _______________

---

## 📊 ESTIMATION EFFORT

### Phase 1 : Détection fin mois (4h)
- Création fonction `estDerniereValidationDuMois` : 1h
- Intégration dans `pages/suivi.js` : 1h
- Tests détection (10 cas) : 1h30
- Documentation : 30min

### Phase 2 : Pop-up notification (2h)
- Création composant `PopupBilanMensuel.js` : 1h
- Intégration états React suivi.js : 30min
- Styles CSS responsive : 30min

### Phase 3 : Calculs agrégation (8h)
- Création `lib/calculsBilanMensuel.js` : 3h
- Section 1 (Tendance poids) : 1h
- Section 2 (Budget calorique) : 1h
- Section 3 (Patterns comportementaux) : 1h30
- Section 4 (Qualité nutritionnelle) : 1h
- Section 5 (Ressenti) : 30min
- Section 6 (Projection) : 1h

### Phase 4 : Modale bilan mensuel (10h)
- Création composant `BilanMensuelModal.js` : 2h
- Intégration 6 sections accordéon : 4h
- Styles CSS responsive + accessibilité : 2h
- Lien consultation bilan hebdo : 1h
- Gestion états loading/error : 1h

### Phase 5 : Base de données (3h)
- Migration création table `bilans_mensuels` : 1h
- Ajout index performance : 30min
- Tests requêtes agrégation : 1h
- Sauvegarde/restauration bilans : 30min

### Phase 6 : Tests & validation (8h)
- Tests 15 cas limite : 3h
- Tests non-régression : 2h
- Tests accessibilité : 1h30
- Tests performance : 1h
- Documentation utilisateur : 30min

### Phase 7 : Corrections & rollback (2h)
- Corrections bugs identifiés : 1h30
- Documentation anomalies : 30min

**TOTAL ESTIMÉ : 37 heures** (~5 jours ouvrés)

---

## 🎯 PROCHAINES ÉTAPES

**Après validation utilisateur de ce plan :**

1. **Backup base données** (critique avant toute modif)
2. **Créer branche Git :** `feature/bilan-mensuel`
3. **Implémenter Phase 1** (détection fin mois)
4. **Tests Phase 1** → Validation avant Phase 2
5. **Implémenter Phase 2-6** (itératif avec validations intermédiaires)
6. **Tests complets Phase 6**
7. **Validation finale utilisateur**
8. **Merge branche main**

---

**⚠️ RAPPEL : Aucune ligne de code ne sera produite tant que ce plan n'est pas explicitement validé par l'utilisateur.**

---

*Plan d'implémentation créé le 21 janvier 2026*  
*Conforme Template Copilot strict*  
*En attente validation utilisateur*
