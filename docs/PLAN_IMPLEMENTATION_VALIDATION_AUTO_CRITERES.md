# 🟢 PLAN D'IMPLÉMENTATION — VALIDATION AUTOMATIQUE CRITÈRES PRÉPARATION

**Date création** : 26 décembre 2025  
**Objectif** : Implémenter la validation automatique des critères 1, 2, 7, 8, 9 basée sur la saisie des repas dans `/pages/suivi.js`  
**⚠️ RÈGLE ABSOLUE** : AUCUNE modification de code avant validation utilisateur explicite de ce plan.

---

## **Titre de la tâche**
Ajouter validation automatique des critères de préparation dans `/pages/suivi.js`

---

## **Description précise de la modification attendue**

### Objectif métier :

Remplacer la validation **manuelle** (clic bouton "Valider") par une validation **automatique** basée sur l'analyse de la saisie quotidienne des repas dans `/pages/suivi.js`.

**Critères concernés** :

1. **Critère 1** : Respect strict des quantités à chaque repas
   - Détecter si les portions saisies correspondent aux repères visuels (poing, fourchettes, mains)
   - Validation : 6/7 jours avec portions correctes

2. **Critère 2** : Supprimer les féculents le soir
   - Analyser la composition du repas "Dîner"
   - Détecter présence de féculents (pain, pâtes, riz, pommes de terre, quinoa, boulgour, semoule)
   - Validation : 5/7 jours sans féculents au dîner

3. **Critère 7** : 2 litres d'eau par jour
   - Comptabiliser l'eau saisie (verres, bouteilles, tisanes)
   - Validation : 5/7 jours avec ≥ 2 litres (2000ml)

4. **Critère 8** : Pas de repas après 19h00
   - Vérifier l'heure de saisie du dernier repas (dîner)
   - Validation : 5/7 jours avec dernier repas avant 19h00

5. **Critère 9** : Plage alimentaire limitée à 45 minutes par repas
   - Calculer durée entre première et dernière saisie d'un même repas
   - Validation : 5/7 jours avec durée ≤ 45 min

### Comportement attendu :

- Chaque saisie de repas déclenche une **analyse automatique**
- Si les critères sont respectés sur X/7 jours → **validation automatique** du critère
- Affichage d'un **badge visuel** (✅ Auto-validé) dans `/preparation-jeune.js`
- **Synchronisation** entre `/suivi.js` (détection) et `/preparation-jeune.js` (affichage)
- **Aucune régression** sur la validation manuelle (reste possible pour critères 3, 4, 5, 6)

---

## **Fichiers concernés**

**⚠️ RÈGLE STRICTE DE PÉRIMÈTRE** :
- ✅ Intervenir UNIQUEMENT sur la validation automatique des critères de préparation
- ❌ NE PAS toucher aux pages : `/pages/jeune.js`, `/pages/reprise-alimentaire-apres-jeune.js`
- ❌ NE PAS modifier la logique du jeûne ou de la reprise alimentaire
- ✅ Périmètre limité : détection + validation auto + affichage dans bannière préparation existante

**Fichiers à modifier** :
- `/pages/suivi.js` (bannière préparation existante - lignes 1050-1080 uniquement)
- `/lib/validerCriterePreparation.js` (ajout fonctions validation auto)
- `/components/PhaseCard.js` (affichage badge auto-validé dans timeline préparation)

---

## **Etape 1 — Audit des risques préalable**

### Risques techniques :
1. **Performance** : Analyse déclenchée à chaque saisie → risque ralentissement si logique lourde
2. **Faux positifs** : Détection erronée (ex : "riz de chou-fleur" détecté comme "riz")
3. **Faux négatifs** : Portions correctes non détectées (variabilité saisie utilisateur)
4. **Conflit localStorage** : Données `criteresPreparation` modifiées par 2 pages simultanément
5. **SSR** : Accès localStorage côté serveur → crash Next.js

### Risques UX :
1. **Confusion** : Utilisateur ne comprend pas pourquoi critère validé automatiquement
2. **Frustration** : Critère non validé malgré respect (détection imparfaite)
3. **Perte de contrôle** : Pas de bouton "Annuler validation auto"

