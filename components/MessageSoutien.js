import { useState } from 'react';
import styles from '../styles/AjoutsJeune.module.css';

export default function MessageSoutien({ 
  messageDefaut = "", 
  messagePerso = "", 
  onSave,
  jourEnCours 
}) {
  const [texte, setTexte] = useState(messagePerso);
  const [afficherInput, setAfficherInput] = useState(false);
  const [sauvegarde, setSauvegarde] = useState(false);

  const handleSave = () => {
    onSave(texte);
    setSauvegarde(true);
    setTimeout(() => setSauvegarde(false), 2000);
  };

  const messageAffiche = texte.trim() || messageDefaut;

  return (
    <div className={styles.messageSoutien}>
      <h3 className={styles.titreSection}>💬 Message de soutien du jour</h3>
      
      <div className={styles.messageDefaut}>
        <p className={styles.messageTexte}>
          {messageAffiche}
        </p>
      </div>

      {!afficherInput ? (
        <button 
          className={styles.btnPersonnaliser}
          onClick={() => setAfficherInput(true)}
        >
          ✏️ Personnaliser ce message
        </button>
      ) : (
        <div className={styles.zonePersonnalisation}>
          <label className={styles.labelPerso}>
            Ajoute ton propre message de soutien :
          </label>
          <textarea
            className={styles.textareaPerso}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Ex: Aujourd'hui, je choisis de me faire confiance..."
            rows={3}
          />
          <div className={styles.actionsPerso}>
            <button 
              className={styles.btnSauvegarder}
              onClick={handleSave}
            >
              {sauvegarde ? '✅ Sauvegardé !' : '💾 Sauvegarder'}
            </button>
            <button 
              className={styles.btnAnnuler}
              onClick={() => {
                setTexte(messagePerso);
                setAfficherInput(false);
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className={styles.infoMessage}>
        <small>
          💡 Personnalise ce message pour te rappeler pourquoi tu fais ce jeûne. 
          Il sera sauvegardé et visible à chaque fois que tu reviendras sur ce jour.
        </small>
      </div>
    </div>
  );
}
