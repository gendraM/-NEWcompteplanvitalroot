import React, { useEffect, useState } from 'react';
import { obtenirPropositionDefiIntelligente } from '../lib/defisContexteUtilisateur';

export default function PropositionDefiIntelligente({ onAccepter }) {
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [masquee, setMasquee] = useState(false);

  useEffect(() => {
    let actif = true;
    obtenirPropositionDefiIntelligente()
      .then(resultat => { if (actif) setDecision(resultat); })
      .catch(error => console.warn('Proposition défi intelligente indisponible :', error))
      .finally(() => { if (actif) setLoading(false); });
    return () => { actif = false; };
  }, []);

  if (loading || masquee || !decision?.proposition) return null;

  const { defi, raison } = decision.proposition;
  return (
    <section style={{margin:'0 0 24px',padding:20,borderRadius:14,background:'#f3f8ff',border:'1px solid #cfe2ff'}}>
      <div style={{fontSize:14,fontWeight:700,color:'#1976d2',marginBottom:6}}>✨ Une idée pour toi</div>
      <h2 style={{margin:'0 0 8px',fontSize:21}}>{defi.nom}</h2>
      <p style={{margin:'0 0 8px',color:'#444'}}>{raison}</p>
      {defi.description && <p style={{margin:'0 0 16px',color:'#666'}}>{defi.description}</p>}
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <button onClick={() => onAccepter?.(defi.id)} style={{padding:'9px 18px',border:0,borderRadius:8,background:'#1976d2',color:'#fff',fontWeight:700,cursor:'pointer'}}>Je relève le défi</button>
        <button onClick={() => setMasquee(true)} style={{padding:'9px 18px',border:'1px solid #bbb',borderRadius:8,background:'#fff',color:'#444',cursor:'pointer'}}>Pas maintenant</button>
      </div>
    </section>
  );
}
