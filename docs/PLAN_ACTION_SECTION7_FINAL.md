# 🎯 PLAN D'ACTION FINAL — Section 7 "Comment j'ai mangé"

**Date** : 21 janvier 2026  
**Focus** : Section 7 uniquement  
**Durée estimée** : 4h25

---

## ✅ VALIDATION UTILISATEUR

**Section 2 validée telle quelle** :
- ✅ Comparaison N/N-1 : Verbatims OK (rotation variantes = bon point)
- ✅ Vocabulaire "Attention", "Vigilance", "Alerte", "Bravo" : OK pour l'instant
- ✅ Moyenne 14j : 100% conforme, aucune modification

**Focus exclusif** : Section 7

---

## 📋 TODO SECTION 7 (5 tâches)

### 🔥 **TODO 1** : Dynamiser satiété/humeur (1h20)

**Objectif** : Remplacer données statiques par calculs réels

#### **1.1 - Calculer dans pages/suivi.js** (35min)

**Fichier** : `pages/suivi.js` (ligne ~1100, après calcul `apportsTotaux`)

```javascript
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

// Note utilisateur (chercher dans commentaire ou note)
const repasAvecNote = repasData.find(r => r.commentaire || r.note);
const noteUtilisateur = repasAvecNote?.commentaire || repasAvecNote?.note || null;
```

#### **1.2 - Ajouter à bilanData** (10min)

```javascript
setBilanData({
  weekStart: selectedWeekStart,
  apportsTotaux,
  objectifHebdo,
  kcalExtras,
  extras: extrasInfo.count,
  budgetExtras: calculs?.budgetExtras || 500,
  joursRespectes: joursRespectes.length,
  
  // NOUVEAU - Section 7
  satieteMoyenne,      
  humeurDominante,     
  noteUtilisateur,     
  
  // Ouvrir modale
  ...
});
```

#### **1.3 - Modifier BilanHebdoModal.js** (35min)

**Fichier** : `components/BilanHebdoModal.js` (ligne 611-667)

**Remplacer fonction `SectionCommentMange` complète** :

