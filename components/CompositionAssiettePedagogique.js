import { useMemo } from 'react';
import { analyserCompositionAssiette, DIMENSIONS_ASSIETTE } from '../lib/analyseCompositionAssiette';

const DIMENSIONS = [
  { id: DIMENSIONS_ASSIETTE.PROTEINE, emoji: '🥩', label: 'Protéine' },
  { id: DIMENSIONS_ASSIETTE.LEGUME, emoji: '🥦', label: 'Légume' },
  { id: DIMENSIONS_ASSIETTE.FECULENT, emoji: '🍚', label: 'Féculent' },
  { id: DIMENSIONS_ASSIETTE.MATIERE_GRASSE, emoji: '🥑', label: 'Matière grasse' }
];

export default function CompositionAssiettePedagogique({ composition = [] }) {
  const analyse = useMemo(() => analyserCompositionAssiette(composition), [composition]);

  return (
    <aside className="composition-pedagogique" aria-live="polite">
      <div className="entete">
        <div>
          <strong>Compose ton assiette</strong>
          <p>Un repère pour visualiser ton repas, pas une règle à respecter.</p>
        </div>
      </div>

      <div className="dimensions">
        {DIMENSIONS.map(dimension => {
          const resultat = analyse.dimensions[dimension.id];
          const present = resultat?.statut === 'present';
          const inconnu = resultat?.statut === 'inconnu';
          const aliments = Array.isArray(resultat?.aliments) ? resultat.aliments : [];
          const detail = present
            ? aliments.map(item => item?.nom).filter(Boolean).join(', ')
            : inconnu ? 'À préciser' : 'Pas encore repéré';
          return (
            <div key={dimension.id} className={`dimension ${present ? 'presente' : inconnu ? 'inconnue' : ''}`}>
              <span className="emoji" aria-hidden="true">{dimension.emoji}</span>
              <div>
                <strong>{dimension.label}</strong>
                <small>{detail}</small>
              </div>
              <span className="etat" aria-label={present ? `${dimension.label} repéré` : inconnu ? `${dimension.label} à préciser` : `${dimension.label} non repéré`}>
                {present ? '✓' : inconnu ? '?' : '○'}
              </span>
            </div>
          );
        })}

        <div className="dimension cuisson">
          <span className="emoji" aria-hidden="true">🍳</span>
          <div>
            <strong>Cuisson</strong>
            <small>À préciser dans une prochaine étape</small>
          </div>
          <span className="etat" aria-label="Cuisson non renseignée">○</span>
        </div>
      </div>

      {((analyse?.qualiteDonnees?.categoriesNonReconnues?.length || 0) > 0 || (analyse?.qualiteDonnees?.categoriesManquantes?.length || 0) > 0) && (
        <p className="donnees-incompletes">
          Certains aliments ne sont pas encore classés dans ces repères. Ils restent bien dans ton repas.
        </p>
      )}

      <style jsx>{`
        .composition-pedagogique { margin-top: 14px; padding: 14px; border: 1px solid #d7e6dc; border-radius: 12px; background: #fbfdfb; }
        .entete strong { font-size: 17px; }
        .entete p { margin: 4px 0 12px; color: #546e5b; font-size: 13px; }
        .dimensions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        .dimension { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center; min-width: 0; padding: 9px; border: 1px solid #e3e8e4; border-radius: 10px; background: white; }
        .dimension.presente { border-color: #a5d6a7; background: #f1f8f2; }
        .dimension.inconnue { border-style: dashed; }
        .emoji { font-size: 20px; }
        .dimension div { display: grid; min-width: 0; }
        .dimension strong { font-size: 14px; }
        .dimension small { color: #607d68; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .etat { font-size: 18px; font-weight: 800; color: #78909c; }
        .presente .etat { color: #2e7d32; }
        .donnees-incompletes { margin: 10px 0 0; color: #607d68; font-size: 12px; }
        @media (max-width: 600px) {
          .dimensions { grid-template-columns: 1fr; }
        }
      `}</style>
    </aside>
  );
}
