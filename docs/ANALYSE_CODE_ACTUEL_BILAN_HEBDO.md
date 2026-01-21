# 🔍 ANALYSE CODE ACTUEL — Bilan Hebdomadaire (21/01/2026)

**Objectif** : Scanner le code actuel et identifier ce qui est déjà implémenté vs ce qui reste à faire

---

## ✅ CE QUI EST DÉJÀ IMPLÉMENTÉ

### **Section 2 — "Tendance et trajectoire"**

#### ✅ 1. Comparaison N/N-1 (Partiellement implémentée)
**Fichier** : `lib/validationSemaine.js` (ligne 387-530)

**✅ Déjà fait** :
- Fonction `calculerComparaisonN1()` existe et fonctionne
- Logique de base avec seuil 100 kcal
- 3 cas identifiés : rapprochement, éloignement, reproduction
- Détection pattern 3 semaines consécutives
- Verbatims rotatifs (6 variantes par cas)
- Couleurs et badges

**❌ Non conforme métier (nouvelle approche COMPARAISON_FICHE_METIER_BILAN_HEBDO.md)** :
- ❌ Verbatims contiennent vocabulaire interdit :
  - "Attention" (ligne 408, 421)
  - "Vigilance" (ligne 407)
  - "Alerte" (ligne 409, 421)
  - "Bravo" (ligne 395, 414, 423, 433)
  - Formulations prescriptives ("Tu peux", "Il est temps de")
- ❌ Logique de calcul `evolution = ecartN - ecartN1` au lieu de `Math.abs(ecartN) - Math.abs(ecartN1)`
- ❌ Verbatims ne respectent pas structure stricte référence :
  - Attendu : "L'écart avec l'objectif [augmente/diminue/reste identique]"
  - Actuel : Mélange plusieurs formulations

**🔧 À CORRIGER (TODO 5)** :
1. Changer calcul : `const evolutionEcart = Math.abs(ecartN) - Math.abs(ecartN1);`
2. Remplacer TOUS les verbatims par verbatims référence conformes
3. Supprimer vocabulaire interdit
4. Simplifier : 1 verbatim par cas (pas de rotation)

---

#### ✅ 2. Moyenne 14j (Totalement implémentée et conforme)
**Fichier** : `components/Moyenne14jBlock.js` (304 lignes)

**✅ Déjà fait** :
- Calcul cumul 14j ✅
- Calcul moyenne journalière ✅
- Récupération écarts N-1 et N depuis `semaines_validees` ✅
- 5 situations détectées : surplus, maîtrise, stabilité, amélioration, éloignement ✅
- Verbatims strictement conformes ADN Plan Vital ✅
- Structure exacte : Cumul → Rythme → Perspective → Signature ✅
- Phrase clé récurrente présente ✅
- Positionnement semaine courante (badge + phrase) ✅
- Rappel contextuel dynamique ✅
- En-tête pédagogique ✅
- Aucun vocabulaire interdit ✅

**✅ CONFORME À 100%** — Aucune modification nécessaire

---

### **Section 7 — "Comment j'ai mangé"**

#### ❌ 1. Satiété et humeur (Non dynamique)
**Fichier** : `components/BilanHebdoModal.js` (ligne 617-620)

**❌ Problème actuel** :
```javascript
const syntheseSemaine = bilan?.syntheseSemaine || {
  satiete: 'Majorité des repas pris avec satiété',  // ❌ HARDCODÉ
  humeur: 'Humeur globalement stable',               // ❌ HARDCODÉ
  note: bilan?.note || '',
  extrasHorsRepas: bilan?.extrasHorsRepas || {      // ❌ TOUS À 0
    matin: 0, apresmidi: 0, soir: 0, nuit: 0
  }
};
```

**❌ Données non calculées dans `pages/suivi.js`** :
- Aucun calcul de `satieteMoyenne`
- Aucun calcul de `humeurDominante`
- Aucun calcul de `extrasHorsRepas` par moment

**🔧 À FAIRE (TODO 1, 2, 3)** :
1. Calculer dans `pages/suivi.js` avant ouverture modale
2. Passer dans objet `bilanData`
3. Utiliser dans composant `SectionCommentMange`

