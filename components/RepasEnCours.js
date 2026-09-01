import { useEffect, useMemo, useState } from 'react';

export default function RepasEnCours({ aliments = [], chargement = false, onRetirer, onFinaliser }) {
  const [enregistrerModele, setEnregistrerModele] = useState(false);
  const [nomModele, setNomModele] = useState('');
  const [erreur, setErreur] = useState('');

  const totalKcal = useMemo(
    () => aliments.reduce((total, entree) => total + Number(entree?.ligne?.kcal || 0), 0),
    [aliments]
  );
  const modeleDisponible = aliments.length >= 2 && aliments.every(entree => entree.composantModele);

  useEffect(() => {
    if (modeleDisponible) return;
    setEnregistrerModele(false);
    setNomModele('');
    setErreur('');
  }, [modeleDisponible]);

  if (!aliments.length) return null;

  const finaliser = async () => {
    if (enregistrerModele && !nomModele.trim()) {
      setErreur('Donne un nom à cette assiette pour pouvoir la réutiliser.');
      return;
    }
    setErreur('');
    const resultat = await onFinaliser?.({
      enregistrerModele,
      nomModele: nomModele.trim(),
    });
    if (resultat?.ok) {
      setEnregistrerModele(false);
      setNomModele('');
    }
  };

  return (
    <section style={{
      background: '#f5f9ff',
      border: '2px solid #90caf9',
      borderRadius: 12,
      padding: 16,
      margin: '14px 0 20px'
    }}>
      <h3 style={{ margin: '0 0 6px' }}>🍽️ Mon repas en cours</h3>
      <p style={{ margin: '0 0 12px', color: '#455a64' }}>
        Tous ces aliments seront enregistrés ensemble dans une seule assiette.
      </p>

      {aliments.map((entree, index) => (
        <div key={entree.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          background: '#fff',
          borderRadius: 8,
          padding: '9px 10px',
          marginTop: 8
        }}>
          <div style={{ flex: '1 1 190px' }}>
            <strong>{index + 1}. {entree.ligne.aliment || 'Aliment'}</strong>
            <div style={{ fontSize: 13, color: '#607d8b' }}>
              {entree.ligne.categorie || 'Sans catégorie'} · {String(entree.ligne.quantite ?? '')} · {Number(entree.ligne.kcal || 0)} kcal
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRetirer?.(entree.id)}
            disabled={chargement}
            style={{ border: 0, borderRadius: 7, padding: '7px 10px', background: '#ffebee', color: '#b71c1c', cursor: 'pointer' }}
          >
            Retirer
          </button>
        </div>
      ))}

      <div style={{ textAlign: 'right', fontWeight: 800, marginTop: 12 }}>
        Total du repas : {Math.round(totalKcal)} kcal
      </div>

      {modeleDisponible && (
        <div style={{ background: '#f3e5f5', borderRadius: 9, padding: 12, marginTop: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <input
              type="checkbox"
              checked={enregistrerModele}
              onChange={event => setEnregistrerModele(event.target.checked)}
            />
            Enregistrer aussi cette assiette pour la réutiliser
          </label>
          {enregistrerModele && (
            <input
              value={nomModele}
              onChange={event => setNomModele(event.target.value)}
              placeholder="Nom du repas, par exemple Poulet et légumes"
              style={{ width: '100%', marginTop: 10, minHeight: 38, border: '1px solid #b39ddb', borderRadius: 7, padding: '7px 9px' }}
            />
          )}
        </div>
      )}

      {erreur && <div role="alert" style={{ color: '#b71c1c', marginTop: 10, fontWeight: 700 }}>{erreur}</div>}

      <button
        type="button"
        onClick={finaliser}
        disabled={chargement}
        style={{
          display: 'block',
          width: '100%',
          marginTop: 14,
          border: 0,
          borderRadius: 9,
          padding: 11,
          background: chargement ? '#b0bec5' : '#1976d2',
          color: '#fff',
          fontWeight: 800,
          cursor: chargement ? 'not-allowed' : 'pointer'
        }}
      >
        {chargement ? 'Enregistrement…' : `Enregistrer ce repas (${aliments.length} aliment${aliments.length > 1 ? 's' : ''})`}
      </button>
    </section>
  );
}
