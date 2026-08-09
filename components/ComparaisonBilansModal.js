import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ComparaisonBilansModal({ isOpen, onClose, bilans }) {
  const [periode1, setPeriode1] = useState('');
  const [periode2, setPeriode2] = useState('');
  const [bilan1, setBilan1] = useState(null);
  const [bilan2, setBilan2] = useState(null);
  const [loading, setLoading] = useState(false);

  const getNomMois = (mois) => {
    const moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNoms[mois - 1];
  };

  const chargerBilans = async () => {
    if (!periode1 || !periode2) return;

    setLoading(true);
    try {
      const [mois1, annee1] = periode1.split('-').map(Number);
      const [mois2, annee2] = periode2.split('-').map(Number);

      const b1 = bilans.find(b => b.mois === mois1 && b.annee === annee1);
      const b2 = bilans.find(b => b.mois === mois2 && b.annee === annee2);

      setBilan1(b1);
      setBilan2(b2);
    } catch (err) {
      console.error('[COMPARAISON] Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (periode1 && periode2) {
      chargerBilans();
    }
  }, [periode1, periode2]);

  const getEvolution = (val1, val2) => {
    if (val1 === null || val2 === null || val1 === undefined || val2 === undefined) return null;
    const diff = val2 - val1;
    const pourcent = val1 !== 0 ? ((diff / val1) * 100).toFixed(1) : 0;
    return { diff, pourcent };
  };

  const getIndicateur = (diff) => {
    if (diff > 0) return { emoji: '↗️', color: '#4caf50', label: 'En hausse' };
    if (diff < 0) return { emoji: '↘️', color: '#f44336', label: 'En baisse' };
    return { emoji: '➡️', color: '#ff9800', label: 'Stable' };
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '20px 20px 0 0',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>⚖️ Comparaison de bilans</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>Analysez votre évolution entre deux périodes</p>
        </div>

        {/* Sélection périodes */}
        <div style={{
          padding: '30px',
          background: '#f8f9fa',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
              📅 Période 1
            </label>
            <select
              value={periode1}
              onChange={(e) => setPeriode1(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #ddd',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Sélectionner...</option>
              {bilans.map(b => (
                <option key={b.id} value={`${b.mois}-${b.annee}`}>
                  {getNomMois(b.mois)} {b.annee}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
              📅 Période 2
            </label>
            <select
              value={periode2}
              onChange={(e) => setPeriode2(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #ddd',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Sélectionner...</option>
              {bilans.map(b => (
                <option key={b.id} value={`${b.mois}-${b.annee}`}>
                  {getNomMois(b.mois)} {b.annee}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparaison */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              margin: '0 auto 20px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p>Chargement...</p>
          </div>
        ) : bilan1 && bilan2 ? (
          <div style={{ padding: '30px' }}>
            {/* Section 2 - Budget Calorique */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '20px',
              border: '2px solid #e0e0e0'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.5rem' }}>
                🔥 Budget Calorique
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
                    {getNomMois(bilan1.mois)} {bilan1.annee}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
                    {bilan1.section_2_budget_calorique?.total_consomme?.toFixed(0) || 0} kcal
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '5px' }}>
                    Moyenne: {bilan1.section_2_budget_calorique?.moyenne_jour || 0} kcal/j
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '3rem' }}>
                  {getIndicateur(
                    (bilan2.section_2_budget_calorique?.total_consomme || 0) - 
                    (bilan1.section_2_budget_calorique?.total_consomme || 0)
                  ).emoji}
                </div>

                <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
                    {getNomMois(bilan2.mois)} {bilan2.annee}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#764ba2' }}>
                    {bilan2.section_2_budget_calorique?.total_consomme?.toFixed(0) || 0} kcal
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '5px' }}>
                    Moyenne: {bilan2.section_2_budget_calorique?.moyenne_jour || 0} kcal/j
                  </div>
                </div>
              </div>

              {(() => {
                const evo = getEvolution(
                  bilan1.section_2_budget_calorique?.total_consomme,
                  bilan2.section_2_budget_calorique?.total_consomme
                );
                return evo && (
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    background: evo.diff < 0 ? '#e8f5e9' : '#fff3e0',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    {evo.diff < 0 ? '✅' : '⚠️'} Évolution: {evo.diff > 0 ? '+' : ''}{evo.diff.toFixed(0)} kcal ({evo.pourcent > 0 ? '+' : ''}{evo.pourcent}%)
                  </div>
                );
              })()}
            </div>

            {/* Section 3 - Patterns */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '20px',
              border: '2px solid #e0e0e0'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.5rem' }}>
                📊 Conformité & Patterns
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px', textAlign: 'center' }}>
                    {getNomMois(bilan1.mois)} {bilan1.annee}
                  </div>
                  <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea' }}>
                      {bilan1.section_3_patterns?.taux_conformite?.toFixed(1) || 0}%
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                      {bilan1.section_3_patterns?.jours_conformes || 0} jours conformes
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px', textAlign: 'center' }}>
                    {getNomMois(bilan2.mois)} {bilan2.annee}
                  </div>
                  <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#764ba2' }}>
                      {bilan2.section_3_patterns?.taux_conformite?.toFixed(1) || 0}%
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                      {bilan2.section_3_patterns?.jours_conformes || 0} jours conformes
                    </div>
                  </div>
                </div>
              </div>

              {(() => {
                const evo = getEvolution(
                  bilan1.section_3_patterns?.taux_conformite,
                  bilan2.section_3_patterns?.taux_conformite
                );
                return evo && (
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    background: evo.diff > 0 ? '#e8f5e9' : '#ffebee',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    {evo.diff > 0 ? '✅' : '⚠️'} Évolution: {evo.diff > 0 ? '+' : ''}{evo.diff.toFixed(1)} points ({evo.pourcent > 0 ? '+' : ''}{evo.pourcent}%)
                  </div>
                );
              })()}
            </div>

            {/* Section 4 - Qualité Nutritionnelle */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '20px',
              border: '2px solid #e0e0e0'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.5rem' }}>
                🥗 Qualité Nutritionnelle
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
                    {getNomMois(bilan1.mois)} {bilan1.annee}
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea' }}>
                    {bilan1.section_4_qualite_nutritionnelle?.score_qualite || 0}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '5px' }}>Score / 100</div>
                </div>

                <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
                    {getNomMois(bilan2.mois)} {bilan2.annee}
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#764ba2' }}>
                    {bilan2.section_4_qualite_nutritionnelle?.score_qualite || 0}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '5px' }}>Score / 100</div>
                </div>
              </div>
            </div>

            {/* Section 5 - Bien-être */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '20px',
              border: '2px solid #e0e0e0'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.5rem' }}>
                😊 Bien-être & Ressentis
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Satiété P1</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#667eea' }}>
                    {bilan1.section_5_bien_etre?.moyenne_satiete?.toFixed(1) || 0}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Humeur P1</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#667eea' }}>
                    {bilan1.section_5_bien_etre?.moyenne_humeur?.toFixed(1) || 0}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Satiété P2</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#764ba2' }}>
                    {bilan2.section_5_bien_etre?.moyenne_satiete?.toFixed(1) || 0}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Humeur P2</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#764ba2' }}>
                    {bilan2.section_5_bien_etre?.moyenne_humeur?.toFixed(1) || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              padding: '25px',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 15px 0' }}>📈 Résumé de l'évolution</h3>
              <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.95 }}>
                Comparez vos progrès et identifiez les axes d'amélioration !
              </p>
            </div>
          </div>
        ) : periode1 && periode2 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
            <p>Sélectionnez deux périodes pour voir la comparaison</p>
          </div>
        ) : null}

        {/* Footer */}
        <div style={{
          padding: '20px 30px',
          borderTop: '2px solid #eee',
          textAlign: 'right'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 30px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Fermer
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
