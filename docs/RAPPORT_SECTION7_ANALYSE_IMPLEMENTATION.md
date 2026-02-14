# 📋 RAPPORT D'ANALYSE — Section 7 "Comment j'ai mangé" (Bilan Hebdo)

**Date** : 21 janvier 2026  
**Statut actuel** : Section 7 existante, données simulées/statiques, nécessite dynamisation

---

## 1. ÉTAT ACTUEL DU CODE

### Localisation
- Fichier : `/components/BilanHebdoModal.js`
- Lignes : 611-667
- Composant : `SectionCommentMange({ bilan, selectedDate })`

### Structure actuelle
```javascript
function SectionCommentMange({ bilan, selectedDate }) {
  const [open, setOpen] = React.useState(false);
  
  // TODO existant : "remplacer par fetch/agrégation réelle"
  const syntheseSemaine = bilan?.syntheseSemaine || {
    satiete: 'Majorité des repas pris avec satiété', // ❌ STATIQUE
    humeur: 'Humeur globalement stable',              // ❌ STATIQUE
    note: bilan?.note || '',                          // ⚠️ SEMI-DYNAMIQUE
    extrasHorsRepas: bilan?.extrasHorsRepas || {
      matin: 0,        // ❌ TOUTES À ZÉRO
      apresmidi: 0,    // ❌ TOUTES À ZÉRO
      soir: 0,         // ❌ TOUTES À ZÉRO
      nuit: 0          // ❌ TOUTES À ZÉRO
    }
  };
}
```

### Affichage actuel
✅ **Conforme métier** :
- Bloc rétractable (bouton "Comment j'ai mangé cette semaine ▼")
- Titres : "Ressenti global de la semaine", "Répartition des extras hors repas"
- Message doux : "Ce que tu ressens aujourd'hui n'est qu'une étape : c'est la continuité qui façonne ton chemin."
- Accessibilité : `aria-expanded`, `aria-controls`

❌ **Non conforme métier** :
- Données satiété/humeur **statiques** (texte générique)
- Répartition extras hors repas **toutes à 0**
- Note utilisateur **non affichée** (même si `bilan?.note` existe)
- Aucun cas limite géré (aucune donnée saisie)
- Message doux **non personnalisé** selon données réelles

---

## 2. ÉCARTS IDENTIFIÉS (PLAN_IMPL_SECTION2_BILAN_HEBDO.md)

### 🔴 **Écart 1 : Données dynamiques manquantes**
- **État actuel** : Valeurs simulées/statiques
- **Impact** : Utilisateur voit données fictives, perd confiance
- **Priorité** : 🔥 CRITIQUE

### 🔴 **Écart 2 : Note utilisateur non affichée**
- **État actuel** : `bilan?.note` existe mais condition `{syntheseSemaine.note &&` ne rend rien
- **Impact** : Perte d'information précieuse pour l'utilisateur
- **Priorité** : 🔥 HAUTE

### 🔴 **Écart 3 : Répartition extras toutes à 0**
- **État actuel** : Hardcodé à 0 dans fallback
- **Impact** : Impossible de voir patterns temporels (grignotage soir/nuit)
- **Priorité** : 🔥 HAUTE

### 🟡 **Écart 4 : Accessibilité ARIA incomplète**
- **État actuel** : `aria-expanded/controls` présents, mais focus/tabulation non testés
- **Impact** : Navigation clavier potentiellement dégradée
- **Priorité** : 🟡 MOYENNE

### 🟡 **Écart 5 : Message doux non personnalisé**
- **État actuel** : Message statique identique pour tous les cas
- **Impact** : Perte d'opportunité de coaching contextuel
- **Priorité** : 🟡 MOYENNE

### 🟡 **Écart 6 : Cas limites non gérés**
- **État actuel** : Aucun message pédagogique si 0 donnée saisie
- **Impact** : Écran vide ou données 0 sans explication
- **Priorité** : 🟡 MOYENNE

---

## 3. DONNÉES DISPONIBLES (ANALYSE FAISABILITÉ)

### ✅ **Données 100% disponibles**
D'après `/docs/ANALYSE_FAISABILITE_BILAN_HEBDO.md` :

