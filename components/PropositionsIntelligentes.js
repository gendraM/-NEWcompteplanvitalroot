import React from 'react';

/**
 * PropositionsIntelligentes
 * Affiche les propositions alimentaires intelligentes, les alertes de jours critiques
 * et les recommandations basées sur l'analyse de l'historique des reprises.
 *
 * Props:
 *   propositionsAliments  {Array}  — aliments gagnants pour le jour/phase actuel
 *   alertesJoursCritiques {Array}  — jours détectés comme critiques
 *   recommandations       {Array}  — textes de recommandation
 *   jourActuel            {number} — jour courant
 *   phaseActuelle         {number} — phase courante
 */
export default function PropositionsIntelligentes({
  propositionsAliments = [],
  alertesJoursCritiques = [],
  recommandations = [],
  jourActuel,
  phaseActuelle,
}) {
  // Pas de données à afficher
  if (
    propositionsAliments.length === 0 &&
    alertesJoursCritiques.length === 0 &&
    recommandations.length === 0
  ) {
    return null;
  }

  const styleContainer = {
    margin: '16px 0',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e3f2fd',
  };

  const styleHeader = {
    background: 'linear-gradient(90deg, #4fc3f7 0%, #0288d1 100%)',
    color: '#fff',
    padding: '10px 14px',
    fontWeight: 700,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const styleBody = {
    background: '#f9fdff',
    padding: '12px 14px',
  };

  const styleAlerte = {
    background: '#fff3e0',
    border: '1px solid #ffb74d',
    borderRadius: 6,
    padding: '8px 12px',
    marginBottom: 10,
    fontSize: 13,
    color: '#e65100',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  };

  const styleReco = {
    background: '#e8f5e9',
    border: '1px solid #a5d6a7',
    borderRadius: 6,
    padding: '8px 12px',
    marginBottom: 8,
    fontSize: 13,
    color: '#2e7d32',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  };

  const stylePill = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#e3f2fd',
    border: '1px solid #90caf9',
    borderRadius: 20,
    padding: '3px 10px',
    marginRight: 6,
    marginBottom: 6,
    fontSize: 12,
    color: '#1565c0',
    fontWeight: 500,
  };

  // Retourne l'emoji correspondant au préfixe d'une recommandation
  function getRecommendationEmoji(reco) {
    if (reco.startsWith('⚠️')) return '⚠️';
    if (reco.startsWith('💡')) return '💡';
    if (reco.startsWith('🏆')) return '🏆';
    return '✨';
  }

  return (
    <div style={styleContainer}>
      <div style={styleHeader}>
        <span>🧠</span>
        <span>
          Propositions intelligentes — Jour {jourActuel} Phase {phaseActuelle}
        </span>
      </div>

      <div style={styleBody}>
        {/* Alertes jours critiques */}
        {alertesJoursCritiques.map((alerte, idx) => (
          <div key={idx} style={styleAlerte}>
            <span>⚠️</span>
            <span>
              <strong>Jour {alerte.jour} Phase {alerte.phase} :</strong>{' '}
              Stagnation détectée dans {alerte.stagnations}/{alerte.total} reprises
              ({alerte.tauxStagnation}%).{' '}
              {alerte.alerte === 'CRITIQUE' ? 'Sois très vigilant !' : 'Reste attentif !'}
            </span>
          </div>
        ))}

        {/* Recommandations textuelles */}
        {recommandations.map((reco, idx) => (
          <div key={idx} style={styleReco}>
            <span>{getRecommendationEmoji(reco)}</span>
            <span>{reco.replace(/^[✨⚠️💡🏆]\s*/, '')}</span>
          </div>
        ))}

        {/* Aliments gagnants */}
        {propositionsAliments.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
              🍽️ Aliments qui ont bien fonctionné ce jour / cette phase :
            </div>
            <div>
              {propositionsAliments.map((item, idx) => (
                <span key={idx} style={stylePill}>
                  {item.aliment}
                  {item.succes > 0 && (
                    <span style={{ color: '#43a047', fontWeight: 700 }}>
                      {' '}✓{item.succes}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
