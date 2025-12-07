import { useState, useRef, useEffect } from 'react';
import styles from '../styles/AudioPlayer.module.css';

export default function AudioPlayer({ audioBlob, titre, duree }) {
  const [enLecture, setEnLecture] = useState(false);
  const [progression, setProgression] = useState(0);
  const [tempsActuel, setTempsActuel] = useState(0);
  const [vitesse, setVitesse] = useState(1);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  // Créer URL audio
  useEffect(() => {
    if (audioBlob) {
      audioUrlRef.current = URL.createObjectURL(audioBlob);
    }

    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [audioBlob]);

  // Play/Pause
  const toggleLecture = () => {
    if (!audioRef.current) return;

    if (enLecture) {
      audioRef.current.pause();
      setEnLecture(false);
    } else {
      audioRef.current.play();
      setEnLecture(true);
    }
  };

  // Mise à jour progression
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration || duree;
    
    setTempsActuel(current);
    setProgression((current / duration) * 100);
  };

  // Fin lecture
  const handleEnded = () => {
    setEnLecture(false);
    setProgression(0);
    setTempsActuel(0);
  };

  // Changer position
  const handleSeek = (e) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    const time = (percent / 100) * (audioRef.current.duration || duree);

    audioRef.current.currentTime = time;
    setProgression(percent);
  };

  // Changer vitesse
  const changerVitesse = () => {
    const vitesses = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const indexActuel = vitesses.indexOf(vitesse);
    const nouvelleVitesse = vitesses[(indexActuel + 1) % vitesses.length];
    
    setVitesse(nouvelleVitesse);
    if (audioRef.current) {
      audioRef.current.playbackRate = nouvelleVitesse;
    }
  };

  // Changer volume
  const changerVolume = (e) => {
    const nouveauVolume = parseFloat(e.target.value);
    setVolume(nouveauVolume);
    if (audioRef.current) {
      audioRef.current.volume = nouveauVolume;
    }
  };

  // Reculer 10s
  const reculer = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
  };

  // Avancer 10s
  const avancer = () => {
    if (!audioRef.current) return;
    const duration = audioRef.current.duration || duree;
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
  };

  // Formater temps
  const formaterTemps = (secondes) => {
    const mins = Math.floor(secondes / 60);
    const secs = Math.floor(secondes % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={styles.playerContainer}>
      <audio
        ref={audioRef}
        src={audioUrlRef.current}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Titre */}
      {titre && (
        <div className={styles.titre}>
          🎵 {titre}
        </div>
      )}

      {/* Barre progression */}
      <div className={styles.progressionSection}>
        <span className={styles.temps}>{formaterTemps(tempsActuel)}</span>
        <div
          className={styles.progressBar}
          onClick={handleSeek}
        >
          <div
            className={styles.progressFill}
            style={{ width: `${progression}%` }}
          />
          <div
            className={styles.progressHandle}
            style={{ left: `${progression}%` }}
          />
        </div>
        <span className={styles.temps}>{formaterTemps(duree)}</span>
      </div>

      {/* Contrôles principaux */}
      <div className={styles.controlesPrincipaux}>
        <button onClick={reculer} className={styles.btnControle} title="Reculer 10s">
          ⏪ 10s
        </button>

        <button
          onClick={toggleLecture}
          className={`${styles.btnControle} ${styles.btnPlay}`}
        >
          {enLecture ? '⏸️' : '▶️'}
        </button>

        <button onClick={avancer} className={styles.btnControle} title="Avancer 10s">
          10s ⏩
        </button>
      </div>

      {/* Contrôles secondaires */}
      <div className={styles.controlesSecondaires}>
        {/* Vitesse */}
        <button
          onClick={changerVitesse}
          className={styles.btnVitesse}
          title="Vitesse de lecture"
        >
          🏃 {vitesse}x
        </button>

        {/* Volume */}
        <div className={styles.volumeSection}>
          <span className={styles.volumeIcone}>
            {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={changerVolume}
            className={styles.volumeSlider}
          />
        </div>
      </div>
    </div>
  );
}
