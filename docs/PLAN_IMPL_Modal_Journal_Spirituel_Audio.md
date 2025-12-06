# 🙏 PLAN D'IMPLÉMENTATION : Modal Journal Spirituel avec Audio

**Date de création :** 06/12/2025  
**Statut :** 📋 Spécification validée - En attente d'implémentation  
**Priorité :** P1 (Haute - Dimension spirituelle essentielle)  
**Effort estimé :** ~1130 lignes de code

---

## 🎯 OBJECTIF

Créer une **Modal Journal Spirituel Interactive** complète avec enregistrement audio/vocal, permettant à l'utilisateur de documenter sa traversée spirituelle pendant le jeûne avec :
- 📿 Méditations quotidiennes avec timer
- 📖 Collection de versets/citations
- 💭 Questions profondes guidées
- 🎯 Intentions spirituelles
- 🎙️ **Enregistrements audio/vocaux (prières, méditations, réflexions)**

---

## 📦 ARCHITECTURE GLOBALE

### **Fichiers à créer**

```
/components/
  ├── ModalJournalSpirituel.js       (600 lignes - Composant principal)
  ├── AudioRecorder.js                (200 lignes - Enregistrement)
  ├── AudioPlayer.js                  (150 lignes - Lecteur avancé)
  └── JournalSpirituelTabs.js         (80 lignes - Navigation onglets)

/lib/
  ├── audioStorage.js                 (100 lignes - Gestion stockage)
  └── audioAnalyzer.js                (80 lignes - Visualisation)

/styles/
  └── ModalJournalSpirituel.module.css (120 lignes - Styles)

Total estimé : ~1330 lignes
```

---

## 🎨 STRUCTURE DE LA MODAL

### **5 Onglets principaux**

```jsx
<ModalJournalSpirituel isOpen={true} onClose={...} jourEnCours={3}>
  <Tabs>
    <Tab id="meditation" label="📿 Méditation" />
    <Tab id="versets" label="📖 Versets" />
    <Tab id="questions" label="💭 Questions" />
    <Tab id="intentions" label="🎯 Intentions" />
    <Tab id="audios" label="🎙️ Audios" />
  </Tabs>
  
  <TabContent activeTab={activeTab}>
    {/* Contenu dynamique selon l'onglet */}
  </TabContent>
</ModalJournalSpirituel>
```

---

## 📿 ONGLET 1 : MÉDITATION

### **Fonctionnalités**

```jsx
<div className="meditation-tab">
  <h3>📿 Ma méditation du jour</h3>
  
  {/* Sélection durée */}
  <div className="duration-selector">
    <button className={duree === 5 ? 'active' : ''} onClick={() => setDuree(5)}>5 min</button>
    <button className={duree === 10 ? 'active' : ''} onClick={() => setDuree(10)}>10 min</button>
    <button className={duree === 15 ? 'active' : ''} onClick={() => setDuree(15)}>15 min</button>
    <button className={duree === 20 ? 'active' : ''} onClick={() => setDuree(20)}>20 min</button>
    <button className={duree === 30 ? 'active' : ''} onClick={() => setDuree(30)}>30 min</button>
  </div>
  
  {/* Timer */}
  {timerActif && (
    <div className="timer">
      <div className="time-display">{formatTime(tempsRestant)}</div>
      <div className="progress-circle">
        <svg>
          <circle cx="50%" cy="50%" r="45%" stroke="currentColor" />
        </svg>
      </div>
      <button onClick={pauseTimer}>⏸️ Pause</button>
      <button onClick={stopTimer}>⏹️ Arrêter</button>
    </div>
  )}
  
  {!timerActif && (
    <button onClick={startTimer} className="btn-start">
      ▶️ Commencer ma méditation
    </button>
  )}
  
  {/* Type de méditation */}
  <div className="type-meditation">
    <label>
      <input type="radio" name="type" value="priere" checked={type === 'priere'} />
      🙏 Prière
    </label>
    <label>
      <input type="radio" name="type" value="silence" checked={type === 'silence'} />
      🤫 Silence
    </label>
    <label>
      <input type="radio" name="type" value="lecture" checked={type === 'lecture'} />
      📖 Lecture
    </label>
    <label>
      <input type="radio" name="type" value="contemplation" checked={type === 'contemplation'} />
      🌅 Contemplation
    </label>
  </div>
  
  {/* Notes post-méditation */}
  <div className="notes">
    <label>📝 Ce qui est remonté :</label>
    <textarea 
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      placeholder="Note ce qui s'est passé pendant ta méditation..."
    />
  </div>
  
  {/* Ressenti */}
  <div className="ressenti">
    <label>💫 Ressenti après :</label>
    <div className="emotions">
      <button className={ressenti.includes('paix') ? 'active' : ''} onClick={() => toggleRessenti('paix')}>
        😌 Paix
      </button>
      <button className={ressenti.includes('gratitude') ? 'active' : ''} onClick={() => toggleRessenti('gratitude')}>
        🙏 Gratitude
      </button>
      <button className={ressenti.includes('force') ? 'active' : ''} onClick={() => toggleRessenti('force')}>
        💪 Force
      </button>
      <button className={ressenti.includes('emotion') ? 'active' : ''} onClick={() => toggleRessenti('emotion')}>
        😢 Émotion
      </button>
      <button className={ressenti.includes('question') ? 'active' : ''} onClick={() => toggleRessenti('question')}>
        🤔 Question
      </button>
    </div>
  </div>
  
  <button onClick={sauvegarderMeditation} className="btn-save">
    Sauvegarder cette méditation
  </button>
</div>
```

