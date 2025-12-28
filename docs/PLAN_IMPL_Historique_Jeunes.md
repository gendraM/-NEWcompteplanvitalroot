# 🟢 PLAN D'IMPLÉMENTATION — Historique des Jeûnes

**Date de création** : 26/12/2025  
**Statut** : ⏳ EN ATTENTE VALIDATION UTILISATEUR

**⚠️ AUCUNE modification de code ne sera produite tant que l'utilisateur n'aura pas validé explicitement ce plan.**

---

## Titre de la tâche
Implémenter système d'historique multi-jeûnes avec consultation archives

---

## **Description précise de la modification attendue**

### Objectif principal
Permettre à l'utilisateur de :
1. **Consulter son jeûne EN COURS** en priorité sur la page `/jeune`
2. **Accéder à l'historique** de tous ses jeûnes terminés via un bouton discret "📚 Mes jeûnes"
3. **Naviguer dans un jeûne archivé** (voir tous les jours, outils, bilan, programme reprise)
4. **Archiver automatiquement** le jeûne terminé quand un nouveau jeûne est créé
5. **Revenir au jeûne actif** facilement depuis une archive

### Comportement détaillé

**Vue principale (jeûne en cours)** :
- Page `/jeune` affiche le jeûne actif (en cours ou dernier terminé si aucun nouveau)
- Bouton "📚 Mes jeûnes" visible en haut à droite
- Fonctionnement normal : validation jours, navigation, outils, bilan

**Modal historique** :
- Clic sur "📚 Mes jeûnes" → Modal s'ouvre
- Liste de tous les jeûnes :
  * Jeûne EN COURS (🟢) affiché en premier avec mention "Actuellement affiché"
  * Jeûnes TERMINÉS (✅) listés par ordre chronologique décroissant
- Chaque jeûne archivé : Date, durée, progression, bouton "👀 Consulter"
- Bouton [✕ Fermer] pour revenir au jeûne actif

**Mode consultation archive** :
- Clic "👀 Consulter" sur jeûne archivé → Page recharge en mode ARCHIVE
- Bandeau orange visible : "📖 ARCHIVE - Jeûne du [date]"
- Bouton "[← Retour au jeûne en cours]" en haut à gauche
- Navigation complète : tous les jours, outils, messages persos
- Bilan et programme de reprise consultables
- Pas de modification possible (lecture seule)

**Archivage automatique** :
- Quand utilisateur crée une NOUVELLE préparation (nouvelle date/durée)
- ET qu'un jeûne TERMINÉ existe (X/X jours validés)
- → Jeûne terminé archivé automatiquement dans `historiqueJeunes[]`
- → Nouveau jeûne devient le jeûne actif
- → Ancien jeûne consultable via historique

---

## **Fichiers concernés**

### Fichiers à MODIFIER
- `/pages/jeune.js` (fichier principal - ~1900 lignes)
  * Ajout state `historiqueJeunes` et `jeuneConsulte`
  * Ajout modal historique
  * Ajout logique archivage automatique
  * Ajout mode consultation archive
  * Ajout bouton "📚 Mes jeûnes"
  * Modification logique de chargement données

### Fichiers à CRÉER
- `/components/HistoriqueJeunesModal.js` (nouveau composant)
  * Modal liste historique
  * Cards jeûnes avec infos + bouton consultation
  * Gestion fermeture

### Fichiers à CONSULTER (pas modifier)
- `/lib/parcoursJeuneAPI.js` (vérifier si fonctions existantes utilisables)
- `/docs/Anomalie roll back` (lecture obligatoire avant code)
- `/lib/jeuneUtils.js` (helpers potentiels)

---

## Etape 1 — **Audit des risques préalable**

### Risques techniques identifiés

**1. PERTE DE DONNÉES lors archivage**
- **Risque CRITIQUE** : Si archivage échoue, données du jeûne terminé perdues
- **Mitigation** : Transaction localStorage complète avec rollback
- **Mitigation** : Sauvegarde Supabase en priorité (si disponible)
- **Mitigation** : Validation données avant suppression ancien jeûne

**2. CONFUSION utilisateur entre actif/archivé**
- **Risque UX** : Utilisateur modifie un jeûne pensant que c'est l'actif
- **Mitigation** : Bandeau orange très visible en mode archive
- **Mitigation** : Lecture seule stricte sur jeûnes archivés
- **Mitigation** : Bouton "Retour au jeûne en cours" toujours visible