---

#### ❌ 2. Répartition extras temporelle (Non implémentée)
**Fichiers à créer/modifier** :
- `lib/validationSemaine.js` : Fonctions manquantes
- `pages/suivi.js` : Calcul manquant
- `components/BilanHebdoModal.js` : Affichage statique

**❌ Fonctions manquantes** :
- `categoriserMomentJournee(heure)` : N'existe pas
- `calculerRepartitionExtrasTemporelle(repasExtras)` : N'existe pas

**⚠️ Prérequis technique** :
- Table `repas_reels` doit avoir colonne `heure_saisie`
- ⚠️ À VÉRIFIER AVANT IMPLÉMENTATION

**🔧 À FAIRE (TODO 2, 3)** :
1. Créer 2 fonctions dans `lib/validationSemaine.js`
2. Calculer dans `pages/suivi.js`
3. Intégrer dans objet `bilanData`
4. Afficher conditionnellement dans `SectionCommentMange`

---

#### ❌ 3. Message doux personnalisé (Statique)
**Fichier** : `components/BilanHebdoModal.js` (ligne 661)

**❌ Problème actuel** :
```javascript
<div style={{...}}>
  Ce que tu ressens aujourd'hui n'est qu'une étape : 
  c'est la continuité qui façonne ton chemin.
</div>
```
→ Message identique pour tous les cas

**🔧 À FAIRE (TODO 4)** :
1. Créer fonction `genererMessageDoux(syntheseSemaine, bilan)`
2. 4 cas adaptatifs :
   - Extras soir/nuit > 70%
   - Humeur basse + extras > 3
   - Satiété < 3.5
   - Tout OK
3. Remplacer message statique par appel fonction

---

## 📊 RÉCAPITULATIF ÉTAT ACTUEL

| Section | Élément | État | Conformité | Action |
|---------|---------|------|------------|--------|
| **Section 2** | Comparaison N/N-1 | ⚠️ Implémentée | ❌ Non conforme | 🔧 Corriger verbatims |
| **Section 2** | Moyenne 14j | ✅ Implémentée | ✅ Conforme 100% | ✅ Aucune |
| **Section 7** | Satiété/humeur | ❌ Statique | ❌ Non dynamique | 🔧 Calculer + intégrer |
| **Section 7** | Répartition extras | ❌ Non implémentée | ❌ Manquante | 🔧 Créer fonctions |
| **Section 7** | Message doux | ❌ Statique | ❌ Non personnalisé | 🔧 Créer logique |

---

## 🎯 TODO MISE À JOUR

### 🔥 PRIORITÉ CRITIQUE

#### **TODO 5** : Mettre à jour verbatims comparaison N/N-1 (1h)
**Fichier** : `lib/validationSemaine.js` (ligne 387-530)

**Actions** :
1. Changer calcul évolution :
   ```javascript
   // AVANT (incorrect)
   const evolution = ecartN - ecartN1;
   
   // APRÈS (correct)
   const evolutionEcart = Math.abs(ecartN) - Math.abs(ecartN1);
   ```

2. Remplacer verbatims par verbatims référence :
   ```javascript
   // ÉLOIGNEMENT (écart augmente)
   const verbatimEloignement = "L'écart avec l'objectif augmente. Le comportement s'éloigne de la cible.";
   
   // RAPPROCHEMENT (écart diminue)
   const verbatimRapprochement = "L'écart avec l'objectif diminue. Le comportement se rapproche de la cible.";
   
   // REPRODUCTION (variation < 100 kcal)
   const verbatimReproduction = "L'écart avec l'objectif reste quasiment identique. Le même schéma se répète, sans ajustement notable.";
   ```

3. Supprimer :
   - Tous les arrays `verbatimsRapprochement[]`, `verbatimsEloignement[]`, etc.
   - Fonction `pickRandom()`
   - Tous verbatims renforcés (non conformes)
   - Verbatims rotation (1 seul verbatim par cas)

