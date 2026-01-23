import React, { useState, useEffect } from 'react';
import { calculerSection1TendancePoids, calculerSection2BudgetCalorique, calculerSection3Patterns, calculerSection4QualiteNutritionnelle, calculerSection5BienEtre, calculerSection6Projection, genererBilanCompletMensuel } from '../lib/calculsBilanMensuel';
import { supabase } from '../lib/supabaseClient';
import { calculerProfilComplet } from '../lib/routeurPoids';

/**
 * Composant Section1TendancePoids
 * Affiche l'évolution du poids sur le mois
 */
function Section1TendancePoids({ data }) {
  if (data?.erreur === 'donnees_insuffisantes') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: '1rem' }}>⚖️</div>
        <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Pas encore assez de données</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: 15 }}>
          {data.nb_pesees === 0 
            ? "Aucune pesée enregistrée ce mois-ci"
            : `Une pesée supplémentaire est nécessaire pour calculer ta tendance`}
        </p>
        
        {/* Cas 1 pesée avec projection : Analyse comparative */}
        {data.pesee_unique && data.projection_precedente ? (
          <>
            {/* Cartes comparatives côte à côte */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, background: '#f0f9ff', padding: '1rem', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: 12, color: '#0369a1', marginBottom: 4 }}>📈 Projection</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0284c7' }}>
                  {data.projection_precedente} kg
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Mois dernier</div>
              </div>
              <div style={{ flex: 1, background: '#f1f5f9', padding: '1rem', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>⚖️ Poids actuel</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b' }}>
                  {data.pesee_unique} kg
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Ce mois</div>
              </div>
            </div>
            
            {/* Mini-analyse de l'écart */}
            {(() => {
              const ecart = data.pesee_unique - data.projection_precedente;
              const ecartAbs = Math.abs(ecart);
              let emoji, message, bgColor, borderColor, textColor;
              
              if (ecart <= -0.5) {
                emoji = '💪';
                message = `Excellent ! Tu es en avance de ${ecartAbs.toFixed(1)} kg sur la projection !`;
                bgColor = '#f0fdf4';
                borderColor = '#86efac';
                textColor = '#166534';
              } else if (ecart <= 0) {
                emoji = '🎯';
                message = `Super ! Tu es pile sur la projection (${ecartAbs.toFixed(1)} kg d'avance) !`;
                bgColor = '#f0fdf4';
                borderColor = '#86efac';
                textColor = '#166534';
              } else if (ecart <= 0.5) {
                emoji = '👍';
                message = `Bon suivi ! Tu es proche de la projection (+${ecart.toFixed(1)} kg)`;
                bgColor = '#fffbeb';
                borderColor = '#fde047';
                textColor = '#92400e';
              } else {
                emoji = '⚠️';
                message = `Attention : léger écart avec la projection (+${ecart.toFixed(1)} kg)`;
                bgColor = '#fef2f2';
                borderColor = '#fca5a5';
                textColor = '#991b1b';
              }
              
              return (
                <div style={{ background: bgColor, padding: '1rem', borderRadius: 8, marginBottom: '1rem', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: 14, color: textColor, fontWeight: 600, lineHeight: 1.5 }}>
                    {emoji} {message}
                  </div>
                </div>
              );
            })()}
            
            {/* Encouragement pour 2e pesée */}
            <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: 8, marginBottom: '1.5rem', border: '1px solid #fde047' }}>
              <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.4 }}>
                📊 <strong>Pèse-toi une 2e fois</strong> ce mois pour confirmer la tendance et obtenir une analyse complète avec graphique !
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Cas 1 pesée SANS projection */}
            {data.pesee_unique && (
              <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Poids actuel</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1e293b' }}>
                  {data.pesee_unique} kg
                </div>
              </div>
            )}
            
            {/* Projection seule (0 pesée) */}
            {!data.pesee_unique && data.projection_precedente && (
              <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: 12, color: '#0369a1', marginBottom: 4 }}>📈 Projection du mois précédent</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0284c7' }}>
                  {data.projection_precedente} kg
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Basé sur ta tendance du mois dernier
                </div>
              </div>
            )}
            
            {/* Dernier poids connu (ancien) - Si 0 pesée ce mois */}
            {data.nb_pesees === 0 && data.dernier_poids_connu && (
              <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: 12, color: '#991b1b', marginBottom: 4 }}>📅 Dernier poids connu</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }}>
                  {data.dernier_poids_connu.poids} kg
                </div>
                <div style={{ fontSize: 11, color: '#991b1b', marginTop: 6, lineHeight: 1.4 }}>
                  ⚠️ Donnée de {new Date(data.dernier_poids_connu.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  {data.dernier_poids_connu.anciennete_mois > 0 && ` (${data.dernier_poids_connu.anciennete_mois} mois)`}
                  <div style={{ marginTop: 4, fontWeight: 600 }}>Ces données ne sont plus fiables</div>
                </div>
              </div>
            )}
            
            {/* Message encourageant (0 pesée) */}
            {data.nb_pesees === 0 && (
              <div style={{ background: '#fefce8', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', border: '1px solid #fde047' }}>
                <div style={{ fontSize: 14, color: '#854d0e', lineHeight: 1.5 }}>
                  💡 <strong>Conseil :</strong> Pèse-toi au moins 2 fois par mois pour suivre ta progression
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Bouton CTA */}
        <button 
          onClick={() => window.location.href = '/suivi-poids'}
          style={{ 
            background: '#10b981', 
            color: 'white',
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#059669'}
          onMouseOut={(e) => e.target.style.background = '#10b981'}
        >
          📊 {data.nb_pesees === 0 ? 'Saisir ma première pesée' : 'Ajouter une pesée'}
        </button>
      </div>
    );
  }

  const {
    poids_debut,
    poids_fin,
    evolution_kg,
    evolution_pourcent,
    trajectoire,
    emoji_trajectoire,
    couleur_trajectoire,
    poids_mois_prochain,
    poids_moyen,
    poids_min,
    poids_max,
    amplitude,
    nb_pesees,
    courbe_poids
  } = data;

  // Message selon trajectoire
  const getMessageTrajectoire = () => {
    switch (trajectoire) {
      case 'excellente':
        return 'Excellente progression ! Tu as perdu plus de 2 kg ce mois-ci. Continue comme ça ! 💪';
      case 'bonne':
        return 'Très bonne progression ! La perte de poids est régulière et saine. 👏';
      case 'stable_positive':
        return 'Bonne stabilité ! Tu maintiens une légère perte de poids. 👍';
      case 'stable':
        return 'Ton poids est stable ce mois-ci. Analyse les autres sections pour identifier des axes d\'amélioration.';
      case 'attention':
        return 'Petite prise de poids ce mois-ci. Vérifie la section Budget calorique pour ajuster. ⚠️';
      case 'difficile':
        return 'Prise de poids significative. Il est temps de revoir ton budget et tes extras. 🔴';
      case 'critique':
        return 'Prise de poids importante. Revois ton plan alimentaire avec attention. 🚨';
      default:
        return '';
    }
  };

  return (
    <div>
      <style jsx>{`
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: #f9fafb;
          border-radius: 10px;
          padding: 18px;
          border: 2px solid #e5e7eb;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-sub {
          font-size: 13px;
          color: #64748b;
        }

        .trajectoire-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border: 2px solid #e2e8f0;
          text-align: center;
        }

        .trajectoire-emoji {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .trajectoire-label {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .trajectoire-message {
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
        }

        .courbe-container {
          background: white;
          border-radius: 10px;
          padding: 20px;
          border: 2px solid #e5e7eb;
          margin-top: 20px;
        }

        .courbe-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 15px;
        }

        .courbe-wrapper {
          position: relative;
          height: 200px;
          border-left: 2px solid #cbd5e1;
          border-bottom: 2px solid #cbd5e1;
          margin: 20px 10px 30px 40px;
        }

        .courbe-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          top: 0;
        }

        .courbe-point {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #667eea;
          border-radius: 50%;
          transform: translate(-50%, 50%);
          cursor: pointer;
          transition: all 0.2s;
        }

        .courbe-point:hover {
          width: 14px;
          height: 14px;
          background: #5568d3;
        }

        .courbe-y-axis {
          position: absolute;
          left: -35px;
          font-size: 11px;
          color: #64748b;
        }

        .courbe-x-label {
          position: absolute;
          bottom: -25px;
          font-size: 11px;
          color: #64748b;
          transform: translateX(-50%);
        }

        @media (max-width: 768px) {
          .stat-grid {
            grid-template-columns: 1fr;
          }

          .courbe-wrapper {
            height: 150px;
            margin: 15px 5px 25px 35px;
          }
        }
      `}</style>

      {/* Trajectoire principale */}
      <div className="trajectoire-card" style={{ borderColor: couleur_trajectoire }}>
        <div className="trajectoire-emoji">{emoji_trajectoire}</div>
        <div className="trajectoire-label" style={{ color: couleur_trajectoire }}>
          {trajectoire.toUpperCase().replace('_', ' ')}
        </div>
        <div className="trajectoire-message">{getMessageTrajectoire()}</div>
      </div>

      {/* Statistiques principales */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Poids début</div>
          <div className="stat-value" style={{ color: '#64748b' }}>
            {poids_debut} kg
          </div>
          <div className="stat-sub">{data.date_debut}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Poids fin</div>
          <div className="stat-value" style={{ color: '#64748b' }}>
            {poids_fin} kg
          </div>
          <div className="stat-sub">{data.date_fin}</div>
        </div>

        <div className="stat-card" style={{ borderColor: couleur_trajectoire }}>
          <div className="stat-label">Évolution</div>
          <div className="stat-value" style={{ color: couleur_trajectoire }}>
            {evolution_kg > 0 ? '+' : ''}{evolution_kg} kg
          </div>
          <div className="stat-sub">
            {evolution_pourcent > 0 ? '+' : ''}{evolution_pourcent}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Projection mois prochain</div>
          <div className="stat-value" style={{ color: '#667eea' }}>
            {poids_mois_prochain} kg
          </div>
          <div className="stat-sub">Basé sur tendance actuelle</div>
        </div>
      </div>

      {/* Statistiques secondaires */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Poids moyen</div>
          <div className="stat-value" style={{ color: '#64748b', fontSize: '22px' }}>
            {poids_moyen} kg
          </div>
          <div className="stat-sub">{nb_pesees} pesées</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Amplitude</div>
          <div className="stat-value" style={{ color: '#64748b', fontSize: '22px' }}>
            {amplitude} kg
          </div>
          <div className="stat-sub">Min: {poids_min} kg | Max: {poids_max} kg</div>
        </div>
      </div>

      {/* Courbe d'évolution */}
      {courbe_poids && courbe_poids.length > 0 && (
        <div className="courbe-container">
          <div className="courbe-title">📈 Évolution du poids sur le mois</div>
          <div className="courbe-wrapper">
            {/* Axe Y (poids) */}
            <div className="courbe-y-axis" style={{ top: '0%' }}>
              {poids_max.toFixed(1)}
            </div>
            <div className="courbe-y-axis" style={{ top: '50%' }}>
              {((poids_max + poids_min) / 2).toFixed(1)}
            </div>
            <div className="courbe-y-axis" style={{ top: '100%' }}>
              {poids_min.toFixed(1)}
            </div>

            {/* Points de la courbe */}
            <div className="courbe-line">
              {courbe_poids.map((point, index) => {
                const xPercent = (index / (courbe_poids.length - 1)) * 100;
                const yPercent = ((poids_max - point.poids) / (poids_max - poids_min)) * 100;
                
                return (
                  <React.Fragment key={index}>
                    <div
                      className="courbe-point"
                      style={{
                        left: `${xPercent}%`,
                        bottom: `${yPercent}%`
                      }}
                      title={`${point.date}: ${point.poids} kg`}
                    />
                    {/* Labels axe X (première, milieu, dernière date) */}
                    {(index === 0 || index === Math.floor(courbe_poids.length / 2) || index === courbe_poids.length - 1) && (
                      <div className="courbe-x-label" style={{ left: `${xPercent}%` }}>
                        {new Date(point.date).getDate()}/{new Date(point.date).getMonth() + 1}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              
              {/* Ligne reliant les points */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none'
                }}
              >
                <polyline
                  points={courbe_poids.map((point, index) => {
                    const x = (index / (courbe_poids.length - 1)) * 100;
                    const y = ((poids_max - point.poids) / (poids_max - poids_min)) * 100;
                    return `${x}%,${y}%`;
                  }).join(' ')}
                  fill="none"
                  stroke="#667eea"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Section2BudgetCalorique - Budget calorique et répartition
 * Affiche le budget total consommé vs objectif, la répartition par type de repas
 * et la répartition des extras par moment de la journée
 */
function Section2BudgetCalorique({ data }) {
  // Log au début du composant
  console.log('[SECTION2 COMPOSANT] Rendu Section2BudgetCalorique');
  console.log('[SECTION2 COMPOSANT] Données reçues:', data);
  console.log('[SECTION2 COMPOSANT] Type de data:', typeof data);
  
  if (!data || data.erreur === 'aucun_repas') {
    console.log('[SECTION2 COMPOSANT] Affichage du fallback: aucun repas');
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🍽️</div>
        <div style={{ marginTop: '0.5rem', fontSize: 16, color: '#6b7280' }}>
          Aucun repas enregistré ce mois-ci
        </div>
      </div>
    );
  }

  // Log de confirmation: on a des données valides
  console.log('[SECTION2 COMPOSANT] Données valides, rendu complet');

  const {
    total_consomme,
    budget_mensuel,
    ecart_budget,
    ecart_pourcent,
    moyenne_jour,
    repartition_repas,
    repartition_extras,
    nb_jours_saisis,
    nb_jours_total,
    nb_extras,
    extras_moyens_jour,
    nb_repas_total
  } = data;

  console.log('[SECTION2 COMPOSANT] Données destructurées:', {
    total_consomme,
    budget_mensuel,
    nb_repas: repartition_repas?.length,
    nb_extras
  });

  // Fonction pour déterminer la couleur selon l'écart
  const getEcartColor = (pourcent) => {
    if (Math.abs(pourcent) <= 5) return '#10b981'; // Vert (dans l'objectif ±5%)
    if (pourcent > 0) return '#f59e0b'; // Orange (dépassement)
    return '#0ea5e9'; // Bleu (sous-consommation)
  };

  const ecartColor = getEcartColor(ecart_pourcent);
  const pourcentageGauge = Math.min((total_consomme / budget_mensuel) * 100, 100);

  // Log des valeurs calculées pour l'affichage
  console.log('[SECTION2 COMPOSANT] Valeurs affichage:', {
    total_consomme,
    budget_mensuel,
    ecart_pourcent,
    pourcentageGauge,
    ecartColor,
    nb_repas: repartition_repas?.length,
    nb_extras
  });

  // Labels et couleurs pour les types de repas
  const repasLabels = {
    'Petit-déjeuner': '🌅 Petit-déjeuner',
    'Déjeuner': '☀️ Déjeuner',
    'Dîner': '🌙 Dîner',
    'Collation': '🍎 Collation'
  };

  const repasColors = {
    'Petit-déjeuner': '#fbbf24',
    'Déjeuner': '#60a5fa',
    'Dîner': '#a78bfa',
    'Collation': '#34d399'
  };

  // Labels pour les moments d'extras
  const momentLabels = {
    matin: '🌅 Matin',
    apres_midi: '☀️ Après-midi',
    soir: '🌙 Soir'
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Jauge du budget calorique */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
            Budget calorique mensuel
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: ecartColor }}>
            {ecart_budget >= 0 ? '+' : ''}{Math.round(ecart_budget)} kcal ({ecart_pourcent >= 0 ? '+' : ''}{ecart_pourcent.toFixed(1)}%)
          </span>
        </div>

        {/* Barre de progression */}
        <div style={{ 
          width: '100%', 
          height: 24, 
          background: '#e5e7eb', 
          borderRadius: 12, 
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ 
            width: `${pourcentageGauge}%`, 
            height: '100%', 
            background: ecartColor,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Légende */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: 13, color: '#6b7280' }}>
          <span>{Math.round(total_consomme).toLocaleString()} kcal consommées</span>
          <span>Objectif: {Math.round(budget_mensuel).toLocaleString()} kcal</span>
        </div>
      </div>

      {/* 2. Moyenne journalière */}
      <div style={{ 
        background: '#f9fafb', 
        border: '1px solid #e5e7eb', 
        borderRadius: 12, 
        padding: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: '0.25rem' }}>
          Moyenne journalière
        </div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#111827' }}>
          {Math.round(moyenne_jour).toLocaleString()} kcal/jour
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: '0.25rem' }}>
          Sur {nb_jours_saisis} jours saisis / {nb_jours_total} jours au total
        </div>
      </div>

      {/* 3. Répartition par type de repas */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>
          Répartition par type de repas
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {repartition_repas.map(({ type, total, pourcent, nb_repas }) => (
            <div key={type}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: 13, color: '#4b5563' }}>
                  {repasLabels[type]} ({nb_repas})
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                  {Math.round(total).toLocaleString()} kcal ({pourcent.toFixed(0)}%)
                </span>
              </div>

              {/* Barre horizontale */}
              <div style={{ 
                width: '100%', 
                height: 8, 
                background: '#e5e7eb', 
                borderRadius: 4, 
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${pourcent}%`, 
                  height: '100%', 
                  background: repasColors[type],
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Répartition des extras par moment */}
      {nb_extras > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>
            Répartition des extras ({nb_extras} extras • {extras_moyens_jour.toFixed(1)} par jour)
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {repartition_extras.map(({ moment, count, pourcent }) => (
              <div 
                key={moment}
                style={{ 
                  flex: 1,
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  padding: '0.75rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
                  {momentLabels[moment]}
                </div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#78350f', marginTop: '0.25rem' }}>
                  {count}
                </div>
                <div style={{ fontSize: 12, color: '#92400e' }}>
                  {pourcent.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>

          {/* Alerte si plus de 50% des extras sont l'après-midi */}
          {repartition_extras[1]?.pourcent > 50 && (
            <div style={{ 
              marginTop: '1rem',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 8,
              padding: '0.75rem',
              fontSize: 13,
              color: '#991b1b'
            }}>
              ⚠️ Plus de la moitié de tes extras sont pris l'après-midi. Essaie de les répartir ou de les limiter !
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Section3PatternsComportementaux - Analyse des patterns
 * Affiche la conformité, les points forts/faibles, et les insights temporels
 */
function Section3PatternsComportementaux({ data }) {
  console.log('[SECTION3 COMPOSANT] Rendu Section3PatternsComportementaux');
  console.log('[SECTION3 COMPOSANT] Data reçue:', data);
  
  if (!data || data.erreur === 'aucun_repas') {
    console.log('[SECTION3 COMPOSANT] Affichage fallback: aucun repas');
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>📊</div>
        <div style={{ marginTop: '0.5rem', fontSize: 16, color: '#6b7280' }}>
          Pas assez de données pour analyser les patterns
        </div>
      </div>
    );
  }

  const {
    jours_conformes,
    jours_depasses,
    jours_sous_objectif,
    taux_conformite,
    points_forts,
    points_amelioration,
    insights_temporels,
    nb_jours_analyses
  } = data;

  // Couleur selon le taux de conformité
  const getConformiteColor = (taux) => {
    if (taux >= 80) return '#10b981'; // Vert
    if (taux >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Rouge
  };

  const conformiteColor = getConformiteColor(taux_conformite);

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Encadré d'explication */}
      <div style={{ 
        background: '#f0f9ff', 
        border: '1px solid #bae6fd', 
        borderRadius: 8, 
        padding: '1rem',
        fontSize: 13,
        color: '#0c4a6e'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📘 Comment lire cette section ?</div>
        <div style={{ lineHeight: 1.6 }}>
          Un jour est <strong>conforme</strong> quand tu consommes entre 1710 et 2090 kcal (±10% de ton objectif).
          <br/>Cette marge permet une flexibilité naturelle tout en respectant ton budget global.
        </div>
      </div>

      {/* 1. Bilan de conformité */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>
          Conformité mensuelle
        </div>

        {/* Jauge de conformité */}
        <div style={{ 
          background: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          borderRadius: 12, 
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: conformiteColor }}>
            {Math.round(taux_conformite)}%
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: '0.5rem' }}>
            des jours dans l'objectif
          </div>
          
          {/* Badge de performance */}
          <div style={{ 
            display: 'inline-block',
            marginTop: '0.75rem',
            padding: '0.5rem 1rem',
            background: taux_conformite >= 80 ? '#dcfce7' : taux_conformite >= 60 ? '#fef3c7' : '#fee2e2',
            color: taux_conformite >= 80 ? '#166534' : taux_conformite >= 60 ? '#92400e' : '#991b1b',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600
          }}>
            {taux_conformite >= 80 ? '🎉 Excellent' : taux_conformite >= 60 ? '👍 Bien' : '💪 À améliorer'}
          </div>

          {/* Détail jours */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem', 
            marginTop: '1.5rem',
            fontSize: 13
          }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>
                {jours_conformes}
              </div>
              <div style={{ color: '#6b7280' }}>✅ Conformes</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: '0.25rem' }}>
                (1710-2090 kcal)
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444' }}>
                {jours_depasses}
              </div>
              <div style={{ color: '#6b7280' }}>⚠️ Dépassés</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: '0.25rem' }}>
                (&gt;2090 kcal)
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0ea5e9' }}>
                {jours_sous_objectif}
              </div>
              <div style={{ color: '#6b7280' }}>📉 Sous-objectif</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: '0.25rem' }}>
                (&lt;1710 kcal)
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: '1rem' }}>
            Sur {nb_jours_analyses} jours analysés
          </div>
        </div>
      </div>

      {/* 2. Points forts */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
          💪 Points forts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {points_forts.map((point, idx) => (
            <div 
              key={idx}
              style={{ 
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: 8,
                padding: '0.75rem',
                fontSize: 14,
                color: '#166534',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: 16 }}>✅</span>
              <span style={{ flex: 1 }}>{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Points d'amélioration */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
          🎯 Points d'amélioration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {points_amelioration.map((point, idx) => (
            <div 
              key={idx}
              style={{ 
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '0.75rem',
                fontSize: 14,
                color: '#92400e',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: 16 }}>💡</span>
              <span style={{ flex: 1 }}>{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Insights temporels (weekend vs semaine) */}
      {insights_temporels && insights_temporels.jours_weekend > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            📅 Weekend vs Semaine
          </div>
          
          {/* Sous-titre explicatif */}
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: '1rem' }}>
            Comparaison de tes moyennes caloriques entre jours de semaine et weekend
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {/* Carte semaine */}
            <div style={{ 
              flex: 1,
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 8,
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 13, color: '#0c4a6e', fontWeight: 600 }}>
                📆 Semaine
              </div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0284c7', marginTop: '0.5rem' }}>
                {insights_temporels.moyenne_semaine} kcal
              </div>
              <div style={{ fontSize: 12, color: '#0369a1', marginTop: '0.25rem' }}>
                Moyenne sur {insights_temporels.jours_semaine} jours
              </div>
              
              {/* Indicateur écart vs objectif */}
              <div style={{ 
                fontSize: 11, 
                color: '#0369a1', 
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                {insights_temporels.moyenne_semaine < 1900 ? '⬇️' : '⬆️'} 
                {' '}{Math.abs(insights_temporels.moyenne_semaine - 1900)} kcal vs objectif
              </div>
            </div>

            {/* Carte weekend */}
            <div style={{ 
              flex: 1,
              background: '#fefce8',
              border: '1px solid #fde047',
              borderRadius: 8,
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 13, color: '#713f12', fontWeight: 600 }}>
                🎉 Weekend
              </div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ca8a04', marginTop: '0.5rem' }}>
                {insights_temporels.moyenne_weekend} kcal
              </div>
              <div style={{ fontSize: 12, color: '#a16207', marginTop: '0.25rem' }}>
                Moyenne sur {insights_temporels.jours_weekend} jours
              </div>
              
              {/* Indicateur écart vs objectif */}
              <div style={{ 
                fontSize: 11, 
                color: '#a16207', 
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                {insights_temporels.moyenne_weekend < 1900 ? '⬇️' : '⬆️'} 
                {' '}{Math.abs(insights_temporels.moyenne_weekend - 1900)} kcal vs objectif
              </div>
            </div>
          </div>

          {/* Écart weekend/semaine avec contexte */}
          {Math.abs(insights_temporels.ecart_weekend_semaine) > 100 && (
            <div style={{ 
              marginTop: '1rem',
              background: insights_temporels.ecart_weekend_semaine > 0 ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${insights_temporels.ecart_weekend_semaine > 0 ? '#fca5a5' : '#86efac'}`,
              borderRadius: 8,
              padding: '0.75rem',
              fontSize: 13,
              color: insights_temporels.ecart_weekend_semaine > 0 ? '#991b1b' : '#166534'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                {insights_temporels.ecart_weekend_semaine > 0 ? '⚠️ Écart significatif détecté' : '✅ Bonne cohérence'}
              </div>
              <div>
                Le weekend, tu consommes en moyenne {insights_temporels.ecart_weekend_semaine > 0 ? '+' : ''}
                {insights_temporels.ecart_weekend_semaine} kcal/jour 
                {' '}({Math.abs(Math.round((insights_temporels.ecart_weekend_semaine / 1900) * 100))}% de ton objectif).
                {insights_temporels.ecart_weekend_semaine > 200 && 
                  ' Essaie de réduire cet écart pour plus de régularité.'
                }
              </div>
            </div>
          )}
          
          {/* Conseil si écart faible */}
          {Math.abs(insights_temporels.ecart_weekend_semaine) <= 100 && (
            <div style={{ 
              marginTop: '1rem',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 8,
              padding: '0.75rem',
              fontSize: 13,
              color: '#166534',
              textAlign: 'center'
            }}>
              ✅ Excellente régularité ! Ton alimentation est cohérente en semaine comme le weekend.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Section4QualiteNutritionnelle - Analyse de la qualité alimentaire
 * Affiche la répartition des catégories, le score qualité, et les recommandations
 */
function Section4QualiteNutritionnelle({ data }) {
  console.log('[SECTION4 COMPOSANT] Rendu Section4QualiteNutritionnelle');
  console.log('[SECTION4 COMPOSANT] Data reçue:', data);
  
  if (!data || data.erreur === 'aucun_repas') {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🥗</div>
        <div style={{ marginTop: '0.5rem', fontSize: 16, color: '#6b7280' }}>
          Pas assez de données pour analyser la qualité nutritionnelle
        </div>
      </div>
    );
  }

  const {
    repartition_categories,
    nb_fast_food,
    fast_food_par_semaine,
    score_qualite,
    points_attention,
    points_positifs,
    nb_repas_total
  } = data;

  // Couleur du score
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const scoreColor = getScoreColor(score_qualite);

  // Couleurs des catégories
  const categorieColors = {
    'protéine': '#f472b6',
    'féculent': '#fbbf24',
    'légume': '#34d399',
    'fruit': '#fb923c',
    'extra': '#ef4444',
    'autre': '#9ca3af'
  };

  const categorieEmojis = {
    'protéine': '🍗',
    'féculent': '🍞',
    'légume': '🥦',
    'fruit': '🍎',
    'extra': '🍰',
    'autre': '🍽️'
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Score de qualité globale */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>
          Score de qualité nutritionnelle
        </div>

        <div style={{ 
          background: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          borderRadius: 12, 
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 52, fontWeight: 'bold', color: scoreColor }}>
            {score_qualite}/100
          </div>
          <div style={{ 
            display: 'inline-block',
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            background: score_qualite >= 80 ? '#dcfce7' : score_qualite >= 60 ? '#fef3c7' : '#fee2e2',
            color: score_qualite >= 80 ? '#166534' : score_qualite >= 60 ? '#92400e' : '#991b1b',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600
          }}>
            {score_qualite >= 80 ? '🌟 Excellent' : score_qualite >= 60 ? '👍 Correct' : '💪 À améliorer'}
          </div>

          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: '0.75rem' }}>
            Basé sur {nb_repas_total} repas analysés
          </div>
        </div>
      </div>

      {/* Répartition des catégories */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>
          Répartition des catégories alimentaires
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {repartition_categories.map(({ categorie, nombre, pourcent }) => (
            <div 
              key={categorie}
              style={{ 
                flex: '1 1 calc(33% - 0.5rem)',
                minWidth: '140px',
                background: '#fff',
                border: `2px solid ${categorieColors[categorie] || '#e5e7eb'}`,
                borderRadius: 8,
                padding: '0.75rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 24, marginBottom: '0.25rem' }}>
                {categorieEmojis[categorie] || '🍽️'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'capitalize', fontWeight: 600 }}>
                {categorie}
              </div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: '0.25rem' }}>
                {pourcent}%
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                ({nombre} repas)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fast-food */}
      {nb_fast_food > 0 && (
        <div style={{ 
          background: fast_food_par_semaine > 1 ? '#fef2f2' : '#f0f9ff',
          border: `1px solid ${fast_food_par_semaine > 1 ? '#fca5a5' : '#bae6fd'}`,
          borderRadius: 8,
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: 32 }}>🍔</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                Fast-food ce mois-ci
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: '0.25rem' }}>
                {nb_fast_food} repas • {fast_food_par_semaine.toFixed(1)} par semaine
              </div>
            </div>
            <div style={{ 
              fontSize: 24, 
              color: fast_food_par_semaine > 1 ? '#ef4444' : '#10b981'
            }}>
              {fast_food_par_semaine > 1 ? '⚠️' : '✅'}
            </div>
          </div>
        </div>
      )}

      {/* Points positifs */}
      {points_positifs.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            🌟 Points forts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {points_positifs.map((point, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 8,
                  padding: '0.75rem',
                  fontSize: 13,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: 16 }}>✅</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points d'attention */}
      {points_attention.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            💡 Recommandations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {points_attention.map((point, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  padding: '0.75rem',
                  fontSize: 13,
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>📌</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Section5BienEtre - Analyse du bien-être et des ressentis
 * Affiche moyennes satiété/humeur, distributions, semaines critiques
 */
function Section5BienEtre({ data }) {
  console.log('[SECTION5 COMPOSANT] Rendu Section5BienEtre');
  console.log('[SECTION5 COMPOSANT] Data reçue:', data);
  
  if (!data || data.erreur === 'aucun_repas') {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>😊</div>
        <div style={{ marginTop: '0.5rem', fontSize: 16, color: '#6b7280' }}>
          Pas de données de ressenti ce mois-ci
        </div>
      </div>
    );
  }

  const {
    moyenne_satiete,
    moyenne_humeur,
    distribution_satiete,
    distribution_humeur,
    nb_repas_satiete,
    nb_repas_ressenti,
    jours_excellents,
    semaines_critiques,
    points_positifs,
    points_amelioration,
    analyse_depassements,
    insights_depassements,
    analyse_humeur_negative,
    insights_humeur_negative,
    matrice_croisee,
    insights_matrice
  } = data;

  // Couleurs des scores
  const getScoreColor = (score) => {
    if (score >= 4) return '#10b981';
    if (score >= 3) return '#f59e0b';
    return '#ef4444';
  };

  const satColor = getScoreColor(moyenne_satiete);
  const humColor = getScoreColor(moyenne_humeur);

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Scores moyens */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Satiété */}
        <div style={{ 
          background: '#f9fafb', 
          border: `2px solid ${satColor}`, 
          borderRadius: 12, 
          padding: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>
            🍽️ Satiété
          </div>
          <div style={{ fontSize: 42, fontWeight: 'bold', color: satColor }}>
            {moyenne_satiete}
          </div>
          <div style={{ fontSize: 18, color: '#9ca3af' }}>/5</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: '0.5rem' }}>
            {nb_repas_satiete} repas
          </div>
        </div>

        {/* Humeur */}
        <div style={{ 
          background: '#f9fafb', 
          border: `2px solid ${humColor}`, 
          borderRadius: 12, 
          padding: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>
            😊 Humeur
          </div>
          <div style={{ fontSize: 42, fontWeight: 'bold', color: humColor }}>
            {moyenne_humeur}
          </div>
          <div style={{ fontSize: 18, color: '#9ca3af' }}>/5</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: '0.5rem' }}>
            {nb_repas_ressenti} repas
          </div>
        </div>
      </div>

      {/* Jours excellents */}
      {jours_excellents > 0 && (
        <div style={{ 
          background: '#f0fdf4',
          border: '2px solid #86efac',
          borderRadius: 12,
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 32 }}>🌟</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#166534', marginTop: '0.5rem' }}>
            {jours_excellents} jour(s) excellent(s) !
          </div>
          <div style={{ fontSize: 13, color: '#15803d' }}>
            Satiété respectée ET humeur positive
          </div>
        </div>
      )}

      {/* Distributions */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
          Répartition des ressentis
        </div>
        <div style={{ 
          fontSize: 12, 
          color: '#6b7280', 
          background: '#f9fafb', 
          padding: '0.5rem', 
          borderRadius: 6,
          marginBottom: '1rem'
        }}>
          <strong>Légende scores :</strong> 1 = Très négatif • 2 = Faible • 3 = Moyen • 4 = Bon • 5 = Excellent
        </div>
        
        {/* Distribution satiété - NOUVEAU VISUEL CARTES */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>
            🍽️ <strong>Satiété</strong> (1=ballonné/regret, 2=dépassé, 3=sans faim, 5=rassasié)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
            {[
              { score: '1', emoji: '🤢', label: 'Ballonné', color: '#fee2e2', border: '#fecaca', text: '#991b1b' },
              { score: '2', emoji: '😣', label: 'Dépassé', color: '#ffedd5', border: '#fed7aa', text: '#92400e' },
              { score: '3', emoji: '😐', label: 'Sans faim', color: '#fef3c7', border: '#fde68a', text: '#92400e' },
              { score: '4', emoji: '🙂', label: 'Bien', color: '#d1fae5', border: '#a7f3d0', text: '#065f46' },
              { score: '5', emoji: '😊', label: 'Rassasié', color: '#d1fae5', border: '#6ee7b7', text: '#065f46' }
            ].map(({ score, emoji, label, color, border, text }) => {
              const count = distribution_satiete[score] || 0;
              const total = Object.values(distribution_satiete).reduce((s, v) => s + v, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              
              return (
                <div 
                  key={score}
                  style={{ 
                    background: count > 0 ? color : '#f9fafb',
                    border: `2px solid ${count > 0 ? border : '#e5e7eb'}`,
                    borderRadius: 8,
                    padding: '0.75rem 0.5rem',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: '0.25rem' }}>{emoji}</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: count > 0 ? text : '#9ca3af' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: 10, color: count > 0 ? text : '#9ca3af', marginTop: '0.25rem' }}>
                    {label}
                  </div>
                  {count > 0 && (
                    <div style={{ fontSize: 11, fontWeight: 600, color: text, marginTop: '0.25rem' }}>
                      {pct}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution humeur - NOUVEAU VISUEL CARTES */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>
            😊 <strong>Humeur</strong> (1=ballonné/culpabilité, 2=lourd, 3=neutre, 4=j'assume, 5=léger/satisfait)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
            {[
              { score: '1', emoji: '😰', label: 'Culpabilité', color: '#fee2e2', border: '#fecaca', text: '#991b1b' },
              { score: '2', emoji: '😑', label: 'Lourd', color: '#ffedd5', border: '#fed7aa', text: '#92400e' },
              { score: '3', emoji: '😐', label: 'Neutre', color: '#fef3c7', border: '#fde68a', text: '#92400e' },
              { score: '4', emoji: '💪', label: 'J\'assume', color: '#d1fae5', border: '#a7f3d0', text: '#065f46' },
              { score: '5', emoji: '🌱', label: 'Léger', color: '#d1fae5', border: '#6ee7b7', text: '#065f46' }
            ].map(({ score, emoji, label, color, border, text }) => {
              const count = distribution_humeur[score] || 0;
              const total = Object.values(distribution_humeur).reduce((s, v) => s + v, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              
              return (
                <div 
                  key={score}
                  style={{ 
                    background: count > 0 ? color : '#f9fafb',
                    border: `2px solid ${count > 0 ? border : '#e5e7eb'}`,
                    borderRadius: 8,
                    padding: '0.75rem 0.5rem',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: '0.25rem' }}>{emoji}</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: count > 0 ? text : '#9ca3af' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: 10, color: count > 0 ? text : '#9ca3af', marginTop: '0.25rem' }}>
                    {label}
                  </div>
                  {count > 0 && (
                    <div style={{ fontSize: 11, fontWeight: 600, color: text, marginTop: '0.25rem' }}>
                      {pct}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Semaines critiques */}
      {semaines_critiques.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            ⚠️ Semaines à surveiller
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {semaines_critiques.map((sem, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  padding: '0.75rem',
                  fontSize: 13
                }}
              >
                <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>
                  Semaine {sem.semaine}
                </div>
                <div style={{ color: '#92400e' }}>
                  {sem.raison} (Sat: {sem.moyenne_satiete}/5, Hum: {sem.moyenne_humeur}/5)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyse des dépassements de satiété */}
      {analyse_depassements && analyse_depassements.total > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            🔍 Pourquoi dépassé(e) ? ({analyse_depassements.total} repas)
          </div>
          
          <div style={{ 
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: 13 }}>
              {/* Par type de repas */}
              {Object.keys(analyse_depassements.par_type).length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>
                    Par moment :
                  </div>
                  {Object.entries(analyse_depassements.par_type)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([type, count]) => (
                      <div key={type} style={{ color: '#92400e' }}>
                        • {type} : {count} fois
                      </div>
                    ))}
                </div>
              )}
              
              {/* Par cause */}
              <div>
                <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>
                  Causes :
                </div>
                {analyse_depassements.avec_extras > 0 && (
                  <div style={{ color: '#92400e' }}>
                    • Extras : {analyse_depassements.avec_extras} ({((analyse_depassements.avec_extras / analyse_depassements.total) * 100).toFixed(0)}%)
                  </div>
                )}
                {analyse_depassements.avec_fast_food > 0 && (
                  <div style={{ color: '#92400e' }}>
                    • Fast-food : {analyse_depassements.avec_fast_food}
                  </div>
                )}
                {Object.keys(analyse_depassements.categories_frequentes).length > 0 && (
                  <div style={{ color: '#92400e' }}>
                    • Catégorie : {Object.entries(analyse_depassements.categories_frequentes).sort((a, b) => b[1] - a[1])[0][0]}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Insights dépassements */}
          {insights_depassements && insights_depassements.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {insights_depassements.map((insight, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: 8,
                    padding: '0.75rem',
                    fontSize: 13,
                    color: '#92400e'
                  }}
                >
                  💡 {insight}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Corrélations humeur négative */}
      {analyse_humeur_negative && analyse_humeur_negative.total > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            😔 Quand l'humeur était négative ? ({analyse_humeur_negative.total} repas)
          </div>
          
          <div style={{ 
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: 13 }}>
              {/* Par moment */}
              {Object.keys(analyse_humeur_negative.par_type).length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, color: '#991b1b', marginBottom: '0.25rem' }}>
                    Moments critiques :
                  </div>
                  {Object.entries(analyse_humeur_negative.par_type)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([type, count]) => (
                      <div key={type} style={{ color: '#991b1b' }}>
                        • {type} : {count} fois
                      </div>
                    ))}
                </div>
              )}
              
              {/* Facteurs */}
              <div>
                <div style={{ fontWeight: 600, color: '#991b1b', marginBottom: '0.25rem' }}>
                  Facteurs associés :
                </div>
                {analyse_humeur_negative.avec_extras > 0 && (
                  <div style={{ color: '#991b1b' }}>
                    • Extras : {((analyse_humeur_negative.avec_extras / analyse_humeur_negative.total) * 100).toFixed(0)}%
                  </div>
                )}
                {analyse_humeur_negative.avec_fast_food > 0 && (
                  <div style={{ color: '#991b1b' }}>
                    • Fast-food : {analyse_humeur_negative.avec_fast_food} fois
                  </div>
                )}
                {analyse_humeur_negative.kcal_moyen > 0 && (
                  <div style={{ color: '#991b1b' }}>
                    • Kcal moyen : {analyse_humeur_negative.kcal_moyen}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Insights humeur */}
          {insights_humeur_negative && insights_humeur_negative.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {insights_humeur_negative.map((insight, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: '0.75rem',
                    fontSize: 13,
                    color: '#991b1b'
                  }}
                >
                  ⚠️ {insight}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Matrice croisée Satiété x Humeur */}
      {matrice_croisee && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            🔗 Analyse croisée : Satiété × Humeur
          </div>
          
          <div style={{ 
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '1rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {/* Cercle vertueux */}
              <div style={{ 
                background: matrice_croisee.satiete_ok_humeur_ok > 0 ? '#f0fdf4' : '#fff',
                border: '1px solid #86efac',
                borderRadius: 8,
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 28, color: '#10b981' }}>✓</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>
                  {matrice_croisee.satiete_ok_humeur_ok}
                </div>
                <div style={{ fontSize: 12, color: '#15803d' }}>
                  Satiété OK + Humeur positive
                </div>
              </div>
              
              {/* Critique */}
              <div style={{ 
                background: matrice_croisee.satiete_ko_humeur_ko > 0 ? '#fee2e2' : '#fff',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 28, color: '#ef4444' }}>⚠️</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444' }}>
                  {matrice_croisee.satiete_ko_humeur_ko}
                </div>
                <div style={{ fontSize: 12, color: '#991b1b' }}>
                  Satiété dépassée + Humeur négative
                </div>
              </div>
              
              {/* Mixtes */}
              <div style={{ 
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f59e0b' }}>
                  {matrice_croisee.satiete_ok_humeur_ko}
                </div>
                <div style={{ fontSize: 11, color: '#92400e' }}>
                  Satiété OK mais humeur négative
                </div>
              </div>
              
              <div style={{ 
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f59e0b' }}>
                  {matrice_croisee.satiete_ko_humeur_ok}
                </div>
                <div style={{ fontSize: 11, color: '#92400e' }}>
                  Satiété dépassée mais humeur OK
                </div>
              </div>
            </div>
          </div>
          
          {/* Insights matrice */}
          {insights_matrice && insights_matrice.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {insights_matrice.map((insight, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: 8,
                    padding: '0.75rem',
                    fontSize: 13,
                    color: '#075985'
                  }}
                >
                  🔗 {insight}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Points positifs */}
      {points_positifs.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            🌟 Points forts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {points_positifs.map((point, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 8,
                  padding: '0.75rem',
                  fontSize: 13,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: 16 }}>✅</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points d'amélioration */}
      {points_amelioration.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            💡 Points d'amélioration
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {points_amelioration.map((point, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  padding: '0.75rem',
                  fontSize: 13,
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>📌</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Section6Projection - Projection et recommandations mois suivant
 * Affiche objectifs, ajustements stratégiques, checkpoints hebdo
 */
function Section6Projection({ data }) {
  console.log('[SECTION6 COMPOSANT] Rendu Section6Projection');
  console.log('[SECTION6 COMPOSANT] Data reçue:', data);
  
  if (!data || data.erreur === 'donnees_insuffisantes') {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🎯</div>
        <div style={{ marginTop: '0.5rem', fontSize: 16, color: '#6b7280' }}>
          Données insuffisantes pour générer une projection
        </div>
      </div>
    );
  }

  const {
    objectif_poids,
    objectif_poids_message,
    objectif_budget,
    ajustement_budget_message,
    ajustements_strategiques,
    points_vigilance,
    checkpoints_hebdo,
    points_forts_a_maintenir
  } = data;

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* En-tête avec période */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: '1.5rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 32, marginBottom: '0.5rem' }}>🎯</div>
        <div style={{ fontSize: 20, fontWeight: 'bold' }}>Plan d'action mois prochain</div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: '0.25rem' }}>
          Recommandations personnalisées basées sur ce mois
        </div>
      </div>

      {/* Objectifs principaux */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Objectif poids */}
        {objectif_poids && (
          <div style={{ 
            background: '#f0f9ff',
            border: '2px solid #0ea5e9',
            borderRadius: 12,
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#075985', marginBottom: '0.5rem' }}>
              ⚖️ Objectif poids
            </div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#0284c7' }}>
              {objectif_poids} kg
            </div>
            <div style={{ fontSize: 12, color: '#0369a1', marginTop: '0.5rem' }}>
              {objectif_poids_message}
            </div>
          </div>
        )}

        {/* Objectif budget */}
        <div style={{ 
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: 12,
          padding: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: '0.5rem' }}>
            🔥 Budget calorique
          </div>
          <div style={{ fontSize: 36, fontWeight: 'bold', color: '#d97706' }}>
            {objectif_budget}
          </div>
          <div style={{ fontSize: 11, color: '#78350f' }}>kcal/jour</div>
          <div style={{ fontSize: 12, color: '#92400e', marginTop: '0.5rem' }}>
            {ajustement_budget_message}
          </div>
        </div>
      </div>

      {/* Points forts à maintenir */}
      {points_forts_a_maintenir && points_forts_a_maintenir.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            💪 Tes forces à conserver
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {points_forts_a_maintenir.map((point, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 8,
                  padding: '0.75rem',
                  fontSize: 13,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: 16 }}>✅</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ajustements stratégiques */}
      {ajustements_strategiques && ajustements_strategiques.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            🎯 Ajustements prioritaires
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ajustements_strategiques.map((ajustement, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: '#eff6ff',
                  border: '2px solid #60a5fa',
                  borderRadius: 8,
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <div style={{ 
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1, fontSize: 13, color: '#1e40af', paddingTop: '0.25rem' }}>
                  {ajustement}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points de vigilance */}
      {points_vigilance && points_vigilance.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            ⚠️ Points de vigilance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {points_vigilance.map((point, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  padding: '0.75rem',
                  fontSize: 13,
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkpoints hebdomadaires */}
      {checkpoints_hebdo && checkpoints_hebdo.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
            📅 Checkpoints hebdomadaires
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {checkpoints_hebdo.map((checkpoint, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 10,
                  width: 50,
                  height: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>S{checkpoint.semaine}</div>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>📌</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                    {checkpoint.objectif}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Indicateur : {checkpoint.indicateur}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message de motivation */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: 12,
        padding: '1.5rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: 24, marginBottom: '0.5rem' }}>💪</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          Tu as toutes les clés en main !
        </div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: '0.5rem' }}>
          Ces recommandations sont basées sur TES données réelles. 
          Un pas après l'autre, tu progresses. 🌟
        </div>
      </div>
    </div>
  );
}

/**
 * BilanMensuelModal - Modale d'affichage du bilan mensuel
 * 
 * Phase 2 : Structure vide avec 6 sections accordéons
 * Phase 3-8 : Intégration des calculs pour chaque section
 * 
 * Props:
 * - isOpen: boolean - Contrôle l'affichage de la modale
 * - mois: number (1-12) - Mois du bilan
 * - annee: number - Année du bilan
 * - onClose: function - Callback de fermeture
 */
export default function BilanMensuelModal({ isOpen, mois, annee, onClose }) {
  console.log('[BILAN MENSUEL MODAL] Composant monté avec props:', { isOpen, mois, annee });
  
  // État des sections (true = ouverte, false = fermée)
  const [sectionsOuvertes, setSectionsOuvertes] = useState({
    section1: true, // Tendance poids ouverte par défaut
    section2: false,
    section3: false,
    section4: false,
    section5: false,
    section6: false,
  });

  // État de chargement des données
  const [loading, setLoading] = useState(true);
  const [bilanData, setBilanData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  console.log('[BILAN MENSUEL MODAL] États initiaux:', { loading, bilanData });
  console.log('[BILAN MENSUEL MODAL] 🔐 RLS actif - pas besoin de userId explicite');

  // Noms des mois
  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Toggle section accordion
  const toggleSection = (section) => {
    setSectionsOuvertes(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Charger les données du bilan mensuel
  useEffect(() => {
    console.log('[BILAN MENSUEL MODAL] useEffect chargerDonnees déclenché');
    console.log('[BILAN MENSUEL MODAL] Conditions:', { isOpen, mois, annee });
    
    if (!isOpen) {
      console.log('[BILAN MENSUEL MODAL] ⏸️ Modale fermée, pas de chargement');
      return;
    }
    if (!mois || !annee) {
      console.log('[BILAN MENSUEL MODAL] ⚠️ Mois ou année manquant');
      return;
    }
    
    console.log('[BILAN MENSUEL MODAL] ✅ Conditions réunies, démarrage chargement (RLS auto)');
    
    const chargerDonnees = async () => {
      setLoading(true);
      console.log('[BILAN MENSUEL MODAL] 🔄 Chargement données pour', moisNoms[mois - 1], annee);
      
      try {
        // Récupérer profil utilisateur pour calculer objectif calorique
        let objectifCaloriqueJour = 1900; // Valeur par défaut
        const { data: profil, error: profilError } = await supabase
          .from('profil')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!profilError && profil && profil.sexe && profil.niveau_activite) {
          // Déterminer objectif type (perte/maintien/prise)
          let objectifType = 'perte';
          if (profil.poids_de_depart && profil.objectif) {
            if (profil.poids_de_depart > profil.objectif) {
              objectifType = 'perte';
            } else if (profil.poids_de_depart < profil.objectif) {
              objectifType = 'prise';
            } else {
              objectifType = 'maintien';
            }
          }
          
          const profilComplet = {
            sexe: profil.sexe,
            age: profil.age,
            taille: profil.taille,
            poids_de_depart: profil.poids_de_depart,
            niveau_activite: profil.niveau_activite,
            objectif: objectifType
          };
          
          const calculs = calculerProfilComplet(profilComplet);
          if (calculs && calculs.apport_calorique_cible) {
            objectifCaloriqueJour = calculs.apport_calorique_cible;
            console.log('[BILAN MENSUEL MODAL] Objectif calorique personnalisé:', objectifCaloriqueJour, 'kcal/jour');
          }
        } else {
          console.log('[BILAN MENSUEL MODAL] Profil incomplet, utilisation valeur par défaut:', objectifCaloriqueJour, 'kcal/jour');
        }
        
        // Phase 3: Charger Section 1
        console.log('[BILAN MENSUEL MODAL] Appel calculerSection1TendancePoids...');
        const section1 = await calculerSection1TendancePoids(mois, annee);
        console.log('[BILAN MENSUEL MODAL] Section 1 reçue:', section1);
        
        // Phase 4: Charger Section 2
        console.log('[BILAN MENSUEL MODAL] === DÉBUT CHARGEMENT SECTION 2 ===');
        console.log('[BILAN MENSUEL MODAL] Appel calculerSection2BudgetCalorique...');
        
        const section2 = await calculerSection2BudgetCalorique(mois, annee, objectifCaloriqueJour);
        console.log('[BILAN MENSUEL MODAL] Section 2 reçue avec succès:', section2);
        
        // Log détaillé du contenu
        if (section2) {
          console.log('[BILAN MENSUEL MODAL] Type de section2:', typeof section2);
          console.log('[BILAN MENSUEL MODAL] Clés de section2:', Object.keys(section2));
          console.log('[BILAN MENSUEL MODAL] section2.erreur?', section2.erreur);
          console.log('[BILAN MENSUEL MODAL] section2.total_consomme:', section2.total_consomme);
        } else {
          console.log('[BILAN MENSUEL MODAL] ⚠️ section2 est null ou undefined!');
        }
        console.log('[BILAN MENSUEL MODAL] === FIN CHARGEMENT SECTION 2 ===');
        
        // Phase 5: Charger Section 3
        console.log('[BILAN MENSUEL MODAL] === DÉBUT CHARGEMENT SECTION 3 ===');
        const section3 = await calculerSection3Patterns(mois, annee, objectifCaloriqueJour);
        console.log('[BILAN MENSUEL MODAL] Section 3 reçue:', section3);
        console.log('[BILAN MENSUEL MODAL] === FIN CHARGEMENT SECTION 3 ===');
        
        // Phase 6: Charger Section 4
        console.log('[BILAN MENSUEL MODAL] === DÉBUT CHARGEMENT SECTION 4 ===');
        const section4 = await calculerSection4QualiteNutritionnelle(mois, annee);
        console.log('[BILAN MENSUEL MODAL] Section 4 reçue:', section4);
        console.log('[BILAN MENSUEL MODAL] === FIN CHARGEMENT SECTION 4 ===');
        
        // Phase 7: Charger Section 5
        console.log('[BILAN MENSUEL MODAL] === DÉBUT CHARGEMENT SECTION 5 ===');
        const section5 = await calculerSection5BienEtre(mois, annee);
        console.log('[BILAN MENSUEL MODAL] Section 5 reçue:', section5);
        console.log('[BILAN MENSUEL MODAL] === FIN CHARGEMENT SECTION 5 ===');
        
        // Phase 8: Charger Section 6 (projection basée sur toutes les sections)
        console.log('[BILAN MENSUEL MODAL] === DÉBUT CHARGEMENT SECTION 6 ===');
        const section6 = await calculerSection6Projection(mois, annee, {
          section1,
          section2,
          section3,
          section4,
          section5
        });
        console.log('[BILAN MENSUEL MODAL] Section 6 reçue:', section6);
        console.log('[BILAN MENSUEL MODAL] === FIN CHARGEMENT SECTION 6 ===');
        
        const nouveauBilan = {
          mois,
          annee,
          section1,
          section2,
          section3,
          section4,
          section5,
          section6
        };
        
        console.log('[BILAN MENSUEL MODAL] Bilan créé:', nouveauBilan);
        console.log('[BILAN MENSUEL MODAL] Vérification section2:', nouveauBilan.section2);
        setBilanData(nouveauBilan);
        console.log('[BILAN MENSUEL MODAL] setBilanData appelé avec succès');
      } catch (err) {
        console.error('[BILAN MENSUEL MODAL] ❌ Erreur chargement:', err);
        console.error('[BILAN MENSUEL MODAL] Stack:', err.stack);
        setBilanData({ mois, annee, erreur: true });
      } finally {
        console.log('[BILAN MENSUEL MODAL] ✅ Chargement terminé, loading = false');
        setLoading(false);
      }
    };
    
    chargerDonnees();
  }, [isOpen, mois, annee]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Fonction de sauvegarde en base de données
  const sauvegarderBilan = async () => {
    if (saved) {
      alert('✅ Ce bilan a déjà été sauvegardé');
      return;
    }
    
    setSaving(true);
    console.log('[BILAN MENSUEL] Sauvegarde en cours...', { mois, annee });
    
    try {
      const result = await genererBilanCompletMensuel(mois, annee);
      
      if (result) {
        console.log('[BILAN MENSUEL] ✅ Bilan sauvegardé:', result.id);
        setSaved(true);
        alert('✅ Bilan mensuel sauvegardé avec succès !');
      } else {
        console.error('[BILAN MENSUEL] ❌ Échec sauvegarde - result est null');
        alert('❌ Erreur lors de la sauvegarde. Vérifiez la console.');
      }
    } catch (err) {
      console.error('[BILAN MENSUEL] Erreur sauvegarde:', err);
      alert('❌ Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    console.log('[BILAN MENSUEL MODAL] Rendu null (modale fermée)');
    return null;
  }

  console.log('[BILAN MENSUEL MODAL] Rendu modale - loading:', loading, 'bilanData:', bilanData);

  return (
    <>
      <style jsx>{`
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }

        .modal {
          background: white;
          border-radius: 16px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 16px 16px 0 0;
          position: relative;
        }

        .closeBtn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 28px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .closeBtn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .subtitle {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
        }

        .content {
          padding: 30px;
        }

        .section {
          margin-bottom: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .section:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .sectionHeader {
          background: #f9fafb;
          padding: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
          user-select: none;
        }

        .sectionHeader:hover {
          background: #f3f4f6;
        }

        .sectionHeaderLeft {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sectionIcon {
          font-size: 24px;
        }

        .sectionTitle {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .chevron {
          font-size: 20px;
          color: #64748b;
          transition: transform 0.3s;
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .sectionContent {
          padding: 25px;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .placeholder {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }

        .placeholderIcon {
          font-size: 48px;
          margin-bottom: 15px;
          opacity: 0.5;
        }

        .placeholderText {
          font-size: 16px;
          margin: 0;
        }

        .footer {
          padding: 20px 30px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btnPrimary {
          background: #667eea;
          color: white;
        }

        .btnPrimary:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btnSecondary {
          background: white;
          color: #64748b;
          border: 2px solid #e5e7eb;
        }

        .btnSecondary:hover {
          border-color: #cbd5e1;
          background: #f9fafb;
        }

        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 768px) {
          .modal {
            max-height: 95vh;
            border-radius: 12px;
          }

          .header {
            padding: 20px;
          }

          .title {
            font-size: 22px;
          }

          .content {
            padding: 20px;
          }

          .footer {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="header">
            <button className="closeBtn" onClick={onClose} aria-label="Fermer">
              ×
            </button>
            <h2 className="title">📊 Bilan Mensuel</h2>
            <p className="subtitle">
              {moisNoms[mois - 1]} {annee}
            </p>
          </div>

          {/* Content */}
          <div className="content">
            {loading ? (
              // Skeleton loader
              <div>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <div className="skeleton" style={{ height: '70px' }} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Section 1: Tendance poids & objectif */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section1')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section1}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">⚖️</span>
                      <h3 className="sectionTitle">Tendance poids & objectif</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section1 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section1 && (
                    <div className="sectionContent">
                      {bilanData?.section1 ? (
                        <Section1TendancePoids data={bilanData.section1} />
                      ) : (
                        <div className="placeholder">
                          <div className="placeholderIcon">⏳</div>
                          <p className="placeholderText">Calculs en cours...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 2: Budget calorique */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section2')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section2}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">🔥</span>
                      <h3 className="sectionTitle">Budget calorique</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section2 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section2 && (
                    <div className="sectionContent">
                      {bilanData?.section2 ? (
                        <Section2BudgetCalorique data={bilanData.section2} />
                      ) : (
                        <div className="placeholder">
                          <div className="placeholderIcon">⏳</div>
                          <p className="placeholderText">Calculs en cours...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 3: Patterns comportementaux */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section3')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section3}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">📈</span>
                      <h3 className="sectionTitle">Patterns comportementaux</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section3 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section3 && (
                    <div className="sectionContent">
                      {bilanData?.section3 ? (
                        <Section3PatternsComportementaux data={bilanData.section3} />
                      ) : (
                        <div className="placeholder">
                          <div className="placeholderIcon">⏳</div>
                          <p className="placeholderText">Calculs en cours...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 4: Qualité nutritionnelle */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section4')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section4}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">🥗</span>
                      <h3 className="sectionTitle">Qualité nutritionnelle</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section4 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section4 && (
                    <div className="sectionContent">
                      {bilanData?.section4 ? (
                        <Section4QualiteNutritionnelle data={bilanData.section4} />
                      ) : (
                        <div className="placeholder">
                          <div className="placeholderIcon">⏳</div>
                          <p className="placeholderText">
                            Chargement de l'analyse nutritionnelle...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 5: Bien-être & ressentis */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section5')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section5}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">💚</span>
                      <h3 className="sectionTitle">Bien-être & ressentis</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section5 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section5 && (
                    <div className="sectionContent">
                      {bilanData?.section5 ? (
                        <Section5BienEtre data={bilanData.section5} />
                      ) : (
                        <div className="placeholder">
                          <div className="placeholderIcon">⏳</div>
                          <p className="placeholderText">
                            Chargement de l'analyse bien-être...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 6: Projection mois suivant */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section6')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section6}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">🎯</span>
                      <h3 className="sectionTitle">Projection mois suivant</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section6 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section6 && (
                    <div className="sectionContent">
                      {bilanData?.section6 ? (
                        <Section6Projection data={bilanData.section6} />
                      ) : (
                        <div className="placeholder">
                          <div className="placeholderIcon">⏳</div>
                          <p className="placeholderText">
                            Génération du plan d'action...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="footer" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <button 
              className="btn"
              onClick={() => window.location.href = '/historique-bilans-mensuels'}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📈 Voir l'historique
            </button>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn btnSecondary" onClick={onClose}>
                Fermer
              </button>
              <button
                className="btn btnPrimary"
                onClick={sauvegarderBilan}
                disabled={saving || saved}
                style={{
                  opacity: (saving || saved) ? 0.6 : 1,
                  cursor: (saving || saved) ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? '⏳ Sauvegarde...' : saved ? '✅ Sauvegardé' : '💾 Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