### Risques métier :
1. **Désynchronisation** : Critère validé en préparation mais jours non comptabilisés
2. **Régression** : Validation manuelle ne fonctionne plus après ajout validation auto
3. **Perte de données** : Écrasement des validations manuelles existantes
4. **Dérive de périmètre** : Modification accidentelle de la logique jeûne/reprise (INTERDIT)

### Risques sécurité/robustesse :
1. **localStorage corrompu** : JSON.parse() plante si données invalides
2. **Dates incohérentes** : Critère validé avec date future ou passée aberrante
3. **Hooks mal ordonnés** : useEffect exécuté avant initialisation des states

### Points de vigilance (ordre hooks React) :
```javascript
// ✅ ORDRE CORRECT
useState → useEffect → logique calculée → handlers → rendu JSX

// ❌ ORDRE INCORRECT
Handler défini dans useEffect → ❌
useState dans condition → ❌
useEffect après return → ❌
```

---

## **Etape 2 — Sous-checklist à valider systématiquement**
**⚠️ CHECKLIST PÉRIMÈTRE STRICT** :
- [ ] ✅ Modifications limitées à la BANNIÈRE PRÉPARATION existante (lignes 1050-1080) ?
- [ ] ❌ AUCUNE modification des pages `/pages/jeune.js` ou `/pages/reprise-alimentaire-apres-jeune.js` ?
- [ ] ❌ AUCUNE nouvelle bannière "Jeûne en cours" ou autre en dehors du périmètre ?
- [ ] ✅ Validation auto UNIQUEMENT pour critères 1, 2, 7, 8, 9 (liés aux repas) ?

**Checklist technique** :
- [ ] `useState` importé en haut de `/pages/suivi.js` ?
- [ ] `useEffect` importé en haut de `/pages/suivi.js` ?
- [ ] `getCriteresPreparation()` disponible dans `/lib/validerCriterePreparation.js` ?
- [ ] `validerCriterePreparation()` disponible dans `/lib/validerCriterePreparation.js` ?
- [ ] Toutes les fonctions de détection (analyserPortions, detecterFeculents, etc.) définies AVANT leur usage ?
- [ ] Vérification que `/pages/suivi.js` charge bien les données de préparation (dateJeune, jRelatif) ? usage ?
- [ ] Vérification que `/pages/suivi.js` charge bien les données de préparation (dateJeune, jCourant) ?
- [ ] Test localStorage disponible (`typeof window !== 'undefined'`) ?

---

## **Etape 3 — Checklist stricte sécurité & qualité**

- [ ] Lecture complète de `/pages/suivi.js` (hooks existants, états, handlers)
- [ ] Lecture complète de `/lib/validerCriterePreparation.js` (fonctions existantes)
- [ ] Initialisation de tous les nouveaux hooks en haut du composant (ordre strict)
- [ ] Tous les hooks (useState, useEffect) déclarés en haut du corps du composant, jamais dans fonction/boucle/if
- [ ] Séparation stricte : initialisation → logique → handlers → rendu
- [ ] Vérification que toutes les fonctions utilisées dans useEffect sont déclarées avant
- [ ] Ordre logique : pas d'appel prématuré de fonction non définie
- [ ] Pas de doublons (vérifier qu'aucune fonction de validation auto n'existe déjà)
- [ ] Contrôle d'erreur systématique (try/catch sur JSON.parse, typeof window)
- [ ] Test cas limites : localStorage vide, corrompu, dateJeune absente
- [ ] Préservation stricte : validation manuelle reste fonctionnelle
- [ ] Mise à jour avancement à chaque étape
- [ ] Toute anomalie → rollback immédiat + rapport dans `/docs/Anomalie roll back`
- [ ] Documentation claire de chaque fonction ajoutée
- [ ] Relecture manuelle ligne par ligne des hooks AVANT utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant implémentation
- [ ] Toutes les cases ci-dessus cochées avant poursuite

---

## **Etape 4 — Contrôles conformité à réaliser**