### **Structure de données**

```javascript
{
  id: "med_001",
  jour: 3,
  date: "2025-12-06",
  duree: 15, // minutes
  type: "priere",
  notes: "Moment de clarté intense...",
  ressenti: ["paix", "gratitude"],
  timestamp: "2025-12-06T07:30:00Z"
}
```

---

## 📖 ONGLET 2 : VERSETS & CITATIONS

### **Fonctionnalités**

```jsx
<div className="versets-tab">
  <h3>📖 Ma collection spirituelle</h3>
  
  {/* Formulaire ajout */}
  <button onClick={() => setShowForm(true)} className="btn-add">
    + Ajouter un verset/citation
  </button>
  
  {showForm && (
    <form onSubmit={ajouterVerset}>
      <div className="form-group">
        <label>Verset/Citation :</label>
        <textarea 
          value={nouveauVerset.texte}
          onChange={(e) => setNouveauVerset({...nouveauVerset, texte: e.target.value})}
          placeholder="Tape ou colle ton verset ici..."
          required
        />
      </div>
      
      <div className="form-group">
        <label>Référence (optionnel) :</label>
        <input 
          type="text"
          value={nouveauVerset.reference}
          onChange={(e) => setNouveauVerset({...nouveauVerset, reference: e.target.value})}
          placeholder="ex: Psaume 23:1, Coran 2:45, etc."
        />
      </div>
      
      <div className="form-group">
        <label>🔗 Lien externe (optionnel) :</label>
        <input 
          type="url"
          value={nouveauVerset.lien}
          onChange={(e) => setNouveauVerset({...nouveauVerset, lien: e.target.value})}
          placeholder="Lien vers audio/vidéo/article"
        />
      </div>
      
      <div className="form-group">
        <label>🏷️ Tags :</label>
        <input 
          type="text"
          value={nouveauVerset.tags}
          onChange={(e) => setNouveauVerset({...nouveauVerset, tags: e.target.value})}
          placeholder="force, paix, patience (séparés par des virgules)"
        />
      </div>
      
      <div className="form-actions">
        <button type="submit" className="btn-primary">Ajouter</button>
        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
      </div>
    </form>
  )}
  
  {/* Liste des versets */}
  <div className="versets-liste">
    <h4>📜 Mes versets sauvegardés ({versets.length}) :</h4>
    
    {versets.map(verset => (
      <div key={verset.id} className="verset-card">
        <div className="verset-header">
          <button 
            className={`btn-favori ${verset.favori ? 'active' : ''}`}
            onClick={() => toggleFavori(verset.id)}
          >
            {verset.favori ? '⭐' : '☆'}
          </button>
          <span className="reference">{verset.reference}</span>
        </div>
        
        <p className="texte">{verset.texte}</p>
        
        {verset.tags && verset.tags.length > 0 && (
          <div className="tags">
            {verset.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
        
        <div className="verset-actions">
          {verset.lien && (
            <a href={verset.lien} target="_blank" rel="noopener noreferrer" className="btn-link">
              🔗 Lien externe
            </a>
          )}
          <button onClick={() => editerVerset(verset.id)} className="btn-edit">
            ✏️ Éditer
          </button>
          <button onClick={() => supprimerVerset(verset.id)} className="btn-delete">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
```