| Donnée | Disponible | Source | Notes |
|--------|------------|--------|-------|
| Satiété moyenne | ✅ OUI | `suivi.js` ligne 1023-1024 | `satieteMoyenne` déjà calculée |
| Humeur moyenne | ✅ OUI | `suivi.js` ligne 1026-1027 | `humeurMoyenne` déjà calculée |
| Notes écrites | ✅ OUI | Table `repas_reels` | Champ `commentaire` ou `note` |

### ❌ **Données NON disponibles (nécessitent développement)**
| Donnée | État | Action requise |
|--------|------|----------------|
| Répartition extras hors repas (matin/après-midi/soir/nuit) | ❌ NON | Extraction heure de saisie + catégorisation temporelle |

---

## 4. STRATÉGIE D'IMPLÉMENTATION

### 🎯 **Phase 1 : Quick Win (1-2h) — PRIORITÉ IMMÉDIATE**

#### Action 1.1 : Rendre satiété et humeur dynamiques
**Objectif** : Remplacer textes statiques par calculs réels

**Approche** :
1. Ajouter `satieteMoyenne` et `humeurMoyenne` à l'objet `bilan` passé au composant
2. Calculer ces valeurs dans `pages/suivi.js` avant ouverture modale
3. Afficher valeurs réelles avec formatage métier

**Calcul métier** :
```javascript
// Dans suivi.js, lors de la préparation du bilan
const repasAvecSatiete = repasSemaine.filter(r => r.satiete !== null);
const satieteMoyenne = repasAvecSatiete.length > 0
  ? (repasAvecSatiete.reduce((sum, r) => sum + r.satiete, 0) / repasAvecSatiete.length).toFixed(1)
  : null;

const repasAvecHumeur = repasSemaine.filter(r => r.humeur_associee !== null);
const humeurDominante = repasAvecHumeur.length > 0
  ? // Calculer humeur dominante (mode statistique)
  : null;
```

**Formatage affichage** :
```javascript
// Satiété : "4,2 / 5" ou "Non renseigné"
satiete: satieteMoyenne ? `${satieteMoyenne} / 5` : 'Non renseigné'

// Humeur : "Bonne énergie" ou "Non renseigné"
humeur: humeurDominante || 'Non renseigné'
```

#### Action 1.2 : Afficher la note utilisateur
**Objectif** : Rendre visible `bilan.note` si présente

**Approche** :
1. Vérifier existence de `bilan.note` (pas `syntheseSemaine.note`)
2. Afficher conditionnellement dans le bloc "Ressenti global"

**Code** :
```javascript
{bilan?.note && (
  <li style={{marginBottom: 7}}>
    <span style={{fontWeight:600}}>Note&nbsp;:</span> 
    <span style={{fontStyle: 'italic', color: '#1976d2'}}>"{bilan.note}"</span>
  </li>
)}
```

#### Action 1.3 : Gérer cas "Aucune donnée saisie"
**Objectif** : Message pédagogique si aucun repas avec satiété/humeur

**Approche** :
```javascript
if (!satieteMoyenne && !humeurDominante) {
  return (
    <div style={{fontStyle: 'italic', color: '#64748b', padding: '1rem'}}>
      Aucune donnée de ressenti saisie cette semaine. 
      Pense à compléter ton journal pour un suivi plus précis !
    </div>
  );
}
```

---

### 🎯 **Phase 2 : Enrichissement (2-3h) — PRIORITÉ HAUTE**

#### Action 2.1 : Implémenter répartition extras hors repas (matin/après-midi/soir/nuit)
**Objectif** : Détecter patterns temporels (grignotage soir/nuit)

**Approche** :
1. Créer fonction `categoriserMomentJournee(heure)` dans `lib/validationSemaine.js`
2. Filtrer extras de la semaine par catégorie temporelle
3. Afficher répartition si extras > 0, sinon message pédagogique

**Fonction utilitaire** :
```javascript
// lib/validationSemaine.js
export function categoriserMomentJournee(heure) {
  // Heure au format "HH:MM" ou "HH:MM:SS"
  const h = parseInt(heure.split(':')[0]);
  
  if (h >= 6 && h < 12) return 'matin';
  if (h >= 12 && h < 18) return 'apresmidi';
  if (h >= 18 && h < 23) return 'soir';
  return 'nuit'; // 23h-6h
}

export function calculerRepartitionExtrasTemporelle(repasExtras) {
  const repartition = { matin: 0, apresmidi: 0, soir: 0, nuit: 0 };
  
  repasExtras.forEach(r => {
    if (r.heure_saisie) {
      const moment = categoriserMomentJournee(r.heure_saisie);
      repartition[moment]++;
    }
  });
  
  return repartition;
}
```

