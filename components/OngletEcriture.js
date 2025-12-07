import { useState, useEffect } from 'react';
import styles from '../styles/OngletEcriture.module.css';

export default function OngletEcriture({ jourJeune }) {
  // ==========================================
  // 1. HOOKS (tous en haut du composant)
  // ==========================================
  const [texte, setTexte] = useState('');
  const [titre, setTitre] = useState('');
  const [ecrits, setEcrits] = useState([]);
  const [modeEdition, setModeEdition] = useState(false);
  const [ecritEnCoursEdition, setEcritEnCoursEdition] = useState(null);

  // Charger les écrits depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ecritsStockes = localStorage.getItem('journalEcrits');
      if (ecritsStockes) {
        try {
          const parsed = JSON.parse(ecritsStockes);
          // Trier par date décroissante (plus récent en premier)
          const tries = parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
          setEcrits(tries);
        } catch (error) {
          console.error('Erreur chargement écrits:', error);
        }
      }
    }
  }, []);

  // ==========================================
  // 2. HANDLERS (après les hooks)
  // ==========================================

  const sauvegarderEcrit = () => {
    if (!texte.trim()) {
      alert('Veuillez écrire quelque chose avant de sauvegarder.');
      return;
    }

    const nouvelEcrit = {
      id: modeEdition ? ecritEnCoursEdition.id : Date.now(),
      titre: titre.trim() || 'Sans titre',
      texte: texte.trim(),
      date: modeEdition ? ecritEnCoursEdition.date : new Date().toISOString(),
      dateModification: modeEdition ? new Date().toISOString() : null,
      jourJeune: jourJeune || 'N/A',
      nbCaracteres: texte.trim().length
    };

    let nouveauxEcrits;
    if (modeEdition) {
      // Remplacer l'écrit existant
      nouveauxEcrits = ecrits.map(e => e.id === ecritEnCoursEdition.id ? nouvelEcrit : e);
    } else {
      // Ajouter nouvel écrit
      nouveauxEcrits = [nouvelEcrit, ...ecrits];
    }

    // Sauvegarder dans localStorage
    localStorage.setItem('journalEcrits', JSON.stringify(nouveauxEcrits));
    setEcrits(nouveauxEcrits);

    // Réinitialiser le formulaire
    setTexte('');
    setTitre('');
    setModeEdition(false);
    setEcritEnCoursEdition(null);
  };

  const editerEcrit = (ecrit) => {
    setTitre(ecrit.titre);
    setTexte(ecrit.texte);
    setModeEdition(true);
    setEcritEnCoursEdition(ecrit);
    // Scroll vers le haut pour voir le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const annulerEdition = () => {
    setTexte('');
    setTitre('');
    setModeEdition(false);
    setEcritEnCoursEdition(null);
  };

  const supprimerEcrit = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet écrit ?')) {
      const nouveauxEcrits = ecrits.filter(e => e.id !== id);
      localStorage.setItem('journalEcrits', JSON.stringify(nouveauxEcrits));
      setEcrits(nouveauxEcrits);
    }
  };

  const formaterDate = (dateISO) => {
    const date = new Date(dateISO);
    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const annee = date.getFullYear();
    const heures = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${jour}/${mois}/${annee} ${heures}:${minutes}`;
  };

  // ==========================================
  // 3. RENDER
  // ==========================================

  return (
    <div className={styles.ongletContainer}>
      <h1 className={styles.title}>✍️ Écriture libre</h1>
      
      {/* Formulaire de saisie */}
      <div className={styles.formulaire}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitre}>
            {modeEdition ? '✏️ Modifier l\'écrit' : '📝 Nouvel écrit'}
          </h2>
          {modeEdition && (
            <button onClick={annulerEdition} className={styles.btnAnnulerEdition}>
              ❌ Annuler
            </button>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Titre (optionnel)
          </label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex: Réflexion du jour 3, Gratitude du matin..."
            className={styles.input}
            maxLength={100}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Votre texte
          </label>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Écrivez librement vos pensées, réflexions, prières, gratitudes, ressentis...&#10;&#10;Aucune limite de longueur. Laissez votre cœur s'exprimer."
            className={styles.textarea}
            rows={12}
          />
          <div className={styles.compteur}>
            {texte.length.toLocaleString('fr-FR')} caractère{texte.length > 1 ? 's' : ''}
          </div>
        </div>

        <button onClick={sauvegarderEcrit} className={styles.btnSauvegarder}>
          {modeEdition ? '💾 Enregistrer les modifications' : '💾 Sauvegarder'}
        </button>
      </div>

      {/* Historique des écrits */}
      <div className={styles.historiqueSection}>
        <h2 className={styles.historiqueTitre}>
          📚 Mes écrits ({ecrits.length})
        </h2>

        {ecrits.length === 0 ? (
          <p className={styles.emptyMessage}>
            Aucun écrit pour le moment. Commencez à écrire pour garder une trace de votre cheminement spirituel.
          </p>
        ) : (
          <div className={styles.ecritsListe}>
            {ecrits.map((ecrit) => (
              <div key={ecrit.id} className={styles.ecritCard}>
                <div className={styles.ecritHeader}>
                  <div className={styles.ecritHeaderLeft}>
                    <h3 className={styles.ecritTitre}>{ecrit.titre}</h3>
                    <div className={styles.ecritMeta}>
                      <span>📅 {formaterDate(ecrit.date)}</span>
                      <span>📖 Jour {ecrit.jourJeune}</span>
                      <span>📝 {ecrit.nbCaracteres.toLocaleString('fr-FR')} caractères</span>
                      {ecrit.dateModification && (
                        <span className={styles.modifie}>✏️ Modifié le {formaterDate(ecrit.dateModification)}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.ecritActions}>
                    <button
                      onClick={() => editerEcrit(ecrit)}
                      className={styles.btnAction}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => supprimerEcrit(ecrit.id)}
                      className={styles.btnAction}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className={styles.ecritTexte}>
                  {ecrit.texte}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
