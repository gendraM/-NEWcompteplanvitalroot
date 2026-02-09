# 🔍 ANALYSE BESOINS UTILISATEUR vs FICHIER "MAJ BILAN HEBDO"

**Date** : 25 janvier 2026  
**Objectif** : Identifier ce qui est couvert, ce qui manque, et proposer enrichissements

---

## 📊 TABLEAU COMPARATIF — Besoins vs Couverture actuelle

| # | Besoin exprimé | Couvert dans "maj bilan hebdo" | Statut | Localisation |
|---|----------------|-------------------------------|--------|--------------|
| 1 | **Points positifs** : Valoriser jours en dessous/dans objectif calorique | ✅ OUI (partiel) | 🟡 À enrichir | Section A - Répartition jours |
| 2 | **Séries de jours réussis** : Identifier et encourager les streaks | ❌ NON | 🔴 Manquant | - |
| 3 | **Alerte journée problématique** : Une mauvaise journée peut tout gâcher | ✅ OUI | 🟢 Couvert | Section B - Impact jours |
| 4 | **Explication détaillée semaine** : Comprendre ce qui s'est passé | ✅ OUI (partiel) | 🟡 À enrichir | Sections A+B+C combinées |
| 5 | **Messages encourageants sur forces** | ✅ OUI (partiel) | 🟡 À enrichir | Verbatims Plan Vital |
| 6 | **Messages sur zones de faiblesse** | ❌ NON | 🔴 Manquant | - |
| 7 | **Typologie repas jours forte densité** | ❌ NON | 🔴 Manquant | - |
| 8 | **Objectif semaine pro personnalisé** (champ libre utilisateur) | ❌ NON | 🔴 Manquant | - |
| 9 | **Voir détail repas du jour** dans suivi | ❌ NON | 🟠 Hors scope bilan | Concerne page suivi.js |
| 10 | **Historique bilans hebdo** | ❌ NON | 🟠 Hors scope bilan | Nouvelle fonctionnalité à créer |
| 11 | **Comparaison extras S-1** | ✅ OUI | 🟢 Couvert | Section C - Évolution extras |

---

## ✅ CE QUI EST DÉJÀ COUVERT (bien fait)

### Section A — Répartition des jours vs objectif
**Besoin 1 couvert à 60%**

✅ **Ce qui est fait** :
- Comptage jours sous/proches/léger dépassement/débordement
- Phrase synthèse : "Sur 7 jours : X jours sous ou proches de l'objectif..."
- Verbatim dynamique selon profil semaine

⚠️ **Ce qui manque pour couvrir besoin 1 à 100%** :
- Valorisation explicite des jours réussis
- Exemple actuel : "Sur 7 jours : 5 jours sous ou proches" → OK mais manque encouragement explicite
- **Proposition** : Ajouter phrase spécifique : "Bravo, 5 jours sur 7 sont restés alignés avec ton objectif. C'est une base solide à préserver."

---

### Section B — Jour(s) qui pèsent dans l'écart
**Besoin 3 couvert à 100%** ✅