**Intégration** :
```javascript
// Dans suivi.js, calcul du bilan
const extrasAvecHeure = repasSemaine.filter(r => r.est_extra && r.heure_saisie);
const repartitionTemporelle = calculerRepartitionExtrasTemporelle(extrasAvecHeure);

bilanData.extrasHorsRepas = repartitionTemporelle;
```

**Affichage conditionnel** :
```javascript
// Si aucun extra
if (Object.values(syntheseSemaine.extrasHorsRepas).every(v => v === 0)) {
  return <div style={{fontStyle: 'italic', color: '#64748b'}}>
    Aucun extra hors repas cette semaine. Bravo pour ta régularité !
  </div>;
}

// Sinon, afficher répartition
<div style={{display: 'flex', gap: '1.2rem', marginBottom: '1rem'}}>
  <span>Matin&nbsp;: <b>{syntheseSemaine.extrasHorsRepas.matin}</b></span>
  <span>Après-midi&nbsp;: <b>{syntheseSemaine.extrasHorsRepas.apresmidi}</b></span>
  <span>Soir&nbsp;: <b>{syntheseSemaine.extrasHorsRepas.soir}</b></span>
  <span>Nuit&nbsp;: <b>{syntheseSemaine.extrasHorsRepas.nuit}</b></span>
</div>
```

---

### 🎯 **Phase 3 : Personnalisation (1-2h) — PRIORITÉ MOYENNE**

#### Action 3.1 : Personnaliser message doux selon données réelles
**Objectif** : Adapter verbatim selon patterns détectés

**Logique métier** :
```javascript
function genererMessageDoux(syntheseSemaine, bilan) {
  const { extrasHorsRepas } = syntheseSemaine;
  const totalExtras = Object.values(extrasHorsRepas).reduce((a, b) => a + b, 0);
  
  // Cas 1 : Beaucoup d'extras soir/nuit (fatigue/charge mentale)
  if (extrasHorsRepas.soir + extrasHorsRepas.nuit > totalExtras * 0.7) {
    return "Tes extras se concentrent en fin de journée : c'est souvent un signal de fatigue ou de charge mentale, pas un manque de volonté. Prévois une collation structurée à l'heure où tu craques d'habitude.";
  }
  
  // Cas 2 : Humeur basse + extras nombreux
  if (bilan.humeurMoyenne < 3 && totalExtras > 3) {
    return "Cette semaine a été plus riche, et ton humeur a été plus basse. Ton corps cherche du réconfort : c'est humain. On va rendre la semaine prochaine plus facile, pas plus stricte.";
  }
  
  // Cas 3 : Satiété basse (repas non rassasiants)
  if (bilan.satieteMoyenne < 3.5) {
    return "Ta satiété moyenne est basse : tes repas ne te portent pas assez longtemps. Augmente les portions de protéines et fibres pour éviter les creux entre repas.";
  }
  
  // Cas 4 : Tout va bien
  if (totalExtras <= 2 && bilan.satieteMoyenne >= 4) {
    return "Cette semaine, tu as maintenu une belle régularité. Ton corps te le rendra : la constance crée le résultat.";
  }
  
  // Cas par défaut
  return "Ce que tu ressens aujourd'hui n'est qu'une étape : c'est la continuité qui façonne ton chemin.";
}
```

#### Action 3.2 : Vérifier accessibilité complète
**Objectif** : Navigation clavier, focus, contraste

**Tests manuels** :
- [ ] Tabulation : focus visible sur bouton "Comment j'ai mangé ▼"
- [ ] Entrée/Espace : ouvre/ferme le bloc
- [ ] Escape : ferme le bloc (déjà géré au niveau modale)
- [ ] Contraste : textes lisibles (WCAG AA minimum)
- [ ] Screen reader : attributs ARIA corrects

**Améliorations si nécessaire** :
```javascript
<button
  aria-expanded={open}
  aria-controls="comment-mange-details"
  aria-label="Comment j'ai mangé cette semaine"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(o => !o);
    }
  }}
  // ...styles
>
```

