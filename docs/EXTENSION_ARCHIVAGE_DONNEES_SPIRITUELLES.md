# 📿 EXTENSION ARCHIVAGE : Données Spirituelles

**Date :** 27 décembre 2025  
**Contexte :** Extension du système d'historique jeûnes pour inclure les données du journal spirituel

---

## 🎯 OBJECTIF

Étendre le système d'archivage multi-jeûnes pour inclure **toutes les données spirituelles** :
- 📿 Méditations quotidiennes (localStorage)
- 📖 Versets favoris (localStorage)
- 💭 Questions/réponses profondes (localStorage)
- 🎯 Intentions spirituelles (localStorage)
- ✍️ Écritures libres (localStorage)
- 🎤 **Audios/prières enregistrées (IndexedDB)**

---

## ⚠️ PROBLÈME INITIAL

Le système d'archivage jeûnes (implémenté 26/12) archivait uniquement :
- ✅ Jours validés
- ✅ Outils textuels
- ✅ Message perso
- ✅ Bilan
- ✅ Programme reprise

**Données manquantes :**
- ❌ Méditations (localStorage `meditationsHistorique`)
- ❌ Versets (localStorage `versets`)
- ❌ Questions (localStorage `questionsReponses`)
- ❌ Intentions (localStorage `intentions`)
- ❌ Écritures (localStorage `ecritures`)
- ❌ **Audios (IndexedDB `JournalSpirituelDB`)**

**Impact utilisateur :**
Quand l'utilisateur consultait un jeûne archivé et cliquait sur "Accéder à ma restauration spirituelle", il ne voyait **aucune de ses méditations, prières audio, etc.**

---

## 🏗️ ARCHITECTURE SOLUTION

### 1. Nouveau fichier utilitaire : `lib/journalSpirituelArchive.js`

**Fonctions principales :**

```javascript
// Archiver toutes les données spirituelles d'un jeûne
archiverDonneesSpirituellesJeune(dateDebut, dateFin, idJeune)
  → Filtre par dates
  → Stocke dans localStorage séparé (*Archives)
  → Retourne compteur par type

// Récupérer données archivées
recupererDonneesSpirituellesArchivees(idJeune)
  → Retourne objet { meditations, versets, questions, intentions, ecritures, audios }

// Compter données archivées
compterDonneesSpirituellesArchivees(idJeune)
  → Retourne nombre total d'entrées

// Supprimer données archivées
supprimerDonneesSpirituellesArchivees(idJeune)
  → Suppression définitive
```

**Structure localStorage archives :**

```json
{
  "meditationsArchives": {
    "2025-12-01_10j": [
      { "id": 123, "date": "...", "type_meditation": "priere", ... }
    ]
  },
  "versetsArchives": { "2025-12-01_10j": [...] },
  "questionsArchives": { "2025-12-01_10j": [...] },
  "intentionsArchives": { "2025-12-01_10j": [...] },
  "ecrituresArchives": { "2025-12-01_10j": [...] },
  "audiosArchives": {
    "2025-12-01_10j": [
      { "id": 456, "titre": "Prière J3", "duree": 120, ... }
      // Note : SANS blob audio (trop lourd pour localStorage)
    ]
  }
}
```

### 2. Extension de `lib/audioStorage.js`

**Nouvelles fonctions IndexedDB :**

```javascript
// Récupérer audios d'un jeûne par plage de dates
recupererAudiosParJeune(dateDebut, dateFin)

// Archiver métadonnées audios (sans blobs)
archiverAudiosJeune(dateDebut, dateFin, idJeune)
  → Filtre audios par dates
  → Stocke métadonnées dans localStorage audiosArchives
  → Blobs restent dans IndexedDB (accès par ID)

// Récupérer métadonnées audios archivés
recupererAudiosArchives(idJeune)

// Restaurer audio complet (si toujours dans IndexedDB)
restaurerAudioArchive(idAudio)
```

**Pourquoi ne pas archiver les blobs audio ?**
- Blobs = fichiers lourds (plusieurs MB par audio)
- localStorage limité à 5-10 MB total
- IndexedDB conserve les blobs (500+ MB)
- **Solution :** Archiver métadonnées + garder référence vers IndexedDB

### 3. Modifications `pages/jeune.js`

**Handler `archiverJeuneActuel()` (ligne ~1163) :**

