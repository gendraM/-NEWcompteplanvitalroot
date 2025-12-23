import { useState } from 'react';
import { useIntentions } from '../lib/useJournalSpirituel';
import styles from '../styles/OngletIntentions.module.css';

export default function OngletIntentions({ jourJeune }) {
  // Hook Supabase avec fallback localStorage
  const { intentions, loading, mode, ajouter, modifier, supprimer } = useIntentions();
  
  // États locaux pour le formulaire
  const [nouvelleIntention, setNouvelleIntention] = useState('');
  const [afficherCompletes, setAfficherCompletes] = useState(false);
  const [modeAjout, setModeAjout] = useState(false);

  // Afficher loading pendant chargement
  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement des intentions...</div>;
  }

  // Ajouter intention
  const ajouterIntention = async () => {
    if (!nouvelleIntention.trim()) {
      alert('Veuillez saisir une intention');
      return;
    }

    const intention = {
      texte: nouvelleIntention,
      jourJeuneCreation: jourJeune,
      completee: false,
      progression: 0
    };

    await ajouter(intention);

    setNouvelleIntention('');
    setModeAjout(false);
    alert('✅ Intention ajoutée !');
  };

  // Marquer comme complétée
  const marquerCompletee = async (id) => {
    const intention = intentions.find(i => i.id === id);
    if (intention) {
      await modifier(id, {
        ...intention,
        completee: true,
        progression: 100
      });
      alert('🎉 Intention accomplie !');
    }
  };

  // Réactiver intention
  const reactiverIntention = async (id) => {
    const intention = intentions.find(i => i.id === id);
    if (intention) {
      await modifier(id, {
        ...intention,
        completee: false
      });
    }
  };

  // Supprimer intention
  const supprimerIntention = async (id) => {
    if (!confirm('Supprimer cette intention ?')) return;

    await supprimer(id);
  };

  // Modifier progression
  const modifierProgression = async (id, nouvelleProgression) => {
    const intention = intentions.find(i => i.id === id);
    if (intention) {
      await modifier(id, {
        ...intention,
        progression: nouvelleProgression
      });
    }
  };

  // Filtrer intentions
  const intentionsActives = intentions.filter(i => !i.completee);
  const intentionsCompletes = intentions.filter(i => i.completee);

  return (
    <div className={styles.ongletContainer}>
      <h2 className={styles.title}>
        🎯 Mes Intentions {mode === 'supabase' ? '☁️' : '💾'}
      </h2>

      <div className={styles.infoSection}>
        <p className={styles.infoText}>
          💡 Définis tes intentions spirituelles pour ce jeûne. Suis ta progression et célèbre chaque accomplissement !
        </p>
      </div>

      {/* Bouton ajouter intention */}
      {!modeAjout && (
        <button
          onClick={() => setModeAjout(true)}
          className={styles.btnAjoutPrincipal}
        >
          ✨ Ajouter une nouvelle intention
        </button>
      )}

      {/* Formulaire ajout */}
      {modeAjout && (
        <div className={styles.formulaireAjout}>
          <h3 className={styles.formTitre}>✨ Nouvelle intention</h3>
          <textarea
            value={nouvelleIntention}
            onChange={(e) => setNouvelleIntention(e.target.value)}
            placeholder="Ex: Développer ma gratitude quotidienne, Pardonner une personne, Approfondir ma connexion spirituelle..."
            className={styles.textarea}
            rows={4}
            autoFocus
          />
          <div className={styles.formActions}>
            <button onClick={ajouterIntention} className={styles.btnSauvegarder}>
              💾 Créer cette intention
            </button>
            <button
              onClick={() => {
                setModeAjout(false);
                setNouvelleIntention('');
              }}
              className={styles.btnAnnuler}
            >
              ✕ Annuler
            </button>
          </div>
        </div>
      )}

      {/* Intentions actives */}
      <div className={styles.intentionsSection}>
        <h3 className={styles.sectionTitle}>
          🔥 Intentions en cours ({intentionsActives.length})
        </h3>

        {intentionsActives.length === 0 ? (
          <p className={styles.emptyMessage}>
            Aucune intention en cours. Commence par en créer une ! 🎯
          </p>
        ) : (
          <div className={styles.intentionsList}>
            {intentionsActives.map(intention => (
              <div key={intention.id} className={styles.intentionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <span className={styles.cardJour}>J{intention.jourJeuneCreation}</span>
                    <span className={styles.cardDate}>
                      📅 {intention.dateCreationFormatee}
                    </span>
                  </div>
                  <button
                    onClick={() => supprimerIntention(intention.id)}
                    className={styles.btnDeleteMini}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>

                <p className={styles.intentionTexte}>{intention.texte}</p>

                {/* Barre de progression */}
                <div className={styles.progressionSection}>
                  <div className={styles.progressionHeader}>
                    <span className={styles.progressionLabel}>Progression</span>
                    <span className={styles.progressionPourcentage}>
                      {intention.progression}%
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${intention.progression}%` }}
                    />
                  </div>
                  <div className={styles.progressionControls}>
                    <button
                      onClick={() => modifierProgression(intention.id, Math.max(0, intention.progression - 10))}
                      className={styles.btnProgression}
                      disabled={intention.progression === 0}
                    >
                      −10%
                    </button>
                    <button
                      onClick={() => modifierProgression(intention.id, Math.min(90, intention.progression + 10))}
                      className={styles.btnProgression}
                      disabled={intention.progression >= 90}
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => marquerCompletee(intention.id)}
                      className={styles.btnCompletee}
                    >
                      ✓ Marquer comme accomplie
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Intentions complétées */}
      {intentionsCompletes.length > 0 && (
        <div className={styles.intentionsSection}>
          <button
            onClick={() => setAfficherCompletes(!afficherCompletes)}
            className={styles.btnToggleCompletes}
          >
            ✅ Intentions accomplies ({intentionsCompletes.length})
            <span className={styles.toggleIcon}>
              {afficherCompletes ? '▼' : '▶'}
            </span>
          </button>

          {afficherCompletes && (
            <div className={styles.intentionsList}>
              {intentionsCompletes.map(intention => (
                <div key={intention.id} className={styles.intentionCardComplete}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <span className={styles.cardJour}>J{intention.jourJeuneCreation}</span>
                      <span className={styles.cardDate}>
                        📅 {intention.dateCreationFormatee}
                      </span>
                    </div>
                    <div className={styles.cardHeaderActions}>
                      <span className={styles.badgeComplete}>
                        ✓ Accomplie le {intention.dateCompletionFormatee}
                      </span>
                      <button
                        onClick={() => reactiverIntention(intention.id)}
                        className={styles.btnReactiver}
                        title="Réactiver"
                      >
                        ↻
                      </button>
                      <button
                        onClick={() => supprimerIntention(intention.id)}
                        className={styles.btnDeleteMini}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p className={styles.intentionTexte}>{intention.texte}</p>

                  <div className={styles.completionBadge}>
                    🎉 Intention accomplie !
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statistiques */}
      {intentions.length > 0 && (
        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>📊 Statistiques</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValeur}>{intentions.length}</div>
              <div className={styles.statLabel}>Total intentions</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValeur}>{intentionsActives.length}</div>
              <div className={styles.statLabel}>En cours</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValeur}>{intentionsCompletes.length}</div>
              <div className={styles.statLabel}>Accomplies</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValeur}>
                {intentions.length > 0
                  ? Math.round((intentionsCompletes.length / intentions.length) * 100)
                  : 0}%
              </div>
              <div className={styles.statLabel}>Taux de réussite</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