**3. MIGRATION données existantes**
- **Risque** : Utilisateurs ayant déjà un jeûne terminé (localStorage actuel)
- **Mitigation** : Code de migration automatique au premier chargement
- **Mitigation** : Détection jeûne terminé existant → archivage initial
- **Mitigation** : Conservation données si migration échoue

**4. PERFORMANCE avec beaucoup d'historique**
- **Risque** : localStorage trop lourd si 50+ jeûnes archivés
- **Mitigation** : ~~Limite 20 derniers jeûnes~~ **ILLIMITÉ** (validation utilisateur)
- **Mitigation renforcée** : Chargement lazy des détails (uniquement ID+date+durée dans liste, détails chargés à la consultation)
- **Mitigation** : Pagination si >15 jeûnes dans modal (affichage 15 par page)
- **Mitigation** : Compression données si >100 jeûnes (JSON.stringify avec minification)

**5. ORDRE DES HOOKS React**
- **Risque** : Nouveaux useState/useEffect mal placés
- **Mitigation** : Tous les hooks en DÉBUT de composant (ligne ~475-500)
- **Mitigation** : Pas de hooks conditionnels
- **Mitigation** : Respect strict ordre : useState → useEffect → fonctions → render

**6. DÉTECTION "NOUVELLE PRÉPARATION" défaillante**
- **Risque** : Code existant (lignes 637-656) peut mal détecter changement
- **Mitigation** : Améliorer logique détection avec ID unique préparation
- **Mitigation** : Vérifier cohérence date + durée + ID
- **Mitigation** : Log console explicite lors archivage

**7. CONFLIT avec parcours Supabase**
- **Risque** : Table `parcours_jeune` en BDD peut être désynchronisée
- **Mitigation** : Priorité Supabase si disponible
- **Mitigation** : localStorage comme backup/cache uniquement
- **Mitigation** : Réconciliation données BDD ↔ localStorage

**8. RÉGRESSION fonctionnalités existantes**
- **Risque MAJEUR** : Validation jours, navigation, bilan cassés
- **Mitigation** : Aucune suppression de code existant
- **Mitigation** : Tests exhaustifs avant validation
- **Mitigation** : Rollback immédiat si régression détectée

### Risques UX identifiés

**1. Bouton "📚 Mes jeûnes" trop discret**
- Solution : Position fixe, couleur visible, tooltip au survol

**2. Modal trop complexe**
- Solution : Design épuré, max 3 infos par jeûne (date, durée, progression)

**3. Retour au jeûne actif pas clair**
- Solution : Bouton toujours visible en haut, couleur distinctive

### Risques sécurité/données

**1. localStorage corrompu**
- Validation JSON.parse avec try/catch systématique
- Fallback valeurs par défaut si parse échoue

**2. Données orphelines**
- Nettoyage automatique jeûnes sans date/durée valide

---

## Etape 2 — **Sous-checklist à valider systématiquement**

### Imports nécessaires
- [ ] `useState` déjà importé (vérifier ligne 1)
- [ ] `useEffect` déjà importé (vérifier ligne 1)
- [ ] Pas de nouvel import externe requis
- [ ] Nouveau composant `HistoriqueJeunesModal` importé correctement

### Nouveaux states à ajouter
- [ ] `historiqueJeunes` : array (liste tous jeûnes archivés - ILLIMITÉ)
- [ ] `jeunesSupprimés` : array (corbeille jeûnes supprimés - restauration possible)
- [ ] `jeuneConsulte` : object | null (jeûne actuellement affiché si archive)
- [ ] `showHistoriqueModal` : boolean (affichage modal historique)
- [ ] `showSuppressionModal` : boolean (affichage modal confirmation suppression)
- [ ] `jeuneASupprimer` : object | null (jeûne en attente suppression)
- [ ] `showCorbeille` : boolean (affichage section corbeille dans modal)

