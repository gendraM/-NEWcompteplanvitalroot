import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/JournalSpirituel.module.css';
import OngletMeditation from '../components/OngletMeditation';
import OngletVersets from '../components/OngletVersets';
import OngletQuestions from '../components/OngletQuestions';
import OngletIntentions from '../components/OngletIntentions';
import OngletAudios from '../components/OngletAudios';
import OngletEcriture from '../components/OngletEcriture';

export default function JournalSpirituel() {
  // ==========================================
  // 1. HOOKS (tous en haut du composant)
  // ==========================================
  const router = useRouter();
  const [ongletActif, setOngletActif] = useState('meditation');
  const [jourJeune, setJourJeune] = useState(null);
  const [modeArchive, setModeArchive] = useState(false);
  const [idJeuneArchive, setIdJeuneArchive] = useState(null);

  // useEffect pour récupérer le jour du jeûne depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier si on consulte un jeûne archivé
      const jeuneConsulte = localStorage.getItem('jeuneConsulte');
      if (jeuneConsulte) {
        try {
          const jeune = JSON.parse(jeuneConsulte);
          setModeArchive(true);
          setIdJeuneArchive(jeune.id);
          // Calculer jour à partir du jeûne archivé
          const jourActuel = parseInt(localStorage.getItem('jourEnCours')) || 1;
          setJourJeune(jourActuel);
          console.log('📿 Mode archive restauration spirituelle:', jeune.id);
          return;
        } catch (error) {
          console.error('Erreur parsing jeûne consulté:', error);
        }
      }

      // Mode normal : jeûne actif
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
      {/* 🆕 BANDEAU MODE ARCHIVE */}
      {modeArchive && (
        <div style={{
          background: '#e3f2fd',
          border: '2px solid #64b5f6',
          borderRadius: 8,
          padding: '12px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>📚</span>
            <div>
              <div style={{ fontWeight: 600, color: '#1565c0' }}>
                Mode archive - Jeûne terminé
              </div>
              <div style={{ fontSize: 13, color: '#1976d2' }}>
                Vous consultez les données spirituelles d'un jeûne archivé (lecture seule)
              </div>
            </div>
          </div>
        </div>
      )}

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
            <OngletMeditation jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} />
          </div>
        )}

        {ongletActif === 'versets' && (
          <div 
            role="tabpanel" 
            id="panel-versets" 
            aria-labelledby="tab-versets"
            className={styles.panel}
          >
            <OngletVersets jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} />
          </div>
        )}

        {ongletActif === 'questions' && (
          <div 
            role="tabpanel" 
            id="panel-questions" 
            aria-labelledby="tab-questions"
            className={styles.panel}
          >
            <OngletQuestions jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} />
          </div>
        )}

        {ongletActif === 'intentions' && (
          <div 
            role="tabpanel" 
            id="panel-intentions" 
            aria-labelledby="tab-intentions"
            className={styles.panel}
          >
            <OngletIntentions jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} />
          </div>
        )}

        {ongletActif === 'audios' && (
          <div 
            role="tabpanel" 
            id="panel-audios" 
            aria-labelledby="tab-audios"
            className={styles.panel}
          >
            <OngletAudios jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} />
          </div>
        )}

        {ongletActif === 'ecriture' && (
          <div 
            role="tabpanel" 
            id="panel-ecriture" 
            aria-labelledby="tab-ecriture"
            className={styles.panel}
          >
            <OngletEcriture jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} />
          </div>
        )}
      </main>
    </div>
  );
}
