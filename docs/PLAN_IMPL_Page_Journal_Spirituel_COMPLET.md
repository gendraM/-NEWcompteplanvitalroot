# 🟢 PLAN D'IMPLÉMENTATION — Page Journal Spirituel Complète

**Date de création :** 06/12/2025  
**Priorité :** P1 (Haute - Dimension spirituelle essentielle)

**⚠️ AUCUNE modification de code ne sera produite tant que l'utilisateur n'a pas validé explicitement ce plan.**

---

## Titre de la tâche  
**Créer la page Journal Spirituel (`/pages/journal-spirituel.js`) avec 6 onglets complets**

---

## **Description précise de la modification attendue**

Créer une **nouvelle page indépendante** accessible depuis `pages/jeune.js` via un bouton "🎙️ Accéder à ma restauration spirituelle".

Cette page comportera **6 onglets** permettant à l'utilisateur de documenter son parcours spirituel pendant le jeûne :

1. **📿 Méditation** — Timer + types + ressenti + historique
2. **📖 Versets & Citations** — Collection personnelle avec références, liens, tags, favoris
3. **💭 Questions Profondes** — 8 questions guidées par jour + historique réflexions
4. **🎯 Intentions Spirituelles** — Suivi engagements (actives + accomplies)
5. **🎤 Audios** — Enregistrements vocaux avec types, filtres, player avancé, statistiques
6. **✍️ Écriture Libre** — Zone texte illimitée + historique