4. Simplifier logique :
   ```javascript
   if (evolutionEcart > seuil) {
     type = 'eloignement';
     verbatim = verbatimEloignement;
     couleur = '#e74c3c';
   } else if (evolutionEcart < -seuil) {
     type = 'rapprochement';
     verbatim = verbatimRapprochement;
     couleur = '#27ae60';
   } else {
     type = 'reproduction';
     verbatim = verbatimReproduction;
     couleur = '#f39c12';
   }
   ```

**Tests** : Vérifier avec écarts réels, cas limites

---

### 🔥 PRIORITÉ HAUTE

#### **TODO 1** : Dynamiser satiété/humeur Section 7 (1h20)

**Sous-tâches** :

**1.1** Calculer dans `pages/suivi.js` (ligne ~1090) :
```javascript
// Après calcul apportsTotaux, avant bilanToInsert

// Calcul satiété moyenne
const repasAvecSatiete = repasData.filter(r => r.satiete !== null && r.satiete !== undefined);
const satieteMoyenne = repasAvecSatiete.length > 0
  ? (repasAvecSatiete.reduce((sum, r) => sum + Number(r.satiete), 0) / repasAvecSatiete.length).toFixed(1)
  : null;

// Calcul humeur dominante (mode statistique)
const repasAvecHumeur = repasData.filter(r => r.humeur_associee !== null && r.humeur_associee !== undefined);
const humeurCounts = {};
repasAvecHumeur.forEach(r => {
  humeurCounts[r.humeur_associee] = (humeurCounts[r.humeur_associee] || 0) + 1;
});
const humeurDominante = Object.keys(humeurCounts).length > 0
  ? Object.entries(humeurCounts).sort((a, b) => b[1] - a[1])[0][0]
  : null;

// Note utilisateur (si présente dans un des repas)
const repasAvecNote = repasData.find(r => r.commentaire || r.note);
const noteUtilisateur = repasAvecNote?.commentaire || repasAvecNote?.note || null;
```

**1.2** Ajouter à `bilanData` :
```javascript
setBilanData({
  weekStart: selectedWeekStart,
  apportsTotaux,
  // ...
  satieteMoyenne,      // NOUVEAU
  humeurDominante,     // NOUVEAU
  noteUtilisateur,     // NOUVEAU
  // ...
});
```

**1.3** Modifier `BilanHebdoModal.js` (ligne 617-650) :
```javascript
function SectionCommentMange({ bilan, selectedDate }) {
  const [open, setOpen] = React.useState(false);
  
  // Données dynamiques
  const satieteMoyenne = bilan?.satieteMoyenne;
  const humeurDominante = bilan?.humeurDominante;
  const noteUtilisateur = bilan?.noteUtilisateur;
  
  // Cas aucune donnée
  if (!satieteMoyenne && !humeurDominante && !noteUtilisateur) {
    return (
      <div style={{...}}>
        <button>...</button>
        {open && (
          <div style={{fontStyle: 'italic', color: '#64748b', padding: '1rem'}}>
            Aucune donnée de ressenti saisie cette semaine. 
            Pense à compléter ton journal pour un suivi plus précis !
          </div>
        )}
      </div>
    );
  }
  
  // Affichage données
  return (
    <div>
      <button>...</button>
      {open && (
        <div>
          <h3>Ressenti global de la semaine</h3>
          <ul>
            <li>
              <span>Satiété :</span> 
              <span>{satieteMoyenne ? `${satieteMoyenne} / 5` : 'Non renseigné'}</span>
            </li>
            <li>
              <span>Humeur :</span> 
              <span>{humeurDominante || 'Non renseigné'}</span>
            </li>
            {noteUtilisateur && (
              <li>
                <span>Note :</span> 
                <span style={{fontStyle: 'italic', color: '#1976d2'}}>"{noteUtilisateur}"</span>
              </li>
            )}
          </ul>
          {/* ... */}
        </div>
      )}
    </div>
  );
}
```

**Tests** : Vérifier affichage avec/sans données, cas "Non renseigné"

---

#### **TODO 2** : Créer fonctions répartition extras temporelle (40min)

