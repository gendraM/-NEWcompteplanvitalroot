import styles from '../styles/AjoutsJeune.module.css';

export default function AnalyseComportementale({ data }) {
  if (!data) return null;

  const { repasRecents = [], extras, dominant, message } = data;

  return (
    <div className={styles.analyseComportementale}>
      <h3 className={styles.titreSection}>📊 Analyse comportementale</h3>
      
      <div className={styles.analyseCarte}>
        <div className={styles.repasRecents}>
          <h4 className={styles.sousTitre}>Tes 3 derniers repas avant le jeûne :</h4>
          <ul className={styles.listeRepas}>
            {repasRecents.length > 0 ? (
              repasRecents.map((repas, index) => (
                <li key={index} className={styles.repasItem}>
                  <span className={styles.repasNom}>{repas.aliment}</span>
                  <span className={styles.repasCategorie}>({repas.categorie})</span>
                  {repas.est_extra && <span className={styles.badgeExtra}>Extra</span>}
                </li>
              ))
            ) : (
              <li className={styles.repasVide}>Aucune donnée disponible</li>
            )}
          </ul>
        </div>

        {extras !== undefined && (
          <div className={styles.statsExtras}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Extras détectés :</span>
              <span className={`${styles.statValeur} ${extras > 1 ? styles.attention : ''}`}>
                {extras} / 3
              </span>
            </div>
            {dominant && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Catégorie dominante :</span>
                <span className={styles.statValeur}>{dominant}</span>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className={styles.messageAnalyse}>
            <p>{message}</p>
          </div>
        )}
      </div>

      <div className={styles.infoAnalyse}>
        <small>
          💡 Cette analyse montre tes habitudes alimentaires avant le jeûne. 
          Le jeûne est une vraie rupture avec ces schémas. Tu coupes une boucle automatique.
        </small>
      </div>
    </div>
  );
}