```javascript
// Bloc Section 7 — Comment j'ai mangé
function SectionCommentMange({ bilan, selectedDate }) {
  const [open, setOpen] = React.useState(false);
  
  // Données dynamiques
  const satieteMoyenne = bilan?.satieteMoyenne;
  const humeurDominante = bilan?.humeurDominante;
  const noteUtilisateur = bilan?.noteUtilisateur;
  const extrasHorsRepas = bilan?.extrasHorsRepas || { matin: 0, apresmidi: 0, soir: 0, nuit: 0 };
  
  // Cas aucune donnée de ressenti
  const aucuneDonnee = !satieteMoyenne && !humeurDominante && !noteUtilisateur;

  return (
    <div style={{marginBottom: '2rem'}}>
      <button
        aria-expanded={open}
        aria-controls="comment-mange-details"
        onClick={() => setOpen(o => !o)}
        style={{
          background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8,
          padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: open ? 10 : 0
        }}
      >
        {open ? 'Masquer le détail ▲' : 'Comment j'ai mangé cette semaine ▼'}
      </button>
      {open && (
        <div id="comment-mange-details" style={{marginTop: '0.7rem', background: '#f7faff', borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #b3d8f7'}}>
          {aucuneDonnee ? (
            <div style={{fontStyle: 'italic', color: '#64748b', padding: '1rem', textAlign: 'center'}}>
              Aucune donnée de ressenti saisie cette semaine.<br/>
              Pense à compléter ton journal pour un suivi plus précis ! 📝
            </div>
          ) : (
            <>
              <h3 style={{color: '#1976d2', marginBottom: '0.7rem', fontSize: '1.13rem'}}>Ressenti global de la semaine</h3>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.07rem'}}>
                <li style={{marginBottom: 7}}>
                  <span style={{fontWeight:600}}>Satiété&nbsp;:</span> 
                  <span>{satieteMoyenne ? `${satieteMoyenne} / 5` : 'Non renseigné'}</span>
                </li>
                <li style={{marginBottom: 7}}>
                  <span style={{fontWeight:600}}>Humeur&nbsp;:</span> 
                  <span>{humeurDominante || 'Non renseigné'}</span>
                </li>
                {noteUtilisateur && (
                  <li style={{marginBottom: 7}}>
                    <span style={{fontWeight:600}}>Note&nbsp;:</span> 
                    <span style={{fontStyle: 'italic', color: '#1976d2'}}>"{noteUtilisateur}"</span>
                  </li>
                )}
              </ul>
              
              <h4 style={{color: '#1976d2', margin: '1.1rem 0 0.5rem 0', fontSize: '1.07rem'}}>Répartition des extras hors repas</h4>
              {(() => {
                const totalExtras = (extrasHorsRepas.matin || 0) + (extrasHorsRepas.apresmidi || 0) + (extrasHorsRepas.soir || 0) + (extrasHorsRepas.nuit || 0);
                
                if (totalExtras === 0) {
                  return (
                    <div style={{fontStyle: 'italic', color: '#64748b', marginBottom: '1rem'}}>
                      Aucun extra hors repas cette semaine. Bravo pour ta régularité ! ✨
                    </div>
                  );
                }
                
                return (
                  <div style={{display: 'flex', gap: '1.2rem', marginBottom: '1rem', flexWrap: 'wrap'}}>
                    <span>Matin&nbsp;: <b>{extrasHorsRepas.matin || 0}</b></span>
                    <span>Après-midi&nbsp;: <b>{extrasHorsRepas.apresmidi || 0}</b></span>
                    <span>Soir&nbsp;: <b>{extrasHorsRepas.soir || 0}</b></span>
                    <span>Nuit&nbsp;: <b>{extrasHorsRepas.nuit || 0}</b></span>
                  </div>
                );
              })()}
              
              <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#1976d2', fontSize: '1.04rem'}}>
                {genererMessageDoux(bilan)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

**Tests** :
- [ ] Affichage avec données complètes
- [ ] Affichage avec données partielles
- [ ] Affichage "Aucune donnée"
- [ ] Note utilisateur visible si présente

---

### 🔥 **TODO 2** : Créer fonctions répartition extras temporelle (40min)

**Objectif** : Détecter patterns temporels (grignotage soir/nuit)

**Fichier** : `lib/validationSemaine.js` (ajouter après ligne 530)

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
    return 'nuit'; // 23h-6h (minuit jusqu'à 6h du matin)
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

**Tests** :
- [ ] Catégorisation heure 6h → matin
- [ ] Catégorisation heure 12h → après-midi
- [ ] Catégorisation heure 18h → soir
- [ ] Catégorisation heure 23h → nuit
- [ ] Catégorisation heure null → ne casse pas

---

### 🔥 **TODO 3** : Intégrer répartition extras dans bilan (50min)

**Objectif** : Alimenter données répartition temporelle

#### **3.1 - Importer fonction** (5min)

**Fichier** : `pages/suivi.js` (ligne ~40)

```javascript
import {
  genererMessageFeedback,
  getMonday,
  addDays,
  formatDate,
  calculerTendance7j,
  calculerRepartitionExtrasTemporelle  // NOUVEAU
} from '../lib/validationSemaine';
```

#### **3.2 - Calculer répartition** (25min)

**Fichier** : `pages/suivi.js` (ligne ~1110, après calcul `extrasInfo`)

```javascript
// Calculer répartition temporelle extras
const extrasAvecHeure = repasData.filter(r => r.est_extra && r.heure_saisie);
const repartitionTemporelle = calculerRepartitionExtrasTemporelle(extrasAvecHeure);

console.log('[LOG BILAN] Répartition extras temporelle:', repartitionTemporelle);
```

#### **3.3 - Ajouter à bilanData** (10min)

```javascript
setBilanData({
  weekStart: selectedWeekStart,
  apportsTotaux,
  objectifHebdo,
  kcalExtras,
  extras: extrasInfo.count,
  budgetExtras: calculs?.budgetExtras || 500,
  joursRespectes: joursRespectes.length,
  satieteMoyenne,
  humeurDominante,
  noteUtilisateur,
  
  // NOUVEAU
  extrasHorsRepas: repartitionTemporelle,
  
  // Ouvrir modale
  ...
});
```

#### **3.4 - Vérifier prérequis BDD** (10min)

⚠️ **IMPORTANT** : Vérifier que la colonne existe

```sql
-- À exécuter dans Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'repas_reels' 
AND column_name = 'heure_saisie';
```

**Si colonne absente** → Créer migration :

```sql
-- Migration: add_heure_saisie_to_repas_reels.sql
ALTER TABLE repas_reels 
ADD COLUMN IF NOT EXISTS heure_saisie TIME;