**Fichier** : `lib/validationSemaine.js` (après ligne 530)

```javascript
/**
 * Catégorise un moment de la journée selon l'heure
 * @param {string} heure - Heure au format "HH:MM" ou "HH:MM:SS"
 * @returns {string} - 'matin' | 'apresmidi' | 'soir' | 'nuit'
 */
export function categoriserMomentJournee(heure) {
  if (!heure) return 'inconnu';
  
  try {
    const h = parseInt(heure.split(':')[0]);
    
    if (h >= 6 && h < 12) return 'matin';
    if (h >= 12 && h < 18) return 'apresmidi';
    if (h >= 18 && h < 23) return 'soir';
    return 'nuit'; // 23h-6h
  } catch (error) {
    console.error('Erreur categoriserMomentJournee:', error);
    return 'inconnu';
  }
}

/**
 * Calcule la répartition des extras par moment de journée
 * @param {Array} repasExtras - Liste des repas extras avec heure_saisie
 * @returns {Object} - { matin: number, apresmidi: number, soir: number, nuit: number }
 */
export function calculerRepartitionExtrasTemporelle(repasExtras) {
  const repartition = { matin: 0, apresmidi: 0, soir: 0, nuit: 0 };
  
  if (!repasExtras || !Array.isArray(repasExtras)) {
    return repartition;
  }
  
  repasExtras.forEach(repas => {
    if (repas.heure_saisie) {
      const moment = categoriserMomentJournee(repas.heure_saisie);
      if (moment !== 'inconnu' && repartition.hasOwnProperty(moment)) {
        repartition[moment]++;
      }
    }
  });
  
  return repartition;
}
```

**Tests** : Vérifier catégorisation heures limites (6h, 12h, 18h, 23h)

---

#### **TODO 3** : Intégrer répartition extras dans bilan (50min)

**3.1** Modifier `pages/suivi.js` (ligne ~1090) :
```javascript
// Après calcul extrasInfo, avant bilanToInsert

// Calculer répartition temporelle extras
const extrasAvecHeure = repasData.filter(r => r.est_extra && r.heure_saisie);
const repartitionTemporelle = calculerRepartitionExtrasTemporelle(extrasAvecHeure);

// Ajouter à bilanData
setBilanData({
  // ...
  extrasHorsRepas: repartitionTemporelle, // NOUVEAU
  // ...
});
```

**3.2** Modifier `BilanHebdoModal.js` (ligne 652-658) :
```javascript
<h4>Répartition des extras hors repas</h4>
{(() => {
  const { matin, apresmidi, soir, nuit } = bilan?.extrasHorsRepas || {};
  const totalExtras = (matin || 0) + (apresmidi || 0) + (soir || 0) + (nuit || 0);
  
  if (totalExtras === 0) {
    return (
      <div style={{fontStyle: 'italic', color: '#64748b', marginBottom: '1rem'}}>
        Aucun extra hors repas cette semaine. Bravo pour ta régularité ! ✨
      </div>
    );
  }
  
  return (
    <div style={{display: 'flex', gap: '1.2rem', marginBottom: '1rem'}}>
      <span>Matin : <b>{matin || 0}</b></span>
      <span>Après-midi : <b>{apresmidi || 0}</b></span>
      <span>Soir : <b>{soir || 0}</b></span>
      <span>Nuit : <b>{nuit || 0}</b></span>
    </div>
  );
})()}
```

**⚠️ Prérequis** : Vérifier colonne `heure_saisie` existe dans table `repas_reels`

**Tests** : Vérifier affichage avec/sans extras, heures variées

---

### 🟡 PRIORITÉ MOYENNE

#### **TODO 4** : Créer fonction message doux personnalisé (55min)

**Fichier** : `components/BilanHebdoModal.js` (avant ligne 611)

