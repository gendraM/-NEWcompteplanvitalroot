/**
 * 🥘 RECETTES DÉTAILLÉES PHASE 2
 * Modal avec instructions précises Cookeo/Marmite pour fibres douces
 * Architecture identique à RecettesPhase1Modal.js (succès éprouvé)
 * Recettes Phase 2 selon documentation officielle
 */

import { useState } from 'react';

export default function RecettesPhase2Modal({ isOpen, onClose, recetteType = 'compote' }) {
  const [methodPreferee, setMethodPreferee] = useState('cookeo');

  const recettes = {
    compote: {
      nom: 'Compote maison Phase 2',
      duree: 'J3-J4-J5',
      ingredients: [
        '3 pommes OU 3 poires',
        '100 ml d\'eau',
        'Huile olive progressive : J3=1 càc, J4=1 càs, J5=1,5 càs'
      ],
      cookeo: {
        etapes: [
          'Éplucher et couper les fruits en morceaux',
          'Mettre dans la cuve + 100 ml d\'eau',
          'Cuisson sous pression 8 minutes',
          'Mixer pour obtenir texture lisse parfaite',
          'Laisser refroidir avant d\'ajouter huile crue',
          'Ajouter huile selon jour : J3=1 càc, J4=1 càs, J5=1,5 càs'
        ],
        conseil: 'Le Cookeo préserve les fibres douces essentielles Phase 2'
      },
      marmite: {
        etapes: [
          'Placer les fruits + 100 ml d\'eau',
          'Porter à ébullition, réduire le feu',
          'Laisser mijoter 20 minutes jusqu\'à tendresse',
          'Mixer parfaitement (texture lisse obligatoire)',
          'Refroidir puis incorporer huile crue selon progression'
        ],
        conseil: 'Cuisson douce traditionnelle, préserve les nutrients Phase 2'
      }
    },
    puree: {
      nom: 'Purées fibres douces (carotte, courgette, potimarron)',
      duree: 'Repas 13h et 19h',
      ingredients: [
        '4-5 carottes OU',
        '2-3 courgettes OU', 
        '300g potimarron',
        'Eau de cuisson du bouillon Phase 2',
        'Huile olive selon jour (1 càc→1 càs→1,5 càs)'
      ],
      cookeo: {
        etapes: [
          'Éplucher et couper légumes en morceaux',
          'Cuisson vapeur 12 minutes dans le Cookeo',
          'Égoutter en gardant l\'eau de cuisson',
          'Mixer avec un peu d\'eau de cuisson pour texture veloutée',
          'Texture finale : lisse et homogène (150-180g par portion)',
          'Incorporer huile crue juste avant service'
        ],
        conseil: 'Cuisson vapeur préserve fibres douces et minéraux'
      },
      marmite: {
        etapes: [
          'Cuisson vapeur 15-20 minutes dans panier vapeur',
          'Vérifier tendresse à la fourchette',
          'Mixer avec eau de cuisson pour consistance parfaite',
          'Passer au tamis si nécessaire (texture lisse)',
          'Servir tiède avec huile crue selon progression'
        ],
        conseil: 'Méthode douce qui respecte la structure des fibres'
      }
    },
    fruitcuit: {
      nom: 'Fruits cuits (pomme/poire) - Horaire 16h',
      duree: 'Collation Phase 2',
      ingredients: [
        '1 pomme moyenne OU 1 poire moyenne',
        '50 ml d\'eau',
        'Option : 1 pincée de cannelle'
      ],
      cookeo: {
        etapes: [
          'Éplucher et couper fruit en quartiers',
          'Mettre dans cuve avec 50 ml d\'eau',
          'Cuisson vapeur 6 minutes',
          'Vérifier tendresse (doit être très fondant)',
          'Servir tiède, texture fondante obligatoire'
        ],
        conseil: 'Cuisson rapide qui préserve les fibres solubles digestibles'
      },
      marmite: {
        etapes: [
          'Cuisson vapeur douce 12-15 minutes',
          'Surveillance régulière de la tendresse',
          'Fruit doit être fondant mais pas en bouillie',
          'Servir immédiatement pour meilleure digestibilité'
        ],
        conseil: 'Méthode traditionnelle qui respecte la structure du fruit'
      }
    },
    bouillon: {
      nom: 'Bouillon légumes filtré - Horaire 11h',
      duree: 'Quotidien Phase 2',
      ingredients: [
        '3 carottes',
        '2 courgettes',
        '1 branche céleri',
        '1 petit oignon',
        '2,5 litres d\'eau',
        '1 feuille de laurier'
      ],
      cookeo: {
        etapes: [
          'Légumes lavés et coupés grossièrement',
          'Tous ingrédients dans la cuve + eau + laurier',
          'Cuisson sous pression 20 minutes',
          'Filtrage parfait au tamis fin ou linge propre',
          'Conservation au frigo 3 jours max',
          'Réchauffer portion de 200ml pour 11h'
        ],
        conseil: 'Extraction optimale des minéraux pour Phase 2'
      },
      marmite: {
        etapes: [
          'Porter à ébullition puis réduire le feu',
          'Laisser frémir 45 minutes minimum',
          'Écumer régulièrement les impuretés',
          'Filtrage minutieux pour bouillon parfaitement clair',
          'Conservation réfrigérée en portions de 200ml'
        ],
        conseil: 'Méthode lente qui extrait tous les nutrients'
      }
    }
  };

  const recetteActuelle = recettes[recetteType] || recettes.compote;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
          color: 'white',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.4rem',
              fontWeight: 700
            }}>
              🥘 {recetteActuelle.nom}
            </h2>
            <div style={{
              fontSize: '0.9rem',
              opacity: 0.9,
              marginTop: '4px'
            }}>
              🕐 {recetteActuelle.duree} • Phase 2 fibres douces
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {/* Ingrédients */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              color: '#2E7D32',
              fontWeight: 600,
              marginBottom: '12px',
              fontSize: '1.1rem'
            }}>
              📝 Ingrédients
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {recetteActuelle.ingredients.map((ingredient, idx) => (
                <li key={idx} style={{
                  background: '#E8F5E8',
                  padding: '8px 12px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #4CAF50'
                }}>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Sélecteur méthode */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => setMethodPreferee('cookeo')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: methodPreferee === 'cookeo' ? '2px solid #4CAF50' : '2px solid #ddd',
                  background: methodPreferee === 'cookeo' ? '#E8F5E8' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🥘 Cookeo
              </button>
              <button
                onClick={() => setMethodPreferee('marmite')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: methodPreferee === 'marmite' ? '2px solid #4CAF50' : '2px solid #ddd',
                  background: methodPreferee === 'marmite' ? '#E8F5E8' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🍲 Marmite
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              color: '#2E7D32',
              fontWeight: 600,
              marginBottom: '12px',
              fontSize: '1.1rem'
            }}>
              👩‍🍳 Instructions {methodPreferee === 'cookeo' ? 'Cookeo' : 'Marmite'}
            </h3>
            <ol style={{
              paddingLeft: '0',
              listStyle: 'none',
              margin: 0
            }}>
              {recetteActuelle[methodPreferee].etapes.map((etape, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                  padding: '12px',
                  background: '#F9F9F9',
                  borderRadius: '8px',
                  borderLeft: '4px solid #4CAF50'
                }}>
                  <span style={{
                    background: '#4CAF50',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginRight: '12px',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{
                    lineHeight: '1.4',
                    color: '#333'
                  }}>
                    {etape}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Conseil */}
          <div style={{
            background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #2196F3'
          }}>
            <h4 style={{
              color: '#1565C0',
              margin: '0 0 8px 0',
              fontSize: '1rem',
              fontWeight: 600
            }}>
              💡 Conseil chef
            </h4>
            <p style={{
              margin: 0,
              color: '#1565C0',
              lineHeight: '1.4',
              fontSize: '0.9rem'
            }}>
              {recetteActuelle[methodPreferee].conseil}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}