✅ **Ce qui est fait** :
- Identification du jour le plus lourd (ex: 60% de l'excédent)
- Verbatim clair : "L'écart ne s'est pas construit progressivement : il s'est surtout joué sur un moment précis."
- Distinction concentré vs diffus

**Exemple concret (ton cas dimanche 25 janvier)** :
```
Section B affichera :
"1 journée explique ~60% de l'excédent hebdomadaire."

Verbatim :
"La semaine a été globalement tenue.
Une journée a déplacé la trajectoire.
Ce n'est pas une semaine "ratée".
C'est un point à sécuriser."
```

✅ **Ce besoin est parfaitement couvert** : L'app ne dira plus "tu as fait ta pire semaine" mais "la semaine était tenue sauf 1 jour".

---

### Section C — Évolution extras vs semaine précédente
**Besoin 11 couvert à 100%** ✅

✅ **Ce qui est fait** :
- Delta kcal extras (N vs N-1)
- Delta nombre extras (N vs N-1)
- Seuils : Progrès / Stable / Plus présent
- Verbatim évolution comportement

**Exemple** :
```
Si extras S-1 = 3 et extras S = 1 :
→ "Les extras sont mieux maîtrisés que la semaine précédente.
   Une régulation est déjà en place."

Si extras S-1 = 1 et extras S = 3 :
→ "Les extras ont été plus présents cette semaine.
   Sur la durée, cela pèse dans la trajectoire."
```

✅ **Ce besoin est parfaitement couvert** : Comparaison S-1 intégrée + évolution comportement visible.

---

## 🔴 CE QUI MANQUE (à ajouter)

### 🆕 BESOIN 2 — Séries de jours réussis (streaks)

**Pourquoi c'est important** :
- Ton cas : "tout allait bien depuis début de semaine" → Cette info doit être visible et valorisée
- Permet de voir qu'une semaine n'est pas "ratée" si 5-6 jours sont OK

**Proposition d'enrichissement Section A** :

#### Nouvelle logique à ajouter

```javascript
// Dans calculerRepartitionJours()
// Détecter les séquences de jours conformes consécutifs

function detecterStreaksReussis(detailsJours) {
  let streaks = [];
  let currentStreak = 0;
  
  detailsJours.forEach(jour => {
    if (jour.categorie === 'sous' || jour.categorie === 'proche') {
      currentStreak++;
    } else {
      if (currentStreak >= 2) {
        streaks.push(currentStreak);
      }
      currentStreak = 0;
    }
  });
  
  // Gérer dernier streak
  if (currentStreak >= 2) {
    streaks.push(currentStreak);
  }
  
  return {
    longestStreak: Math.max(...streaks, 0),
    streaks: streaks
  };
}
```

#### Affichage proposé dans BilanHebdoModal

```javascript
// Dans BlocRepartitionJours(), après phrase répartition

{bilan.longestStreak >= 3 && (
  <div style={{
    marginTop: '0.7rem',
    padding: '0.7rem 1rem',
    background: '#f0fdf4',
    borderLeft: '4px solid #22c55e',
    borderRadius: 6
  }}>
    <span style={{fontSize: '1.1rem'}}>✅</span>
    <span style={{marginLeft: '0.5rem', color: '#15803d', fontWeight: 600}}>
      {bilan.longestStreak} jours consécutifs alignés avec ton objectif. 
      Cette régularité est ta vraie force cette semaine.
    </span>
  </div>
)}
```

**Verbatim Plan Vital pour les streaks** :
- Si longestStreak >= 5 : "Cette régularité sur 5+ jours montre que tu maîtrises la base. La trajectoire est là."
- Si longestStreak >= 3 : "Trois jours alignés d'affilée, c'est une vraie continuité. Le corps perçoit cette stabilité."
- Si longestStreak < 3 : "La semaine manque de continuité. Concentre-toi sur enchaîner 2-3 jours alignés."

---

### 🆕 BESOIN 6 — Messages sur zones de faiblesse (typologie repas)

**Pourquoi c'est important** :
- "Zone sur laquelle il faut travailler" → Identifier patterns problématiques
- "Typologie repas dans jours à forte densité" → Comprendre QUOI a fait déraper

**Proposition : Nouvelle Section D — Analyse des fragilités**

#### Où l'intégrer ?
- Fichier : `BilanHebdoModal.js`
- Emplacement : Après Section C (Évolution extras)
- Nom fonction : `BlocAnalyseFragilites`

#### Données requises (à calculer dans pages/suivi.js)

```javascript
// Nouvelles données à ajouter à bilanData
{
  fragilites: {
    joursDebordement: [
      {
        date: '2026-01-25',
        kcal_total: 3200,
        ecart: +850,
        repasProblematiques: [
          { type: 'Déjeuner', kcal: 1200, aliment: 'Fast food' },
          { type: 'extra', kcal: 500, moment: 'soir' }
        ]
      }
    ],
    typologieProblematique: 'extras_soir' | 'repas_trop_lourds' | 'cumul_repas_extras',
    momentFragile: 'soir' | 'dejeuner' | 'après-midi'
  }
}
```

#### Calcul à implémenter

**Fichier** : `/lib/validationSemaine.js`  
**Nouvelle fonction** :

```javascript
export function analyserFragilites(repasReels, weekStart, detailsJours) {
  // 1. Identifier jours de débordement (ecart >= +300)
  const joursDebordement = detailsJours.filter(j => j.categorie === 'debordement');
  
  // 2. Pour chaque jour problématique, extraire repas les plus lourds
  const fragilites = joursDebordement.map(jour => {
    const repasDuJour = repasReels.filter(r => r.date === jour.date);
    
    // Trier par kcal décroissant
    const repasProblematiques = repasDuJour
      .sort((a, b) => (b.kcal || 0) - (a.kcal || 0))
      .slice(0, 3); // Top 3 repas les plus lourds
    
    return {
      date: jour.date,
      kcal_total: jour.kcal_total,
      ecart: jour.ecart,
      repasProblematiques
    };
  });
  
  // 3. Détecter typologie problématique
  let typologie = null;
  let momentFragile = null;
  
  const extrasNombreux = fragilites.some(f => 
    f.repasProblematiques.filter(r => r.est_extra).length >= 2
  );
  
  const repasLourds = fragilites.some(f =>
    f.repasProblematiques.some(r => !r.est_extra && r.kcal >= 800)
  );
  
  if (extrasNombreux && repasLourds) {
    typologie = 'cumul_repas_extras';
  } else if (extrasNombreux) {
    typologie = 'extras_nombreux';
    // Détecter moment fragile
    const momentsExtras = [];
    fragilites.forEach(f => {
      f.repasProblematiques
        .filter(r => r.est_extra)
        .forEach(r => momentsExtras.push(r.moment || 'inconnu'));
    });
    momentFragile = getMomentDominant(momentsExtras);
  } else if (repasLourds) {
    typologie = 'repas_trop_lourds';
  }
  
  return {
    joursDebordement: fragilites,
    typologieProblematique: typologie,
    momentFragile
  };
}

function getMomentDominant(moments) {
  const counts = {};
  moments.forEach(m => counts[m] = (counts[m] || 0) + 1);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, null);
}
```

#### Affichage proposé dans BilanHebdoModal

```javascript
function BlocAnalyseFragilites() {
  const { fragilites } = bilan || {};
  
  if (!fragilites || fragilites.joursDebordement.length === 0) {
    return null; // Pas de fragilité détectée
  }
  
  return (
    <section style={{
      marginTop: '1.5rem',
      padding: '1.2rem',
      background: '#fffbeb',
      borderRadius: 10,
      border: '2px solid #f59e0b'
    }}>
      <h4 style={{color: '#d97706', fontSize: '1.1rem', marginBottom: '0.7rem'}}>
        🔍 Zones de vigilance
      </h4>
      
      {/* Affichage typologie problématique */}
      {fragilites.typologieProblematique === 'cumul_repas_extras' && (
        <p>
          Sur les journées de débordement, c'est le cumul de repas lourds ET d'extras 
          qui a déplacé la trajectoire. La vigilance doit porter sur les deux.
        </p>
      )}
      
      {fragilites.typologieProblematique === 'extras_nombreux' && (
        <p>
          Les extras se sont concentrés {fragilites.momentFragile && `le ${fragilites.momentFragile}`}, 
          créant une charge difficile à absorber. C'est le point à sécuriser.
        </p>
      )}
      
      {fragilites.typologieProblematique === 'repas_trop_lourds' && (
        <p>
          Certains repas principaux dépassent largement le cadre prévu. 
          Même sans extras, cela suffit à créer un excédent.
        </p>
      )}
      
      {/* Liste des jours problématiques (optionnel, rétractable) */}
      <details style={{marginTop: '0.7rem'}}>
        <summary style={{cursor: 'pointer', fontWeight: 600, color: '#d97706'}}>
          Voir le détail des journées
        </summary>
        <div style={{marginTop: '0.5rem', fontSize: '0.95rem'}}>
          {fragilites.joursDebordement.map((jour, idx) => (
            <div key={idx} style={{marginBottom: '0.5rem', paddingLeft: '1rem'}}>
              <b>{formatDate(jour.date, 'd MMM')}</b> : {jour.kcal_total} kcal (écart : +{jour.ecart})
              <ul style={{fontSize: '0.9rem', color: '#78716c', marginTop: '0.3rem'}}>
                {jour.repasProblematiques.map((r, i) => (
                  <li key={i}>
                    {r.type} : {r.aliment} ({r.kcal} kcal)
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
```

**Verbatim Plan Vital pour les fragilités** :
- Toujours formuler en observation, jamais en reproche
- Pointer le pattern, pas la faute
- Finir par une ouverture : "C'est identifié. La semaine prochaine, tu sais où porter ton attention."

---

### 🆕 BESOIN 8 — Objectif personnalisé semaine prochaine

**Pourquoi c'est important** :
- Ton exemple : "Mon goal c'est de continuer les bonnes choses et rectifier les écarts identifiés. Plus de journée comme dimanche 25 janvier !"
- Appropriation de l'objectif (pas imposé par l'app)

