import { ACTIONS_POINT_AJUSTEMENT_AUTORISEES } from '../lib/pointAjustementAlimentaire';

function libelleAction(action) {
  if (action === ACTIONS_POINT_AJUSTEMENT_AUTORISEES.UTILISER_VALEUR_SURE) return 'Préparer cette valeur sûre';
  if (action === ACTIONS_POINT_AJUSTEMENT_AUTORISEES.AJUSTER_REPAS_PLANIFIE) return 'Voir mon planning';
  if (action === ACTIONS_POINT_AJUSTEMENT_AUTORISEES.CONSERVER_PLAN) return 'Garder mon plan comme prévu';
  return null;
}

export default function PointAjustementPlanning({ carte, onAction, onDismiss }) {
  if (!carte) return null;
  const libelle = libelleAction(carte?.proposition?.action);

  return (
    <section className="point-ajustement" aria-label="Point d’ajustement alimentaire">
      <div className="point-ajustement-entete">
        <div>
          <span className="point-ajustement-surtitre">🌿 Mon point d’ajustement</span>
          <h2>Ce que tes premiers jours racontent</h2>
        </div>
        <button type="button" className="fermer-point" onClick={onDismiss} aria-label="Fermer le point d’ajustement">×</button>
      </div>

      {carte.ceQuiFonctionne && (
        <div className="bloc-point positif">
          <strong>Ce qui fonctionne</strong>
          <p>{carte.ceQuiFonctionne.texte}</p>
        </div>
      )}

      {carte.pointAttention && (
        <div className="bloc-point attention">
          <strong>À regarder de plus près</strong>
          <p>{carte.pointAttention.texte}</p>
        </div>
      )}

      {carte.proposition && (
        <div className="bloc-point proposition">
          <strong>Pour la suite</strong>
          <p>{carte.proposition.texte}</p>
          {libelle && <button type="button" onClick={() => onAction(carte.proposition)}>{libelle}</button>}
        </div>
      )}

      <button type="button" className="garder-en-tete" onClick={onDismiss}>Je garde ça en tête</button>

      <style jsx>{`
        .point-ajustement { margin: 0 0 20px; padding: 18px; border: 1px solid #c7b4e7; border-radius: 16px; background: linear-gradient(145deg, #fbf8ff, #f4edff); color: #30283b; }
        .point-ajustement-entete { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .point-ajustement-surtitre { color: #6d3da0; font-weight: 800; }
        .point-ajustement h2 { margin: 5px 0 14px; font-size: 21px; }
        .fermer-point { border: 0; background: transparent; color: #6d5b78; font-size: 28px; line-height: 1; cursor: pointer; }
        .bloc-point { margin-top: 10px; padding: 12px 13px; border-radius: 12px; background: white; }
        .bloc-point.positif { border-left: 4px solid #4c9b68; }
        .bloc-point.attention { border-left: 4px solid #d18a3c; }
        .bloc-point.proposition { border-left: 4px solid #7d52aa; }
        .bloc-point p { margin: 5px 0 0; line-height: 1.5; }
        .bloc-point button { margin-top: 11px; border: 0; border-radius: 9px; padding: 10px 14px; background: #7d52aa; color: white; font-weight: 800; cursor: pointer; }
        .garder-en-tete { margin-top: 12px; border: 0; background: transparent; color: #695878; font-weight: 700; cursor: pointer; }
        @media (max-width: 600px) {
          .point-ajustement { padding: 14px; }
          .point-ajustement h2 { font-size: 19px; }
          .bloc-point button, .garder-en-tete { width: 100%; }
        }
      `}</style>
    </section>
  );
}