### **Structure de données**

```javascript
{
  id: "vers_001",
  texte: "Car je connais les projets que j'ai formés sur vous...",
  reference: "Jérémie 29:11",
  lien: "https://youtube.com/...",
  tags: ["espoir", "avenir", "confiance"],
  favori: true,
  dateAjout: "2025-12-06"
}
```

---

## 💭 ONGLET 3 : QUESTIONS PROFONDES

### **Questions pré-remplies par jour**

```javascript
const QUESTIONS_GUIDEES = {
  1: "Pourquoi ai-je choisi ce jeûne maintenant ?",
  2: "Qu'est-ce que je cherche à retrouver en moi ?",
  3: "Quelle relation j'entretiens avec le divin ?",
  4: "Qu'est-ce qui m'empêche d'être pleinement présent·e ?",
  5: "Qu'est-ce que mon corps m'enseigne pendant ce jeûne ?",
  7: "Quel engagement spirituel je veux prendre après ?",
  10: "Comment intégrer cette paix dans ma vie quotidienne ?",
  14: "Quelle personne je veux devenir après ce jeûne ?"
};
```

### **Interface**

```jsx
<div className="questions-tab">
  <h3>💭 Questions pour mon âme</h3>
  
  <div className="question-du-jour">
    <h4>Question du jour (J{jourEnCours}) :</h4>
    <p className="question">{QUESTIONS_GUIDEES[jourEnCours] || "Aucune question suggérée pour ce jour"}</p>
    
    <label>Ma réponse :</label>
    <textarea 
      value={reponse}
      onChange={(e) => setReponse(e.target.value)}
      placeholder="Prends ton temps... Écris ce qui vient du coeur..."
      rows="8"
    />
    
    <div className="actions">
      <button onClick={sauvegarderReponse} className="btn-primary">
        Sauvegarder
      </button>
      <button onClick={questionSuivante} className="btn-secondary">
        Question suivante
      </button>
    </div>
  </div>
  
  <div className="historique">
    <h4>📚 Historique des réflexions :</h4>
    <ul>
      {reponsesSauvegardees.map(r => (
        <li key={r.jour}>
          <span className="jour">J{r.jour}</span>
          <span className="question">{r.question}</span>
          <button onClick={() => voirReponse(r.jour)}>👁️ Voir</button>
        </li>
      ))}
    </ul>
  </div>
  
  <button onClick={() => setShowCustomQuestion(true)} className="btn-add">
    + Ajouter ma propre question
  </button>
</div>
```

---

## 🎙️ ONGLET 4 : AUDIOS (PRINCIPAL - NOUVELLE FONCTIONNALITÉ)

### **Interface principale**

