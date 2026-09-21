import React, { useEffect, useState } from 'react';
import { chargerPreuvesValidationDefi } from '../lib/defisValidationPreuves';
import { evaluerValidationDefi } from '../lib/defisValidationMoteur';
import { VALIDATION_DECISION, PROGRESSION_MODEL, getValidationConfig } from '../lib/defisValidationReferentiel';
import { chargerObservationsDuree, sauvegarderObservationDuree } from '../lib/defisObservationsDuree';

const QUESTIONS = {
  '🍎 Pas de dessert par automatisme': 'Ce dessert était-il un choix conscient (vraie envie ou occasion choisie) ?',
  '🧀 1 portion ça suffit': decision => decision?.donnees?.secondePortionMentionnee
    ? 'Tu as mentionné une deuxième portion dans ta saisie. Tu confirmes t’être resservi·e ?'
    : 'Pour les repas observés aujourd’hui, es-tu resté·e sur une seule portion ?',
  '🚫 Le faux allié': 'Cet extra servait-il à compenser ou remplacer un autre aliment ou un autre extra ?',
  '🔄 Je brise la chaîne': 'Cet enchaînement sucre → gras correspondait-il bien au schéma que tu voulais observer ?',
  '✨ Je me programme du plaisir': 'Ce plaisir avait-il été planifié avant de le consommer ?',
  '💧 1 cru par jour': 'As-tu mangé aujourd’hui au moins un aliment cru et non sucré ?'
};

export default function ConfirmationObservationDuree({ defi }) {
  const [decision, setDecision] = useState(null);
  const [dejaRepondu, setDejaRepondu] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [message, setMessage] = useState('');
  const question = typeof QUESTIONS[defi?.nom] === 'function' ? QUESTIONS[defi.nom](decision) : QUESTIONS[defi?.nom];

  useEffect(() => {
    let actif = true;
    async function charger() {
      const config = getValidationConfig(defi);
      if (!defi?.id || defi?.status !== 'en cours' || config.progressionModel !== PROGRESSION_MODEL.DURATION || !QUESTIONS[defi.nom]) {
        if (actif) setChargement(false);
        return;
      }
      try {
        const preuves = await chargerPreuvesValidationDefi(defi);
        const resultat = evaluerValidationDefi(preuves);
        const observations = await chargerObservationsDuree(defi.id);
        const repondue = resultat?.preuveId && observations.some(item => item.preuve_id === resultat.preuveId);
        if (actif) {
          setDecision(resultat);
          setDejaRepondu(Boolean(repondue));
        }
      } catch (error) {
        console.warn('Confirmation DURATION indisponible:', error);
      } finally {
        if (actif) setChargement(false);
      }
    }
    charger();
    return () => { actif = false; };
  }, [defi?.id, defi?.status, defi?.nom, defi?.started_at]);

  async function repondre(reponse) {
    if (!decision?.preuveId || sauvegarde) return;
    setSauvegarde(true);
    setMessage('');
    try {
      await sauvegarderObservationDuree(defi, decision, reponse);
      setDejaRepondu(true);
      setMessage('Merci, c’est noté pour ton bilan.');
    } catch (error) {
      console.error(error);
      setMessage('Impossible d’enregistrer ta réponse pour le moment.');
    } finally {
      setSauvegarde(false);
    }
  }

  if (chargement || dejaRepondu || decision?.decision !== VALIDATION_DECISION.NEEDS_CONFIRMATION) {
    return message ? <div style={{ marginTop: 10, color: '#555' }}>{message}</div> : null;
  }

  return (
    <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: '#f7f7fb', border: '1px solid #e4e4ef' }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Petite observation</div>
      <div style={{ marginBottom: 10 }}>{question}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button disabled={sauvegarde} onClick={() => repondre('oui')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #bbb', background: '#fff' }}>Oui</button>
        <button disabled={sauvegarde} onClick={() => repondre('non')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #bbb', background: '#fff' }}>Non</button>
        <button disabled={sauvegarde} onClick={() => repondre('autre')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #bbb', background: '#fff' }}>Pas sûr·e</button>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>Ta réponse sert au bilan du défi. Elle ne fait pas avancer ni reculer le nombre de jours.</div>
    </div>
  );
}
