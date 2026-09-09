import { useState } from 'react';

function descriptionComposition(repere) {
  return (repere?.composition || [])
    .map(ligne => [ligne.aliment, ligne.quantite].filter(Boolean).join(' · '))
    .join(' + ');
}

function CarteRepere({ repere, principale = false, onUse }) {
  return (
    <article className={principale ? 'carte-repere principale' : 'carte-repere secondaire'}>
      {principale && <span className="surtitre">🌿 Une assiette qui semble bien te convenir</span>}
      <strong>{descriptionComposition(repere)}</strong>
      {repere.kcalTotal !== null && repere.kcalTotal !== undefined && Number.isFinite(Number(repere.kcalTotal)) && (
        <small>{repere.kcalTotal} kcal au total</small>
      )}
      <p>{repere.raison}</p>
      <button type="button" onClick={() => onUse(repere)}>Prévoir cette assiette</button>
    </article>
  );
}

export default function RepasReperesPlanning({ candidats = [], onUse, onDismiss }) {
  const [voirAutres, setVoirAutres] = useState(false);
  const propositions = candidats.slice(0, 3);
  if (!propositions.length) return null;

  const [principale, ...autres] = propositions;
  return (
    <section className="repas-reperes" aria-label="Assiettes repères">
      <CarteRepere repere={principale} principale onUse={onUse} />

      <div className="actions-reperes">
        {autres.length > 0 && (
          <button type="button" className="autres" onClick={() => setVoirAutres(visible => !visible)}>
            {voirAutres ? 'Masquer les autres idées' : `Voir ${autres.length} autre${autres.length > 1 ? 's' : ''} assiette${autres.length > 1 ? 's' : ''} repérée${autres.length > 1 ? 's' : ''}`}
          </button>
        )}
        <button type="button" className="plus-tard" onClick={onDismiss}>Pas cette semaine</button>
      </div>

      {voirAutres && (
        <div className="autres-reperes">
          {autres.map(repere => <CarteRepere key={repere.cleComposition} repere={repere} onUse={onUse} />)}
        </div>
      )}

      <style jsx global>{`
        .repas-reperes { margin: 0 0 20px; padding: 16px; border: 1px solid #b7dfc4; border-radius: 15px; background: #f3fbf5; }
        .carte-repere { display: grid; gap: 8px; }
        .surtitre { color: #2e7d32; font-weight: 800; }
        .carte-repere > strong { font-size: 18px; }
        .carte-repere small { color: #546e5a; font-weight: 700; }
        .carte-repere p { margin: 0; color: #455a4a; line-height: 1.45; }
        .carte-repere button { justify-self: start; border: 0; border-radius: 9px; padding: 10px 14px; background: #2e7d32; color: white; font-weight: 800; cursor: pointer; }
        .actions-reperes { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .actions-reperes button { border: 0; border-radius: 9px; padding: 8px 11px; font-weight: 700; cursor: pointer; }
        .autres { background: #e1f2e5; color: #21652a; }
        .plus-tard { background: transparent; color: #607d66; }
        .autres-reperes { display: grid; gap: 10px; margin-top: 12px; }
        .secondaire { padding: 12px; border-radius: 11px; background: white; }
        @media (max-width: 600px) {
          .repas-reperes { padding: 13px; }
          .carte-repere button, .actions-reperes button { width: 100%; justify-self: stretch; }
        }
      `}</style>
    </section>
  );
}
