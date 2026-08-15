import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
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
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || null;
  const [ongletActif, setOngletActif] = useState('meditation');
  const [jourJeune, setJourJeune] = useState(null);
  const [modeArchive, setModeArchive] = useState(false);
  const [idJeuneArchive, setIdJeuneArchive] = useState(null);
  const [periodeArchive, setPeriodeArchive] = useState(null);

  // useEffect pour récupérer le jour du jeûne depuis localStorage
  useEffect(() => {
    if (authLoading || typeof window === 'undefined') {
      return;
    }

    const getKey = (key) => (userId ? `${key}_${userId}` : key);

    // Vérifier si on consulte un jeûne archivé
    const jeuneConsulte = localStorage.getItem(getKey('jeuneConsulte'));
    if (jeuneConsulte) {
      try {
        const jeune = JSON.parse(jeuneConsulte);
        setModeArchive(true);
        setIdJeuneArchive(jeune.id);
        setPeriodeArchive({
          dateDebut: jeune.dateDebut || jeune.date_debut,
          dateFin: jeune.dateFin || jeune.date_fin
        });
        // Calculer jour à partir du jeûne archivé
        const jourActuel = parseInt(localStorage.getItem(getKey('jourEnCours'))) || 1;
        setJourJeune(jourActuel);
        console.log('📿 Mode archive restauration spirituelle:', jeune.id);
        return;
      } catch (error) {
        console.error('Erreur parsing jeûne consulté:', error);
      }
    }

    // Mode normal : jeûne actif
    const dateJeuneStr = localStorage.getItem(getKey('dateDebutJeune')) || localStorage.getItem('dateJeune');
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
  }, [authLoading, userId]);

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
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '3px solid #1976d2',
          borderRadius: 12,
          padding: '16px 24px',
          marginBottom: 20,
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              fontSize: 48, 
              background: '#fff',
              borderRadius: '50%',
              width: 70,
              height: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              📚
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: 700, 
                color: '#0d47a1', 
                fontSize: 18,
                marginBottom: 6
              }}>
                🔒 Mode Consultation Archive
              </div>
              <div style={{ fontSize: 14, color: '#1565c0', lineHeight: 1.5 }}>
                Vous consultez les données spirituelles d'un <strong>jeûne terminé</strong>
                <br />
                {idJeuneArchive && (
                  <span style={{ fontSize: 12, opacity: 0.9 }}>
                    ID: {idJeuneArchive} • Lecture seule
                  </span>
                )}
              </div>
            </div>
            <div style={{
              background: '#1976d2',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              📖 Archive
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
          <h1>
            🎙️ Ma restauration spirituelle
            {modeArchive && (
              <span style={{
                fontSize: '0.5em',
                color: '#1976d2',
                fontWeight: 500,
                marginLeft: 12,
                verticalAlign: 'middle'
              }}>
                [Archive]
              </span>
            )}
          </h1>
          {jourJeune && !modeArchive && (
            <span className={styles.jourBadge}>
              Jour {jourJeune}
            </span>
          )}
          {modeArchive && (
            <span className={styles.jourBadge} style={{ background: '#1976d2' }}>
              📚 Lecture seule
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
            <OngletMeditation jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} periodeArchive={periodeArchive} userId={userId} />
          </div>
        )}

        {ongletActif === 'versets' && (
          <div 
            role="tabpanel" 
            id="panel-versets" 
            aria-labelledby="tab-versets"
            className={styles.panel}
          >
            <OngletVersets jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} periodeArchive={periodeArchive} userId={userId} />
          </div>
        )}

        {ongletActif === 'questions' && (
          <div 
            role="tabpanel" 
            id="panel-questions" 
            aria-labelledby="tab-questions"
            className={styles.panel}
          >
            <OngletQuestions jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} periodeArchive={periodeArchive} userId={userId} />
          </div>
        )}

        {ongletActif === 'intentions' && (
          <div 
            role="tabpanel" 
            id="panel-intentions" 
            aria-labelledby="tab-intentions"
            className={styles.panel}
          >
            <OngletIntentions jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} periodeArchive={periodeArchive} userId={userId} />
          </div>
        )}

        {ongletActif === 'audios' && (
          <div 
            role="tabpanel" 
            id="panel-audios" 
            aria-labelledby="tab-audios"
            className={styles.panel}
          >
            <OngletAudios jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} periodeArchive={periodeArchive} userId={userId} />
          </div>
        )}

        {ongletActif === 'ecriture' && (
          <div 
            role="tabpanel" 
            id="panel-ecriture" 
            aria-labelledby="tab-ecriture"
            className={styles.panel}
          >
            <OngletEcriture jourJeune={jourJeune} modeArchive={modeArchive} idJeuneArchive={idJeuneArchive} periodeArchive={periodeArchive} userId={userId} />
          </div>
        )}
      </main>
    </div>
  );
}