```jsx
<div className="audios-tab">
  <h3>🎙️ Mes enregistrements vocaux</h3>
  
  {/* Bouton principal */}
  {!isRecording && !isPlaying && (
    <button onClick={startRecording} className="btn-record">
      🔴 Enregistrer une note vocale
    </button>
  )}
  
  {/* Interface enregistrement */}
  {isRecording && (
    <div className="recording-interface">
      <h4>🎙️ Enregistrement en cours...</h4>
      
      {/* Visualisation niveau audio */}
      <div className="audio-visualizer">
        <canvas ref={visualizerRef} width="400" height="100" />
      </div>
      
      {/* Timer */}
      <div className="timer-recording">
        <span className="time">{formatTime(recordingTime)}</span>
        <span className="max">/ 30:00</span>
      </div>
      
      {/* Contrôles */}
      <div className="controls">
        <button onClick={pauseRecording} className="btn-pause">
          ⏸️ Pause
        </button>
        <button onClick={stopRecording} className="btn-stop">
          ⏹️ Arrêter
        </button>
        <button onClick={cancelRecording} className="btn-cancel">
          🗑️ Annuler
        </button>
      </div>
      
      <p className="conseil">
        💡 Conseil : Parle naturellement, laisse sortir ce qui vient...
      </p>
    </div>
  )}
  
  {/* Modal de sauvegarde après enregistrement */}
  {audioBlob && showSaveModal && (
    <div className="save-modal">
      <h4>Sauvegarder l'enregistrement</h4>
      
      <div className="form-group">
        <label>Type d'enregistrement :</label>
        <select value={audioType} onChange={(e) => setAudioType(e.target.value)}>
          <option value="priere">🙏 Prière personnelle</option>
          <option value="meditation">🧘 Méditation guidée</option>
          <option value="reflexion">💭 Réflexion du jour</option>
          <option value="intention">🎯 Intention spirituelle</option>
          <option value="note">📝 Note libre</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Note (optionnel) :</label>
        <textarea 
          value={audioNote}
          onChange={(e) => setAudioNote(e.target.value)}
          placeholder="Ajoute un contexte à cet enregistrement..."
        />
      </div>
      
      <div className="form-group">
        <label>Tags :</label>
        <input 
          type="text"
          value={audioTags}
          onChange={(e) => setAudioTags(e.target.value)}
          placeholder="gratitude, paix, douleur..."
        />
      </div>
      
      <div className="actions">
        <button onClick={sauvegarderAudio} className="btn-primary">
          💾 Sauvegarder
        </button>
        <button onClick={cancelSave} className="btn-secondary">
          Annuler
        </button>
      </div>
    </div>
  )}
  
  {/* Liste des audios */}
  <div className="audios-liste">
    <h4>📼 Mes audios ({audios.length}) :</h4>
    
    {/* Filtres */}
    <div className="filtres">
      <select value={filtre} onChange={(e) => setFiltre(e.target.value)}>
        <option value="tous">Tous les types</option>
        <option value="priere">🙏 Prières</option>
        <option value="meditation">🧘 Méditations</option>
        <option value="reflexion">💭 Réflexions</option>
        <option value="intention">🎯 Intentions</option>
        <option value="note">📝 Notes</option>
      </select>
      
      <select value={tri} onChange={(e) => setTri(e.target.value)}>
        <option value="recent">Plus récent</option>
        <option value="ancien">Plus ancien</option>
        <option value="duree">Durée</option>
        <option value="jour">Jour du jeûne</option>
      </select>
    </div>
    
    {/* Cards audios */}
    {audiosFiltres.map(audio => (
      <div key={audio.id} className="audio-card">
        <div className="audio-header">
          <span className="type-icon">{getTypeIcon(audio.type)}</span>
          <div className="info">
            <h5>{getTypeLabel(audio.type)} - J{audio.jour}</h5>
            <p className="meta">
              ⏱️ {formatDuration(audio.duree)} | 📅 {formatDate(audio.date)}
            </p>
          </div>
          <button 
            className={`btn-favori ${audio.favori ? 'active' : ''}`}
            onClick={() => toggleFavoriAudio(audio.id)}
          >
            {audio.favori ? '⭐' : '☆'}
          </button>
        </div>
        
        {audio.note && (
          <p className="note">📝 {audio.note}</p>
        )}
        
        {audio.tags && audio.tags.length > 0 && (
          <div className="tags">
            {audio.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
        
        <div className="audio-actions">
          <button onClick={() => playAudio(audio.id)} className="btn-play">
            {currentAudioId === audio.id && isPlaying ? '⏸️ Pause' : '▶️ Écouter'}
          </button>
          <button onClick={() => editerNoteAudio(audio.id)} className="btn-edit">
            📝 Ajouter note
          </button>
          <button onClick={() => telechargerAudio(audio.id)} className="btn-download">
            ⬇️ Télécharger
          </button>
          <button onClick={() => supprimerAudio(audio.id)} className="btn-delete">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    ))}
  </div>
  
  {/* Player global */}
  {currentAudioId && (
    <div className="player-global">
      <AudioPlayer
        audio={audios.find(a => a.id === currentAudioId)}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onPlayPause={togglePlay}
        onSeek={seekAudio}
        onSpeedChange={changeSpeed}
        onClose={closePlayer}
      />
    </div>
  )}
</div>
```

