import React from 'react';

export default function SyntheseJours({ joursRespectes, joursNonRespectes }) {
  // joursRespectes, joursNonRespectes : tableaux de string (ex: ['Lundi', 'Mardi'])
  return (
    <div style={{margin:'1rem 0'}}>
      <h4>Synthèse jours respectés / non respectés</h4>
      <div style={{display:'flex', gap:32}}>
        <div>
          <strong>Jours respectés :</strong>
          <ul>
            {Array.isArray(joursRespectes) && joursRespectes.length > 0 ?
              joursRespectes.map((j,i) => <li key={i}>{j}</li>) : <li>—</li>}
          </ul>
        </div>
        <div>
          <strong>Jours non respectés :</strong>
          <ul>
            {Array.isArray(joursNonRespectes) && joursNonRespectes.length > 0 ?
              joursNonRespectes.map((j,i) => <li key={i}>{j}</li>) : <li>—</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
