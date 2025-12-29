import React, { useEffect, useState } from 'react';
import CartePreparationJeune from '../components/CartePreparationJeune';
import { getHistoriquePreparationsJeune, restaurerPreparationJeune, supprimerPreparationJeuneDefinitivement } from '../lib/preparationsJeune';

export default function HistoriquePreparationsJeune() {
  const [historique, setHistorique] = useState([]);
  const [corbeille, setCorbeille] = useState([]);

  useEffect(() => {
    setHistorique(getHistoriquePreparationsJeune());
    setCorbeille(JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]'));
  }, []);

  // Callback pour suppression (refresh)
  const handleDelete = () => {
    setHistorique(getHistoriquePreparationsJeune());
    setCorbeille(JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]'));
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ color: '#4F8FFF', fontWeight: 800, fontSize: '2rem', marginBottom: 24 }}>
        🕑 Historique de mes préparations au jeûne
      </h1>
      {historique.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: '1.1em', margin: '32px 0' }}>
          Aucune préparation terminée pour l’instant.<br />
          Les préparations terminées s’afficheront ici.
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {historique.map(prep => (
            <CartePreparationJeune key={prep.id} preparation={prep} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Corbeille des préparations supprimées */}
      <h2 style={{ color: '#FF6B6B', fontWeight: 700, fontSize: '1.2rem', margin: '32px 0 12px 0' }}>
        🗑️ Corbeille des préparations supprimées
      </h2>
      {corbeille.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: '1em', margin: '16px 0' }}>
          Aucune préparation supprimée.
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {corbeille.map(prep => (
            <div key={prep.id} style={{ background: '#fff0f0', border: '1px solid #FF6B6B', borderRadius: 12, padding: 18, minWidth: 280, maxWidth: 340, boxShadow: '0 2px 8px rgba(255,107,107,0.08)', position: 'relative' }}>
              <div style={{ fontWeight: 700, fontSize: '1.08em', color: '#FF6B6B', marginBottom: 6 }}>
                Préparation du {prep.dateDebut} au {prep.dateFin}
              </div>
              <button
                onClick={() => {
                  restaurerPreparationJeune(prep.id);
                  setHistorique(getHistoriquePreparationsJeune());
                  setCorbeille(JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]'));
                }}
                style={{ background: '#43D9A3', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginRight: 8 }}
                title="Restaurer cette préparation"
              >
                Restaurer
              </button>
              <button
                onClick={() => {
                  supprimerPreparationJeuneDefinitivement(prep.id);
                  setCorbeille(JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]'));
                }}
                style={{ background: '#FF6B6B', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                title="Supprimer définitivement"
              >
                Supprimer définitivement
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