**Proposition : Bloc "Mon objectif pour la semaine prochaine"**

#### Où l'intégrer ?
- Fichier : `BilanHebdoModal.js`
- Emplacement : En fin de modale (après Section 7)
- Nom fonction : `BlocObjectifSemaineProchaine`

#### Interface proposée

```javascript
function BlocObjectifSemaineProchaine() {
  const [objectifPerso, setObjectifPerso] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  
  // Charger objectif existant depuis localStorage ou Supabase
  React.useEffect(() => {
    const saved = localStorage.getItem(`objectif_semaine_${getNextWeekStart()}`);
    if (saved) setObjectifPerso(saved);
  }, []);
  
  const handleSave = async () => {
    // Sauvegarder dans localStorage + optionnel Supabase
    localStorage.setItem(`objectif_semaine_${getNextWeekStart()}`, objectifPerso);
    
    // Optionnel : Sauvegarder en BDD
    if (supabase) {
      await supabase.from('objectifs_personnalises').insert({
        user_id: userId,
        week_start: getNextWeekStart(),
        objectif: objectifPerso,
        created_at: new Date().toISOString()
      });
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  return (
    <section style={{
      marginTop: '2rem',
      padding: '1.5rem',
      background: '#fef3c7',
      borderRadius: 10,
      border: '2px solid #fbbf24'
    }}>
      <h4 style={{color: '#d97706', fontSize: '1.15rem', marginBottom: '0.5rem'}}>
        🎯 Mon objectif pour la semaine prochaine
      </h4>
      <p style={{fontSize: '0.95rem', color: '#78716c', marginBottom: '1rem'}}>
        Prends un moment pour noter ce que tu veux améliorer. 
        C'est ton engagement, pas une consigne.
      </p>
      
      <textarea
        value={objectifPerso}
        onChange={(e) => setObjectifPerso(e.target.value)}
        placeholder="Ex : Continuer les bonnes choses et rectifier les écarts identifiés. Plus de journée comme dimanche 25 janvier !"
        rows={4}
        style={{
          width: '100%',
          padding: '0.8rem',
          borderRadius: 8,
          border: '2px solid #fbbf24',
          fontSize: '1rem',
          fontFamily: 'inherit',
          resize: 'vertical'
        }}
      />
      
      <button
        onClick={handleSave}
        style={{
          marginTop: '0.7rem',
          background: '#d97706',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '0.6rem 1.2rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        {saved ? '✅ Enregistré !' : 'Enregistrer mon objectif'}
      </button>
      
      <div style={{marginTop: '1rem', fontSize: '0.9rem', color: '#78716c', fontStyle: 'italic'}}>
        💡 Cet objectif sera affiché en début de semaine prochaine pour te rappeler ta direction.
      </div>
    </section>
  );
}
```

