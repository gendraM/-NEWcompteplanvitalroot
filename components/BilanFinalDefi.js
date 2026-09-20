import React, { useEffect, useState } from 'react';
import { chargerPreuvesValidationDefi } from '../lib/defisValidationPreuves';
import { construireBilanFinalDuree } from '../lib/defisBilanFinal';

const DEFIS_DURATION = new Set([
  '🍎 Pas de dessert par automatisme',
  '🧀 1 portion ça suffit',
  '💡 J’écoute mon ventre',
  '🚫 Le faux allié',
  '🔄 Je brise la chaîne',
  '✨ Je me programme du plaisir',
  '💧 1 cru par jour'
]);

export default function BilanFinalDefi({ defi }) {
  const [bilan, setBilan] = useState(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let actif = true;

    async function charger() {
      if (!defi?.id || defi?.status !== 'terminé' || !DEFIS_DURATION.has(defi?.nom)) return;
      try {
        setErreur(false);
        const preuves = await chargerPreuvesValidationDefi(defi);
        const resultat = construireBilanFinalDuree(preuves.defi, preuves);
        if (actif) setBilan(resultat);
      } catch (error) {
        console.warn('Bilan final du défi indisponible:', error);
        if (actif) setErreur(true);
      }
    }

    charger();
    return () => { actif = false; };
  }, [defi?.id, defi?.status, defi?.nom, defi?.ended_at]);

  if (defi?.status !== 'terminé' || !DEFIS_DURATION.has(defi?.nom)) return null;
  if (erreur) return <div style={{ marginTop: 10, color: '#666' }}>Ton défi est terminé. Ton bilan détaillé sera disponible dès que tes observations pourront être relues.</div>;
  if (!bilan?.pret) return null;

  return (
    <div style={{ marginTop: 12, padding: 14, borderRadius: 8, background: '#fff' }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Ton bilan du défi</div>
      <div>{bilan.message}</div>
      {defi?.nom === '💡 J’écoute mon ventre' && bilan.nonRenseignes > 0 && (
        <div style={{ marginTop: 6, color: '#666' }}>
          {bilan.nonRenseignes} repas n’avaient pas d’information de satiété : ils ne sont pas considérés comme des échecs.
        </div>
      )}
    </div>
  );
}