### Fonctions/handlers à créer
- [ ] `archiverJeuneActuel()` : Sauvegarde jeûne terminé dans historique
- [ ] `chargerJeuneArchive(jeuneId)` : Charge jeûne archivé pour consultation
- [ ] `retourJeuneActif()` : Revient au jeûne en cours
- [ ] `ouvrirModalHistorique()` : Affiche modal liste
- [ ] `fermerModalHistorique()` : Ferme modal
- [ ] `demanderSuppressionJeune(jeune)` : Ouvre modal confirmation suppression
- [ ] `confirmerSuppressionJeune()` : Déplace jeûne vers corbeille (soft delete)
- [ ] `restaurerJeune(jeuneId)` : Restaure jeûne depuis corbeille
- [ ] `supprimerDefinitivement(jeuneId)` : Suppression hard (après confirmation)
- [ ] `nettoyerCorbeilleAuto()` : Supprime jeûnes >30 jours dans corbeille

### Données localStorage à gérer
- [ ] Nouvelle clé : `historiqueJeunes` (array objects - ILLIMITÉ)
- [ ] Nouvelle clé : `jeunesSupprimés` (array objects - corbeille avec date suppression)
- [ ] Conservation clés existantes : `joursValides`, `preparationData`, etc.
- [ ] Migration automatique premier chargement si jeûne terminé détecté
- [ ] Nettoyage automatique corbeille (jeûnes >30 jours supprimés définitivement)

---

## Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**

