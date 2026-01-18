import React from 'react';

export default function ConseilsPersonnalises({ conseils }) {
  // conseils : tableau de string ou string unique
  if (!conseils || (Array.isArray(conseils) && conseils.length === 0)) {
    return <div style={{margin:'1rem 0'}}><em>Aucun conseil personnalisé pour cette semaine.</em></div>;
  }
  return (
    <div style={{margin:'1rem 0'}}>
      <h4>Conseils personnalisés</h4>
      <ul>
        {Array.isArray(conseils)
          ? conseils.map((c, i) => <li key={i}>{c}</li>)
          : <li>{conseils}</li>}
      </ul>
    </div>
  );
}