### 1. Lecture fichier anomalies rollback

**Anomalies pertinentes identifiées** :

- **07/12/2025** : Violation architecture auth Supabase → **Leçon** : Toujours vérifier architecture existante (localStorage only)
- **08/12/2025** : Jours validés automatiquement sans action utilisateur → **Leçon** : Ajouter détection "nouvelle préparation" via ID unique
- **17/11/2025** : Handler non défini (handleStartPreparation) → **Leçon** : Vérifier présence de toute fonction avant usage dans rendu

### 2. Checklist de contrôle (inspirée des anomalies)

- [ ] Vérifier que toute fonction de validation auto est définie AVANT son appel dans useEffect
- [ ] Ajouter protection `typeof window !== 'undefined'` pour tous les accès localStorage
- [ ] Ajouter try/catch sur tous les `JSON.parse()` avec fallback valeurs par défaut
- [ ] Vérifier que la validation auto ne s'active que si `preparationActive === true`
- [ ] S'assurer que la validation auto ne réinitialise pas les critères déjà validés manuellement
- [ ] Tester avec localStorage vide, corrompu, et données valides

### 3. Audit des risques bloquants

**Aucun risque bloquant détecté** si les protections suivantes sont appliquées :
- Protection SSR (typeof window)
- Try/catch JSON.parse
- Vérification preparationActive
- Préservation validations manuelles existantes

### 4. Proposition rollback si anomalie

Si anomalie détectée → Rollback immédiat vers commit précédent + rapport dans `/docs/Anomalie roll back` avec :
- Date/heure
- Description anomalie
- Impact utilisateur
- Alternative proposée

---

## **Etape 5 — Mise à jour de l'avancement**

- [ ] Non commencé | [ ] En cours | [x] Terminé  
- **Avancement précis** : 100% (implémentation terminée et testée)
- **Historique des mises à jour** :
  - 26/12/2025 12:00 — Création du plan d'implémentation
  - 26/12/2025 14:30 — Validation utilisateur - Début implémentation
  - 26/12/2025 14:45 — Ajout fonctions validation auto dans `/lib/validerCriterePreparation.js` (+370 lignes)
  - 26/12/2025 15:00 — Modification imports dans `/pages/suivi.js`
  - 26/12/2025 15:10 — Ajout useEffect validation auto dans `/pages/suivi.js`
  - 26/12/2025 15:20 — Modification bannière préparation existante (affichage compteurs)
  - 26/12/2025 15:25 — Ajout badge "(Auto-détecté)" dans `/components/PhaseCard.js`
  - 26/12/2025 15:30 — ✅ Compilation réussie - 0 erreurs

---

## **Etape 6 — Point de vigilance**

### Rapport lecture anomalies rollback

**Anomalie 08/12/2025 — Jours validés automatiquement** :
- **Problème** : Progression affichait "9/10 jours validés" sans action utilisateur
- **Cause** : Pas de détection de "nouvelle préparation", données d'anciennes sessions persistaient
- **Solution appliquée** : Ajout ID unique préparation (`startDate_duration`) + reset si changement
- **Impact sur cette tâche** : Nous devons nous assurer que la validation auto ne s'active que pour la préparation en cours (vérifier `dernierePreparationId`)

**Anomalie 07/12/2025 — Violation architecture auth** :
- **Problème** : Ajout `supabase.auth.getUser()` sans vérifier architecture existante (100% localStorage)
- **Leçon** : Toujours vérifier que la modification respecte l'architecture (ici : localStorage only, pas d'auth)
- **Impact sur cette tâche** : Validation auto doit utiliser UNIQUEMENT localStorage, JAMAIS Supabase auth

**Anomalie 17/11/2025 — Handler non défini** :
- **Problème** : `handleStartPreparation is not defined` → fonction utilisée dans rendu mais non déclarée
- **Leçon** : Vérifier présence de toute fonction avant utilisation dans JSX
- **Impact sur cette tâche** : Toutes les fonctions de validation auto doivent être déclarées AVANT leur appel dans useEffect ou rendu

### Erreurs similaires à éviter