- [ ] Lecture complète de `/pages/jeune.js` (1884 lignes) avec attention aux hooks existants
- [ ] Lecture complète de `/docs/Anomalie roll back` pour identifier patterns d'erreurs similaires
- [ ] Identification position exacte des hooks actuels (lignes 475-550)
- [ ] Nouveaux useState ajoutés APRÈS les existants, AVANT tout useEffect
- [ ] Nouveaux useEffect ajoutés APRÈS useState, AVANT fonctions handlers
- [ ] Aucun hook dans fonction, boucle, map, if ou condition
- [ ] Toutes fonctions/handlers déclarées AVANT leur usage dans JSX
- [ ] Pas de doublon de déclarations (vérifier noms existants)
- [ ] Initialisation de tous les nouveaux states avec valeurs par défaut valides
- [ ] Gestion erreurs JSON.parse avec try/catch systématique
- [ ] Test compilation après CHAQUE ajout de code (pas tout d'un coup)
- [ ] Test rendu page sans régression (jeûne actif fonctionne normalement)
- [ ] Test création nouveau jeûne → archivage automatique
- [ ] Test consultation archive → navigation jours fonctionne
- [ ] Test retour jeûne actif → données correctes rechargées
- [ ] Test modal historique → liste affichée, fermeture OK
- [ ] Test cas limite : 0 jeûne archivé, 1 jeûne archivé, 10+ jeûnes
- [ ] Test migration automatique jeûne existant
- [ ] Validation utilisateur OBLIGATOIRE avant implémentation
- [ ] Rollback préparé en cas d'anomalie (git tag avant modif)
- [ ] Documentation de chaque étape dans rapport Markdown

---

## Etape 4 — **Contrôles conformité à réaliser**

### Phase 1 : Lecture fichier anomalies (OBLIGATOIRE)

**Anomalies pertinentes identifiées dans `/docs/Anomalie roll back`** :

1. **08/12/2025 - Jours validés automatiquement**
   - Cause : Changement durée jeûne sans reset joursValides
   - **Leçon** : Vérifier cohérence durée/jours validés lors chargement
   - **Application ici** : Vérifier jeûne archivé a durée cohérente avec jours validés

2. **06/12/2025 - Carte phases reprise non-sticky**
   - Cause : Mauvais composant modifié
   - **Leçon** : Lire code AVANT modification, identifier bon endroit
   - **Application ici** : S'assurer modal ajouté au bon endroit (après bilan, avant progression)

3. **22/11/2025 - Page défis non-fonctionnelle**
   - Cause : Suppression destructrice de 100+ lignes de logique essentielle
   - **Leçon CRITIQUE** : JAMAIS supprimer code existant, seulement ajouter
   - **Application ici** : Aucune suppression dans jeune.js, uniquement ajouts

4. **21/11/2025 - Hook useState hors composant**
   - Cause : Déclaration hook avant export default function
   - **Leçon** : Tous hooks en haut du corps du composant uniquement
   - **Application ici** : Nouveaux hooks lignes 475-500, jamais avant/après

5. **21/11/2025 - Doublon hook debugInfo**
   - Cause : Déclaration dupliquée lors patch
   - **Leçon** : Vérifier unicité noms hooks avant ajout
   - **Application ici** : Grep vérification noms historiqueJeunes, jeuneConsulte

6. **04/12/2025 - Authentification Supabase bloquante**
   - Cause : Ajout auth.getUser() dans app NO AUTH
   - **Leçon** : Respecter architecture NO AUTH existante
   - **Application ici** : Pas d'ajout auth, utiliser user_id fixe si Supabase

7. **26/12/2025 - Typo fonction setParcoursId**
   - Cause : Erreur frappe "conParcoursId" au lieu de "setParcoursId"
   - **Leçon** : Relecture manuelle ligne par ligne des noms fonctions
   - **Application ici** : Vérifier orthographe tous appels fonctions archivage

8. **26/12/2025 - Bouton reprise non fonctionnel**
   - Cause : Vérification uniquement programmeReprise, pas planRepriseValide
   - **Leçon** : Vérifier TOUTES les sources de données (localStorage multiple)
   - **Application ici** : Jeûne archivé doit charger TOUTES ses données (outils, messages, etc.)

### Phase 2 : Checklist prévention erreurs similaires

**À vérifier AVANT codage** :
- [ ] Aucune suppression de code existant (règle ABSOLUE)
- [ ] Tous nouveaux hooks en haut composant (après ligne 475, avant ligne 550)
- [ ] Tous noms hooks/fonctions vérifiés unique (grep avant ajout)
- [ ] Aucun auth.getUser() ajouté (respect NO AUTH)
- [ ] Tous appels fonctions avec orthographe correcte (relecture manuelle)
- [ ] Chargement jeûne archivé récupère TOUTES données (outils, messages, programme, etc.)
- [ ] Try/catch sur tous JSON.parse
- [ ] Validation cohérence données (durée === joursValides.length max)

### Phase 3 : Tests de conformité

**Tests fonctionnels requis** :
1. **Test création historique** : Terminer jeûne 10/10 → Créer nouveau jeûne → Vérifier archivage auto
2. **Test consultation archive** : Ouvrir modal → Cliquer jeûne archivé → Voir tous les jours
3. **Test retour actif** : Depuis archive, cliquer "Retour jeûne en cours" → Voir jeûne actif correct
4. **Test navigation archive** : Dans jeûne archivé, boutons "← Jour précédent" / "Jour suivant →" fonctionnent
5. **Test bilan archive** : Dans jeûne archivé, bouton "Voir bilan" affiche bon bilan
6. **Test programme archive** : Dans jeûne archivé, bouton "Visualiser plan validé" charge bon programme
7. **Test m5+ archives** : Affichage correct avec pagination, scroll, performance
10. **Test modal fermeture** : Clic [✕] ou hors modal → Retour jeûne actif
11. **Test suppression soft** : Clic "Supprimer" → Modal confirmation → Jeûne déplacé vers corbeille
12. **Test restauration** : Onglet "Corbeille" → Clic "Restaurer" → Jeûne revient dans historique
13. **Test suppression définitive** : Corbeille → Clic "Supprimer définitivement" → Modal danger → Suppression confirmée
14. **Test nettoyage auto** : Jeûne supprimé depuis >30 jours → Suppression automatique au chargement
15. **Test pagination** : Plus de 15 jeûnes → Boutons "Précédent/Suivant" fonctionnent message informatif
9. **Test 10+ archives** : Affichage correct, scroll, performance
10. **Test modal fermeture** : Clic [✕] ou hors modal → Retour jeûne actif

**Tests non-régression** :
- [ ] Validation jour actif fonctionne toujours
- [ ] Navigation jours actif fonctionne toujours
- [ ] Ajout outils actif fonctionne toujours
- [ ] Génération programme reprise fonctionne toujours
- [ ] Bilan jeûne actif fonctionne toujours
- [ ] Bouton "Accéder à ma reprise alimentaire" fonctionne toujours

**Tests performance** :
- [ ] Chargement page <500ms même avec 20 jeûnes archivés
- [ ] Ouverture modal <200ms
- [ ] Consultation jeûne archivé <300ms

---

## Etape 5 — **Mise à jour de l'avancement**

- [x] Non commencé  
- [ ] En cours  
- [ ] Terminé  

**Avancement précis** : 0% (Plan créé, attente validation utilisateur)

**Historique des mises à jour** :
- 26/12/2025 14:00 — Plan d'implémentation créé, analyse risques complète
- _À compléter au fur et à mesure_

---

## Etape 6 — **Point de vigilance**

### Rapport lecture fichier anomalies rollback

**8 entrées pertinentes analysées** (cf. Etape 4 Phase 1)

**Patterns d'erreurs à éviter absolument** :
1. ❌ Suppression code existant → ✅ Uniquement ajouts
2. ❌ Hooks hors composant → ✅ Tous hooks lignes 475-550
3. ❌ Noms doublons → ✅ Grep vérification avant ajout
4. ❌ Auth dans NO AUTH app → ✅ Pas d'auth.getUser()
5. ❌ Typos noms fonctions → ✅ Relecture manuelle ligne par ligne
6. ❌ Source données unique → ✅ Vérifier toutes sources (localStorage multiple)

### Checklist vigilance spécifique à cette tâche

**Archivage automatique** :
- [ ] Vérifier jeûne TERMINÉ avant archivage (joursValides.length === duree)
- [ ] Sauvegarder TOUTES données : joursValides, outils, messages, bilan, programme, date, durée
- [ ] Ne JAMAIS écraser historique existant (append uniquement)
- [ ] Validation données avant suppression localStorage jeûne actif

**Chargement jeûne archivé** :
- [ ] Restaurer TOUTES données dans states React correspondants
- [ ] Mode lecture seule (désactiver boutons validation)
- [ ] Bandeau orange très visible
- [ ] Bouton retour toujours accessible

**Modal historique** :
- [ ] Gestion fermeture ESC key
- [ ] Gestion clic outside modal
- [ ] Liste vide : message informatif clair
- [ ] Scroll si >10 jeûnes

**Migration données existantes** :
- [ ] Détecter jeûne terminé au premier load
- [ ] Créer ID unique rétroactif
- [ ] Archiver automatiquement
- [ ] Ne pas perdre données si migration échoue

---

## Etape 7 — **Proposition de rollback**

### Stratégie rollback préparée

**AVANT toute modification** :
```bash
# Tag Git de sécurité
git add .
git commit -m "AVANT implémentation historique jeûnes - état stable"
git tag v1.9.0-pre-historique
```

**SI anomalie détectée pendant développement** :
```bash
# Rollback immédiat
git reset --hard v1.9.0-pre-historique
```

**Documentation anomalie** :
- Fichier : `/docs/Anomalie roll back`
- Format : Date/heure, description, cause, impact, action rollback
- **Ajout en FIN de fichier uniquement (jamais suppression)**

### Actions rollback par type d'anomalie

**Anomalie 1 : Erreur compilation**
- Action : Rollback immédiat du dernier changement
- Rapport : Ligne exacte erreur, code ajouté, message erreur
- Alternative : Correction syntaxe puis re-test

**Anomalie 2 : Perte données utilisateur**
- Action : ROLLBACK TOTAL immédiat
- Rapport : Détail données perdues, étape reproduction
- Alternative : Attendre validation utilisateur avant nouvelle tentative

**Anomalie 3 : Régression fonctionnalité existante**
- Action : Rollback partiel (retirer uniquement code problématique)
- Rapport : Fonctionnalité cassée, code suspect
- Alternative : Ajout conditionnel pour isoler nouveau code

**Anomalie 4 : Modal ne s'affiche pas**
- Action : Debug, pas de rollback si pas d'impact autre
- Rapport : Reproduction étape par étape
- Alternative : Vérification order hooks, state management

### Validation avant commit final

- [ ] Tests exhaustifs réussis (cf. Etape 4)
- [ ] Aucune régression détectée
- [ ] Utilisateur a testé workflow complet
- [ ] Documentation mise à jour
- [ ] Rapport Markdown AVANT/APRÈS généré

---

## Etape 8 — **Rapport Markdown Copilot**

### RAPPORT AVANT MODIFICATION

**Structure actuelle `/pages/jeune.js` (ligne 1-1884)** :

```
Lignes 1-10    : Imports
Lignes 475-550 : Déclaration hooks (31 useState, 7 useEffect)
Lignes 585-700 : Initialisation client-side (durée, date, joursValides)
Lignes 750-850 : Hooks données Supabase
Lignes 856-950 : Fonction genererBilanJeune()
Lignes 951-995 : Fonction validerJour() (async, avec Supabase save)
Lignes 1000+   : Autres handlers
Lignes 1100+   : useEffect génération bilan auto
Lignes 1150+   : Rendu JSX
```

**Hooks existants pertinents** :
- `dureeJeune` (line ~475) : Durée jeûne actif
- `jourEnCours` (line ~476) : Jour actuellement affiché
- `joursValides` (line ~477) : Array jours validés
- `dateDebutJeune` (line ~478) : Date début jeûne
- `outils` (line ~479) : Outils utilisés par jour
- `messagePerso` (line ~480) : Message personnalisé
- `programmeReprise` (line ~475) : Programme reprise généré
- `planRepriseValide` (line ~480) : Plan reprise validé
- `bilanJeune` (line ~483) : Bilan jeûne terminé
- `showBilan` (line ~484) : Affichage modal bilan
- `parcoursId` (line ~485) : ID parcours Supabase

**Logique détection nouvelle préparation** (lignes 637-656) :
```javascript
// Vérifier si c'est une nouvelle préparation (reset nécessaire)
const prepId = `${prepData.startDate}_${prepData.duration}`;
if (dernierePrepStr !== prepId) {
  const jeuneTermine = joursValidesActuels.length >= dureeFiable;
  if (!jeuneTermine) {
    // Reset jeûne en cours
  } else {
    // Garde jeûne terminé (correction 26/12/2025)
  }
}
```

**Fonctionnalités existantes à préserver** :
- Validation séquentielle jours (ligne 963-968)
- Sauvegarde Supabase jours validés (ligne 976-985)
- Génération bilan auto (ligne 1105-1115)
- Consultation bilan modal (ligne 1733+)
- Accès programme reprise (ligne 1780+)
- Section verte plan validé (ligne 1654+)

---

### RAPPORT APRÈS MODIFICATION (sera généré après implémentation)

**Nouveaux hooks ajoutés** (à ajouter ligne ~486-488) :
```javascript
const [historiqueJeunes, setHistoriqueJeunes] = useState([]);
const [jeuneConsulte, setJeuneConsulte] = useState(null);
const [showHistoriqueModal, setShowHistoriqueModal] = useState(false);
```

**Nouveau useEffect archivage** (à ajouter ligne ~560) :
```javascript
useEffect(() => {
  // Détecter nouvelle préparation + jeûne terminé → archiver
  // Migrer jeûne existant si premier chargement
}, [preparationData, joursValides.length, dureeJeune]);
```

**Nouvelles fonctions handlers** (à ajouter ligne ~1085) :
```javascript
const archiverJeuneActuel = () => { ... };
const chargerJeuneArchive = (jeuneId) => { ... };
const retourJeuneActif = () => { ... };
const ouvrirModalHistorique = () => { ... };
const fermerModalHistorique = () => { ... };
```

**Nouveau composant modal** (à ajouter dans JSX ligne ~1730) :
```jsx
{showHistoriqueModal && (
  <HistoriqueJeunesModal
    jeunes={historiqueJeunes}
    jeuneActif={jeuneConsulte === null}
    onConsulter={chargerJeuneArchive}
    onFermer={fermerModalHistorique}
  />
)}
```

**Nouveau bandeau mode archive** (à ajouter dans JSX ligne ~1155) :
```jsx
{jeuneConsulte && (
  <div style={{ background: '#fff3e0', border: '2px solid #ff9800', ... }}>
    📖 ARCHIVE - Jeûne du {jeuneConsulte.dateDebut} ({jeuneConsulte.duree} jours)
    <button onClick={retourJeuneActif}>← Retour au jeûne en cours</button>
  </div>
)}
```

**Nouveau bouton historique** (à ajouter dans header ligne ~1148) :
```jsx
<button onClick={ouvrirModalHistorique} style={{ position: 'absolute', top: 24, right: 24, ... }}>
  📚 Mes jeûnes
</button>
```

**Modifications logique existante** :
- Ligne 637-656 : Améliorer détection nouvelle préparation avec archivage
- Ligne 670 : Charger historiqueJeunes depuis localStorage
- Ligne 951+ : Fonction validerJour() désactivée si mode archive

**Nouveau fichier créé** :
- `/components/HistoriqueJeunesModal.js` (~200 lignes)

---

## Etape 9 — **Validation explicite de l'utilisateur (OBLIGATOIRE)**

### Questions de validation

**Design & UX** :
1. ✅ Modal historique OU page séparée `/mes-jeunes` ?  
   → **Réponse utilisateur** : Modal (confirmé)

2. ✅ Archivage automatique quand nouveau jeûne créé ?  
   → **Réponse utilisateur** : Oui (confirmé)

3. ✅ Limite d'historique (ex: 20 derniers jeûnes) ou illimité ?  
   → **Réponse utilisateur** : **ILLIMITÉ** (tous les jeûnes conservés)

4. ✅ Bouton "Supprimer" un jeûne archivé ou non ?  
   → **Réponse utilisateur** : **OUI avec sécurités** :
   - Modal confirmation avant suppression
   - Message rappel des risques (perte données définitive)
   - Système "Corbeille" : jeûnes supprimés → `jeunesSupprimés[]` (restauration possible)
   - Bouton "Restaurer" dans section jeûnes supprimés
   - Suppression définitive après 30 jours OU action manuelle utilisateur

5. ✅ Position exacte bouton "📚 Mes jeûnes" : coin haut droit du header ?  
   → **Réponse utilisateur** : **Ce qui est le mieux visuellement** (à déterminer avec palette app)

6. ✅ Couleur bandeau archive : Orange #fff3e0 comme proposé ?  
   → **Réponse utilisateur** : **Ce qui est le mieux visuellement** (cohérent avec palette app)

**Analyse palette couleurs existante `/pages/jeune.js`** :
- Jaune clair : `#fff3cd` / `#fffde7` (alertes, préparation reprise)
- Bleu clair : `#e3f2fd` (infos, outils)
- Vert clair : `#e8f5e9` / `#e0f2f1` (succès, jeûne terminé, plan validé)
- Violet clair : `#ede7f6` / `#f3e5f5` (spirituel, questions)
- Orange clair : `#fff3e0` (alertes urgentes J-3)
- Gris clair : `#f5f5f5` (progression)

**Décisions design retenues** :
- **Bandeau archive** : `#e3f2fd` (bleu clair) + border `#64b5f6` → Cohérent avec sections informatives, distinct du jeûne actif
- **Bouton "📚 Mes jeûnes"** : Position **top-right absolu** (à droite du titre), couleur `#1976d2` (bleu primaire app)
**Validations utilisateur confirmées** :

- [x] ✅ J'ai lu et compris le workflow utilisateur (3 scénarios)
- [x] ✅ J'ai validé le visuel proposé (modal + bandeau + bouton)
- [x] ✅ J'ai confirmé les fonctionnalités attendues (archivage, consultation, retour)
- [x] ✅ J'ai répondu aux 6 questions de validation :
  * Historique ILLIMITÉ (pas de limite)
  * Suppression OUI avec système corbeille (soft delete + restauration)
  * Position bouton : top-right (cohérent palette app)
  * Couleur bandeau archive : `#e3f2fd` bleu clair (cohérent infos)
  * Couleur modal suppression : `#ffebee` rouge clair (danger)
  * Section corbeille : `#fafafa` gris très clair avec icon 🗑️
- [ ] ⏳ Je donne mon autorisation pour démarrer l'implémentation
- [ ] ⏳ Je comprends qu'aucun code ne sera écrit avant cette validation

**Signature utilisateur finale requise** :

Écris **"Je valide le plan, tu peux coder"** pour autoriser l'implémentation.
- [ ] ✅ J'ai validé le visuel proposé (modal + bandeau + bouton)
- [ ] ✅ J'ai confirmé les fonctionnalités attendues (archivage, consultation, retour)
- [ ] ⏳ J'ai répondu aux 4 questions de validation ci-dessus
- [ ] ⏳ Je donne mon autorisation pour démarrer l'implémentation
- [ ] ⏳ Je comprends qu'aucun code ne sera écrit avant cette validation

**Date de validation** : ___ / ___ / ______  
**Signature utilisateur** : ________________________

---

## 📝 PROCHAINES ÉTAPES (après validation)

1. **Phase 1** : Création composant `HistoriqueJeunesModal.js` (tests isolés)
2. **Phase 2** : Ajout hooks et fonctions dans `jeune.js` (tests unitaires)
3. **Phase 3** : Intégration logique archivage (tests archivage auto)
4. **Phase 4** : Ajout UI (bouton + modal + bandeau) (tests visuels)
5. **Phase 5** : Tests exhaustifs workflow complet (10 tests fonctionnels)
6. **Phase 6** : Tests non-régression (6 tests existants)
7. **Phase 7** : Documentation et rapport final

**Durée estimée** : 2-3 heures de développement + tests

---

**⚠️ RAPPEL : Ce plan doit être validé explicitement par l'utilisateur avant toute ligne de code.**