#### Affichage en début de semaine suivante

Dans `pages/suivi.js`, ajouter un bandeau en haut de page :

```javascript
// Si on est en début de semaine (lundi-mardi) ET qu'un objectif perso existe
{objectifPersoSemaineActuelle && (
  <div style={{
    margin: '1rem 0',
    padding: '1rem 1.3rem',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    borderRadius: 10,
    border: '2px solid #fbbf24',
    boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
  }}>
    <div style={{fontSize: '0.9rem', color: '#78716c', marginBottom: '0.3rem'}}>
      🎯 Mon objectif pour cette semaine :
    </div>
    <div style={{fontSize: '1.05rem', fontWeight: 600, color: '#92400e'}}>
      {objectifPersoSemaineActuelle}
    </div>
  </div>
)}
```

---

### 🆕 BESOIN 9 — Voir détail repas du jour (dans page suivi)

**Statut** : 🟠 Hors scope bilan hebdo (concerne page suivi.js)

**Proposition** :
- Créer une section "Détail des repas du jour" dans `pages/suivi.js`
- Afficher liste des repas avec kcal, catégorie, conformité
- Bouton "Voir historique de la journée" qui déploie la liste

**À traiter séparément** du bilan hebdo (autre ticket/tâche).

---

### 🆕 BESOIN 10 — Historique bilans hebdomadaires

