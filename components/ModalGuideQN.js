import React from 'react';

/**
 * Modal pédagogique pour expliquer le score QN (Qualité Nutritionnelle)
 * Affiche un tableau détaillé, descriptions, exemples, couleurs
 */
export default function ModalGuideQN({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 32, maxWidth: 480, width: '90%', boxShadow: '0 8px 32px #0002',
        fontFamily: 'system-ui,Arial,sans-serif', position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Fermer">×</button>
        <h2 style={{marginTop:0,marginBottom:12}}>Guide QN – Qualité Nutritionnelle</h2>
        <p style={{fontSize:15,marginBottom:18}}>
          Le score QN indique le niveau de transformation de l’aliment. Plus le score est élevé, plus l’aliment est naturel et bénéfique pour la santé.
        </p>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:16}}>
          <thead>
            <tr style={{background:'#f5f5f5'}}>
              <th style={{padding:6}}>QN</th>
              <th style={{padding:6}}>Intitulé</th>
              <th style={{padding:6}}>Description</th>
              <th style={{padding:6}}>Exemples</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{background:'#e8f5e9'}}>
              <td style={{fontWeight:700,color:'#388e3c'}}>5</td>
              <td>Naturel</td>
              <td>Aliment brut, non transformé, sans additif</td>
              <td>Fruits/légumes frais, œufs</td>
            </tr>
            <tr style={{background:'#f1f8e9'}}>
              <td style={{fontWeight:700,color:'#689f38'}}>4</td>
              <td>Peu transformé</td>
              <td>Transformé simplement, peu d’ingrédients</td>
              <td>Pain complet, yaourt nature</td>
            </tr>
            <tr style={{background:'#fffde7'}}>
              <td style={{fontWeight:700,color:'#fbc02d'}}>3</td>
              <td>Transformé modéré</td>
              <td>Plusieurs ingrédients, additifs limités</td>
              <td>Fromage, compote sucrée</td>
            </tr>
            <tr style={{background:'#fff3e0'}}>
              <td style={{fontWeight:700,color:'#f57c00'}}>2</td>
              <td>Transformé industriel</td>
              <td>Additifs, sucre/sel/gras ajoutés</td>
              <td>Céréales sucrées, plats cuisinés</td>
            </tr>
            <tr style={{background:'#ffebee'}}>
              <td style={{fontWeight:700,color:'#d32f2f'}}>1</td>
              <td>Ultra-transformé</td>
              <td>Longue liste d’ingrédients, additifs multiples</td>
              <td>Soda, bonbons, chips</td>
            </tr>
          </tbody>
        </table>
        <div style={{fontSize:13,opacity:0.8}}>
          <b>Astuce :</b> Pour bien choisir, compare la liste d’ingrédients et privilégie les aliments les plus simples et naturels.
        </div>
      </div>
    </div>
  );
}
