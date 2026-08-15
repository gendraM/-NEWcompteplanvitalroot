import { useState, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';
import AudioPlayer from './AudioPlayer';
import {
  sauvegarderAudio,
  recupererTousLesAudios,
  supprimerAudio,
  calculerEspaceUtilise,
  exporterAudio
} from '../lib/audioStorage';
import styles from '../styles/OngletAudios.module.css';

export default function OngletAudios({ jourJeune, userId = null }) {
  const [modeEnregistrement, setModeEnregistrement] = useState(false);
  const [audioEnCours, setAudioEnCours] = useState(null);
  const [modeSauvegarde, setModeSauvegarde] = useState(false);
  
  // Formulaire sauvegarde
  const [typeAudio, setTypeAudio] = useState('libre');
  const [titre, setTitre] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');

  // Liste audios
  const [audios, setAudios] = useState([]);
  const [filtreType, setFiltreType] = useState('tous');
  const [espace, setEspace] = useState(null);
  const [chargement, setChargement] = useState(true);

  // Types d'audios
  const typesAudios = [
    { id: 'meditation', label: '🧘 Méditation', emoji: '🧘' },
    { id: 'priere', label: '🙏 Prière', emoji: '🙏' },
    { id: 'reflexion', label: '💭 Réflexion', emoji: '💭' },
    { id: 'libre', label: '🎤 Libre', emoji: '🎤' }
  ];

  // Charger audios
  useEffect(() => {
    chargerAudios();
  }, []);

  const chargerAudios = async () => {
    setChargement(true);
    const liste = await recupererTousLesAudios(userId);
    setAudios(liste.sort((a, b) => new Date(b.date) - new Date(a.date)));
    
    const stats = await calculerEspaceUtilise(userId);
    setEspace(stats);
    
    setChargement(false);
  };

  // Callback enregistrement terminé
  const handleEnregistrementTermine = (data) => {
    setAudioEnCours(data);
    setModeEnregistrement(false);
    setModeSauvegarde(true);
  };

  // Annuler enregistrement
  const handleAnnulerEnregistrement = () => {
    setModeEnregistrement(false);
    setAudioEnCours(null);
  };

  // Sauvegarder audio
  const sauvegarderEnregistrement = async () => {
    if (!audioEnCours) return;
    
    if (!titre.trim()) {
      alert('Veuillez donner un titre à votre audio');
      return;
    }

    try {
      await sauvegarderAudio({
        blob: audioEnCours.blob,
        duree: audioEnCours.duree,
        type: typeAudio,
        titre: titre,
        note: note,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        jourJeune: jourJeune
      }, userId);

      alert('✅ Audio sauvegardé !');
      
      // Reset
      setModeSauvegarde(false);
      setAudioEnCours(null);
      setTitre('');
      setNote('');
      setTags('');
      setTypeAudio('libre');
      
      // Recharger liste
      chargerAudios();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  // Annuler sauvegarde
  const annulerSauvegarde = () => {
    if (confirm('Abandonner cet enregistrement ?')) {
      setModeSauvegarde(false);
      setAudioEnCours(null);
      setTitre('');
      setNote('');
      setTags('');
    }
  };

  // Supprimer audio
  const handleSupprimerAudio = async (id) => {
    if (!confirm('Supprimer cet audio définitivement ?')) return;

    const success = await supprimerAudio(id, userId);
    if (success) {
      alert('✅ Audio supprimé');
      chargerAudios();
    }
  };

  // Exporter audio
  const handleExporterAudio = async (id) => {
    const success = await exporterAudio(id, userId);
    if (success) {
      alert('✅ Audio téléchargé !');
    } else {
      alert('❌ Erreur lors du téléchargement');
    }
  };

  // Filtrer audios
  const audiosFiltres = filtreType === 'tous'
    ? audios
    : audios.filter(a => a.type === filtreType);

  // Formater durée
  const formaterDuree = (secondes) => {
    const mins = Math.floor(secondes / 60);
    const secs = secondes % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Formater taille
  const formaterTaille = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={styles.ongletContainer}>
      <h2 className={styles.title}>🎤 Mes Audios</h2>

      {/* Mode enregistrement */}
      {modeEnregistrement ? (
        <AudioRecorder
          onSave={handleEnregistrementTermine}
          onCancel={handleAnnulerEnregistrement}
        />
      ) : modeSauvegarde ? (
        /* Mode sauvegarde */
        <div className={styles.formulaireSauvegarde}>
          <h3 className={styles.formTitre}>💾 Sauvegarder l'audio</h3>
          
          {/* Preview */}
          {audioEnCours && (
            <div className={styles.preview}>
              <AudioPlayer
                audioBlob={audioEnCours.blob}
                titre="Prévisualisation"
                duree={audioEnCours.duree}
              />
            </div>
          )}

          {/* Type */}
          <div className={styles.formGroup}>
            <label className={styles.label}>🎯 Type d'audio</label>
            <div className={styles.typesGrid}>
              {typesAudios.map(type => (
                <button
                  key={type.id}
                  onClick={() => setTypeAudio(type.id)}
                  className={`${styles.typeBtn} ${typeAudio === type.id ? styles.typeActive : ''}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Titre */}
          <div className={styles.formGroup}>
            <label className={styles.label}>📝 Titre *</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Méditation du matin, Prière de gratitude..."
              className={styles.input}
            />
          </div>

          {/* Note */}
          <div className={styles.formGroup}>
            <label className={styles.label}>💭 Note (optionnel)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajoute un commentaire sur cet enregistrement..."
              className={styles.textarea}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className={styles.formGroup}>
            <label className={styles.label}>🏷️ Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: matin, gratitude, paix"
              className={styles.input}
            />
          </div>

          {/* Actions */}
          <div className={styles.formActions}>
            <button onClick={sauvegarderEnregistrement} className={styles.btnSauvegarder}>
              💾 Sauvegarder
            </button>
            <button onClick={annulerSauvegarde} className={styles.btnAnnuler}>
              🗑️ Abandonner
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Bouton enregistrer */}
          <button
            onClick={() => setModeEnregistrement(true)}
            className={styles.btnEnregistrer}
          >
            🎙️ Nouvel enregistrement vocal
          </button>

          {/* Statistiques */}
          {espace && (
            <div className={styles.statsSection}>
              <div className={styles.statItem}>
                <span className={styles.statValeur}>{espace.nombreAudios}</span>
                <span className={styles.statLabel}>Audios</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValeur}>{espace.tailleMB} MB</span>
                <span className={styles.statLabel}>Espace utilisé</span>
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className={styles.filtresSection}>
            <button
              onClick={() => setFiltreType('tous')}
              className={`${styles.filtreBtn} ${filtreType === 'tous' ? styles.filtreActif : ''}`}
            >
              🎵 Tous ({audios.length})
            </button>
            {typesAudios.map(type => {
              const count = audios.filter(a => a.type === type.id).length;
              return (
                <button
                  key={type.id}
                  onClick={() => setFiltreType(type.id)}
                  className={`${styles.filtreBtn} ${filtreType === type.id ? styles.filtreActif : ''}`}
                >
                  {type.emoji} {type.label.split(' ')[1]} ({count})
                </button>
              );
            })}
          </div>

          {/* Liste audios */}
          <div className={styles.audiosSection}>
            {chargement ? (
              <p className={styles.chargement}>⏳ Chargement...</p>
            ) : audiosFiltres.length === 0 ? (
              <p className={styles.emptyMessage}>
                {filtreType === 'tous'
                  ? 'Aucun audio enregistré pour l\'instant. Commence par en créer un ! 🎤'
                  : `Aucun audio de type "${typesAudios.find(t => t.id === filtreType)?.label}"`}
              </p>
            ) : (
              audiosFiltres.map(audio => (
                <div key={audio.id} className={styles.audioCard}>
                  <div className={styles.audioHeader}>
                    <div className={styles.audioHeaderLeft}>
                      <span className={styles.audioType}>
                        {typesAudios.find(t => t.id === audio.type)?.emoji} {audio.titre}
                      </span>
                      <div className={styles.audioMeta}>
                        <span>📅 {audio.dateFormatee}</span>
                        <span>⏱️ {formaterDuree(audio.duree)}</span>
                        <span>💾 {formaterTaille(audio.taille)}</span>
                        <span>📆 J{audio.jourJeune}</span>
                      </div>
                    </div>
                    <div className={styles.audioActions}>
                      <button
                        onClick={() => handleExporterAudio(audio.id)}
                        className={styles.btnAction}
                        title="Télécharger"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => handleSupprimerAudio(audio.id)}
                        className={styles.btnAction}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {audio.note && (
                    <p className={styles.audioNote}>💭 {audio.note}</p>
                  )}

                  {audio.tags && audio.tags.length > 0 && (
                    <div className={styles.audioTags}>
                      {audio.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className={styles.playerWrapper}>
                    <AudioPlayer
                      audioBlob={audio.blob}
                      titre={null}
                      duree={audio.duree}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