```javascript
/**
 * Génère un message doux personnalisé selon données semaine
 * @param {Object} bilan - Données bilan complet
 * @returns {string} - Message personnalisé
 */
function genererMessageDoux(bilan) {
  const { extrasHorsRepas, humeurDominante, satieteMoyenne, extras } = bilan || {};
  
  // Calculer total extras par moment
  const totalExtras = extrasHorsRepas 
    ? Object.values(extrasHorsRepas).reduce((a, b) => a + b, 0) 
    : extras || 0;
  
  // Cas 1 : Extras concentrés soir/nuit (>70%)
  if (extrasHorsRepas) {
    const soirNuit = (extrasHorsRepas.soir || 0) + (extrasHorsRepas.nuit || 0);
    if (totalExtras > 0 && soirNuit / totalExtras > 0.7) {
      return "Tes extras se concentrent en fin de journée : c'est souvent un signal de fatigue ou de charge mentale, pas un manque de volonté. Prévois une collation structurée à l'heure où tu craques d'habitude.";
    }
  }
  
  // Cas 2 : Humeur basse + extras nombreux
  const humeursBastes = ['fragile', 'faible', 'triste', 'stressé'];
  if (humeurDominante && humeursBastes.includes(humeurDominante.toLowerCase()) && totalExtras > 3) {
    return "Cette semaine a été plus riche, et ton humeur a été plus basse. Ton corps cherche du réconfort : c'est humain. On va rendre la semaine prochaine plus facile, pas plus stricte.";
  }
  
  // Cas 3 : Satiété basse (<3.5)
  if (satieteMoyenne && parseFloat(satieteMoyenne) < 3.5) {
    return "Ta satiété moyenne est basse : tes repas ne te portent pas assez longtemps. Augmente les portions de protéines et fibres pour éviter les creux entre repas.";
  }
  
  // Cas 4 : Tout va bien
  if (totalExtras <= 2 && satieteMoyenne && parseFloat(satieteMoyenne) >= 4) {
    return "Cette semaine, tu as maintenu une belle régularité. Ton corps te le rendra : la constance crée le résultat.";
  }
  
  // Cas par défaut
  return "Ce que tu ressens aujourd'hui n'est qu'une étape : c'est la continuité qui façonne ton chemin.";
}
```

**Modifier ligne 661** :
```javascript
<div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#1976d2', fontSize: '1.04rem'}}>
  {genererMessageDoux(bilan)}
</div>
```

**Tests** : Vérifier tous les cas (fatigue, humeur basse, satiété basse, OK, défaut)

---

#### **TODO 7** : Tests accessibilité (1h30)

**Tests Section 2 & 7** :
- [ ] Navigation Tab complète (focus visible)
- [ ] Enter/Espace ouvrent/ferment blocs
- [ ] Attributs ARIA corrects
- [ ] Contraste WCAG AA (vérifier couleurs)
- [ ] Screen reader fonctionnel

---

## 📅 PLANNING RECOMMANDÉ

### **Jour 1** (2h) :
- ✅ TODO 5 : Corriger verbatims N/N-1 (1h)
- ✅ TODO 1 : Dynamiser satiété/humeur (1h)

### **Jour 2** (2h30) :
- ✅ TODO 2 : Créer fonctions répartition (40min)
- ✅ TODO 3 : Intégrer répartition (50min)
- ✅ TODO 4 : Message doux (55min)

### **Jour 3** (1h30) :
- ✅ TODO 7 : Tests accessibilité (1h30)

**TOTAL : 6h** (vs 12h35 estimé initialement)

---

## ✅ VALIDATION FINALE

**Avant de démarrer** :
- [ ] Vérifier colonne `heure_saisie` existe dans `repas_reels`
- [ ] Vérifier champs `satiete` et `humeur_associee` disponibles
- [ ] Backup base de données
- [ ] Créer branche Git : `feature/bilan-hebdo-conformite-finale`

**Après chaque TODO** :
- [ ] Tests manuels avec données réelles
- [ ] Vérification non-régression Sections 1-6
- [ ] Commit Git avec message descriptif

**Validation finale** :
- [ ] Relecture utilisateur verbatims N/N-1
- [ ] Tests accessibilité complets
- [ ] Merge dans main

---

*Analyse effectuée le 21 janvier 2026*  
*Fichiers scannés : validationSemaine.js, BilanHebdoModal.js, Moyenne14jBlock.js, suivi.js*