COMMENT ON COLUMN repas_reels.heure_saisie IS 'Heure de saisie du repas pour catégorisation temporelle';
```

**Tests** :
- [ ] Vérifier colonne `heure_saisie` existe
- [ ] Calcul répartition avec données mixtes (certains avec heure, d'autres sans)
- [ ] Affichage correct dans modale

---

### 🟡 **TODO 4** : Créer fonction message doux personnalisé (55min)

**Objectif** : Adapter verbatim selon données semaine

**Fichier** : `components/BilanHebdoModal.js` (ajouter AVANT fonction `SectionCommentMange`, ligne ~610)

```javascript
/**
 * Génère un message doux personnalisé selon données semaine
 * @param {Object} bilan - Données bilan complet
 * @returns {string} - Message personnalisé
 */
function genererMessageDoux(bilan) {
  if (!bilan) return "Ce que tu ressens aujourd'hui n'est qu'une étape : c'est la continuité qui façonne ton chemin.";
  
  const { extrasHorsRepas, humeurDominante, satieteMoyenne, extras } = bilan;
  
  // Calculer total extras par moment
  const totalExtras = extrasHorsRepas 
    ? (extrasHorsRepas.matin || 0) + (extrasHorsRepas.apresmidi || 0) + (extrasHorsRepas.soir || 0) + (extrasHorsRepas.nuit || 0)
    : extras || 0;
  
  // Cas 1 : Extras concentrés soir/nuit (>70%)
  if (extrasHorsRepas && totalExtras > 0) {
    const soirNuit = (extrasHorsRepas.soir || 0) + (extrasHorsRepas.nuit || 0);
    const proportion = soirNuit / totalExtras;
    
    if (proportion > 0.7) {
      return "Tes extras se concentrent en fin de journée : c'est souvent un signal de fatigue ou de charge mentale, pas un manque de volonté. Prévois une collation structurée à l'heure où tu craques d'habitude.";
    }
  }
  
  // Cas 2 : Humeur basse + extras nombreux (>3)
  const humeursBastes = ['fragile', 'faible', 'triste', 'stressé', 'stressée', 'épuisé', 'épuisée'];
  const humeurBasse = humeurDominante && humeursBastes.some(h => humeurDominante.toLowerCase().includes(h));
  
  if (humeurBasse && totalExtras > 3) {
    return "Cette semaine a été plus riche, et ton humeur a été plus basse. Ton corps cherche du réconfort : c'est humain. On va rendre la semaine prochaine plus facile, pas plus stricte.";
  }
  
  // Cas 3 : Satiété basse (<3.5)
  if (satieteMoyenne && parseFloat(satieteMoyenne) < 3.5) {
    return "Ta satiété moyenne est basse : tes repas ne te portent pas assez longtemps. Augmente les portions de protéines et fibres pour éviter les creux entre repas.";
  }
  
  // Cas 4 : Tout va bien (extras <= 2 ET satiété >= 4)
  if (totalExtras <= 2 && satieteMoyenne && parseFloat(satieteMoyenne) >= 4) {
    return "Cette semaine, tu as maintenu une belle régularité. Ton corps te le rendra : la constance crée le résultat.";
  }
  
  // Cas par défaut (message existant)
  return "Ce que tu ressens aujourd'hui n'est qu'une étape : c'est la continuité qui façonne ton chemin.";
}
```

**Tests** :
- [ ] Cas 1 : Extras soir/nuit > 70% → message fatigue
- [ ] Cas 2 : Humeur "fragile" + 4 extras → message réconfort
- [ ] Cas 3 : Satiété 3.2 → message protéines/fibres
- [ ] Cas 4 : 2 extras + satiété 4.5 → message régularité
- [ ] Cas défaut : autres situations → message continuité

---

### 🟡 **TODO 5** : Tests accessibilité Section 7 (1h30)

**Objectif** : Garantir navigation clavier, ARIA, contraste

#### **5.1 - Navigation clavier** (30min)

**Tests manuels** :
- [ ] Tab : focus visible sur bouton "Comment j'ai mangé ▼"
- [ ] Enter : ouvre/ferme le bloc
- [ ] Espace : ouvre/ferme le bloc
- [ ] Escape : ferme la modale (déjà géré au niveau parent)
- [ ] Focus reste dans modale ouverte (trap focus)

**Amélioration si nécessaire** :

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
  style={{...}}
>
```

