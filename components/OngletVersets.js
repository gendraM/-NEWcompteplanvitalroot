import { useState, useEffect } from 'react';
import styles from '../styles/OngletVersets.module.css';

export default function OngletVersets({ jourJeune }) {
  const [versets, setVersets] = useState([]);
  const [modeEdition, setModeEdition] = useState(false);
  const [versetEnCours, setVersetEnCours] = useState(null);
  const [texte, setTexte] = useState('');
  const [reference, setReference] = useState('');
  const [lienExterne, setLienExterne] = useState('');
  const [tags, setTags] = useState('');
  const [filtreRecherche, setFiltreRecherche] = useState('');
  const [filtreFavoris, setFiltreFavoris] = useState(false);

  // Chargement versets depuis localStorage
  useEffect(() => {
    const versetsStockes = localStorage.getItem('versets');
    if (versetsStockes) {
      try {
        setVersets(JSON.parse(versetsStockes));
      } catch (e) {
        console.error('Erreur chargement versets:', e);
      }
    }
  }, []);

  // Sauvegarder dans localStorage
  const sauvegarderStorage = (nouveauxVersets) => {
    localStorage.setItem('versets', JSON.stringify(nouveauxVersets));
  };

  // Ajouter/Modifier verset
  const handleSoumettre = (e) => {
    e.preventDefault();
    
    if (!texte.trim() || !reference.trim()) {
      alert('Le texte et la référence sont obligatoires');
      return;
    }

    const tagsList = tags.split(',').map(t => t.trim()).filter(t => t);

    if (versetEnCours) {
      // Modification
      const versetsModifies = versets.map(v => 
        v.id === versetEnCours.id 
          ? { ...v, texte, reference, lienExterne, tags: tagsList, dateModif: new Date().toISOString() }
          : v
      );
      setVersets(versetsModifies);
      sauvegarderStorage(versetsModifies);
    } else {
      // Ajout
      const nouveauVerset = {
        id: Date.now(),
        texte,
        reference,
        lienExterne,
        tags: tagsList,
        favori: false,
        dateCreation: new Date().toISOString(),
        jourJeune
      };
      const nouveauxVersets = [nouveauVerset, ...versets];
      setVersets(nouveauxVersets);
      sauvegarderStorage(nouveauxVersets);
    }

    // Reset formulaire
    resetFormulaire();
    alert(versetEnCours ? '✅ Verset modifié !' : '✅ Verset ajouté !');
  };

  // Reset formulaire
  const resetFormulaire = () => {
    setTexte('');
    setReference('');
    setLienExterne('');
    setTags('');
    setVersetEnCours(null);
    setModeEdition(false);
  };

  // Éditer verset
  const handleEditer = (verset) => {
    setVersetEnCours(verset);
    setTexte(verset.texte);
    setReference(verset.reference);
    setLienExterne(verset.lienExterne || '');
    setTags(verset.tags ? verset.tags.join(', ') : '');
    setModeEdition(true);
  };

  // Supprimer verset
  const handleSupprimer = (id) => {
    if (!confirm('Supprimer ce verset ?')) return;
    
    const nouveauxVersets = versets.filter(v => v.id !== id);
    setVersets(nouveauxVersets);
    sauvegarderStorage(nouveauxVersets);
  };

  // Toggle favori
  const toggleFavori = (id) => {
    const versetsModifies = versets.map(v => 
      v.id === id ? { ...v, favori: !v.favori } : v
    );
    setVersets(versetsModifies);
    sauvegarderStorage(versetsModifies);
  };

  // Filtrer versets
  const versetsFiltres = versets.filter(v => {
    // Filtre favoris
    if (filtreFavoris && !v.favori) return false;
    
    // Filtre recherche
    if (filtreRecherche) {
      const recherche = filtreRecherche.toLowerCase();
      return (
        v.texte.toLowerCase().includes(recherche) ||
        v.reference.toLowerCase().includes(recherche) ||
        (v.tags && v.tags.some(tag => tag.toLowerCase().includes(recherche)))
      );
    }
    
    return true;
  });

  // Formater date
  const formaterDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  return (
    <div className={styles.ongletContainer}>
      <h2 className={styles.title}>📖 Versets & Citations</h2>
      
      {/* Bouton ajouter */}
      {!modeEdition && (
        <button
          onClick={() => setModeEdition(true)}
          className={styles.btnAjouter}
        >
          ➕ Ajouter un verset
        </button>
      )}

      {/* Formulaire */}
      {modeEdition && (
        <form onSubmit={handleSoumettre} className={styles.formulaire}>
          <h3 className={styles.subTitle}>
            {versetEnCours ? '✏️ Modifier le verset' : '➕ Nouveau verset'}
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              📝 Texte du verset <span className={styles.requis}>*</span>
            </label>
            <textarea
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder="« Car Dieu a tant aimé le monde qu'il a donné son Fils unique... »"
              className={styles.textarea}
              rows={4}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              📚 Référence <span className={styles.requis}>*</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Jean 3:16"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>🔗 Lien externe (optionnel)</label>
            <input
              type="url"
              value={lienExterne}
              onChange={(e) => setLienExterne(e.target.value)}
              placeholder="https://..."
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              🏷️ Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="amour, foi, persévérance"
              className={styles.input}
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btnValider}>
              {versetEnCours ? '💾 Modifier' : '✅ Ajouter'}
            </button>
            <button
              type="button"
              onClick={resetFormulaire}
              className={styles.btnAnnuler}
            >
              ❌ Annuler
            </button>
          </div>
        </form>
      )}

      {/* Filtres */}
      {!modeEdition && versets.length > 0 && (
        <div className={styles.filtres}>
          <input
            type="text"
            value={filtreRecherche}
            onChange={(e) => setFiltreRecherche(e.target.value)}
            placeholder="🔍 Rechercher par texte, référence ou tag..."
            className={styles.inputRecherche}
          />
          
          <button
            onClick={() => setFiltreFavoris(!filtreFavoris)}
            className={`${styles.btnFiltreFavoris} ${filtreFavoris ? styles.actif : ''}`}
          >
            {filtreFavoris ? '⭐ Favoris uniquement' : '☆ Tous les versets'}
          </button>
        </div>
      )}

      {/* Liste versets */}
      {!modeEdition && (
        <div className={styles.listeVersets}>
          {versetsFiltres.length === 0 ? (
            <p className={styles.emptyMessage}>
              {versets.length === 0 
                ? "Aucun verset enregistré. Clique sur '➕ Ajouter un verset' pour commencer !"
                : "Aucun verset ne correspond à ta recherche."}
            </p>
          ) : (
            versetsFiltres.map(verset => (
              <div key={verset.id} className={styles.versetCard}>
                <div className={styles.cardHeader}>
                  <button
                    onClick={() => toggleFavori(verset.id)}
                    className={styles.btnFavori}
                    title={verset.favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    {verset.favori ? '⭐' : '☆'}
                  </button>
                  
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleEditer(verset)}
                      className={styles.btnAction}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleSupprimer(verset.id)}
                      className={styles.btnAction}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <p className={styles.versetTexte}>"{verset.texte}"</p>
                
                <div className={styles.versetReference}>
                  <span className={styles.reference}>📚 {verset.reference}</span>
                  {verset.lienExterne && (
                    <a 
                      href={verset.lienExterne} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.lienExterne}
                    >
                      🔗 Lien
                    </a>
                  )}
                </div>

                {verset.tags && verset.tags.length > 0 && (
                  <div className={styles.tags}>
                    {verset.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.versetMeta}>
                  <span>📅 Ajouté le {formaterDate(verset.dateCreation)}</span>
                  <span>📍 J{verset.jourJeune}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Statistiques */}
      {!modeEdition && versets.length > 0 && (
        <div className={styles.statistiques}>
          <div className={styles.stat}>
            <span className={styles.statValeur}>{versets.length}</span>
            <span className={styles.statLabel}>verset{versets.length > 1 ? 's' : ''}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValeur}>{versets.filter(v => v.favori).length}</span>
            <span className={styles.statLabel}>favori{versets.filter(v => v.favori).length > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}