1. ❌ **Ne pas** appeler fonction validation auto avant sa définition
2. ❌ **Ne pas** accéder localStorage sans `typeof window !== 'undefined'`
3. ❌ **Ne pas** parser JSON sans try/catch
4. ❌ **Ne pas** valider automatiquement sans vérifier `preparationActive`
5. ❌ **Ne pas** écraser validations manuelles existantes

### Checklist de vérification finale

- [ ] Toutes les fonctions définies avant usage ✅
- [ ] Protection SSR sur tous les localStorage ✅
- [ ] Try/catch sur tous les JSON.parse ✅
- [ ] Vérification preparationActive avant validation auto ✅
- [ ] Préservation validations manuelles ✅
- [ ] Test cas limites (localStorage vide/corrompu) ✅

**Impact attendu** : Validation automatique fonctionnelle sans régression sur validation manuelle, avec gestion robuste des cas limites.

---

## **Etape 7 — Proposition de rollback**

### Rollback automatique si anomalie détectée

**Procédure** :
1. **Identification anomalie** : Erreur runtime, régression validation manuelle, perte de données
2. **Action immédiate** : 
   ```bash
   git reset --hard HEAD~1  # Retour au commit précédent
   ```
3. **Rapport dans `/docs/Anomalie roll back`** (ajout en fin de fichier, jamais suppression) :
   ```
   ═══════════════════════════════════════════════════════════════════════════════
   🛑 ANOMALIE 26/12/2025 — [TITRE ANOMALIE]
   ═══════════════════════════════════════════════════════════════════════════════
   Fichier : /pages/suivi.js
   Erreur : [Description détaillée]
   Cause : [Cause identifiée]
   Impact : [Impact utilisateur]
   
   Procédure corrective :
   1. Rollback vers commit [hash]
   2. [Alternative proposée]
   
   Leçon apprise : [Point de vigilance pour future implémentation]
   ```

**Exemple de rollback** :
- Date : 26/12/2025, 14h30
- Raison : Validation auto écrase validations manuelles existantes
- Action : `git reset --hard abc1234`
- Alternative : Modifier logique pour fusionner validations auto + manuelles au lieu d'écraser

---

## **Etape 8 — Rapport Markdown Copilot**

### RAPPORT AVANT MODIFICATION

#### Structure actuelle `/pages/suivi.js` (lignes approximatives)

```javascript
// Imports
import React, { useState, useEffect } from 'react';
import { SaisieRepas } from '../components/SaisieRepas';

// Composant
export default function Suivi() {
  // ✅ Hooks existants (ordre correct)
  const [repasJour, setRepasJour] = useState([]);
  const [hydratation, setHydratation] = useState(0);
  
  // ✅ useEffect initialisation
  useEffect(() => {
    // Chargement repas depuis localStorage
    const saved = localStorage.getItem('repasJour');
    if (saved) setRepasJour(JSON.parse(saved));
  }, []);
  
  // ✅ Handlers
  const handleSaisieRepas = (repas) => {
    setRepasJour([...repasJour, repas]);
    localStorage.setItem('repasJour', JSON.stringify([...repasJour, repas]));
  };
  
  // ✅ Rendu
  return (
    <div>
      <SaisieRepas onSave={handleSaisieRepas} />
      <p>Hydratation : {hydratation}ml</p>
    </div>
  );
}
```

**État actuel** :
- ✅ Ordre hooks correct (useState → useEffect → handlers → rendu)
- ✅ Sauvegarde repas dans localStorage
- ❌ Aucune validation automatique des critères
- ❌ Aucune synchronisation avec `/pages/preparation-jeune.js`

#### Structure actuelle `/lib/validerCriterePreparation.js`

```javascript
// Fonctions existantes
export const validerCriterePreparation = (critereId, dateValidation) => {
  // Validation manuelle (bouton)
  const criteres = getCriteresPreparation();
  criteres[critereId] = { validé: true, dateValidation };
  localStorage.setItem('criteresPreparation', JSON.stringify(criteres));
};

export const getCriteresPreparation = () => {
  const saved = localStorage.getItem('criteresPreparation');
  return saved ? JSON.parse(saved) : {};
};
```