```javascript
const archiverJeuneActuel = async () => {
  // ... lecture localStorage existante ...

  // 🆕 ARCHIVER DONNÉES SPIRITUELLES
  const { archiverDonneesSpirituellesJeune } = await import('../lib/journalSpirituelArchive');
  const donneesSpirituellesArchivees = await archiverDonneesSpirituellesJeune(
    dateDebutLS,
    dateFinArchivage,
    idJeune
  );

  const jeuneArchive = {
    // ... données existantes ...
    // 🆕 Métadonnées données spirituelles
    donneesSpirituellesCount: donneesSpirituellesArchivees ? 
      Object.values(donneesSpirituellesArchivees).reduce((a, b) => a + b, 0) : 0
  };

  // ... sauvegarde historique ...
};
```

**Handler `supprimerDefinitivement()` (ligne ~1346) :**

```javascript
const supprimerDefinitivement = async (jeuneId) => {
  // ... suppression jeûne existante ...

  // 🆕 SUPPRIMER DONNÉES SPIRITUELLES
  const { supprimerDonneesSpirituellesArchivees } = await import('../lib/journalSpirituelArchive');
  supprimerDonneesSpirituellesArchivees(jeuneId);
};
```

### 4. Modifications `pages/journal-spirituel.js`

**Détection mode archive (ligne ~19) :**

```javascript
useEffect(() => {
  // Vérifier si on consulte un jeûne archivé
  const jeuneConsulte = localStorage.getItem('jeuneConsulte');
  if (jeuneConsulte) {
    const jeune = JSON.parse(jeuneConsulte);
    setModeArchive(true);
    setIdJeuneArchive(jeune.id);
    return;
  }
  // ... mode normal ...
}, []);
```

**Bandeau mode archive (ligne ~78) :**

```javascript
{modeArchive && (
  <div style={{ background: '#e3f2fd', ... }}>
    📚 Mode archive - Jeûne terminé
    Vous consultez les données spirituelles d'un jeûne archivé (lecture seule)
  </div>
)}
```

**Props aux composants enfants :**

```javascript
<OngletMeditation 
  jourJeune={jourJeune} 
  modeArchive={modeArchive} 
  idJeuneArchive={idJeuneArchive} 
/>
```

### 5. Extension `lib/useJournalSpirituel.js`

**Hook `useMeditations()` avec support archive :**

```javascript
export const useMeditations = (modeArchive = false, idJeuneArchive = null) => {
  // ...
  
  const charger = async () => {
    // 🆕 MODE ARCHIVE : charger depuis archives
    if (modeArchive && idJeuneArchive) {
      const donneesArchivees = await recupererDonneesSpirituellesArchivees(idJeuneArchive);
      setMeditations(donneesArchivees?.meditations || []);
      return;
    }
    
    // Mode normal : Supabase ou localStorage
    // ...
  };

  const ajouter = async (meditation) => {
    // 🆕 Bloquer ajout en mode archive
    if (modeArchive) {
      alert('⚠️ Mode archive : impossible d\'ajouter');
      return null;
    }
    // ...
  };

  const supprimer = async (id) => {
    // 🆕 Bloquer suppression en mode archive
    if (modeArchive) {
      alert('⚠️ Mode archive : impossible de supprimer');
      return;
    }
    // ...
  };
};
```

### 6. Modifications `components/OngletMeditation.js`

**Props + hook :**

```javascript
export default function OngletMeditation({ 
  jourJeune, 
  modeArchive = false, 
  idJeuneArchive = null 
}) {
  const { meditations, ajouter, supprimer, modeArchive: isArchive } = 
    useMeditations(modeArchive, idJeuneArchive);

  const demarrerMeditation = () => {
    if (modeArchive) {
      alert('⚠️ Mode archive : vous ne pouvez pas démarrer de méditation');
      return;
    }
    // ...
  };
}
```

**Badge mode archive :**

```javascript
<h2>
  🧘 Méditation & Prière
  {modeArchive ? (
    <span style={{color: '#64b5f6'}}>📚 Archive</span>
  ) : modeSupabase ? (
    <span style={{color: '#10b981'}}>☁️ Sync</span>
  ) : (
    <span style={{color: '#f59e0b'}}>💾 Local</span>
  )}
</h2>
```

