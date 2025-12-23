/**
 * 🥘 RECETTES DÉTAILLÉES PHASE 1
 * Modal avec instructions précises Cookeo/Marmite selon documentation officielle
 */

import { useState } from 'react';

export default function RecettesPhase1Modal({ isOpen, onClose, recetteType = 'bouillon' }) {
  const [methodPreferee, setMethodPreferee] = useState('cookeo');

  const recettes = {
    bouillon: {
      nom: 'Bouillon spécial Phase 1',
      duree: '2 jours',
      ingredients: [
        '5 carottes',
        '3 courgettes', 
        '1 branche de céleri',
        '1 petit oignon',
        '1 feuille de laurier',
        '3 litres d\'eau'
      ],
      cookeo: {
        etapes: [
          'Mettre tous les légumes lavés et coupés grossièrement',
          'Ajouter 3L d\'eau + laurier',
          'Cuisson sous pression 15 minutes',
          'Filtrer totalement à travers une passoire fine (ou un linge)',
          'Conserver au frigo dans des bouteilles en verre'
        ],
        conseil: 'Le Cookeo permet une extraction rapide des minéraux'
      },
      marmite: {
        etapes: [
          'Placer les légumes + 3L d\'eau + laurier',
          'Porter à ébullition, baisser le feu',
          'Laisser frémir 40 minutes',
          'Filtrer parfaitement',
          'Conserver'
        ],
        conseil: 'Cuisson douce traditionnelle, préserve les nutrients'
      }
    },
    puree: {
      nom: 'Purée lisse (carottes ou courgettes)',
      duree: 'À partir J2',
      ingredients: [
        '4 carottes OU',
        '2-3 courgettes',
        'Un peu d\'eau du bouillon'
      ],
      cookeo: {
        etapes: [
          'Mettre les légumes dans le panier vapeur',
          'Cuisson sous pression 7 minutes',
          'Mixer en ajoutant 30-40 ml d\'eau chaude du bouillon'
        ],
        conseil: 'Texture velours parfaite avec le Cookeo'
      },
      marmite: {
        etapes: [
          'Cuire vapeur 20 minutes',
          'Mixer avec un peu d\'eau chaude',
          'Obtenir une texture lisse (type velours)'
        ],
        conseil: 'Cuisson vapeur préserve les vitamines'
      }
    }
  };

  const recette = recettes[recetteType] || recettes.bouillon;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px 24px',
          borderRadius: '16px 16px 0 0',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
          
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
            🥘 {recette.nom}
          </h3>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: 4 }}>
            📅 {recette.duree}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Ingrédients */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              color: '#333', 
              fontSize: '1.1rem',
              borderLeft: '4px solid #667eea',
              paddingLeft: '12px'
            }}>
              🛒 Ingrédients
            </h4>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              background: '#f8f9fa',
              borderRadius: 8,
              padding: '16px'
            }}>
              {recette.ingredients.map((ingredient, index) => (
                <li key={index} style={{ 
                  padding: '4px 0',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    background: '#667eea',
                    color: 'white',
                    borderRadius: '50%',
                    width: '6px',
                    height: '6px',
                    marginRight: '12px'
                  }}></span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Sélection méthode */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              background: '#f1f3f4',
              borderRadius: 8,
              padding: '4px'
            }}>
              <button
                onClick={() => setMethodPreferee('cookeo')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: 6,
                  background: methodPreferee === 'cookeo' ? '#667eea' : 'transparent',
                  color: methodPreferee === 'cookeo' ? 'white' : '#666',
                  fontWeight: methodPreferee === 'cookeo' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.95rem'
                }}
              >
                👩‍🍳 Version COOKEO
              </button>
              <button
                onClick={() => setMethodPreferee('marmite')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: 6,
                  background: methodPreferee === 'marmite' ? '#667eea' : 'transparent',
                  color: methodPreferee === 'marmite' ? 'white' : '#666',
                  fontWeight: methodPreferee === 'marmite' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.95rem'
                }}
              >
                🥘 Version MARMITE
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              color: '#333', 
              fontSize: '1.1rem',
              borderLeft: '4px solid #667eea',
              paddingLeft: '12px'
            }}>
              📝 Instructions {methodPreferee === 'cookeo' ? 'COOKEO' : 'MARMITE'}
            </h4>
            
            <div style={{
              background: methodPreferee === 'cookeo' ? '#e3f2fd' : '#fff3e0',
              border: `1px solid ${methodPreferee === 'cookeo' ? '#bbdefb' : '#ffcc02'}`,
              borderRadius: 8,
              padding: '16px'
            }}>
              <ol style={{ margin: 0, paddingLeft: '20px' }}>
                {recette[methodPreferee].etapes.map((etape, index) => (
                  <li key={index} style={{ 
                    marginBottom: '8px',
                    fontSize: '0.95rem',
                    lineHeight: '1.4'
                  }}>
                    {etape}
                  </li>
                ))}
              </ol>
              
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 6,
                fontSize: '0.9rem',
                color: '#666',
                fontStyle: 'italic'
              }}>
                💡 {recette[methodPreferee].conseil}
              </div>
            </div>
          </div>

          {/* Conseils Phase 1 */}
          <div style={{
            background: '#fffde7',
            border: '1px solid #fff176',
            borderRadius: 8,
            padding: '16px'
          }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#f57c00', fontSize: '1rem' }}>
              🧘‍♀️ Conseils Phase 1
            </h5>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#e65100' }}>
              <li>Filtrer parfaitement = zéro morceaux</li>
              <li>Servir tiède, jamais bouillant</li>
              <li>Siroter lentement, en conscience</li>
              <li>Conservation 48h maximum au frigo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}