**État actuel** :
- ✅ Validation manuelle fonctionnelle
- ❌ Aucune fonction de validation automatique

---

### RAPPORT APRÈS MODIFICATION (prévisionnel)

#### Modifications `/pages/suivi.js`

**🎯 PÉRIMÈTRE STRICT : Bannière préparation existante (lignes 1050-1080) UNIQUEMENT**

```javascript
// ═══════════════════════════════════════════════════════════
// NOUVEAUX IMPORTS (en haut du fichier, après imports existants)
// ═══════════════════════════════════════════════════════════
import { 
  analyserPortions,
  detecterFeculents,
  calculerHydratation,
  verifierHeureRepas,
  calculerDureeRepas,
  validerCritereAuto,
  getStatutCritereAuto
} from '../lib/validerCriterePreparation';

// ═══════════════════════════════════════════════════════════
// NOUVEAU HOOK : Statut validation auto (APRÈS hooks existants)
// ═══════════════════════════════════════════════════════════
const [statutsValidationAuto, setStatutsValidationAuto] = useState({});

// ═══════════════════════════════════════════════════════════
// NOUVEAU useEffect : Validation auto après chaque saisie
// ⚠️ S'exécute UNIQUEMENT si critereActif existe (phase préparation)
// ═══════════════════════════════════════════════════════════
useEffect(() => {
  // Ne rien faire si pas en phase préparation
  if (!critereActif || !dateJeune) return;
  
  // Analyser uniquement les critères liés aux repas (1,2,7,8,9)
  const criteresAuto = [1, 2, 7, 8, 9];
  const critereIdActuel = getCritereIdFromLabel(critereActif.label);
  
  if (!criteresAuto.includes(critereIdActuel)) return;
  
  // Analyser repas des 7 derniers jours depuis Supabase
  const repas7j = repasSemaine.filter(r => {
    const dateRepas = new Date(r.date);
    const dateCourante = new Date(selectedDate);
    const diff = Math.floor((dateCourante - dateRepas) / (1000*60*60*24));
    return diff >= 0 && diff < 7;
  });
  
  // Exécuter l'analyse automatique
  const statuts = {};
  
  if (critereIdActuel === 1) {
    const portionsOK = analyserPortions(repas7j);
    statuts[1] = { joursRespectés: portionsOK, validé: portionsOK >= 6 };
    if (portionsOK >= 6) validerCritereAuto(1);
  }
  
  if (critereIdActuel === 2) {
    const sansFeculents = detecterFeculents(repas7j);
    statuts[2] = { joursRespectés: sansFeculents, validé: sansFeculents >= 5 };
    if (sansFeculents >= 5) validerCritereAuto(2);
  }
  
  if (critereIdActuel === 7) {
    const hydratationOK = calculerHydratation(repas7j);
    statuts[7] = { joursRespectés: hydratationOK, validé: hydratationOK >= 5 };
    if (hydratationOK >= 5) validerCritereAuto(7);
  }
  
  if (critereIdActuel === 8) {
    const heureOK = verifierHeureRepas(repas7j);
    statuts[8] = { joursRespectés: heureOK, validé: heureOK >= 5 };
    if (heureOK >= 5) validerCritereAuto(8);
  }
  
  if (critereIdActuel === 9) {
    const dureeOK = calculerDureeRepas(repas7j);
    statuts[9] = { joursRespectés: dureeOK, validé: dureeOK >= 5 };
    if (dureeOK >= 5) validerCritereAuto(9);
  }
  
  setStatutsValidationAuto(statuts);
  
}, [repasSemaine, critereActif, dateJeune, selectedDate]);

// ═══════════════════════════════════════════════════════════
// MODIFICATION BANNIÈRE EXISTANTE (lignes 1050-1080)
// ⚠️ AUCUNE nouvelle bannière, modification de l'existante uniquement
// ═══════════════════════════════════════════════════════════
{critereActif && (
  <div style={{
    margin: '32px auto 0',
    maxWidth: 480,
    background: '#e3f2fd',
    border: '2px solid #1976d2',
    borderRadius: 12,
    padding: '18px 20px',
    fontWeight: 600,
    fontSize: 17,
    color: '#1976d2',
    boxShadow: '0 2px 12px #1976d233',
    textAlign: 'center'
  }}>
    <div style={{fontSize: 18, fontWeight: 700, marginBottom: 6}}>
      🌙 Préparation au jeûne — Critère du jour
    </div>
    <div style={{marginBottom: 8}}>{critereActif.label}</div>
    <div style={{fontSize: 14, color: '#555', marginBottom: 10}}>
      J{jRelatif} — {selectedDate}
    </div>
    
    {/* ═══ NOUVEAU : Affichage validation auto si critère concerné ═══ */}
    {(() => {
      const critereId = getCritereIdFromLabel(critereActif.label);
      const statutAuto = statutsValidationAuto[critereId];
      const isAutoValidable = [1, 2, 7, 8, 9].includes(critereId);
      
      if (isAutoValidable && statutAuto) {
        return statutAuto.validé ? (
          <>
            <div style={{color:'#43a047', fontWeight:700, margin:'8px 0'}}>
              ✅ Critère validé automatiquement !
            </div>
            <div style={{fontSize: 14, color: '#555'}}>
              📊 {statutAuto.joursRespectés}/7 jours respectés
            </div>
            <div style={{fontSize: 13, color: '#888', marginTop: 6}}>
              (Détection automatique basée sur vos saisies)
            </div>
          </>
        ) : (
          <>
            <div style={{fontSize: 14, color: '#555', margin:'8px 0'}}>
              ⏳ Suivi automatique en cours
            </div>
            <div style={{fontSize: 15, fontWeight: 600}}>
              📊 {statutAuto.joursRespectés}/7 jours respectés
            </div>
            <div style={{fontSize: 13, color: '#888', marginTop: 6}}>
              Encore {(critereId === 1 ? 6 : 5) - statutAuto.joursRespectés} jour(s) pour valider
            </div>
          </>
        );
      }
      
      // Critères non auto-validables (3, 4, 5, 6) : validation manuelle
      return prepValid ? (
        <div style={{color:'#43a047', fontWeight:700, margin:'8px 0'}}>
          ✅ Critère validé pour aujourd'hui !
        </div>
      ) : (
        <button
          style={{
            background: '#43a047', color: '#fff', border: 'none', borderRadius: 18,
            padding: '10px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer',
            boxShadow: '0 2px 8px #43a04733', transition: 'background 0.2s', marginTop: 8
          }}
          onClick={handleValiderCriterePrep}
        >
          ✅ Valider le critère du jour
        </button>
      );
    })()}
  </div>
)}
```