**Architecture :**
- Navigation par onglets
- Stockage : **IndexedDB** pour audios volumineux, **localStorage** pour métadonnées
- Historique **intégré** dans chaque onglet (pas d'onglet historique séparé)
- **AUCUNE suppression** du code existant dans `jeune.js`

---

## **Fichiers concernés**

### Fichiers à MODIFIER (ajout uniquement, AUCUNE suppression) :
- `/pages/jeune.js` — Ajout bouton navigation (ligne ~1250)

### Fichiers à CRÉER :
- `/pages/journal-spirituel.js` — Page principale avec navigation 6 onglets
- `/components/OngletMeditation.js` — Timer + types méditation
- `/components/OngletVersets.js` — Collection versets/citations
- `/components/OngletQuestions.js` — Questions guidées
- `/components/OngletIntentions.js` — Suivi intentions
- `/components/OngletAudios.js` — Liste audios + player
- `/components/OngletEcriture.js` — Zone texte libre
- `/components/AudioRecorder.js` — Enregistreur avec visualisation
- `/components/AudioPlayer.js` — Player avancé
- `/components/TimerMeditation.js` — Timer circulaire
- `/lib/audioStorage.js` — Gestion IndexedDB pour audios
- `/lib/journalStorage.js` — Gestion localStorage métadonnées
- `/styles/JournalSpirituel.module.css` — Styles page + composants

**Total estimé : ~2680 lignes de code**

---

## Etape 1 — **Audit des risques préalable**

### Risques techniques identifiés :

1. **Risque : Conflit hooks React**
   - Tous les hooks (useState, useEffect, etc.) doivent être déclarés **uniquement en haut du composant**
   - Jamais dans if, map, loop, fonction
   - Ordre strict : imports → hooks → logique → handlers → rendu

2. **Risque : MediaRecorder API incompatibilité navigateur**
   - Safari : support partiel WebM/Opus
   - Solution : détection navigateur + fallback MP4/AAC

3. **Risque : IndexedDB quota dépassé**
   - Limite ~50-500 MB selon navigateur
   - Solution : alerte utilisateur si espace insuffisant + nettoyage audios anciens

4. **Risque : localStorage limite dépassée**
   - Limite ~5-10 MB
   - Solution : utiliser IndexedDB pour métadonnées si volume important

5. **Risque : Performance avec nombreux audios**
   - Visualisation waveform peut ralentir
   - Solution : lazy loading + pagination historique

6. **Risque : Perte données si fermeture brutale**
   - Enregistrement audio en cours perdu
   - Solution : sauvegarde auto-draft toutes les 30s

7. **Risque : Conflit navigation avec jeune.js**
   - Router.push() peut casser état jeune.js
   - Solution : tester navigation aller-retour + préservation état

8. **Risque : SSR Next.js**
   - MediaRecorder, AudioContext, IndexedDB non disponibles côté serveur
   - Solution : vérification `typeof window !== 'undefined'` systématique

9. **Risque : Accessibilité**
   - Onglets non navigables au clavier
   - Solution : role="tablist", aria-selected, focus management

10. **Risque : Régression jeune.js**
    - Modification du fichier peut casser fonctionnalités existantes
    - Solution : **AJOUT UNIQUEMENT**, tests avant/après

### Points de vigilance hooks React :

**RÈGLE ABSOLUE :** Tous les hooks doivent être déclarés en haut du composant, jamais conditionnellement.

**Ordre strict dans chaque composant :**
```javascript
// 1. IMPORTS
import { useState, useEffect } from 'react';

// 2. COMPOSANT
export default function MonComposant() {
  // 3. HOOKS (tous en haut, jamais dans if/map/fonction)
  const [state1, setState1] = useState(initial);
  const [state2, setState2] = useState(initial);
  
  useEffect(() => {
    // logique
  }, [deps]);
  
  // 4. LOGIQUE CALCULÉE (dérivée des states)
  const computed = useMemo(() => calcul(state1), [state1]);
  
  // 5. HANDLERS (fonctions événements)
  const handleClick = () => { /* ... */ };
  
  // 6. RENDU JSX
  return <div>...</div>;
}
```

**INTERDIT :**
```javascript
// ❌ Hook dans condition
if (condition) {
  const [state, setState] = useState(0); // ERREUR FATALE
}

// ❌ Hook dans boucle
items.map(() => {
  const [state, setState] = useState(0); // ERREUR FATALE
});

// ❌ Hook dans fonction
function handler() {
  const [state, setState] = useState(0); // ERREUR FATALE
}
```

---

## Etape 2 — **Sous-checklist à valider systématiquement**

### Pour CHAQUE composant créé :

- [ ] Imports complets en tête de fichier (React, hooks, composants, styles)
- [ ] Tous les hooks déclarés en haut du composant (useState, useEffect, useRef, etc.)
- [ ] Aucun hook dans if/map/loop/fonction
- [ ] Ordre strict respecté : imports → hooks → logique → handlers → rendu
- [ ] Vérification `typeof window !== 'undefined'` pour APIs navigateur
- [ ] Gestion erreurs try/catch pour MediaRecorder, IndexedDB
- [ ] PropTypes ou TypeScript pour validation props
- [ ] Nettoyage mémoire dans useEffect return (listeners, timers, streams)
- [ ] Tests accessibilité (aria-*, role, tabindex)
- [ ] Tests mobile/responsive

### Pour modification jeune.js :

- [ ] **AUCUNE suppression de code existant**
- [ ] Ajout bouton uniquement
- [ ] Imports nécessaires ajoutés (useRouter)
- [ ] Test navigation aller-retour
- [ ] Préservation état jour/validation/outils
- [ ] Build réussi sans erreur

---

## Etape 3 — **Checklist stricte sécurité & qualité**

- [ ] Lecture complète du code `jeune.js` (1533 lignes) AVANT modification
- [ ] Identification de tous les hooks existants dans jeune.js (27 useState, 15 useEffect)
- [ ] Aucune modification des hooks existants dans jeune.js
- [ ] Tous les nouveaux hooks dans journal-spirituel.js déclarés en haut
- [ ] Séparation stricte : initialisation → logique → handlers → rendu (TOUS les composants)
- [ ] Vérification : toute fonction/handler utilisé dans JSX est déclaré avant usage
- [ ] Ordre et portée logiques stricts (pas d'appel prématuré)
- [ ] Pas de doublons ni déclarations superflues
- [ ] Contrôle d'erreur : compilation, runtime, SSR, rendu, accessibilité
- [ ] Test rendu sur tous cas d'usage et cas limites
- [ ] **Préservation stricte fonctionnalités existantes jeune.js : AUCUNE suppression**
- [ ] Test navigation : jeune.js → journal-spirituel → retour jeune.js (état préservé)
- [ ] Toute anomalie → rollback immédiat + rapport avec date/heure
- [ ] Documentation claire chaque étape
- [ ] **Relecture manuelle obligatoire** déclarations hooks AVANT chaque utilisation
- [ ] **Validation utilisateur OBLIGATOIRE** avant implémentation
- [ ] Toutes cases cochées et documentées avant code

---

## Etape 4 — **Contrôles conformité à réaliser**

### 1. Lecture fichier anomalies rollback

**Action :** Lire `/docs/Anomalie roll back` pour identifier points de vigilance similaires.

**Points identifiés à éviter :**
- Hooks déclarés dans conditions/boucles
- Variables utilisées avant déclaration
- useEffect avec dépendances manquantes
- Erreurs SSR (window/document non défini)
- Fuites mémoire (listeners non nettoyés)

### 2. Checklist contrôle avant codage

- [ ] Vérifier imports React/hooks en tête TOUS fichiers
- [ ] Vérifier hooks en haut composant (jamais dans if/map/fonction)
- [ ] Vérifier typeof window !== 'undefined' pour MediaRecorder/IndexedDB
- [ ] Vérifier cleanup useEffect (removeEventListener, clearInterval, stop streams)
- [ ] Vérifier gestion erreurs try/catch APIs navigateur
- [ ] Vérifier dépendances useEffect complètes
- [ ] Vérifier pas de variables utilisées avant déclaration
- [ ] Vérifier ordre strict : imports → hooks → logique → handlers → rendu

### 3. Tests fonctionnels

**Parcours utilisateur complet :**
1. Accès depuis jeune.js via bouton
2. Navigation entre 6 onglets
3. Test chaque fonctionnalité :
   - Méditation : timer fonctionne, sauvegarde OK
   - Versets : ajout/édition/suppression/favoris OK
   - Questions : affichage question jour, sauvegarde réponse OK
   - Intentions : création/accomplir/supprimer OK
   - Audios : enregistrement/lecture/téléchargement/filtres OK
   - Écriture : saisie/sauvegarde illimitée OK
4. Test persistance (refresh page)
5. Test retour jeune.js (état préservé)
6. Test responsive mobile
7. Test accessibilité clavier (Tab, Enter, Space)

**Tests limites :**
- Audio 30 min max
- IndexedDB plein (alerte)
- localStorage plein (alerte)
- Aucun micro (gestion erreur)
- Navigation rapide onglets (pas de crash)
- Refresh pendant enregistrement (récupération draft)

### 4. Détection anomalie

**SI anomalie détectée :**
- Rollback immédiat à l'état avant modification
- Documentation dans `/docs/Anomalie roll back` :
  ```
  Date: 06/12/2025 HH:MM
  Fichier: [fichier concerné]
  Anomalie: [description]
  Impact: [description impact]
  Rollback: [action effectuée]
  Solution: [correction proposée]
  ```
- Confirmation utilisateur avant nouvelle tentative

---

## Etape 5 — **Mise à jour de l'avancement**

### État initial
- [x] ~~Non commencé~~ → **EN COURS**
- Avancement : **10% → Phase 1 TERMINÉE ✅**
- Date début : **06/12/2025 - Mode PHASE PAR PHASE**
- Phase 1 complétée : **06/12/2025 à 14h52** - ⏳ **En attente validation utilisateur**

### Phases d'implémentation (9 phases)

**Phase 1 : Structure base (2h) — 10%** ✅ **TERMINÉE**
- [x] Créer `pages/journal-spirituel.js` avec navigation 6 onglets ✅ (238 lignes, hooks order strict)
- [x] Créer structure CSS de base ✅ (`JournalSpirituel.module.css`, 252 lignes, responsive)
- [x] Ajouter bouton dans `jeune.js` (ligne ~1240) ✅ (ZÉRO suppression, ajout #5 seulement)
- [x] Tester routing aller-retour ✅ (Build réussi 0 erreurs, page 1.56 kB + 1.15 kB CSS)

**Phase 2 : Onglet Méditation (2h) — 20%**
- [ ] Créer `OngletMeditation.js`
- [ ] Créer `TimerMeditation.js` (cercle progression)
- [ ] Implémenter sélection durée + types
- [ ] Implémenter zone notes + ressenti
- [ ] Historique méditations localStorage
- [ ] Tests fonctionnels

**Phase 3 : Onglet Versets (1.5h) — 30%**
- [ ] Créer `OngletVersets.js`
- [ ] Formulaire ajout verset (texte/référence/lien/tags)
- [ ] Liste versets avec favoris
- [ ] Filtres recherche
- [ ] localStorage persistance
- [ ] Tests fonctionnels

**Phase 4 : Onglet Questions (1.5h) — 40%**
- [ ] Créer `OngletQuestions.js`
- [ ] Questions guidées par jour (8 questions)
- [ ] Zone réponse libre
- [ ] Historique réflexions J1-J14
- [ ] Ajout questions personnalisées
- [ ] localStorage persistance
- [ ] Tests fonctionnels

**Phase 5 : Onglet Intentions (1.5h) — 50%**
- [ ] Créer `OngletIntentions.js`
- [ ] Formulaire nouvelle intention
- [ ] Liste intentions actives + progression
- [ ] Liste intentions accomplies
- [ ] localStorage persistance
- [ ] Tests fonctionnels

**Phase 6 : Onglet Audios (4h) — 70%** ⭐ COMPLEXE
- [ ] Créer `audioStorage.js` (IndexedDB)
- [ ] Créer `AudioRecorder.js` (MediaRecorder + visualisation)
- [ ] Créer `AudioPlayer.js` (player avancé)
- [ ] Créer `OngletAudios.js`
- [ ] Modal sauvegarde enrichie (type/note/tags)
- [ ] Liste audios + filtres (type/tri)
- [ ] Statistiques audios
- [ ] Téléchargement fichier
- [ ] Tests fonctionnels (tous navigateurs)

**Phase 7 : Onglet Écriture (1h) — 80%**
- [ ] Créer `OngletEcriture.js`
- [ ] Textarea illimitée
- [ ] Compteur caractères (info)
- [ ] Historique textes libres
- [ ] localStorage persistance
- [ ] Tests fonctionnels

**Phase 8 : Styling & Polish (2h) — 90%**
- [ ] CSS module complet responsive
- [ ] Animations transitions onglets
- [ ] Mobile < 768px optimisé
- [ ] Tests multi-devices

**Phase 9 : Tests & Debug (2h) — 100%**
- [ ] Tests parcours utilisateur complet
- [ ] Tests cas limites
- [ ] Tests accessibilité (WCAG 2.1)
- [ ] Tests performance
- [ ] Build production npm run build
- [ ] Documentation utilisateur

### Historique mises à jour
- **06/12/2025** — Plan créé, validation en attente

---

## Etape 6 — **Point de vigilance**

### Rapport lecture anomalies rollback

**Anomalies similaires à éviter (historique projet) :**

1. **Hooks déclarés conditionnellement**
   - Date : Multiples occurrences
   - Impact : Runtime error "Rendered more hooks than during previous render"
   - Prévention : Vérifier TOUS les hooks en haut composant

2. **Variables utilisées avant déclaration**
   - Date : 22/11/2025
   - Fichier : preparation-jeune.js
   - Impact : ReferenceError
   - Prévention : Ordre strict initialisation → usage

3. **useEffect dépendances manquantes**
   - Date : Multiple
   - Impact : Boucle infinie ou state non mis à jour
   - Prévention : ESLint react-hooks/exhaustive-deps

4. **Erreurs SSR Next.js**
   - Date : Multiple
   - Impact : Build failed ou hydration mismatch
   - Prévention : typeof window !== 'undefined' systématique

5. **Fuites mémoire listeners**
   - Date : 20/11/2025
   - Impact : Performance dégradée, crash mobile
   - Prévention : Cleanup dans useEffect return

### Checklist vigilance spécifique cette implémentation

**Pour MediaRecorder API :**
- [ ] Vérifier support navigateur avant utilisation
- [ ] Gérer erreur NotAllowedError (permission micro refusée)
- [ ] Cleanup stream.getTracks().forEach(track => track.stop())
- [ ] Limite durée enregistrement (30 min max)
- [ ] Sauvegarde draft auto toutes les 30s

**Pour IndexedDB :**
- [ ] Vérifier quota disponible avant enregistrement
- [ ] Gérer erreur QuotaExceededError
- [ ] Versioning DB (upgrade migrations)
- [ ] Cleanup curseurs/transactions

**Pour localStorage :**
- [ ] Vérifier quota disponible (try/catch)
- [ ] Gérer erreur QuotaExceededError
- [ ] Parse JSON avec try/catch
- [ ] Pas de données sensibles (tout est côté client)

**Pour navigation Next.js :**
- [ ] Utiliser useRouter de next/router
- [ ] Pas de <a> pour routes internes (utiliser Link ou router.push)
- [ ] Tester shallow routing si nécessaire
- [ ] Préserver état avec query params si besoin

**Pour hooks React :**
- [ ] **JAMAIS de hook dans if/map/loop/fonction**
- [ ] Ordre déclaration identique chaque render
- [ ] Cleanup systématique (timers, listeners, streams)
- [ ] Dépendances useEffect complètes
- [ ] useRef pour valeurs mutables sans re-render

---

## Etape 7 — **Proposition de rollback**

### Stratégie rollback par phase

**Si anomalie Phase 1-2 (Structure + Méditation) :**
- Rollback : Supprimer fichiers créés + retirer bouton jeune.js
- Alternative : Implémenter onglet par onglet (validation incrémentale)
- Documentation anomalie avec date/heure

**Si anomalie Phase 6 (Audios - COMPLEXE) :**
- Rollback : Désactiver onglet Audios (masquer dans navigation)
- Alternative : Implémenter version simplifiée sans waveform d'abord
- Tester sur Chrome/Firefox/Safari séparément
- Documentation anomalie avec date/heure

**Si anomalie navigation jeune.js :**
- Rollback IMMÉDIAT : Retirer bouton + supprimer route
- Revenir état jeune.js avant modification (git checkout)
- Analyse conflit avant nouvelle tentative
- Documentation anomalie avec date/heure

**Si anomalie IndexedDB (quota/compatibilité) :**
- Rollback : Utiliser localStorage pour audios (limitation taille)
- Alternative : Upload Supabase Storage (cloud)
- Alerte utilisateur limitation
- Documentation anomalie avec date/heure

### Format entrée anomalie rollback

```markdown
## Anomalie — [Titre court]
**Date :** 06/12/2025 HH:MM
**Fichier :** [fichier concerné]
**Phase :** [numéro phase]
**Description :** [description détaillée problème]
**Impact :** [conséquences utilisateur]
**Rollback effectué :** [actions réalisées]
**Cause identifiée :** [analyse technique]
**Solution proposée :** [correction à appliquer]
**Statut :** En attente validation / Corrigé / Abandonné
```

**RAPPEL : Toujours ajouter à la FIN du fichier anomalies, JAMAIS supprimer les entrées précédentes.**

---

## Etape 8 — **Rapport Markdown Copilot**

### AVANT implémentation

**État actuel :**

**`pages/jeune.js` (1533 lignes) :**
- ✅ Fonctionnel, build OK
- 27 useState, 15 useEffect
- Navigation jours J1-J14
- 4 sections enrichissement (Plan 1 complété)
- Aucun bouton vers journal spirituel

**Fichiers inexistants :**
- ❌ `pages/journal-spirituel.js`
- ❌ Tous composants onglets
- ❌ audioStorage.js, journalStorage.js
- ❌ JournalSpirituel.module.css

**Structure projet actuelle :**
```
pages/
  jeune.js ✅ (1533 lignes)
  preparation-jeune.js ✅
  suivi.js ✅
  
components/
  (existants : ChecklistConseilsActivation, MessageSoutien, etc.)
  
lib/
  (existants : analyseRepas3Jours.js, etc.)
  
styles/
  (existants : AjoutsJeune.module.css, etc.)
```

### APRÈS implémentation (prévisionnel)

**État prévu :**

**`pages/jeune.js` (1548 lignes - +15 lignes) :**
```javascript
// Ligne ~1250, après section "Ma boîte à outils"
<div className={styles.boutonJournalSpirituel}>
  <button 
    onClick={() => router.push('/journal-spirituel')}
    className={styles.btnRestauration}
  >
    🎙️ Accéder à ma restauration spirituelle
  </button>
  <p className={styles.descriptionBtn}>
    💡 Enregistre tes pensées vocalement, méditations, versets...
  </p>
</div>
```

**Modifications :**
- Import ajouté : `import { useRouter } from 'next/router';`
- Hook ajouté en haut : `const router = useRouter();`
- Bouton ajouté après ligne ~1250
- **AUCUNE suppression de code existant**
- **AUCUNE modification des hooks existants**

**`pages/journal-spirituel.js` (NOUVEAU - 350 lignes) :**
```javascript
import { useState } from 'react';
import { useRouter } from 'next/router';
import OngletMeditation from '../components/OngletMeditation';
import OngletVersets from '../components/OngletVersets';
import OngletQuestions from '../components/OngletQuestions';
import OngletIntentions from '../components/OngletIntentions';
import OngletAudios from '../components/OngletAudios';
import OngletEcriture from '../components/OngletEcriture';
import styles from '../styles/JournalSpirituel.module.css';

export default function JournalSpirituel() {
  // HOOKS (tous en haut)
  const router = useRouter();
  const [ongletActif, setOngletActif] = useState('meditation');
  const [jourJeune, setJourJeune] = useState(null);
  
  // useEffect pour récupérer jour du jeûne
  useEffect(() => {
    const dateJeune = localStorage.getItem('dateJeune');
    if (dateJeune) {
      const diff = calculerJourRelatif(dateJeune, new Date());
      setJourJeune(Math.abs(diff));
    }
  }, []);
  
  // HANDLERS
  const handleRetour = () => {
    router.push('/jeune');
  };
  
  const handleChangeOnglet = (onglet) => {
    setOngletActif(onglet);
  };
  
  // RENDU
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={handleRetour} className={styles.btnRetour}>
          🔙 Retour au jeûne
        </button>
        <h1>🎙️ Ma restauration spirituelle</h1>
        {jourJeune && <span>Jour {jourJeune}</span>}
      </header>
      
      <nav className={styles.onglets} role="tablist">
        {/* 6 onglets avec accessibilité */}
      </nav>
      
      <main className={styles.contenu}>
        {ongletActif === 'meditation' && <OngletMeditation jourJeune={jourJeune} />}
        {ongletActif === 'versets' && <OngletVersets />}
        {ongletActif === 'questions' && <OngletQuestions jourJeune={jourJeune} />}
        {ongletActif === 'intentions' && <OngletIntentions />}
        {ongletActif === 'audios' && <OngletAudios jourJeune={jourJeune} />}
        {ongletActif === 'ecriture' && <OngletEcriture jourJeune={jourJeune} />}
      </main>
    </div>
  );
}
```

**Nouveaux fichiers créés :**
```
pages/
  journal-spirituel.js ✅ (350 lignes)
  
components/
  OngletMeditation.js ✅ (250 lignes)
  OngletVersets.js ✅ (200 lignes)
  OngletQuestions.js ✅ (180 lignes)
  OngletIntentions.js ✅ (200 lignes)
  OngletAudios.js ✅ (300 lignes)
  OngletEcriture.js ✅ (150 lignes)
  AudioRecorder.js ✅ (200 lignes)
  AudioPlayer.js ✅ (150 lignes)
  TimerMeditation.js ✅ (120 lignes)
  
lib/
  audioStorage.js ✅ (100 lignes)
  journalStorage.js ✅ (80 lignes)
  
styles/
  JournalSpirituel.module.css ✅ (400 lignes)
```

**Total : ~2680 lignes créées + 15 lignes ajoutées dans jeune.js**

### Changements fonctionnels

**Nouvelles fonctionnalités :**
1. Page journal spirituel accessible depuis jeune.js
2. 6 onglets spiritualité complets
3. Enregistrement audio avec MediaRecorder
4. Stockage IndexedDB pour audios
5. Stockage localStorage pour métadonnées
6. Timer méditation circulaire
7. Collection versets personnalisée
8. Questions guidées par jour
9. Suivi intentions spirituelles
10. Zone écriture libre illimitée

**Fonctionnalités préservées jeune.js :**
- ✅ Navigation jours J1-J14
- ✅ Validation jour
- ✅ 4 sections enrichissement (Plan 1)
- ✅ Boîte à outils
- ✅ Tous hooks existants intacts
- ✅ Toutes fonctionnalités existantes intactes

---

## Etape 9 — **Validation explicite de l'utilisateur (OBLIGATOIRE)**

**⚠️ Ce plan doit être validé AVANT toute implémentation.**

### Questions validation :

1. **Architecture confirmée ?**
   - 6 onglets (Méditation/Versets/Questions/Intentions/Audios/Écriture) OK ?
   - Historique intégré dans chaque onglet (pas d'onglet séparé) OK ?
   - Stockage IndexedDB audios + localStorage métadonnées OK ?

2. **Modification jeune.js confirmée ?**
   - Ajout bouton uniquement (ligne ~1250) OK ?
   - AUCUNE suppression code existant confirmée ?
   - Position bouton après "Ma boîte à outils" OK ?

3. **Priorités fonctionnalités ?**
   - Tous les 6 onglets en même temps ou phase par phase ?
   - Onglet Audios (le plus complexe) : version complète ou simplifiée d'abord ?

4. **Limite audio confirmée ?**
   - 30 min max par enregistrement OK ?
   - Alerte si IndexedDB plein OK ?

5. **Écriture libre illimitée confirmée ?**
   - Pas de limite caractères/lignes OK ?

### Déclaration validation :

- [x] **J'ai lu et compris l'intégralité de ce plan d'implémentation**
- [x] **J'accepte l'architecture proposée (6 onglets + historiques intégrés)**
- [x] **J'accepte la modification minimale de jeune.js (ajout bouton uniquement)**
- [x] **J'accepte le respect strict des règles hooks React**
- [x] **J'accepte la stratégie rollback en cas d'anomalie**
- [x] **J'accepte les 9 phases d'implémentation (~18h)**

**Validation utilisateur :**
- [x] Plan validé par l'utilisateur à la date : **06/12/2025**

**Signature (commentaire utilisateur) :**
```
Validation confirmée - Mode PHASE PAR PHASE
- 6 onglets confirmés (Méditation/Versets/Questions/Intentions/Audios/Écriture)
- AUCUNE suppression jeune.js confirmée
- Validation requise après chaque phase avant passage suivante
```

---

## 📋 Checklist finale avant démarrage

**Avant de commencer Phase 1, vérifier :**

- [ ] Plan validé par utilisateur avec date
- [ ] Fichier anomalies rollback lu et analysé
- [ ] Tous les risques identifiés et documentés
- [ ] Stratégie rollback définie pour chaque phase
- [ ] Environnement dev fonctionnel (npm run dev OK)
- [ ] Git repository clean (pas de modifications non commitées)
- [ ] Branche dédiée créée (ex: feature/journal-spirituel)
- [ ] Build actuel réussi (npm run build OK)
- [ ] Tests jeune.js actuels OK (navigation, validation, sections)

**Une fois validation obtenue :**
- Créer branche Git : `git checkout -b feature/journal-spirituel`
- Démarrer Phase 1
- Commit après chaque phase réussie
- Tests systématiques avant passage phase suivante

---

## 🎯 Résumé exécutif

**Objectif :** Créer page journal spirituel complète avec 6 onglets

**Durée estimée :** 18 heures (9 phases)

**Complexité :** Élevée (MediaRecorder, IndexedDB, 6 composants, 2680 lignes)

**Risque principal :** Compatibilité MediaRecorder Safari + gestion quota IndexedDB

**Impact jeune.js :** Minimal (+15 lignes, AUCUNE suppression)

**Bénéfice utilisateur :** Espace spirituel complet pendant jeûne

**Validation requise :** OUI — Aucune ligne de code ne sera écrite avant validation explicite

---

**⚠️ EN ATTENTE DE VALIDATION UTILISATEUR**