---

## 🎙️ COMPOSANT : AudioRecorder.js

### **Fonctionnalités principales**

```javascript
import { useState, useRef, useEffect } from 'react';

export default function AudioRecorder({ onSave, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  
  // Demander permission micro
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onSave(audioBlob, recordingTime);
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Web Audio API pour visualisation
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      // Démarrer
      mediaRecorder.start(100);
      setIsRecording(true);
      startTimer();
      visualizeAudio();
      
    } catch (error) {
      console.error('Erreur accès microphone:', error);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };
  
  // Timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 1800) { // 30 min max
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };
  
  // Visualisation
  const visualizeAudio = () => {
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculer niveau moyen
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(average / 255);
    };
    
    animate();
  };
  
  // Pause
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };
  
  // Stop
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      cancelAnimationFrame(animationRef.current);
      setIsRecording(false);
      setIsPaused(false);
    }
  };
  
  // Cancel
  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      const stream = mediaRecorderRef.current.stream;
      stream.getTracks().forEach(track => track.stop());
    }
    clearInterval(timerRef.current);
    cancelAnimationFrame(animationRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    onCancel();
  };
  
  return (
    <div className="audio-recorder">
      {/* UI render */}
    </div>
  );
}
```

---

## 🔊 COMPOSANT : AudioPlayer.js

### **Player avancé**

```javascript
import { useState, useRef, useEffect } from 'react';

export default function AudioPlayer({ audio, isPlaying, currentTime, onPlayPause, onSeek, onSpeedChange, onClose }) {
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);
  
  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };
  
  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * audio.duree;
    onSeek(newTime);
  };
  
  return (
    <div className="audio-player">
      <div className="player-header">
        <h4>🔊 {audio.type} (J{audio.jour})</h4>
        <button onClick={onClose} className="btn-close">✕</button>
      </div>
      
      <div className="waveform" ref={progressRef} onClick={handleSeek}>
        <div 
          className="progress" 
          style={{ width: `${(currentTime / audio.duree) * 100}%` }}
        />
      </div>
      
      <div className="time-display">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(audio.duree)}</span>
      </div>
      
      <div className="controls">
        <button onClick={() => onSeek(currentTime - 10)} className="btn-skip">
          ⏪ -10s
        </button>
        <button onClick={onPlayPause} className="btn-play-pause">
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button onClick={() => onSeek(currentTime + 10)} className="btn-skip">
          ⏩ +10s
        </button>
      </div>
      
      <div className="speed-control">
        <span>Vitesse :</span>
        <button className={speed === 0.5 ? 'active' : ''} onClick={() => handleSpeedChange(0.5)}>0.5x</button>
        <button className={speed === 0.75 ? 'active' : ''} onClick={() => handleSpeedChange(0.75)}>0.75x</button>
        <button className={speed === 1 ? 'active' : ''} onClick={() => handleSpeedChange(1)}>1x</button>
        <button className={speed === 1.5 ? 'active' : ''} onClick={() => handleSpeedChange(1.5)}>1.5x</button>
      </div>
      
      {audio.note && (
        <div className="audio-note">
          <p>📝 {audio.note}</p>
          <button onClick={() => editerNote(audio.id)} className="btn-edit">✏️ Éditer</button>
        </div>
      )}
      
      <audio ref={audioRef} src={audio.url} />
    </div>
  );
}
```

---

## 💾 STOCKAGE : audioStorage.js

### **Gestion IndexedDB + Supabase**