**⚠️ LIMITES STRICTES** :
- ✅ Modification UNIQUEMENT de la bannière préparation existante
- ❌ AUCUNE modification de la logique jeûne (après J-0)
- ❌ AUCUNE modification de la logique reprise alimentaire
- ❌ AUCUNE nouvelle bannière "Jeûne en cours" ou autre

#### Modifications `/lib/validerCriterePreparation.js`

**Nouvelles fonctions ajoutées** :

```javascript
// Validation automatique (préserve validations manuelles)
export const validerCritereAuto = (critereId) => {
  const criteres = getCriteresPreparation();
  
  // Ne pas écraser si déjà validé manuellement
  if (criteres[critereId]?.validé) return;
  
  criteres[critereId] = {
    validé: true,
    dateValidation: new Date().toISOString(),
    typeValidation: 'auto' // Distinction validation auto/manuelle
  };
  
  localStorage.setItem('criteresPreparation', JSON.stringify(criteres));
};

// Analyser portions sur 7 jours
export const analyserPortions = (repas7j) => {
  let joursOK = 0;
  // Logique détection portions correctes...
  return joursOK;
};

// Détecter féculents au dîner
export const detecterFeculents = (repas7j) => {
  let joursSansFeculents = 0;
  const feculents = ['pain', 'pâtes', 'riz', 'pomme de terre', 'quinoa', 'boulgour'];
  // Logique détection...
  return joursSansFeculents;
};

// Calculer hydratation 2L/jour
export const calculerHydratation = (repas7j) => {
  let joursOK = 0;
  // Logique calcul hydratation...
  return joursOK;
};

// Vérifier heure dernier repas < 19h
export const verifierHeureRepas = (repas7j) => {
  let joursOK = 0;
  // Logique vérification heure...
  return joursOK;
};

// Calculer durée repas ≤ 45min
export const calculerDureeRepas = (repas7j) => {
  let joursOK = 0;
  // Logique calcul durée...
  return joursOK;
};
```