---

## 📊 FLUX COMPLET

### Archivage (nouvelle préparation jeûne)

```
1. User clique "Nouvelle préparation"
2. archiverJeuneActuel() appelé
   ├─ Lecture localStorage (joursValides, outils, etc.)
   ├─ 🆕 archiverDonneesSpirituellesJeune(dateDebut, dateFin, idJeune)
   │   ├─ Filtre méditations par dates
   │   ├─ Filtre versets par dates
   │   ├─ Filtre questions par dates
   │   ├─ Filtre intentions par dates
   │   ├─ Filtre écritures par dates
   │   └─ 🎤 archiverAudiosJeune() → métadonnées dans audiosArchives
   ├─ Création objet jeuneArchive avec compteur données spirituelles
   └─ Sauvegarde historiqueJeunes[]

3. Console logs :
   "✅ Jeûne archivé avec succès: 2025-12-01_10j"
   "📿 Données spirituelles archivées: {
     meditations: 5,
     versets: 3,
     questions: 8,
     intentions: 2,
     ecritures: 4,
     audios: 7
   }"
```

### Consultation archive

```
1. User ouvre "Historique des jeûnes"
2. User clique "Consulter" sur jeûne archivé
3. chargerJeuneArchive(jeuneId)
   ├─ setJeuneConsulte(jeune)
   └─ localStorage.setItem('jeuneConsulte', JSON.stringify(jeune))

4. Page jeune.js affiche bandeau bleu archive

5. User clique "Accéder à ma restauration spirituelle"
6. Navigation vers /journal-spirituel
7. journal-spirituel.js détecte jeuneConsulte
   ├─ setModeArchive(true)
   ├─ setIdJeuneArchive(jeune.id)
   └─ Affiche bandeau archive

8. OngletMeditation reçoit props modeArchive + idJeuneArchive
9. useMeditations(true, "2025-12-01_10j") appelé
10. Chargement depuis meditationsArchives["2025-12-01_10j"]
11. Affichage historique méditations en lecture seule

Pareil pour tous les onglets : Versets, Questions, Intentions, Écritures, Audios
```

### Suppression définitive

```
1. User supprime jeûne de la corbeille (hard delete)
2. supprimerDefinitivement(jeuneId)
   ├─ Suppression de jeunesSupprimés[]
   └─ 🆕 supprimerDonneesSpirituellesArchivees(jeuneId)
       ├─ delete meditationsArchives[jeuneId]
       ├─ delete versetsArchives[jeuneId]
       ├─ delete questionsArchives[jeuneId]
       ├─ delete intentionsArchives[jeuneId]
       ├─ delete ecrituresArchives[jeuneId]
       └─ delete audiosArchives[jeuneId]

3. Console logs :
   "⚠️ Jeûne supprimé définitivement: 2025-12-01_10j"
   "📿 Données spirituelles supprimées"
```

---

## ✅ TESTS À EFFECTUER

### Test 1 : Archivage complet
1. Créer nouveau jeûne
2. Valider quelques jours
3. Aller dans restauration spirituelle
4. Ajouter méditations, versets, questions, intentions, écritures
5. 🎤 Enregistrer 2-3 audios
6. Retour page jeûne → Nouvelle préparation
7. **Vérifier console** : logs archivage données spirituelles
8. **Vérifier localStorage** : meditationsArchives, versetsArchives, audiosArchives

### Test 2 : Consultation archive restauration spirituelle
1. Ouvrir historique jeûnes
2. Consulter jeûne archivé
3. Cliquer "Accéder à ma restauration spirituelle"
4. **Vérifier** : Bandeau bleu "Mode archive"
5. Onglet Méditation : **voir méditations archivées**
6. Onglet Audios : **voir métadonnées audios**
7. Essayer d'ajouter méditation → **alerte "Mode archive"**
8. Essayer de supprimer méditation → **alerte "Mode archive"**

### Test 3 : Audios archivés
1. Dans mode archive restauration spirituelle
2. Aller onglet Audios
3. **Vérifier** : Liste des audios enregistrés
4. **Vérifier** : Métadonnées (titre, durée, type, date)
5. Cliquer "Écouter" → **doit lire depuis IndexedDB si toujours présent**
6. Si audio supprimé IndexedDB → **message "Audio non disponible"**

