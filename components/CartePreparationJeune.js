export default CartePreparationJeune;
// Carte d’aperçu d’une préparation terminée
// À compléter selon le plan d’implémentation validé

function CartePreparationJeune({ preparation, onDelete }) {
  if (!preparation) return null;
  const {
    id,
    dateDebut,
    dateFin,
    tauxReussite,
    nbCriteresValides,
    nbCriteresTotal,
    criteres = [],
    messagePerso,
    axesAmelioration = [],
    conseils = [],
    notesPerso,
    createdAt,
  } = preparation;

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  // Limiter à 2 conseils sur des critères différents, prioriser les axes critiques
  const conseilsFiltres = [];
  const seen = new Set();
  for (const crit of criteres.filter(c => !c.valide)) {
    if (conseilsFiltres.length >= 2) break;
    if (crit.conseil && !seen.has(crit.label)) {
      conseilsFiltres.push(crit.conseil);
      seen.add(crit.label);
    }
  }

  return (
    <div style={{ background: '#F5F8FA', border: '1px solid #4F8FFF', borderRadius: 12, padding: 18, minWidth: 280, maxWidth: 340, boxShadow: '0 2px 8px rgba(79,143,255,0.08)', position: 'relative' }}>
      <button
        onClick={() => {
          supprimerPreparationHistorique(id);
          if (onDelete) onDelete(id);
        }}
        style={{ position: 'absolute', top: 10, right: 10, background: '#FF6B6B', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        title="Supprimer cette préparation"
      >
        Supprimer
      </button>
      <div style={{ fontWeight: 700, fontSize: '1.08em', color: '#0ea5e9', marginBottom: 6 }}>
        Préparation du {formatDate(dateDebut)} au {formatDate(dateFin)}
      </div>
      <div style={{ fontSize: '0.98em', color: '#64748b', marginBottom: 8 }}>
        Taux de réussite : <span style={{ color: '#43D9A3', fontWeight: 700 }}>{Math.round(tauxReussite)}%</span> ({nbCriteresValides}/{nbCriteresTotal} critères validés)
      </div>
      <div style={{ marginBottom: 8 }}>
        <b style={{ color: '#4F8FFF' }}>Critères validés :</b>
        <ul style={{ margin: '6px 0 0 0', paddingLeft: 18 }}>
          {criteres.filter(c => c.valide).length > 0 ? criteres.filter(c => c.valide).map(c => (
            <li key={c.id} style={{ color: '#43D9A3', fontWeight: 600 }}>{c.titre || c.label}</li>
          )) : <li style={{ color: '#64748b' }}>Aucun critère validé</li>}
        </ul>
      </div>
      <div style={{ marginBottom: 8 }}>
        <b style={{ color: '#f59e42' }}>Axes d’amélioration :</b>
        <ul style={{ margin: '6px 0 0 0', paddingLeft: 18 }}>
          {axesAmelioration.length > 0 ? axesAmelioration.map((a, i) => (
            <li key={i} style={{ color: '#f59e42', fontWeight: 600 }}>{a}</li>
          )) : <li style={{ color: '#64748b' }}>Aucun axe d’amélioration</li>}
        </ul>
      </div>
      <div style={{ marginBottom: 8 }}>
        <b style={{ color: '#0ea5e9' }}>Conseils personnalisés :</b>
        <ul style={{ margin: '6px 0 0 0', paddingLeft: 18 }}>
          {conseilsFiltres.length > 0 ? conseilsFiltres.map((c, i) => (
            <li key={i} style={{ color: '#0ea5e9' }}>{c}</li>
          )) : <li style={{ color: '#64748b' }}>Aucun conseil</li>}
        </ul>
      </div>
      {messagePerso && (
        <div style={{ marginBottom: 8, color: '#64748b', fontStyle: 'italic' }}>
          <b style={{ color: '#4F8FFF' }}>Message personnel :</b> {messagePerso}
        </div>
      )}
      {notesPerso && (
        <div style={{ marginBottom: 8, color: '#64748b', fontStyle: 'italic' }}>
          <b style={{ color: '#4F8FFF' }}>Notes :</b> {notesPerso}
        </div>
      )}
      <div style={{ fontSize: '0.85em', color: '#94a3b8', marginTop: 8 }}>
        Archivé le {formatDate(createdAt)}
      </div>
    </div>
  );
}

