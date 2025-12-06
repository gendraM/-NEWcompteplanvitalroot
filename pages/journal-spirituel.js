import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/JournalSpirituel.module.css';

export default function JournalSpirituel() {
  // ==========================================
  // 1. HOOKS (tous en haut du composant)
  // ==========================================
  const router = useRouter();
  const [ongletActif, setOngletActif] = useState('meditation');
  const [jourJeune, setJourJeune] = useState(null);

  // useEffect pour récupérer le jour du jeûne depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dateJeuneStr = localStorage.getItem('dateJeune');
      if (dateJeuneStr) {
        try {
          const dateJeune = new Date(dateJeuneStr);
          const aujourdhui = new Date();
          aujourdhui.setHours(0, 0, 0, 0);
          dateJeune.setHours(0, 0, 0, 0);
          
          const diffTime = aujourdhui - dateJeune;
          const diffJours = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // Si le jeûne a commencé (différence >= 0)
          if (diffJours >= 0) {
            setJourJeune(diffJours + 1); // J1, J2, J3...
          }
        } catch (error) {
          console.error('Erreur calcul jour jeûne:', error);
        }
      }
    }
  }, []);

  // ==========================================
  // 2. HANDLERS (fonctions événements)
  // ==========================================
  const handleRetour = () => {
    router.push('/jeune');
  };

  const handleChangeOnglet = (onglet) => {
    setOngletActif(onglet);
  };

  // ==========================================
  // 3. RENDU JSX
  // ==========================================
  return (
    <div className={styles.container}>
      {/* Header avec bouton retour */}
      <header className={styles.header}>
        <button 
          onClick={handleRetour} 
          className={styles.btnRetour}
          aria-label="Retour à la page jeûne"
        >
          🔙 Retour au jeûne
        </button>
        <div className={styles.titre}>
          <h1>🎙️ Ma restauration spirituelle</h1>
          {jourJeune && (
            <span className={styles.jourBadge}>
              Jour {jourJeune}
            </span>
          )}
        </div>
      </header>

      {/* Message d'introduction */}
      <div className={styles.intro}>
        <p>💭 Espace sacré pour te parler à toi-même</p>
        <p className={styles.sousTitre}>
          Ce que tu écris ou enregistres ici reste privé et t'appartient totalement.
        </p>
      </div>

      {/* Navigation onglets */}
      <nav className={styles.onglets} role="tablist" aria-label="Navigation journal spirituel">
        <button
          role="tab"
          aria-selected={ongletActif === 'meditation'}
          aria-controls="panel-meditation"
          onClick={() => handleChangeOnglet('meditation')}
          className={`${styles.onglet} ${ongletActif === 'meditation' ? styles.actif : ''}`}
        >
          📿 Méditation
        </button>
        <button
          role="tab"
          aria-selected={ongletActif === 'versets'}
          aria-controls="panel-versets"
          onClick={() => handleChangeOnglet('versets')}
          className={`${styles.onglet} ${ongletActif === 'versets' ? styles.actif : ''}`}
        >
          📖 Versets
        </button>
        <button
          role="tab"
          aria-selected={ongletActif === 'questions'}
          aria-controls="panel-questions"
          onClick={() => handleChangeOnglet('questions')}
          className={`${styles.onglet} ${ongletActif === 'questions' ? styles.actif : ''}`}
        >
          💭 Questions
        </button>
        <button
          role="tab"
          aria-selected={ongletActif === 'intentions'}
          aria-controls="panel-intentions"
          onClick={() => handleChangeOnglet('intentions')}
          className={`${styles.onglet} ${ongletActif === 'intentions' ? styles.actif : ''}`}
        >
          🎯 Intentions
        </button>
        <button
          role="tab"
          aria-selected={ongletActif === 'audios'}
          aria-controls="panel-audios"
          onClick={() => handleChangeOnglet('audios')}
          className={`${styles.onglet} ${ongletActif === 'audios' ? styles.actif : ''}`}
        >
          🎤 Audios
        </button>
        <button
          role="tab"
          aria-selected={ongletActif === 'ecriture'}
          aria-controls="panel-ecriture"
          onClick={() => handleChangeOnglet('ecriture')}
          className={`${styles.onglet} ${ongletActif === 'ecriture' ? styles.actif : ''}`}
        >
          ✍️ Écriture
        </button>
      </nav>

      {/* Contenu des onglets */}
      <main className={styles.contenu}>
        {ongletActif === 'meditation' && (
          <div 
            role="tabpanel" 
            id="panel-meditation" 
            aria-labelledby="tab-meditation"
            className={styles.panel}
          >
            <h2>📿 Méditation</h2>
            <p className={styles.placeholder}>
              Composant OngletMeditation à créer (Phase 2)
            </p>
          </div>
        )}

        {ongletActif === 'versets' && (
          <div 
            role="tabpanel" 
            id="panel-versets" 
            aria-labelledby="tab-versets"
            className={styles.panel}
          >
            <h2>📖 Versets & Citations</h2>
            <p className={styles.placeholder}>
              Composant OngletVersets à créer (Phase 3)
            </p>
          </div>
        )}

        {ongletActif === 'questions' && (
          <div 
            role="tabpanel" 
            id="panel-questions" 
            aria-labelledby="tab-questions"
            className={styles.panel}
          >
            <h2>💭 Questions Profondes</h2>
            <p className={styles.placeholder}>
              Composant OngletQuestions à créer (Phase 4)
            </p>
          </div>
        )}

        {ongletActif === 'intentions' && (
          <div 
            role="tabpanel" 
            id="panel-intentions" 
            aria-labelledby="tab-intentions"
            className={styles.panel}
          >
            <h2>🎯 Intentions Spirituelles</h2>
            <p className={styles.placeholder}>
              Composant OngletIntentions à créer (Phase 5)
            </p>
          </div>
        )}

        {ongletActif === 'audios' && (
          <div 
            role="tabpanel" 
            id="panel-audios" 
            aria-labelledby="tab-audios"
            className={styles.panel}
          >
            <h2>🎤 Audios</h2>
            <p className={styles.placeholder}>
              Composant OngletAudios à créer (Phase 6)
            </p>
          </div>
        )}

        {ongletActif === 'ecriture' && (
          <div 
            role="tabpanel" 
            id="panel-ecriture" 
            aria-labelledby="tab-ecriture"
            className={styles.panel}
          >
            <h2>✍️ Écriture Libre</h2>
            <p className={styles.placeholder}>
              Composant OngletEcriture à créer (Phase 7)
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
