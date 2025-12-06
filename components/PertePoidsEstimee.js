import styles from '../styles/AjoutsJeune.module.css';

export default function PertePoidsEstimee({ data }) {
  if (!data || !data.poids || !data.duree) return null;

  const { poids, duree, min, max, moyenne } = data;

  // Décomposition estimée
  const decomposition = {
    eau: Math.round(moyenne * 0.5 * 10) / 10,
    glycogene: Math.round(moyenne * 0.3 * 10) / 10,
    graisses: Math.round(moyenne * 0.2 * 10) / 10
  };

  return (
    <div className={styles.pertePoidsEstimee}>
      <h3 className={styles.titreSection}>⚖️ Perte de poids estimée</h3>
      
      <div className={styles.perteCarte}>
        <div className={styles.parametres}>
          <div className={styles.paramItem}>
            <span className={styles.paramLabel}>Poids de départ :</span>
            <span className={styles.paramValeur}>{poids} kg</span>
          </div>
          <div className={styles.paramItem}>
            <span className={styles.paramLabel}>Durée du jeûne :</span>
            <span className={styles.paramValeur}>{duree} jours</span>
          </div>
        </div>

        <div className={styles.fourchette}>
          <div className={styles.fourchetteValeurs}>
            <div className={styles.valeurMin}>
              <span className={styles.label}>Min</span>
              <span className={styles.valeur}>{min} kg</span>
            </div>
            <div className={styles.valeurMoyenne}>
              <span className={styles.label}>Estimation</span>
              <span className={styles.valeurPrincipale}>{moyenne} kg</span>
            </div>
            <div className={styles.valeurMax}>
              <span className={styles.label}>Max</span>
              <span className={styles.valeur}>{max} kg</span>
            </div>
          </div>
        </div>

        <div className={styles.decomposition}>
          <h4 className={styles.sousTitre}>Décomposition estimée :</h4>
          <div className={styles.decompositionListe}>
            <div className={styles.decompoItem}>
              <span className={styles.decompoLabel}>💧 Eau (rétention)</span>
              <span className={styles.decompoValeur}>{decomposition.eau} kg</span>
              <span className={styles.decompoPct}>~50%</span>
            </div>
            <div className={styles.decompoItem}>
              <span className={styles.decompoLabel}>🍞 Glycogène</span>
              <span className={styles.decompoValeur}>{decomposition.glycogene} kg</span>
              <span className={styles.decompoPct}>~30%</span>
            </div>
            <div className={styles.decompoItem}>
              <span className={styles.decompoLabel}>🔥 Graisses actives</span>
              <span className={styles.decompoValeur}>{decomposition.graisses} kg</span>
              <span className={styles.decompoPct}>~20%</span>
            </div>
          </div>
        </div>

        <div className={styles.disclaimer}>
          <p>
            ⚠️ <strong>Important :</strong> Cette estimation est une fourchette théorique. 
            Le jeûne n'est pas qu'une question de poids : c'est un reset profond du corps et de l'esprit. 
            La vraie transformation est invisible sur la balance (autophagie, inflammation, clarté mentale).
          </p>
        </div>
      </div>

      <div className={styles.infoPerteDetails}>
        <small>
          💡 La perte de poids pendant le jeûne est majoritairement de l'eau et du glycogène. 
          La vraie perte de graisse se fait sur le long terme avec une reprise alimentaire alignée.
        </small>
      </div>
    </div>
  );
}
