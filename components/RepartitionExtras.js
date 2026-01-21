import React from 'react';

export default function RepartitionExtras({ repartitionTypes, repartitionMoments }) {
  // repartitionTypes: { mini: n, normal: n, majeur: n }
  // repartitionMoments: { matin: n, midi: n, soir: n, collation: n }
  return (
    <div style={{margin: '1rem 0'}}>
      <h4>Répartition des extras</h4>
      <div style={{display:'flex', gap:32}}>
        <div>
          <strong>Par type :</strong>
          <ul>
            <li>Mini : {repartitionTypes?.mini ?? '—'}</li>
            <li>Normal : {repartitionTypes?.normal ?? '—'}</li>
            <li>Majeur : {repartitionTypes?.majeur ?? '—'}</li>
          </ul>
        </div>
        <div>
          <strong>Par moment :</strong>
          <ul>
            <li>Matin : {repartitionMoments?.matin ?? '—'}</li>
            <li>Midi : {repartitionMoments?.midi ?? '—'}</li>
            <li>Soir : {repartitionMoments?.soir ?? '—'}</li>
            <li>Collation : {repartitionMoments?.collation ?? '—'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
