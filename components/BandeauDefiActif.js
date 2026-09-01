import React from 'react';
import { useRouter } from 'next/router';
import { useDefis } from './DefisContext';
import { getDefiMax } from '../lib/defisUtils';

// Source de vérité unique : le bandeau ne fait plus confiance à des données de démonstration
// passées par les pages. Il affiche le premier défi réellement en cours du contexte utilisateur.
export default function BandeauDefiActif() {
  const router = useRouter();
  const { defisEnCours = [], loading } = useDefis() || {};
  const defi = defisEnCours[0];

  if (loading || !defi) return null;

  const max = getDefiMax(defi);
  const estAvecJournal = defi.type === 'personnalise' || defi.type === 'alimentaire';

  return (
    <div style={{ background: '#e3f2fd', padding: 16, borderRadius: 10, marginBottom: 16 }}>
      <h2 style={{ margin: 0 }}>{defi.nom}</h2>
      <div>Progression : {defi.progress || 0} / {max}</div>
      <div style={{ margin: '8px 0', color: '#1976d2' }}>Reste motivé, tu es sur la bonne voie !</div>
      <button
        onClick={() => estAvecJournal ? router.push(`/journal-defi/${defi.id}`) : router.push('/defis')}
        style={{ padding: '6px 16px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 700 }}
      >
        {estAvecJournal ? 'Ouvrir le journal de bord' : 'Voir mon défi'}
      </button>
    </div>
  );
}
