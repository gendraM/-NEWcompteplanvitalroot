/**
 * 🥘 RECETTES DÉTAILLÉES PHASE 4
 * Modal avec instructions précises Cookeo/Marmite pour féculents doux
 * Architecture identique à RecettesPhase2Modal.js (succès éprouvé)
 * Recettes Phase 4 : Féculents doux (J11+) - MIDI UNIQUEMENT
 */

import { useState } from 'react';

export default function RecettesPhase4Modal({ isOpen, onClose, recetteType = 'patatedouce' }) {
  const [methodPreferee, setMethodPreferee] = useState('cookeo');

  const recettes = {
    patatedouce: {
      nom: 'Patate douce au four',
      duree: 'MIDI UNIQUEMENT',
      ingredients: [
        '1 patate douce moyenne (80g net)',
        '1 filet d\'huile d\'olive',
        'Sel, poivre',
        'Option : paprika doux'
      ],
      cookeo: {
        etapes: [
          'Laver et sécher la patate douce',
          'Couper en cubes de 2 cm',
          'Mettre dans la cuve avec 100 ml d\'eau',
          'Cuisson vapeur 12 minutes',
          'Écraser légèrement à la fourchette',
          'Ajouter 1 filet d\'huile d\'olive crue',
          'Portion : 80g maximum par repas de midi'
        ],
        conseil: 'Cuisson vapeur préserve l\'index glycémique bas de la patate douce'
      },
      marmite: {
        etapes: [
          'Préchauffer le four à 200°C',
          'Couper la patate douce en cubes',
          'Disposer sur plaque avec papier sulfurisé',
          'Badigeonner d\'un filet d\'huile d\'olive',
          'Cuisson 25-30 minutes jusqu\'à tendresse',
          'Vérifier à la fourchette',
          'Servir tiède à midi uniquement - 80g max'
        ],
        conseil: 'Cuisson au four concentre les saveurs naturelles'
      }
    },
    rizcomplet: {
      nom: 'Riz complet bien cuit',
      duree: 'MIDI UNIQUEMENT',
      ingredients: [
        'Riz complet : 1,5 CS (environ 30g sec)',
        'Eau : 3 fois le volume de riz',
        '1 pincée de sel',
        '1 filet d\'huile d\'olive'
      ],
      cookeo: {
        etapes: [
          'Rincer le riz complet à l\'eau froide 3 fois',
          'Mettre 1,5 CS de riz dans la cuve',
          'Ajouter 3 fois le volume d\'eau + sel',
          'Cuisson grain 10 minutes',
          'Laisser reposer 5 minutes couvercle fermé',
          'Ajouter 1 filet d\'huile d\'olive crue',
          'Portion stricte : 1,5 CS à midi'
        ],
        conseil: 'Le Cookeo cuit parfaitement le riz complet sans surveillance'
      },
      marmite: {
        etapes: [
          'Rincer le riz à l\'eau froide plusieurs fois',
          'Porter l\'eau salée à ébullition',
          'Ajouter le riz, réduire le feu',
          'Cuisson douce 35-40 minutes à couvert',
          'Vérifier la tendresse (grains souples)',
          'Égoutter et laisser reposer 5 minutes',
          'Ajouter huile d\'olive - servir tiède à midi'
        ],
        conseil: 'Cuisson longue pour bien ramollir les grains complets'
      }
    },
    quinoa: {
      nom: 'Quinoa bien cuit',
      duree: 'MIDI UNIQUEMENT',
      ingredients: [
        'Quinoa : 1,5 CS (environ 30g sec)',
        'Eau : 2 fois le volume de quinoa',
        '1 pincée de sel',
        '1 filet d\'huile d\'olive'
      ],
      cookeo: {
        etapes: [
          'Rincer abondamment le quinoa (éliminer saponines)',
          'Mettre 1,5 CS dans la cuve',
          'Ajouter 2 fois le volume d\'eau + sel',
          'Cuisson grain 6 minutes',
          'Laisser reposer 3 minutes',
          'Égrainer à la fourchette + huile d\'olive',
          'Portion : 1,5 CS à midi uniquement'
        ],
        conseil: 'Quinoa = protéines végétales + sans gluten + digeste'
      },
      marmite: {
        etapes: [
          'Rincer le quinoa jusqu\'à eau claire',
          'Porter l\'eau salée à ébullition',
          'Ajouter le quinoa, couvrir',
          'Cuisson douce 12-15 minutes',
          'Le quinoa germe quand c\'est cuit',
          'Égoutter si nécessaire',
          'Ajouter huile d\'olive - servir à midi'
        ],
        conseil: 'Alternative riz, riche en protéines complètes'
      }
    },
    flocons: {
      nom: 'Flocons d\'avoine cuits (Matin OK)',
      duree: 'MATIN AUTORISÉ',
      ingredients: [
        'Flocons d\'avoine : 2 CS (environ 20g)',
        'Lait végétal : 150 ml (amande, avoine, coco)',
        'Option : 1 càc miel OU 1/2 banane écrasée',
        'Option : cannelle'
      ],
      cookeo: {
        etapes: [
          'Verser lait végétal dans la cuve',
          'Ajouter 2 CS de flocons d\'avoine',
          'Cuisson manuelle 3 minutes en remuant',
          'Texture crémeuse parfaite',
          'Ajouter miel ou banane si souhaité',
          'Saupoudrer de cannelle',
          'Portion : 2 CS le matin uniquement'
        ],
        conseil: 'Petit-déjeuner rassasiant, fibres douces pour le transit'
      },
      marmite: {
        etapes: [
          'Chauffer le lait végétal dans une casserole',
          'Ajouter les flocons d\'avoine',
          'Cuire 5 minutes en remuant régulièrement',
          'Consistance crémeuse épaisse',
          'Retirer du feu',
          'Ajouter garniture (miel, banane, cannelle)',
          'Servir chaud le matin'
        ],
        conseil: 'Porridge traditionnel, idéal petit-déjeuner Phase 4'
      }
    },
    lentillescorail: {
      nom: 'Lentilles corail mixées',
      duree: '16h (Collation)',
      ingredients: [
        'Lentilles corail : 2 CS (environ 40g sec)',
        'Eau : 3 fois le volume',
        '1 pincée de cumin',
        '1 filet d\'huile d\'olive'
      ],
      cookeo: {
        etapes: [
          'Rincer les lentilles corail à l\'eau froide',
          'Mettre 2 CS dans la cuve',
          'Ajouter 3 fois le volume d\'eau + cumin',
          'Cuisson sous pression 5 minutes',
          'Mixer pour obtenir purée lisse',
          'Ajouter huile d\'olive crue',
          'Portion : 2 CS à 16h (collation)'
        ],
        conseil: 'Lentilles corail = les plus digestes, cuisson rapide'
      },
      marmite: {
        etapes: [
          'Rincer les lentilles',
          'Porter l\'eau + cumin à ébullition',
          'Ajouter les lentilles',
          'Cuisson douce 12-15 minutes',
          'Les lentilles se défont naturellement',
          'Mixer pour texture lisse',
          'Ajouter huile - servir à 16h'
        ],
        conseil: 'Protéines végétales complètes, excellentes pour Phase 4'
      }
    },
    poischiche: {
      nom: 'Pois chiches bien cuits',
      duree: 'MIDI UNIQUEMENT',
      ingredients: [
        'Pois chiches secs : 2 CS (ou 100g cuits en conserve)',
        'Eau de trempage (12h si secs)',
        'Eau de cuisson',
        '1 filet d\'huile d\'olive',
        'Sel, poivre'
      ],
      cookeo: {
        etapes: [
          'Si secs : trempage 12h obligatoire, puis rincer',
          'Mettre pois chiches + eau dans la cuve',
          'Cuisson sous pression 25 minutes',
          'Égoutter en gardant l\'eau (aquafaba)',
          'Écraser à la fourchette ou mixer grossièrement',
          'Ajouter huile d\'olive + épices',
          'Portion : 2 CS à midi uniquement'
        ],
        conseil: 'Si conserve : rincer et réchauffer 3 min seulement'
      },
      marmite: {
        etapes: [
          'Trempage 12h pour pois chiches secs',
          'Rincer abondamment',
          'Cuisson 1h30-2h à feu doux',
          'Vérifier tendresse à la fourchette',
          'Égoutter',
          'Écraser ou mixer selon préférence',
          'Huile d\'olive + assaisonnement - midi uniquement'
        ],
        conseil: 'Protéines + fibres, excellent pour stabilisation glycémique'
      }
    }
  };

  const recetteActuelle = recettes[recetteType] || recettes.patatedouce;

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
          background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
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
              🍠 {recetteActuelle.nom}
            </h2>
            <div style={{
              fontSize: '0.9rem',
              opacity: 0.9,
              marginTop: '4px'
            }}>
              🕐 {recetteActuelle.duree} • Phase 4 féculents doux
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
              color: '#E65100',
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
                  background: '#FFF3E0',
                  padding: '8px 12px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #FF9800'
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
                  border: methodPreferee === 'cookeo' ? '2px solid #FF9800' : '2px solid #ddd',
                  background: methodPreferee === 'cookeo' ? '#FFF3E0' : 'white',
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
                  border: methodPreferee === 'marmite' ? '2px solid #FF9800' : '2px solid #ddd',
                  background: methodPreferee === 'marmite' ? '#FFF3E0' : 'white',
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
              color: '#E65100',
              fontWeight: 600,
              marginBottom: '12px',
              fontSize: '1.1rem'
            }}>
              👨‍🍳 Instructions {methodPreferee === 'cookeo' ? 'Cookeo' : 'Marmite'}
            </h3>
            <ol style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              counterReset: 'step-counter'
            }}>
              {recetteActuelle[methodPreferee].etapes.map((etape, idx) => (
                <li key={idx} style={{
                  counterIncrement: 'step-counter',
                  marginBottom: '10px',
                  padding: '12px 12px 12px 45px',
                  background: '#FAFAFA',
                  borderRadius: '8px',
                  position: 'relative',
                  borderLeft: '3px solid #FF9800'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#FF9800',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{etape}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Conseil */}
          <div style={{
            background: '#E3F2FD',
            border: '2px solid #2196F3',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '10px'
          }}>
            <div style={{
              fontWeight: 600,
              color: '#1565C0',
              marginBottom: '6px',
              fontSize: '0.95rem'
            }}>
              💡 Conseil du chef
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: '#424242',
              lineHeight: '1.4'
            }}>
              {recetteActuelle[methodPreferee].conseil}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          background: '#f5f5f5',
          borderTop: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            ✓ J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