**Statut** : 🟠 Hors scope bilan hebdo actuel (nouvelle fonctionnalité)

**Proposition** :
- Créer nouveau composant `HistoriqueBilansModal.js`
- Bouton dans page suivi : "Voir mes bilans passés"
- Liste des bilans validés avec dates + bouton "Consulter"
- Réutiliser `BilanHebdoModal` en mode lecture seule

**À traiter séparément** du bilan hebdo (autre ticket/tâche).

---

## 📋 RÉSUMÉ — Ce qui manque et priorités

| # | Besoin manquant | Complexité | Priorité | Impact utilisateur |
|---|-----------------|------------|----------|-------------------|
| 2 | Séries jours réussis (streaks) | 🟢 Faible | 🔥 Critique | ⭐⭐⭐⭐⭐ Essentiel pour ton cas |
| 6 | Analyse fragilités + typologie repas | 🟡 Moyenne | 🔥 Critique | ⭐⭐⭐⭐⭐ Essentiel pour comprendre |
| 8 | Objectif perso semaine pro | 🟢 Faible | 🟡 Haute | ⭐⭐⭐⭐ Appropriation forte |
| 9 | Détail repas du jour | 🟢 Faible | 🟢 Moyenne | ⭐⭐⭐ Confort |
| 10 | Historique bilans hebdo | 🟡 Moyenne | 🟢 Moyenne | ⭐⭐⭐ Consultation passé |

---

## 🎯 PLAN D'ACTION ENRICHISSEMENT

### Phase 1 — Ajouts critiques (priorité 🔥)

1. **Ajouter détection streaks réussis** (Besoin 2)
   - Fichier : `lib/validationSemaine.js`
   - Fonction : `detecterStreaksReussis` (dans `calculerRepartitionJours`)
   - Affichage : Enrichir `BlocRepartitionJours` dans `BilanHebdoModal.js`
   - **Durée estimée** : 2-3h