```javascript
// IndexedDB pour gros fichiers
import { openDB } from 'idb';

const DB_NAME = 'journalSpirituel';
const STORE_NAME = 'audios';

export async function initDB() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
}

export async function sauvegarderAudioLocal(audio) {
  const db = await initDB();
  await db.put(STORE_NAME, audio);
  return audio.id;
}

export async function chargerAudiosLocaux() {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
}

export async function supprimerAudioLocal(id) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

// Upload Supabase (optionnel)
export async function uploadAudioSupabase(audioBlob, audioId, userId) {
  const { data, error } = await supabase.storage
    .from('audios-spirituels')
    .upload(`${userId}/${audioId}.webm`, audioBlob, {
      contentType: 'audio/webm',
      upsert: false
    });
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('audios-spirituels')
    .getPublicUrl(`${userId}/${audioId}.webm`);
  
  return urlData.publicUrl;
}

// Téléchargement
export function telechargerAudio(audioBlob, filename) {
  const url = URL.createObjectURL(audioBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

---

## 📊 STATISTIQUES & DASHBOARD

### **Vue d'ensemble**

```jsx
<div className="dashboard-audio">
  <h4>📊 Mes statistiques audio</h4>
  
  <div className="stats-grid">
    <div className="stat-card">
      <div className="stat-value">{formatDuration(tempsTotal)}</div>
      <div className="stat-label">Total enregistré</div>
    </div>
    
    <div className="stat-card">
      <div className="stat-value">{audios.length}</div>
      <div className="stat-label">Nombre d'audios</div>
    </div>
    
    <div className="stat-card">
      <div className="stat-value">{serieEnCours}</div>
      <div className="stat-label">Série en cours</div>
    </div>
  </div>
  
  <div className="stats-types">
    <h5>Par type :</h5>
    <ul>
      <li>🙏 Prières : {countByType('priere')} ({durationByType('priere')})</li>
      <li>🧘 Méditations : {countByType('meditation')} ({durationByType('meditation')})</li>
      <li>💭 Réflexions : {countByType('reflexion')} ({durationByType('reflexion')})</li>
      <li>🎯 Intentions : {countByType('intention')} ({durationByType('intention')})</li>
      <li>📝 Notes : {countByType('note')} ({durationByType('note')})</li>
    </ul>
  </div>
  
  {audioFavori && (
    <div className="audio-favori">
      <h5>⭐ Audio favori :</h5>
      <p>{audioFavori.type} - J{audioFavori.jour} ({formatDuration(audioFavori.duree)})</p>
    </div>
  )}
</div>
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### **Phase 1 : Structure de base (Estimé : 4h)**
- [ ] Créer composant ModalJournalSpirituel.js avec 5 onglets
- [ ] Créer système de navigation entre onglets
- [ ] Créer structure de données pour chaque section
- [ ] Ajouter persistance localStorage pour chaque section
- [ ] Tester ouverture/fermeture modal

### **Phase 2 : Onglet Méditation (Estimé : 3h)**
- [ ] Créer timer avec countdown
- [ ] Ajouter sélection durée (5, 10, 15, 20, 30 min)
- [ ] Ajouter sélection type (prière, silence, lecture, contemplation)
- [ ] Créer zone notes post-méditation
- [ ] Créer sélection ressenti (émotions)
- [ ] Implémenter sauvegarde méditation
- [ ] Tester fonctionnement complet

### **Phase 3 : Onglet Versets (Estimé : 3h)**
- [ ] Créer formulaire ajout verset
- [ ] Implémenter CRUD versets (Create, Read, Update, Delete)
- [ ] Ajouter système tags
- [ ] Ajouter système favoris
- [ ] Créer affichage liste versets
- [ ] Ajouter liens externes
- [ ] Tester avec plusieurs versets

### **Phase 4 : Onglet Questions (Estimé : 2h)**
- [ ] Créer liste questions pré-remplies par jour
- [ ] Créer zone réponse
- [ ] Implémenter sauvegarde réponses
- [ ] Créer historique réponses
- [ ] Ajouter fonction questions personnalisées
- [ ] Tester navigation historique

### **Phase 5 : Onglet Audios - Enregistrement (Estimé : 6h)**
- [ ] Créer composant AudioRecorder
- [ ] Implémenter MediaRecorder API
- [ ] Ajouter demande permission microphone
- [ ] Créer visualisation niveau audio en direct
- [ ] Implémenter timer enregistrement
- [ ] Ajouter contrôles pause/stop/cancel
- [ ] Créer modal sauvegarde post-enregistrement
- [ ] Tester enregistrement avec différents navigateurs

