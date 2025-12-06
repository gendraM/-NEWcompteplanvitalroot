import { useState, useEffect } from 'react';
import styles from '../styles/AjoutsJeune.module.css';

export default function ChecklistConseilsActivation({ 
  conseils = [], 
  etatConseils = {}, 
  onToggle,
  jourEnCours 
}) {
  // Calcul du score dynamique
  const conseilsActifs = conseils.filter(c => c.actif);
  const nbCoches = conseilsActifs.filter(c => etatConseils[c.id]).length;
  const total = conseilsActifs.length;
  const pourcentage = total > 0 ? Math.round((nbCoches / total) * 100) : 0;

  // Messages motivationnels selon le score
  const getMessageMotivation = () => {
    if (pourcentage === 100) {
      return "🔥 Parfait ! Tu maximises tous les bénéfices du jeûne.";
    } else if (pourcentage >= 75) {
      return "💪 Excellent ! Tu es sur la bonne voie pour amplifier les résultats.";
    } else if (pourcentage >= 50) {
      return "👍 Bien ! Continue, chaque conseil activé compte.";
    } else if (pourcentage >= 25) {
      return "🌱 Bon début ! Ces petits gestes font toute la différence.";
    } else if (nbCoches > 0) {
      return "✨ Bravo pour ce premier pas ! Chaque conseil activé booste ton jeûne.";
    } else {
      return "💡 Active au moins un conseil pour booster les bénéfices de ton jeûne.";
    }
  };

  return (
    <div className={styles.conseilsActivation}>
      <h3 className={styles.titreSection}>💪 Conseils d'activation (booste les bénéfices)</h3>
      
      <div className={styles.scoreBar}>
        <div className={styles.scoreTexte}>
          Score du jour : <strong>{nbCoches} / {total}</strong>
        </div>
        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${pourcentage}%` }}
          />
        </div>
        <div className={styles.pourcentage}>{pourcentage}%</div>
      </div>

      <div className={styles.messageMotivation}>
        {getMessageMotivation()}
      </div>

      <div className={styles.listeConseils}>
        {conseils.map((conseil) => {
          if (!conseil.actif) return null;
          
          const estCoche = etatConseils[conseil.id] || false;
          
          return (
            <label 
              key={conseil.id} 
              className={`${styles.conseilItem} ${estCoche ? styles.coche : ''}`}
            >
              <input
                type="checkbox"
                checked={estCoche}
                onChange={() => onToggle(conseil.id)}
                className={styles.checkbox}
              />
              <div className={styles.conseilContenu}>
                <span className={styles.conseilTexte}>{conseil.conseil}</span>
                <span className={styles.benefice}>{conseil.benefice}</span>
              </div>
            </label>
          );
        })}
      </div>

      <div className={styles.infoConseils}>
        <small>
          💡 Ces conseils augmentent l'efficacité du jeûne sur le déstockage, 
          l'inflammation et la clarté mentale. Coche ceux que tu mets en place aujourd'hui.
        </small>
      </div>
    </div>
  );
}