#### **5.2 - Attributs ARIA** (20min)

**Vérifications** :
- [ ] `aria-expanded` reflète état (true/false)
- [ ] `aria-controls` pointe vers bon ID
- [ ] `aria-label` descriptif si besoin
- [ ] `role="region"` sur sections importantes

**Code déjà présent** :
```javascript
aria-expanded={open}
aria-controls="comment-mange-details"
```

✅ Déjà OK, pas de modification nécessaire

#### **5.3 - Contraste couleurs** (20min)

**Vérifier ratios WCAG AA (≥ 4.5:1)** :

| Élément | Couleur texte | Couleur fond | Ratio | Conforme |
|---------|---------------|--------------|-------|----------|
| Titre h3 | `#1976d2` | `#f7faff` | ? | À vérifier |
| Texte normal | `#000` (défaut) | `#f7faff` | ? | À vérifier |
| Texte italic | `#1976d2` | `#f7faff` | ? | À vérifier |
| Bouton | `#fff` | `#1976d2` | ? | À vérifier |

**Outil** : [Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Corrections si nécessaire** : Assombrir couleurs si ratio < 4.5:1

#### **5.4 - Screen reader** (20min)

**Tests avec** :
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS)

**Vérifier** :
- [ ] Bouton annoncé correctement
- [ ] État ouvert/fermé annoncé
- [ ] Contenu lu dans bon ordre
- [ ] Pas d'éléments cachés lus

---

## 📊 RÉCAPITULATIF

```
┌──────────────────────────────────────────────────┐
│  SECTION 7 — TODO COMPLÈTE                      │
├──────────────────────────────────────────────────┤
│  TODO 1: Dynamiser satiété/humeur    │ 1h20    │
│  TODO 2: Fonctions répartition        │ 40min   │
│  TODO 3: Intégrer répartition         │ 50min   │
│  TODO 4: Message doux personnalisé    │ 55min   │
│  TODO 5: Tests accessibilité          │ 1h30    │
├──────────────────────────────────────────────────┤
│  TOTAL                                │ 5h15    │
└──────────────────────────────────────────────────┘
```

---

## 🚀 PLANNING

### **Jour 1 (2h10)** :
- ✅ TODO 1 : Dynamiser satiété/humeur (1h20)
- ✅ TODO 2 : Fonctions répartition (40min)
- ✅ Tests TODO 1 & 2 (10min)

### **Jour 2 (1h45)** :
- ✅ TODO 3 : Intégrer répartition (50min)
- ✅ TODO 4 : Message doux (55min)
- ✅ Tests TODO 3 & 4

### **Jour 3 (1h30)** :
- ✅ TODO 5 : Tests accessibilité complets
- ✅ Validation finale

---

## ✅ CHECKLIST AVANT DÉMARRAGE

- [ ] Backup base de données
- [ ] Créer branche Git : `feature/section7-dynamisation`
- [ ] Vérifier colonne `heure_saisie` existe
- [ ] Vérifier champs `satiete` et `humeur_associee` disponibles
- [ ] npm run dev fonctionne

---

## 🎯 VALIDATION FINALE

**Après chaque TODO** :
- [ ] Tests manuels avec données réelles
- [ ] Commit Git avec message descriptif
- [ ] Vérification non-régression autres sections

**Validation utilisateur finale** :
- [ ] Section 7 affiche données dynamiques
- [ ] Message doux s'adapte aux situations
- [ ] Accessibilité complète fonctionnelle
- [ ] Aucune régression Sections 1-6

---

*Plan d'action créé le 21 janvier 2026*  
*Focus exclusif : Section 7 "Comment j'ai mangé"*  
*Durée totale : 5h15*
