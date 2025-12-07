import { useState, useEffect } from 'react';
import styles from '../styles/TimerMeditation.module.css';

export default function TimerMeditation({ duree, onComplete }) {
  const [tempsEcoule, setTempsEcoule] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // Calcul progression (0 à 100%)
  const progression = duree > 0 ? (tempsEcoule / duree) * 100 : 0;
  
  // Calcul angle SVG (cercle commence à -90° pour démarrer en haut)
  const circonference = 2 * Math.PI * 90; // rayon = 90
  const offset = circonference - (progression / 100) * circonference;

  // Temps restant en minutes:secondes
  const tempsRestantSecondes = Math.max(0, duree - tempsEcoule);
  const minutes = Math.floor(tempsRestantSecondes / 60);
  const secondes = tempsRestantSecondes % 60;

  // Démarrer/Pause timer
  const toggleTimer = () => {
    if (enCours) {
      // Pause
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setEnCours(false);
    } else {
      // Démarrer
      setEnCours(true);
      const id = setInterval(() => {
        setTempsEcoule(prev => {
          const nouveau = prev + 1;
          if (nouveau >= duree) {
            clearInterval(id);
            setEnCours(false);
            if (onComplete) onComplete();
            return duree;
          }
          return nouveau;
        });
      }, 1000);
      setIntervalId(id);
    }
  };

  // Réinitialiser timer
  const resetTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTempsEcoule(0);
    setEnCours(false);
  };

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Réinitialiser si durée change
  useEffect(() => {
    resetTimer();
  }, [duree]);

  return (
    <div className={styles.timerContainer}>
      {/* Cercle SVG de progression */}
      <div className={styles.circleWrapper}>
        <svg width="220" height="220" className={styles.circleSvg}>
          {/* Cercle arrière-plan */}
          <circle
            cx="110"
            cy="110"
            r="90"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="12"
          />
          
          {/* Cercle de progression */}
          <circle
            cx="110"
            cy="110"
            r="90"
            fill="none"
            stroke="#667eea"
            strokeWidth="12"
            strokeDasharray={circonference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            className={styles.progressCircle}
          />
        </svg>

        {/* Affichage temps au centre */}
        <div className={styles.timeDisplay}>
          <div className={styles.timeText}>
            {String(minutes).padStart(2, '0')}:{String(secondes).padStart(2, '0')}
          </div>
          <div className={styles.progressText}>
            {Math.round(progression)}%
          </div>
        </div>
      </div>

      {/* Boutons contrôle */}
      <div className={styles.controls}>
        <button
          onClick={toggleTimer}
          className={`${styles.btnControl} ${styles.btnPrimary}`}
          disabled={tempsEcoule >= duree}
        >
          {enCours ? '⏸️ Pause' : '▶️ Démarrer'}
        </button>

        <button
          onClick={resetTimer}
          className={`${styles.btnControl} ${styles.btnSecondary}`}
        >
          🔄 Réinitialiser
        </button>
      </div>

      {/* Message de complétion */}
      {tempsEcoule >= duree && duree > 0 && (
        <div className={styles.completionMessage}>
          ✨ Méditation terminée ! Bien joué 🙏
        </div>
      )}
    </div>
  );
}
