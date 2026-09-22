import React, { useEffect, useState } from 'react';
import { chargerPreuvesValidationDefi } from '../lib/defisValidationPreuves';
import { evaluerValidationDefi } from '../lib/defisValidationMoteur';
import { appliquerDecisionValidation } from '../lib/defisValidationProgression';
import { VALIDATION_DECISION, PROGRESSION_MODEL, getValidationConfig } from '../lib/defisValidationReferentiel';

const QUESTIONS = {
  '🧠 Je suis plus fort·e que mes excuses': 'Dans cette situation, as-tu dépassé l’excuse ou l’automatisme que tu voulais travailler ?',
  '🌡️ Chaud devant… mais doux !': 'Pour ce dîner, as-tu réalisé l’action prévue par ce défi ?',
  '🔥 1 vraie faim = 1 vrai repas': 'Ce repas répondait-il à une vraie faim ?'
};

export default function ConfirmationOccurrenceDefi({ defi, onProgress }) {
  const [decision, setDecision] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let actif = true;
    async function charger() {
      const config = getValidationConfig(defi);
      if (!defi?.id || defi?.status !== 'en cours' || config.progressionModel !== PROGRESSION_MODEL.OCCURRENCES || !QUESTIONS[defi.nom]) {
        if (actif) setChargement(false);
        return;
      }
      try {
        const preuves = await chargerPreuvesValidationDefi(defi);
        if (actif) setDecision(evaluerValidationDefi(preuves));
      } catch (error) {
        console.warn('Confirmation OCCURRENCES indisponible:', error);
      } finally {
        if (actif) setChargement(false);
      }
    }
    charger();
    return () => { actif = false; };
  }, [defi?.id, defi?.status, defi?.nom, defi?.progress]);

  async function confirmer() {
    if (!decision?.preuveId || sauvegarde) return;
    setSauvegarde(true);
    setMessage('');
    try {
      const resultat = await appliquerDecisionValidation(defi, { ...decision, decision: VALIDATION_DECISION.VALIDATED }, { source: 'confirmation_utilisateur' });
      if (!resultat?.success) throw new Error(resultat?.error || 'Validation impossible');
      setMessage(resultat.dejaValidee ? 'Cette situation avait déjà été prise en compte.' : 'C’est noté. Cette occurrence est prise en compte.');
      if (onProgress) await onProgress();
    } catch (error) {
      console.error(error);
      setMessage('Impossible d’enregistrer cette occurrence pour le moment.');
    } finally {
      setSauvegarde(false);
    }
  }

  if (chargement) return null;
  if (decision?.decision !== VALIDATION_DECISION.NEEDS_CONFIRMATION) return message ? <div style={{ marginTop: 10, color: '#555' }}>{message}</div> : null;

  return (
    <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: '#f7f7fb', border: '1px solid #e4e4ef' }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Petite confirmation</div>
      <div style={{ marginBottom: 10 }}>{QUESTIONS[defi.nom]}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button disabled={sauvegarde} onClick={confirmer} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #bbb', background: '#fff' }}>Oui</button>
        <button disabled={sauvegarde} onClick={() => setMessage('D’accord. Cette situation ne compte pas comme une occurrence.')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #bbb', background: '#fff' }}>Non</button>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>Seule une confirmation « Oui » ajoute une occurrence. Une même situation ne peut pas être comptée deux fois.</div>
      {message && <div style={{ marginTop: 8, color: '#555' }}>{message}</div>}
    </div>
  );
}