2. **Créer Section D — Analyse fragilités** (Besoin 6)
   - Fichier : `lib/validationSemaine.js`
   - Fonction : `analyserFragilites`
   - Affichage : Nouveau bloc `BlocAnalyseFragilites` dans `BilanHebdoModal.js`
   - **Durée estimée** : 4-5h

### Phase 2 — Ajouts haute priorité (priorité 🟡)

3. **Créer bloc objectif personnalisé** (Besoin 8)
   - Fichier : `BilanHebdoModal.js`
   - Fonction : `BlocObjectifSemaineProchaine`
   - Affichage début semaine suivante dans `pages/suivi.js`
   - **Durée estimée** : 2-3h

### Phase 3 — Ajouts confort (priorité 🟢)

4. **Détail repas du jour** (Besoin 9)
   - Fichier : `pages/suivi.js`
   - Nouvelle section dépliable
   - **Durée estimée** : 2h

5. **Historique bilans hebdo** (Besoin 10)
   - Nouveau composant `HistoriqueBilansModal.js`
   - Fetch depuis `semaines_validees` Supabase
   - **Durée estimée** : 4-5h

---

## 🔄 INTÉGRATION AVEC "MAJ BILAN HEBDO" EXISTANT

### Structure finale proposée

```
┌─────────────────────────────────────────────────┐
│  BILAN HEBDOMADAIRE                             │
├─────────────────────────────────────────────────┤
│  Section 1 — Signal énergétique (existant)      │
│  ► En savoir plus                               │
│  ► Lecture de la semaine                        │
├─────────────────────────────────────────────────┤
│  🆕 LECTURE A — Répartition jours               │
│     + 🆕 Valorisation streaks réussis (Phase 1) │ ← NOUVEAU
├─────────────────────────────────────────────────┤
│  🆕 LECTURE B — Impact jours (existant)         │
├─────────────────────────────────────────────────┤
│  🆕 LECTURE C — Évolution extras (existant)     │
├─────────────────────────────────────────────────┤
│  🆕 SECTION D — Analyse fragilités (Phase 1)    │ ← NOUVEAU
│     • Typologie repas problématiques            │
│     • Moments fragiles                          │
│     • Liste jours débordement (rétractable)     │
├─────────────────────────────────────────────────┤
│  Section 2 — Tendance trajectoire (existant)    │
│  ► Voir le détail                               │
├─────────────────────────────────────────────────┤
│  Section 7 — Comment j'ai mangé (existant)      │
│  ► Voir le détail                               │
├─────────────────────────────────────────────────┤
│  🆕 Mon objectif semaine pro (Phase 2)          │ ← NOUVEAU
│     • Champ libre utilisateur                   │
│     • Bouton enregistrer                        │
└─────────────────────────────────────────────────┘
```

---

## ✅ VALIDATION — Ton cas concret (dimanche 25 janvier)

### Situation
- Lundi-samedi : Jours conformes (série de 6 jours réussis)
- Dimanche : Débordement majeur (+850 kcal)
- Résultat : "Pire semaine" alors que 6/7 jours OK

### Avec les enrichissements proposés, l'app affichera :

#### Section A (répartition + streaks)
```
Sur 7 jours : 6 jours sous ou proches de l'objectif, 
0 jours légèrement au-dessus, 1 jour de débordement plus marqué.

✅ 6 jours consécutifs alignés avec ton objectif.
Cette régularité est ta vraie force cette semaine.

Verbatim :
"La direction globale est restée stable sur la plupart des jours.
Un moment précis a pesé plus lourd dans le bilan."
```

#### Section B (impact jours)
```
1 journée explique ~85% de l'excédent hebdomadaire.

Verbatim :
"La semaine a été globalement tenue.
Une journée a déplacé la trajectoire.
Ce n'est pas une semaine "ratée".
C'est un point à sécuriser."
```