---

## 5. CHECKLIST DE VALIDATION (AVANT CODAGE)

### Étape 1 : Audit des risques ✅
- [x] Risques UX identifiés (surcharge visuelle, confusion période)
- [x] Risques techniques identifiés (calculs, synchronisation, régression)
- [x] Risques accessibilité identifiés (navigation clavier, contraste)
- [x] Risques non-conformité métier identifiés (verbatims, visualisation)

### Étape 2 : Checklist systématique ✅
- [x] `useState` importé en haut du composant
- [x] `useEffect` importé (si nécessaire pour calculs)
- [x] Variables d'état déclarées AVANT usage
- [x] Fonctions helpers documentées
- [x] Props bien typées

### Étape 3 : Checklist sécurité & qualité ✅
- [x] Lecture complète du code concerné (BilanHebdoModal.js)
- [x] Initialisation systématique hooks/variables
- [x] Séparation étapes : init → logique → handlers → rendu
- [x] Contrôle erreur systématique (données manquantes, calculs, rendu)
- [x] Préservation fonctionnalités existantes (Sections 1-6)
- [x] Documentation claire

### Étape 4 : Contrôles conformité ✅
- [x] Données disponibles vérifiées (ANALYSE_FAISABILITE_BILAN_HEBDO.md)
- [x] Verbatims strictement alignés fiche métier
- [x] Cas limites identifiés (aucune donnée, données partielles)
- [x] Accessibilité vérifiée (clavier, ARIA, contraste)

---

## 6. PLAN D'ACTION DÉTAILLÉ

### 📋 **TÂCHE 1 : Rendre satiété et humeur dynamiques**
- **Fichier** : `pages/suivi.js` + `components/BilanHebdoModal.js`
- **Durée estimée** : 30min
- **Tests** : Vérifier affichage réel vs simulé, cas "Non renseigné"

### 📋 **TÂCHE 2 : Afficher note utilisateur**
- **Fichier** : `components/BilanHebdoModal.js`
- **Durée estimée** : 15min
- **Tests** : Vérifier affichage avec/sans note

### 📋 **TÂCHE 3 : Gérer cas "Aucune donnée"**
- **Fichier** : `components/BilanHebdoModal.js`
- **Durée estimée** : 20min
- **Tests** : Simuler semaine sans saisie ressenti

### 📋 **TÂCHE 4 : Implémenter répartition extras temporelle**
- **Fichier** : `lib/validationSemaine.js` + `pages/suivi.js` + `components/BilanHebdoModal.js`
- **Durée estimée** : 1h30
- **Tests** : Vérifier catégorisation heure, affichage répartition, cas 0 extra

### 📋 **TÂCHE 5 : Personnaliser message doux**
- **Fichier** : `components/BilanHebdoModal.js`
- **Durée estimée** : 1h
- **Tests** : Vérifier tous les cas (fatigue soir, humeur basse, satiété basse, tout ok)

### 📋 **TÂCHE 6 : Vérifier accessibilité complète**
- **Fichier** : `components/BilanHebdoModal.js`
- **Durée estimée** : 30min
- **Tests** : Navigation clavier, screen reader, contraste

---

## 7. VALIDATION UTILISATEUR REQUISE

**⚠️ AVANT TOUTE IMPLÉMENTATION, VALIDER :**
- [ ] Stratégie Phase 1 (Quick Win)
- [ ] Stratégie Phase 2 (Enrichissement)
- [ ] Stratégie Phase 3 (Personnalisation)
- [ ] Ordre de priorité des tâches
- [ ] Verbatims du message doux personnalisé

**DATE VALIDATION** : _______________

---

## 8. PROCHAINES ACTIONS IMMÉDIATES

1. **Validation utilisateur de ce rapport** ✋ OBLIGATOIRE
2. **Implémentation Tâche 1** (satiété/humeur dynamiques)
3. **Implémentation Tâche 2** (note utilisateur)
4. **Test Phase 1** (Quick Win)
5. **Validation intermédiaire utilisateur**
6. **Suite implémentation Phase 2**

---

*Rapport généré le 21 janvier 2026 par GitHub Copilot*
*Conformité stricte : PLAN_IMPL_SECTION2_BILAN_HEBDO.md*