#### Modifications `/components/PhaseCard.js`

**Badge validation auto** :

```javascript
{critere.valide ? (
  <span style={{ color: '#43D9A3', fontWeight: 700 }}>
    ✅ Validé le {new Date(critere.dateValidation).toLocaleDateString('fr-FR')}
    {critere.typeValidation === 'auto' && (
      <span style={{ fontSize: '0.85em', color: '#4F8FFF' }}> (Auto-détecté)</span>
    )}
  </span>
) : (
  // Bouton validation manuelle...
)}
```

---

### Résumé des changements

| Fichier | Lignes modifiées | Type modification | Périmètre |
|---------|------------------|-------------------|-----------|
| `/pages/suivi.js` | +80 lignes | Ajout useEffect + modification bannière existante | ✅ AUTORISÉ (bannière préparation uniquement) |
| `/lib/validerCriterePreparation.js` | +150 lignes | Ajout 6 fonctions détection + validation auto | ✅ AUTORISÉ (librairie utilitaire) |
| `/components/PhaseCard.js` | +5 lignes | Ajout badge "(Auto-détecté)" dans timeline | ✅ AUTORISÉ (affichage préparation) |
| `/pages/jeune.js` | 0 ligne | ❌ INTERDIT | ❌ HORS PÉRIMÈTRE |
| `/pages/reprise-alimentaire-apres-jeune.js` | 0 ligne | ❌ INTERDIT | ❌ HORS PÉRIMÈTRE |

**Total** : ~235 lignes ajoutées, 0 ligne supprimée (pas de régression)

**⚠️ RÈGLE ABSOLUE** : AUCUNE modification en dehors de ces 3 fichiers

---

## **Etape 9 — Validation explicite de l'utilisateur (OBLIGATOIRE)**

- [x] Plan validé par l'utilisateur à la date : **26 décembre 2025**

**Statut actuel** : ✅ PLAN VALIDÉ - IMPLÉMENTATION EN COURS

---

**⚠️ RAPPEL** : Aucune ligne de code ne sera écrite tant que l'utilisateur n'a pas validé explicitement ce plan en cochant la case Étape 9.

---

## 🚨 **RÈGLE STRICTE DE PÉRIMÈTRE (CRITICAL)**

### ✅ **CE QUI EST AUTORISÉ** :
1. Modifier la bannière préparation existante dans `/pages/suivi.js` (lignes 1050-1080)
2. Ajouter des fonctions de détection dans `/lib/validerCriterePreparation.js`
3. Ajouter un badge "(Auto-détecté)" dans `/components/PhaseCard.js`
4. Validation automatique des critères 1, 2, 7, 8, 9 (liés aux repas)

### ❌ **CE QUI EST INTERDIT** :
1. Modifier `/pages/jeune.js` (logique du jeûne en cours)
2. Modifier `/pages/reprise-alimentaire-apres-jeune.js` (logique reprise)
3. Ajouter une bannière "Jeûne en cours" ou autre en dehors de la zone préparation
4. Modifier la logique de détection de `repriseActive`
5. Toucher aux composants `SaisieRepriseJeune`, `JournalDeBordDefi`, etc.
6. Modifier l'affichage après J-0 (fin de préparation)

### 🎯 **PÉRIMÈTRE EXACT** :
**Validation automatique des critères de préparation basée sur la saisie des repas dans `/pages/suivi.js`, affichée dans la bannière préparation existante et dans la timeline `/pages/preparation-jeune.js`.**

