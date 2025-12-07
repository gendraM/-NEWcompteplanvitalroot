import { useState } from 'react';
import { useMeditations } from '../lib/useJournalSpirituel';
import TimerMeditation from './TimerMeditation';
import styles from '../styles/OngletMeditation.module.css';

export default function OngletMeditation({ jourJeune }) {
  const { meditations: historique, chargement, modeSupabase, ajouter, supprimer } = useMeditations();
  const [dureeSelectionnee, setDureeSelectionnee] = useState(5);
  const [typeMeditation, setTypeMeditation] = useState('priere');
  const [meditationEnCours, setMeditationEnCours] = useState(false);
  const [notes, setNotes] = useState('');
  const [ressenti, setRessenti] = useState('');
  const [afficherHistorique, setAfficherHistorique] = useState(false);
  const [modePersonnalise, setModePersonnalise] = useState(false);
  const [minutesPersonnalisees, setMinutesPersonnalisees] = useState('');

  // Options de durée (en secondes)
  const dureesDisponibles = [
    { label: '5 min', valeur: 300 },
    { label: '10 min', valeur: 600 },
    { label: '15 min', valeur: 900 },
    { label: '20 min', valeur: 1200 },
    { label: '30 min', valeur: 1800 },
    { label: '⚙️ Personnalisé', valeur: 'custom' }
  ];

  // Gérer sélection durée
  const handleSelectionDuree = (valeur) => {
    if (valeur === 'custom') {
      setModePersonnalise(true);
      setMinutesPersonnalisees('');
    } else {
      setModePersonnalise(false);
      setDureeSelectionnee(valeur);
    }
  };

  // Valider durée personnalisée
  const validerDureePersonnalisee = () => {
    const minutes = parseInt(minutesPersonnalisees);
    if (isNaN(minutes) || minutes <= 0 || minutes > 180) {
      alert('⚠️ Veuillez entrer une durée entre 1 et 180 minutes');
      return;
    }
    setDureeSelectionnee(minutes * 60);
    setModePersonnalise(false);
  };

  // Types de méditation
  const typesMeditation = [
    { id: 'priere', label: '🙏 Prière', emoji: '🙏' },
    { id: 'silence', label: '🤫 Silence', emoji: '🤫' },
    { id: 'lecture', label: '📖 Lecture', emoji: '📖' },
    { id: 'contemplation', label: '🌅 Contemplation', emoji: '🌅' }
  ];

  // Ressentis disponibles
  const ressentisDisponibles = [
    { id: 'paix', label: '☮️ Paix', emoji: '☮️' },
    { id: 'gratitude', label: '🙏 Gratitude', emoji: '🙏' },
    { id: 'force', label: '💪 Force', emoji: '💪' },
    { id: 'emotion', label: '😢 Émotion', emoji: '😢' },
    { id: 'question', label: '🤔 Question', emoji: '🤔' }
  ];

  // Démarrer méditation
  const demarrerMeditation = () => {
    if (modePersonnalise) {
      alert('⚠️ Veuillez valider votre durée personnalisée avant de commencer');
      return;
    }
    setMeditationEnCours(true);
    setNotes('');
    setRessenti('');
  };

  // Méditation terminée
  const handleMeditationComplete = () => {
    setMeditationEnCours(false);
  };

  // Sauvegarder méditation (localStorage temporaire)
  const sauvegarderMeditation = async () => {
    if (!notes.trim() && !ressenti) {
      alert('Veuillez ajouter au moins une note ou un ressenti');
      return;
    }

    const meditation = {
      jourJeune: jourJeune,
      duree: dureeSelectionnee,
      type: typeMeditation,
      notes: notes,
      ressenti: ressenti
    };

    try {
      await ajouter(meditation);
      // Réinitialiser formulaire
      setNotes('');
      setRessenti('');
      alert(`✅ Méditation sauvegardée ${modeSupabase ? '(Supabase)' : '(Local)'}`);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const supprimerMeditationLocal = async (id) => {
    if (!confirm('Supprimer cette méditation ?')) return;
    
    try {
      await supprimer(id);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  // Formater date
  const formaterDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formater durée
  const formaterDuree = (secondes) => {
    const minutes = Math.floor(secondes / 60);
    return `${minutes} min`;
  };

  return (
    <div className={styles.ongletContainer}>
      <h2 className={styles.title}>
        🧘 Méditation & Prière
        {modeSupabase ? <span style={{color: '#10b981', fontSize: '0.75em', marginLeft: '8px'}}>☁️ Sync</span> : <span style={{color: '#f59e0b', fontSize: '0.75em', marginLeft: '8px'}}>💾 Local</span>}
      </h2>
      
      {!meditationEnCours ? (
        <>
          {/* Configuration méditation */}
          <div className={styles.configSection}>
            <div className={styles.configGroup}>
              <label className={styles.label}>⏱️ Durée</label>
              <div className={styles.dureesGrid}>
                {dureesDisponibles.map(d => (
                  <button
                    key={d.valeur}
                    onClick={() => handleSelectionDuree(d.valeur)}
                    className={`${styles.dureeBtn} ${
                      (d.valeur === 'custom' && modePersonnalise) || 
                      (d.valeur !== 'custom' && dureeSelectionnee === d.valeur && !modePersonnalise) 
                        ? styles.dureeActive 
                        : ''
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Input durée personnalisée */}
              {modePersonnalise && (
                <div className={styles.dureePersonnalisee}>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={minutesPersonnalisees}
                    onChange={(e) => setMinutesPersonnalisees(e.target.value)}
                    placeholder="Ex: 45"
                    className={styles.inputMinutes}
                    autoFocus
                  />
                  <span className={styles.uniteMinutes}>minutes</span>
                  <button
                    onClick={validerDureePersonnalisee}
                    className={styles.btnValiderDuree}
                    disabled={!minutesPersonnalisees}
                  >
                    ✓ Valider
                  </button>
                </div>
              )}

              {/* Affichage durée sélectionnée si personnalisée */}
              {!modePersonnalise && dureeSelectionnee > 1800 && (
                <div className={styles.dureeInfo}>
                  ✓ Durée sélectionnée : <strong>{Math.floor(dureeSelectionnee / 60)} minutes</strong>
                </div>
              )}
            </div>

            <div className={styles.configGroup}>
              <label className={styles.label}>🎯 Type de méditation</label>
              <div className={styles.typesGrid}>
                {typesMeditation.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setTypeMeditation(type.id)}
                    className={`${styles.typeBtn} ${typeMeditation === type.id ? styles.typeActive : ''}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={demarrerMeditation}
              className={styles.btnDemarrer}
            >
              ▶️ Commencer la méditation
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Timer actif */}
          <div className={styles.timerSection}>
            <div className={styles.meditationInfo}>
              <span className={styles.infoType}>
                {typesMeditation.find(t => t.id === typeMeditation)?.label}
              </span>
              <span className={styles.infoDuree}>
                {formaterDuree(dureeSelectionnee)}
              </span>
            </div>

            <TimerMeditation
              duree={dureeSelectionnee}
              onComplete={handleMeditationComplete}
            />

            {/* Formulaire post-méditation */}
            <div className={styles.postMeditationForm}>
              <h3 className={styles.subTitle}>📝 Après la méditation</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>💭 Notes / Réflexions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Qu'as-tu ressenti ? Quelles pensées sont venues ? ..."
                  className={styles.textarea}
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>😊 Ressenti principal</label>
                <div className={styles.ressentisGrid}>
                  {ressentisDisponibles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRessenti(r.id)}
                      className={`${styles.ressentiBtn} ${ressenti === r.id ? styles.ressentiActive : ''}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={sauvegarderMeditation}
                className={styles.btnSauvegarder}
              >
                💾 Sauvegarder cette méditation
              </button>
            </div>
          </div>
        </>
      )}

      {/* Historique */}
      <div className={styles.historiqueSection}>
        <button
          onClick={() => setAfficherHistorique(!afficherHistorique)}
          className={styles.btnToggleHistorique}
        >
          📊 Historique ({historique.length} méditation{historique.length > 1 ? 's' : ''})
          <span className={styles.toggleIcon}>
            {afficherHistorique ? '▼' : '▶'}
          </span>
        </button>

        {afficherHistorique && (
          <div className={styles.historiqueList}>
            {historique.length === 0 ? (
              <p className={styles.emptyMessage}>Aucune méditation enregistrée pour l'instant</p>
            ) : (
              historique.map(meditation => (
                <div key={meditation.id} className={styles.meditationCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardType}>
                        {typesMeditation.find(t => t.id === meditation.type_meditation)?.label || meditation.type_meditation}
                      </span>
                      <span className={styles.cardDate}>{formaterDate(meditation.date)}</span>
                    </div>
                    <button
                      onClick={() => supprimerMeditationLocal(meditation.id)}
                      className={styles.btnDelete}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta}>
                      <span>⏱️ {formaterDuree(meditation.duree)}</span>
                      <span>📅 J{meditation.jour_jeune}</span>
                      {meditation.ressenti && (
                        <span>{ressentisDisponibles.find(r => r.id === meditation.ressenti)?.label || meditation.ressenti}</span>
                      )}
                    </div>
                    
                    {meditation.notes && (
                      <p className={styles.cardNotes}>{meditation.notes}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {chargement && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{color: 'white', fontSize: '1.5em'}}>⏳ Synchronisation...</div>
        </div>
      )}
    </div>
  );
}