### Test 4 : Suppression définitive
1. Supprimer jeûne de la corbeille (hard delete)
2. **Vérifier localStorage** : données spirituelles supprimées
3. **Vérifier console** : "Données spirituelles supprimées"
4. Vérifier audiosArchives[idJeune] → **undefined**

### Test 5 : Mode archive toutes les onglets
1. Consulter jeûne archivé → restauration spirituelle
2. Tester **tous les 6 onglets** :
   - 📿 Méditation : voir méditations + badge "Archive"
   - 📖 Versets : voir versets archivés
   - 💭 Questions : voir questions/réponses archivées
   - 🎯 Intentions : voir intentions archivées
   - 🎤 Audios : voir métadonnées audios
   - ✍️ Écriture : voir écritures archivées
3. **Vérifier** : Tous en lecture seule
4. **Vérifier** : Boutons "Ajouter/Supprimer" désactivés ou alertes

---

## 📦 FICHIERS MODIFIÉS

### Nouveaux fichiers
- ✅ `lib/journalSpirituelArchive.js` (200 lignes)

### Fichiers modifiés
- ✅ `lib/audioStorage.js` (+90 lignes)
- ✅ `pages/jeune.js` (archiverJeuneActuel, supprimerDefinitivement)
- ✅ `pages/journal-spirituel.js` (détection mode archive, bandeau)
- ✅ `lib/useJournalSpirituel.js` (support modeArchive dans hooks)
- ✅ `components/OngletMeditation.js` (props modeArchive, blocage actions)

### Fichiers à modifier (même pattern)
- ⏳ `components/OngletVersets.js`
- ⏳ `components/OngletQuestions.js`
- ⏳ `components/OngletIntentions.js`
- ⏳ `components/OngletAudios.js`
- ⏳ `components/OngletEcriture.js`
- ⏳ `lib/useJournalSpirituel.js` (autres hooks : useVersets, useQuestions, etc.)

---

## 🎯 RÉSULTAT FINAL

**Avant :**
- User consulte jeûne archivé
- Clique "Restauration spirituelle"
- Voit 0 méditations, 0 audios → **perte de données**

**Après :**
- User consulte jeûne archivé
- Clique "Restauration spirituelle"
- Voit **TOUTES** ses méditations, versets, questions, audios
- Bandeau bleu "Mode archive (lecture seule)"
- Impossible d'ajouter/supprimer (protection)
- Navigation jour par jour fonctionne
- **Expérience complète de consultation**

---

## 🔮 AMÉLIORATIONS FUTURES (optionnelles)

1. **Compression audios archivés** : Convertir MP3 → réduire taille IndexedDB
2. **Export complet jeûne** : ZIP avec JSON + audios
3. **Statistiques spirituelles** : Graphiques méditations par type, durée totale
4. **Recherche textuelle** : Chercher dans notes méditations archivées
5. **Tags/filtres** : Filtrer méditations archivées par ressenti
6. **Comparaison jeûnes** : Comparer pratiques spirituelles entre 2 jeûnes

---

## 📝 NOTES TECHNIQUES

### Pourquoi localStorage séparé pour archives ?
- **Isolation** : Ne pas mélanger données actives et archives
- **Performance** : Filtrage rapide par clé (idJeune)
- **Clarté** : Structure explicite `*Archives[idJeune]`

### Gestion blobs audio
- **Métadonnées localStorage** : 1-2 KB par audio
- **Blobs IndexedDB** : Quelques MB par audio
- **Référence** : audiosArchives stocke ID → récupération IndexedDB
- **Limitation** : Si user vide cache navigateur → audios perdus (métadonnées conservées)

### Pattern de blocage en mode archive
```javascript
const ajouter = async (item) => {
  if (modeArchive) {
    alert('⚠️ Mode archive : impossible d\'ajouter');
    return null;
  }
  // ... logique normale
};
```

### Filtrage par dates
```javascript
const filtrerParDates = (items, dateDebut, dateFin) => {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  
  return items.filter(item => {
    const dateItem = new Date(item.date || item.created_at);
    return dateItem >= debut && dateItem <= fin;
  });
};
```

---

**Status :** ✅ Extension archivage données spirituelles implémentée  
**Prochaine étape :** Tests utilisateur complets + extension autres onglets (Versets, Questions, etc.)