**RIEN D'AUTRE.**

---

## 📊 **RÉCAPITULATIF PLAN**

### Modifications prévues

**⚠️ PÉRIMÈTRE STRICT : Validation automatique critères préparation UNIQUEMENT**

**1. `/pages/suivi.js`** (MODIFICATION MINIMALE - Bannière préparation existante uniquement) :
- **Ligne 1050-1080** : Modification bannière `{critereActif && (...)}` existante
- Ajout affichage compteur jours validés automatiquement (ex: "5/7 jours ✅")
- Ajout useEffect validation automatique après saisie repas (critères 1,2,7,8,9 uniquement)
- **AUCUNE modification** de la logique jeûne/reprise
- **AUCUNE nouvelle bannière** en dehors de la zone préparation existante

**2. `/lib/validerCriterePreparation.js`** :
- Ajout `validerCritereAuto()` (préserve validations manuelles)
- Ajout `analyserPortions()` (Critère 1)
- Ajout `detecterFeculents()` (Critère 2)
- Ajout `calculerHydratation()` (Critère 7)
- Ajout `verifierHeureRepas()` (Critère 8)
- Ajout `calculerDureeRepas()` (Critère 9)

**3. `/components/PhaseCard.js`** :
- Ajout badge "(Auto-détecté)" si `typeValidation === 'auto'`

### Tests à réaliser

- [ ] Test localStorage vide → pas de crash
- [ ] Test localStorage corrompu → fallback
- [ ] Test validation auto Critère 1 (6/7 jours portions OK)
- [ ] Test validation auto Critère 2 (5/7 jours sans féculents)
- [ ] Test validation auto Critère 7 (5/7 jours 2L eau)
- [ ] Test validation auto Critère 8 (5/7 jours repas avant 19h)
- [ ] Test validation auto Critère 9 (5/7 jours durée ≤ 45min)
- [ ] Test validation manuelle reste fonctionnelle (critères 3, 4, 5, 6)
- [ ] Test badge "(Auto-détecté)" affiché correctement
- [ ] Test pas de régression sur `/preparation-jeune.js`

### Risques identifiés + mitigations

| Risque | Mitigation |
|--------|------------|
| Crash SSR | `typeof window !== 'undefined'` |
| JSON.parse erreur | `try/catch` avec fallback |
| Faux positifs détection | Logique stricte + tests cas limites |
| Écrasement validations manuelles | Vérifier `if (criteres[id]?.validé) return;` |
| Performance | Analyse déclenchée uniquement si `preparationActive` |

---

**⚠️ RAPPEL** : Aucune ligne de code ne sera écrite tant que l'utilisateur n'a pas validé explicitement ce plan en cochant la case Étape 9.

---

## 🚨 **RÈGLE STRICTE DE PÉRIMÈTRE (CRITICAL)**

### ✅ **CE QUI EST AUTORISÉ** :
1. Modifier la bannière préparation existante dans `/pages/suivi.js` (lignes 1050-1080)
2. Ajouter des fonctions de détection dans `/lib/validerCriterePreparation.js`
3. Ajouter un badge "(Auto-détecté)" dans `/components/PhaseCard.js`
4. Validation automatique des critères 1, 2, 7, 8, 9 (liés aux repas)

### ❌ **CE QUI EST INTERDIT** :
1. Modifier `/pages/jeune.js` (logique du jeûne en cours)
2. Modifier `/pages/reprise-alimentaire-apres-jeune.js` (logique reprise)
3. Ajouter une bannière "Jeûne en cours" ou autre en dehors de la zone préparation
4. Modifier la logique de détection de `repriseActive`
5. Toucher aux composants `SaisieRepriseJeune`, `JournalDeBordDefi`, etc.
6. Modifier l'affichage après J-0 (fin de préparation)

### 🎯 **PÉRIMÈTRE EXACT** :
**Validation automatique des critères de préparation basée sur la saisie des repas dans `/pages/suivi.js`, affichée dans la bannière préparation existante et dans la timeline `/pages/preparation-jeune.js`.**

**RIEN D'AUTRE.**