### **Phase 6 : Onglet Audios - Lecture (Estimé : 5h)**
- [ ] Créer composant AudioPlayer
- [ ] Implémenter lecture audio
- [ ] Ajouter visualisation waveform
- [ ] Implémenter contrôles play/pause/seek
- [ ] Ajouter vitesse de lecture variable
- [ ] Implémenter saut ±10s
- [ ] Créer player global
- [ ] Tester lecture avec différents formats

### **Phase 7 : Onglet Audios - Gestion (Estimé : 4h)**
- [ ] Créer liste audios avec filtres
- [ ] Implémenter tri (date, durée, type, jour)
- [ ] Ajouter système favoris
- [ ] Créer fonction édition note audio
- [ ] Implémenter téléchargement audio
- [ ] Implémenter suppression audio
- [ ] Créer dashboard statistiques
- [ ] Tester gestion complète

### **Phase 8 : Stockage (Estimé : 4h)**
- [ ] Créer lib/audioStorage.js
- [ ] Implémenter IndexedDB pour audios
- [ ] Ajouter upload Supabase (optionnel)
- [ ] Créer fonction téléchargement local
- [ ] Implémenter sync localStorage ↔ IndexedDB
- [ ] Tester avec gros fichiers (>10MB)

### **Phase 9 : Onglet Intentions (Estimé : 2h)**
- [ ] Créer formulaire intention principale
- [ ] Ajouter checklist prières quotidiennes
- [ ] Ajouter checklist pratiques spirituelles
- [ ] Créer zone insight du jour
- [ ] Implémenter sauvegarde intentions
- [ ] Tester fonctionnement complet

### **Phase 10 : Styles & UX (Estimé : 4h)**
- [ ] Créer ModalJournalSpirituel.module.css
- [ ] Styler tous les onglets
- [ ] Ajouter animations transitions
- [ ] Rendre responsive mobile
- [ ] Ajouter mode sombre (optionnel)
- [ ] Tester accessibilité
- [ ] Optimiser performances

### **Phase 11 : Intégration jeune.js (Estimé : 2h)**
- [ ] Ajouter bouton "🙏 Mon Journal Spirituel" dans jeune.js
- [ ] Ajouter state modal (ouvert/fermé)
- [ ] Passer props (jourEnCours, onSave, onClose)
- [ ] Ajouter badge nombre méditations/audios
- [ ] Tester intégration complète

### **Phase 12 : Validation finale (Estimé : 3h)**
- [ ] Tester workflow complet chaque onglet
- [ ] Vérifier persistance toutes données
- [ ] Tester navigation entre onglets
- [ ] Vérifier responsive mobile/tablette
- [ ] Tester avec différents navigateurs
- [ ] Vérifier permissions microphone
- [ ] Build production sans erreurs
- [ ] Tester performances (temps chargement, RAM)

---

## 📈 MÉTRIQUES DE SUCCÈS

- ✅ **Adoption** : >60% utilisateurs ouvrent la modal au moins 1 fois
- ✅ **Engagement audios** : >40% utilisateurs enregistrent au moins 1 audio
- ✅ **Rétention** : >50% utilisateurs reviennent plusieurs jours de suite
- ✅ **Qualité audio** : >90% audios enregistrés sans erreur
- ✅ **Performance** : Temps chargement modal <500ms
- ✅ **Satisfaction** : Score NPS >8/10

---

## 🔐 SÉCURITÉ & CONFIDENTIALITÉ

### **Permissions**
- Demande explicite permission microphone
- Message clair sur usage données
- Aucun enregistrement sans consentement

### **Stockage**
- Données stockées localement par défaut (IndexedDB)
- Upload cloud Supabase optionnel (désactivé par défaut)
- Chiffrement audios si cloud activé
- Possibilité suppression totale données

### **Confidentialité**
- Aucun tracking analytics sur contenu spiritual
- Pas d'analyse automatique texte/audio sans opt-in
- Données jamais partagées avec tiers

---

**Fin du document - Prêt pour implémentation**
