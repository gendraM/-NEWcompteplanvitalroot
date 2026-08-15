import { useState, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';
import AudioPlayer from './AudioPlayer';
import {
  sauvegarderAudio,
  recupererTousLesAudios,
  supprimerAudio,
  calculerEspaceUtilise,
  exporterAudio,
  recupererAudiosArchives
} from '../lib/audioStorage';
import {
  getAudios as getAudiosSupabase,
  uploadAudio as uploadAudioSupabase,
  getAudioUrl as getAudioUrlSupabase,
  downloadAudio as downloadAudioSupabase,
  deleteAudio as deleteAudioSupabase
} from '../lib/journalSpirituelAPI';
import styles from '../styles/OngletAudios.module.css';

export default function OngletAudios({ jourJeune, modeArchive = false, idJeuneArchive = null, periodeArchive = null, userId = null }) {
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
  }, [userId, modeArchive, periodeArchive?.dateDebut, periodeArchive?.dateFin]);

  const chargerAudios = async () => {
    setChargement(true);
    let liste = [];

    if (userId) {
      try {
        if (modeArchive && (!periodeArchive?.dateDebut || !periodeArchive?.dateFin)) {
          throw new Error('Période du jeûne archivé incomplète');
        }
        const audiosCloud = await getAudiosSupabase(userId, modeArchive ? periodeArchive : null);
        liste = await Promise.all(audiosCloud.map(async (audio) => ({
          ...audio,
          jourJeune: audio.jour_jeune,
          dateFormatee: new Date(audio.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          audioUrl: audio.storage_path
            ? await getAudioUrlSupabase(audio.storage_path)
            : null,
          source: 'supabase'
        })));
      } catch (error) {
        console.warn('Audios Supabase indisponibles, fallback IndexedDB:', error);
      }
    }

    if (liste.length === 0) {
      liste = modeArchive && idJeuneArchive
        ? await recupererAudiosArchives(idJeuneArchive, userId)
        : await recupererTousLesAudios(userId);
    }
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
      const audioData = {
        blob: audioEnCours.blob,
        duree: audioEnCours.duree,
        type: typeAudio,
        titre: titre,
        note: note,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        jourJeune: jourJeune
      };

      let sauvegardeCloudReussie = false;
      if (userId) {
        try {
          await uploadAudioSupabase(audioData.blob, audioData, userId);
          sauvegardeCloudReussie = true;
        } catch (error) {
          console.warn('Sauvegarde audio Supabase indisponible, conservation locale:', error);
        }
      }

      // IndexedDB reste le cache local et le fallback hors ligne.
      await sauvegarderAudio(audioData, userId);

      alert(sauvegardeCloudReussie || !userId
        ? '✅ Audio sauvegardé !'
        : '⚠️ Audio conservé sur cet appareil, mais pas encore synchronisé avec Supabase.');
      
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
  const handleSupprimerAudio = async (audio) => {
    if (!confirm('Supprimer cet audio définitivement ?')) return;

    let success = false;
    if (audio.source === 'supabase' && userId) {
      try {
        await deleteAudioSupabase(audio.id, audio.storage_path, userId);
        success = true;
      } catch (error) {
        console.error('Erreur suppression audio Supabase:', error);
      }
    } else {
      success = await supprimerAudio(audio.id, userId);
    }
    if (success) {
      alert('✅ Audio supprimé');
      chargerAudios();
    }
  };

  // Exporter audio
  const handleExporterAudio = async (audio) => {
    let success = false;
    try {
      if (audio.source === 'supabase' && audio.storage_path) {
        await downloadAudioSupabase(audio.storage_path, audio.titre);
        success = true;
      } else {
        success = await exporterAudio(audio.id, userId);
      }
    } catch (error) {
      console.error('Erreur téléchargement audio:', error);
    }
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
      {modeEnregistrement && !modeArchive ? (
        <AudioRecorder
          onSave={handleEnregistrementTermine}
          onCancel={handleAnnulerEnregistrement}
        />
      ) : modeSauvegarde && !modeArchive ? (
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
          {!modeArchive && <button
            onClick={() => setModeEnregistrement(true)}
            className={styles.btnEnregistrer}
          >
            🎙️ Nouvel enregistrement vocal
          </button>}

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
                        onClick={() => handleExporterAudio(audio)}
                        className={styles.btnAction}
                        title="Télécharger"
                      >
                        ⬇️
                      </button>
                      {!modeArchive && <button
                        onClick={() => handleSupprimerAudio(audio)}
                        className={styles.btnAction}
                        title="Supprimer"
                      >
                        🗑️
                      </button>}
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
                      audioUrl={audio.audioUrl}
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