#### 🆕 Section D (fragilités)
```
🔍 Zones de vigilance

Sur la journée du 25 janvier, c'est le cumul de repas lourds 
ET d'extras qui a déplacé la trajectoire.

Voir le détail :
• Dimanche 25 janv : 3200 kcal (écart : +850)
  - Déjeuner : Pizza XXL (1200 kcal)
  - Extra soir : Glace + gâteau (500 kcal)
  - Dîner : Burger (800 kcal)

C'est identifié. La semaine prochaine, tu sais où porter ton attention.
```

#### 🆕 Objectif perso
```
🎯 Mon objectif pour la semaine prochaine

[Champ libre où tu notes :]
"Continuer les bonnes choses (6 jours alignés !). 
Rectifier les écarts identifiés : plus de journée comme dimanche 25 janvier.
Même si je suis mal, ne pas m'engouffrer et faire pire. 
Faire autrement. On y croit, la semaine pro c'est la bonne !"

[Bouton : Enregistrer mon objectif]
```

**Résultat** : L'app te dira "Semaine majoritairement tenue avec 1 jour à sécuriser" au lieu de "Pire semaine".

---

## 📝 CONCLUSION

### ✅ Couvert dans "maj bilan hebdo" actuel
- Répartition jours (Section A)
- Impact jour problématique (Section B)
- Évolution extras S-1 (Section C)

### 🔴 Manque critique (à ajouter en Phase 1)
- Valorisation streaks réussis (Besoin 2)
- Analyse fragilités + typologie repas (Besoin 6)

### 🟡 Manque important (à ajouter en Phase 2)
- Objectif personnalisé semaine pro (Besoin 8)

### 🟢 Manque confort (à ajouter en Phase 3)
- Détail repas du jour (Besoin 9)
- Historique bilans hebdo (Besoin 10)

---

**Validation utilisateur requise avant implémentation** ✅

**Prochaine étape** : Confirmer les priorités et démarrer Phase 1 (streaks + fragilités).

---

## 📝 TODO - AMÉLIORATIONS PROCHAINES

### 🔥 Priorité Haute - Corrections urgentes (09/02/2026)

1. ✅ **[FAIT 09/02]** Corriger affichage repas dans zone fragilités
   - Problème : Affichait `jour.top3` (inexistant) au lieu de `jour.repasProblematiques`
   - Problème : Affichait `jour.totalKcal` au lieu de `jour.kcal_total`
   - Solution : Mapping correct + format enrichi avec type, aliment, kcal, badge extra
   - Fichier : `components/BilanHebdoModal.js` ligne 461-489

2. 🔧 **[EN COURS]** Améliorer sauvegarde et navigation bilans hebdo
   - **Sauvegarde** : Vérifier cohérence données entre tableau-de-bord.js et suivi.js
   - **Navigation** : Ajouter flèches ← → dans BilanHebdoModal pour naviguer entre semaines
   - **Consultation historique** : Implémenter bouton 👁️ dans DrawerValidation
   - Fichiers : `components/BilanHebdoModal.js`, `pages/historique-extras.js`, `components/DrawerValidation.js`
   - Durée : 2-3h

### 🎯 Priorité Moyenne - Enrichissements UX

4. **Afficher détail repas jour problématique dans LECTURE B (Impact jours)**
   - Actuellement : "Le 7 février pèse fortement (~34%)"
   - Amélioration : Ajouter bouton "🔍 Voir les repas de ce jour" qui déroule la liste
   - Fichier : `components/BilanHebdoModal.js` BlocImpactJours (ligne 280+)
   - Durée : 1h

5. **Export PDF du bilan hebdomadaire**
   - Ajouter bouton "📥 Télécharger ce bilan (PDF)" en bas de BilanHebdoModal
   - Utiliser bibliothèque : `jspdf` ou `react-pdf`
   - Contenu : Toutes sections ABC + graphiques
   - Fichier : `components/BilanHebdoModal.js`
   - Durée : 3-4h

