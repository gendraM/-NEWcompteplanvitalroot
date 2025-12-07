import { useState, useEffect, useRef } from 'react';
import styles from '../styles/AudioRecorder.module.css';

export default function AudioRecorder({ onSave, onCancel }) {
  const [enregistrement, setEnregistrement] = useState(false);
  const [enPause, setEnPause] = useState(false);
  const [duree, setDuree] = useState(0);
  const [volumeNiveau, setVolumeNiveau] = useState(0);
  const [erreur, setErreur] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Initialiser MediaRecorder
  const demarrerEnregistrement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Analyser audio pour visualisation
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Capturer données audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Fin enregistrement
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Arrêter tous les tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Callback avec blob + durée
        if (onSave) {
          onSave({
            blob: audioBlob,
            duree: duree
          });
        }
      };

      // Démarrer
      mediaRecorder.start();
      setEnregistrement(true);
      setErreur(null);

      // Timer
      timerRef.current = setInterval(() => {
        setDuree(prev => prev + 1);
      }, 1000);

      // Visualisation volume
      visualiserVolume();

    } catch (error) {
      console.error('Erreur accès micro:', error);
      setErreur('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };

  // Visualisation niveau audio
  const visualiserVolume = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const mesurer = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setVolumeNiveau(Math.min(100, (average / 128) * 100));
      
      animationRef.current = requestAnimationFrame(mesurer);
    };

    mesurer();
  };

  // Pause/Reprendre
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (enPause) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setDuree(prev => prev + 1);
      }, 1000);
      setEnPause(false);
    } else {
      mediaRecorderRef.current.pause();
      clearInterval(timerRef.current);
      setEnPause(true);
    }
  };

  // Arrêter enregistrement
  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    clearInterval(timerRef.current);
    cancelAnimationFrame(animationRef.current);
    setEnregistrement(false);
    setEnPause(false);
  };

  // Annuler enregistrement
  const annulerEnregistrement = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Arrêter sans sauvegarder
      const stream = mediaRecorderRef.current.stream;
      mediaRecorderRef.current.stop();
      stream.getTracks().forEach(track => track.stop());
    }
    
    clearInterval(timerRef.current);
    cancelAnimationFrame(animationRef.current);
    audioChunksRef.current = [];
    
    setEnregistrement(false);
    setEnPause(false);
    setDuree(0);
    
    if (onCancel) onCancel();
  };

  // Nettoyage
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animationRef.current);
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        const stream = mediaRecorderRef.current.stream;
        mediaRecorderRef.current.stop();
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Formater durée
  const formaterDuree = (secondes) => {
    const minutes = Math.floor(secondes / 60);
    const secs = secondes % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={styles.recorderContainer}>
      {erreur && (
        <div className={styles.erreur}>
          ⚠️ {erreur}
        </div>
      )}

      {!enregistrement ? (
        <div className={styles.demarrage}>
          <div className={styles.micIcone}>🎤</div>
          <h3 className={styles.titre}>Prêt à enregistrer</h3>
          <p className={styles.info}>
            Clique sur le bouton pour commencer ton enregistrement vocal
          </p>
          <button
            onClick={demarrerEnregistrement}
            className={styles.btnDemarrer}
          >
            🎙️ Commencer l'enregistrement
          </button>
        </div>
      ) : (
        <div className={styles.enCours}>
          {/* Visualisation audio */}
          <div className={styles.visualisation}>
            <div className={styles.ondes}>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={styles.onde}
                  style={{
                    height: `${Math.random() * volumeNiveau + 10}%`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Statut */}
          <div className={styles.statut}>
            {enPause ? (
              <span className={styles.statutPause}>⏸️ En pause</span>
            ) : (
              <span className={styles.statutActif}>🔴 Enregistrement en cours...</span>
            )}
          </div>

          {/* Durée */}
          <div className={styles.dureeAffichage}>
            {formaterDuree(duree)}
          </div>

          {/* Niveau volume */}
          <div className={styles.volumeSection}>
            <span className={styles.volumeLabel}>Volume</span>
            <div className={styles.volumeBar}>
              <div
                className={styles.volumeFill}
                style={{ width: `${volumeNiveau}%` }}
              />
            </div>
          </div>

          {/* Contrôles */}
          <div className={styles.controles}>
            <button
              onClick={togglePause}
              className={styles.btnControle}
              title={enPause ? 'Reprendre' : 'Pause'}
            >
              {enPause ? '▶️' : '⏸️'}
            </button>
            
            <button
              onClick={arreterEnregistrement}
              className={`${styles.btnControle} ${styles.btnArreter}`}
              title="Terminer et sauvegarder"
            >
              ⏹️ Terminer
            </button>

            <button
              onClick={annulerEnregistrement}
              className={`${styles.btnControle} ${styles.btnAnnuler}`}
              title="Annuler"
            >
              🗑️
            </button>
          </div>

          <p className={styles.astuce}>
            💡 Durée max recommandée : 30 minutes
          </p>
        </div>
      )}
    </div>
  );
}