6. **Export JSON des données brutes**
   - Pour analyse externe ou backup
   - Bouton : "💾 Exporter données (JSON)"
   - Contenu : `bilan_abc` complet + métadonnées
   - Fichier : `components/BilanHebdoModal.js`
   - Durée : 30 min

7. **Navigation semaines précédente/suivante dans BilanHebdoModal**
   - Ajouter flèches ← → en haut du modal
   - Charger semaine N-1 ou N+1 sans fermer la modale
   - Badge "📅 Semaine du 3 février 2026" en header
   - Fichier : `components/BilanHebdoModal.js`
   - Durée : 2h

### �️ Corrections techniques à planifier (Reporter à plus tard)

**INCOHÉRENCE SCHEMA BDD - semaines_validees** :
- **Problème détecté** : La table `semaines_validees` utilise 2 colonnes pour identifier les semaines :
  - `semaine_debut` (utilisée par tableau-de-bord.js ligne 562 - ancien code)
  - `weekStart` (utilisée par suivi.js ligne 1266 - nouveau code)
- **Impact** : Les 2 systèmes écrivent dans des colonnes différentes → Données fragmentées
- **Solutions possibles** :
  - Option 1 : Migrer tableau-de-bord.js vers `weekStart` (simple, risque perte données)
  - Option 2 : Synchro double colonne (garde tout, complexe)
  - Option 3 : Migration BDD complète avec script SQL (idéal, 2h)
- **Décision utilisateur** : Reporter à plus tard, ne pas toucher maintenant
- **Fichiers concernés** : `pages/tableau-de-bord.js` ligne 562, `pages/suivi.js` ligne 1266

**Autres nettoyages** :
- Renommer `historique-extras.js` → `historique-bilans-hebdo.js` (confusion route)
- Nettoyer champs obsolètes dans historique (budget_utilise, calories_totales, etc.)

### �🔮 Priorité Basse - Fonctionnalités avancées

8. **Historique bilans avec filtres**
   - Filtrer par : Mois, Année, Niveau de conformité (bonnes/difficiles)
   - Stats globales : "18 semaines validées", "Taux conformité moyen 72%"
   - Afficher meilleure série : "6 semaines d'affilée entre janv-fév"
   - Fichier : `pages/historique-extras.js`
   - Durée : 3h

9. **Comparaison entre 2 bilans hebdo**
   - Sélectionner 2 semaines et afficher comparatif side-by-side
   - Delta sur chaque métrique : extras, kcal, streaks, fragilités
   - Fichier : Nouveau composant `ComparaisonBilansModal.js`
   - Durée : 4h

10. **Graphique évolution streaks sur 12 semaines**
    - Visualiser progression de la régularité dans le temps
    - Afficher dans BilanHebdoModal ou page dédiée
    - Utiliser Chart.js
    - Durée : 2h

---

## 📊 RÉCAPITULATIF ÉTAT PROJET BILAN ABC

### ✅ TERMINÉ (100%)
- Phase 1 : Fonctions calcul ABC (detecterStreaksReussis, analyserFragilites, calculerImpactJours, calculerEvolutionExtras)
- Phase 2 : Sauvegarde Supabase avec bilan_abc JSONB
- Phase 3 : Interface UI 5 blocs ABC dans BilanHebdoModal
- Phase 3.5 : UX (responsive, date française, close button, corrections bugs)
- Correction affichage repas fragilités (09/02/2026)

### 🟡 EN ATTENTE
- Affichage objectif personnel en début de semaine (reporté)
- Nettoyage historique-extras.js (10 min)
- Enrichissements UX (points 4-7 ci-dessus)

### ⏱️ TEMPS ESTIMÉ RESTANT
- Corrections urgentes (points 2-3) : 25 min
- Enrichissements prioritaires (points 4-6) : 4-5h
- Fonctionnalités avancées (points 8-10) : 9h
- **TOTAL** : ~10-11h pour compléter à 100% tous enrichissements
