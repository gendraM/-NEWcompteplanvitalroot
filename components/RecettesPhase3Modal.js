/**
 * 🥘 RECETTES DÉTAILLÉES PHASE 3
 * Modal avec instructions précises Cookeo/Marmite pour solides légers & protéines végétales
 * Architecture identique à RecettesPhase1Modal.js et RecettesPhase2Modal.js
 * © Référentiel "Phase de reprise alimentaire après jeûne.md"
 * UNIQUEMENT 4 recettes officielles confirmées
 */

import { useState } from 'react';

export default function RecettesPhase3Modal({ isOpen, onClose, recetteType = 'lentilles' }) {
  const [methodPreferee, setMethodPreferee] = useState('cookeo');

  const recettes = {
    lentilles: {
      nom: 'Soupe de lentilles corail Phase 3',
      duree: 'Protéine végétale Phase 3 — Jour 8-10',
      ingredients: [
        '80g lentilles corail (décortiquées)',
        '1 carotte moyenne (pelée, coupée en bâtons)',
        '1 courgette petite (pelée, coupée en cubes)',
        '600ml eau filtrée',
        '1 feuille de laurier',
        'Sel marin : 1 pincée (goût final)'
      ],
      cookeo: {
        etapes: [
          'Rincer lentilles corail 2-3 fois sous eau froide',
          'Dans cuve Cookeo : eau + lentilles + carotte + courgette + laurier',
          'NE PAS ajouter sel maintenant (durcit lentilles)',
          'Fermer couvercle, sélectionner MODE SOUS-PRESSION',
          'Cuisson EXACTEMENT 10 minutes',
          'Relâche naturelle vapeur 2-3 minutes',
          'Ouvrir couvercle, vérifier texture : lentilles molles mais pas en purée',
          'Retirer laurier',
          'Ajouter sel marin à goût (très peu)',
          'Servir tiède immédiatement'
        ],
        conseil: '✅ Lentilles corail idéales : ultra-digestibles, pas de trempage requis, cuisson rapide'
      },
      marmite: {
        etapes: [
          'Rincer lentilles corail 2-3 fois sous eau froide',
          'Dans marmite : eau + lentilles + carotte + courgette + laurier',
          'Porter à ébullition vive 2 minutes, puis réduire feu moyen-doux',
          'Laisser mijoter à couvert EXACTEMENT 20 minutes',
          'À 15 minutes : vérifier cuisson lentilles (goût-texture)',
          'Laisser finir les 5 dernières minutes',
          'Vérifier : lentilles molles, légumes tendres, bouillon réduit légèrement',
          'Retirer laurier',
          'Ajouter sel marin en dernier (½ cc max)',
          'Servir tiède dans bol'
        ],
        conseil: '✅ Marmite = meilleur contrôle saveur, peut ajouter eau si trop réduit'
      }
    },

    legumes: {
      nom: 'Légumes vapeur Phase 3',
      duree: 'Fibres & minéraux Phase 3 — Jour 8-10',
      ingredients: [
        '100g carotte (pelée, coupée en bâtons)',
        '100g courgette (pelée, coupée en rondelles)',
        '100g haricots verts frais (équeutés)',
        'Eau filtrée pour vapeur',
        'Sel marin : 1 pincée (après cuisson)',
        'Option : 5ml huile olive vierge (en filet final)'
      ],
      cookeo: {
        etapes: [
          'Préparer légumes : carotte pelée + bâtons, courgette pelée + rondelles, haricots nettoyés',
          'Remplir cuve Cookeo eau jusqu\'à ligne MIN',
          'Placer trivet vapeur dans cuve',
          'Disposer légumes dans panier vapeur : carotte + courgette + haricots mélangés',
          'Fermer couvercle, sélectionner MODE VAPEUR',
          'Cuisson EXACTEMENT 8 minutes',
          'Relâche naturelle vapeur 1-2 minutes',
          'Ouvrir couvercle, vérifier : légumes tendres mais pas mous',
          'Transférer dans bol, ajouter 1 pincée sel marin',
          'Optionnel : filet huile olive vierge première pression'
        ],
        conseil: '✅ Vapeur Cookeo = préserve nutriments, texture parfaite, pas de perte minéraux'
      },
      marmite: {
        etapes: [
          'Préparer légumes : carotte pelée + bâtons, courgette pelée + rondelles, haricots nettoyés',
          'Remplir panier vapeur marmite : eau jusqu\'à 5cm sous panier',
          'Porter eau à ébullition vive',
          'Disposer légumes dans panier vapeur : bien espacés',
          'Couvrir avec couvercle, maintenir ébullition légère',
          'Cuisson EXACTEMENT 15-20 minutes (selon taille bâtons)',
          'Vérifier à 12 minutes : légumes doivent rester fermes',
          'À 15 minutes : piquer carotte avec fourchette (doit céder légèrement)',
          'Transférer dans bol, ajouter sel marin à goût',
          'Optionnel : huile olive en filet fin'
        ],
        conseil: '✅ Vapeur marmite = contrôle visuel total, pas de risque sur-cuisson'
      }
    },

    riz: {
      nom: 'Riz basmati hyper-digestible Phase 3',
      duree: 'Féculents Phase 3 — Jour 8-10',
      ingredients: [
        '50g riz basmati blanc (bien rincé)',
        '75ml eau filtrée (ratio 1:1,5)',
        'Sel marin : 1 pincée (très peu, goût final)',
        'Option : 2-3 grains cardamome verte (enlever avant service)'
      ],
      cookeo: {
        etapes: [
          'Rincer riz basmati 3-4 fois sous eau froide jusqu\'à eau transparente',
          'Égoutter complètement : pas d\'eau résiduelle',
          'Dans cuve Cookeo : riz rincé + eau mesurée (ratio 1:1,5)',
          'NE PAS ajouter sel maintenant',
          'Option : 2-3 grains cardamome si souhaité (améliore digestibilité)',
          'Fermer couvercle, sélectionner MODE CUISSON RIZ OU SOUS-PRESSION',
          'Cuisson EXACTEMENT 6 minutes sous pression',
          'Relâche naturelle vapeur 3-4 minutes (TRÈS important)',
          'Ouvrir couvercle : grains doivent être séparés, Al dente',
          'Aérer doucement à la fourchette',
          'Retirer cardamome si présente',
          'Ajouter sel marin au goût (très peu)',
          'Servir tiède'
        ],
        conseil: '✅ Cookeo = riz parfait : grains séparés, texture tendre, facile à digérer'
      },
      marmite: {
        etapes: [
          'Rincer riz basmati 3-4 fois sous eau froide jusqu\'à eau limpide',
          'Égoutter complètement : sec avant cuisson',
          'Dans marmite : riz rincé + eau mesurée (ratio 1:2 pour Marmite)',
          'Ajouter 2-3 grains cardamome si souhaité',
          'Porter à ébullition vive 1-2 minutes',
          'Réduire feu à minimum, couvrir hermétiquement',
          'Laisser reposer couverte EXACTEMENT 12 minutes',
          'NE PAS soulever couvercle pendant cuisson',
          'À 12 minutes : soulever couvercle, vérifier : eau absorbée, grains séparés',
          'Aérer doucement à la fourchette (grains restent entiers)',
          'Retirer cardamome',
          'Ajouter sel marin (½ cc max)',
          'Servir tiède'
        ],
        conseil: '✅ Marmite = riz traditionnel, texture idéale, bon pour estomac délicat'
      }
    },

    bouillon: {
      nom: 'Bouillon de poulet dégraissé Phase 3',
      duree: 'Minéraux & collagène Phase 3 — Jour 8-10',
      ingredients: [
        '300g cuisses de poulet (chair + os) OU carcasse entière',
        '1 carotte (pelée, coupée en 2)',
        '1 tige céleri (coupée en 3 morceaux)',
        '½ oignon (pelé, coupé en 2)',
        '3L eau filtrée froide',
        '1 feuille de laurier',
        '3-4 grains de poivre noir entiers',
        'Sel marin : 1 pincée (après dégraissage)'
      ],
      cookeo: {
        etapes: [
          'Préparer poulet : retirer peau si possible (réduit matière grasse)',
          'Laver légumes : carotte pelée + coupée, céleri nettoyé, oignon pelé',
          'Dans cuve Cookeo : eau froide + poulet + carotte + céleri + oignon + laurier + poivre',
          'Fermer couvercle, sélectionner MODE SOUS-PRESSION',
          'Cuisson EXACTEMENT 30 minutes sous pression maximale',
          'Relâche naturelle vapeur 5-10 minutes (important pour collagène)',
          'Ouvrir couvercle : liquide doit être ambré clair',
          'Filtrer bouillon à travers passoire fine (retirer os, légumes cuits)',
          'Laisser refroidir 15 minutes à température ambiante',
          'Placer bouillon au réfrigérateur 2-3 heures (graisse remonte dessus)',
          'Retirer graisse solidifiée surface avec cuillère',
          'Réchauffer bouillon dégraissé, ajouter 1 pincée sel marin',
          'Servir chaud dans bol'
        ],
        conseil: '✅ Cookeo = bouillon riche en collagène, dégraissage facile au frais'
      },
      marmite: {
        etapes: [
          'Préparer poulet : retirer peau maximale (réduit gras)',
          'Laver légumes : carotte pelée + coupée, céleri nettoyé, oignon pelé',
          'Dans marmite grande : eau froide + poulet + carotte + céleri + oignon + laurier + poivre',
          'Porter à ébullition vive, écumer mousse blanche surface 2-3 minutes',
          'Réduire feu à minimum, couvrir à moitié',
          'Laisser mijoter très doucement EXACTEMENT 1h30 minutes',
          'Ajouter eau si niveau baisse trop (ne pas laisser découvert)',
          'À 1h10 : vérifier saveur & couleur (doit être ambré clair)',
          'Laisser finir les 20 dernières minutes',
          'Retirer du feu, laisser reposer 10 minutes',
          'Filtrer à travers passoire fine : retirer os, légumes, herbes',
          'Laisser refroidir 20 minutes à température ambiante',
          'Réfrigérer 2-3 heures : graisse remonte',
          'Retirer graisse solidifiée à la cuillère',
          'Réchauffer bouillon dégraissé, ajouter sel marin au goût',
          'Servir chaud'
        ],
        conseil: '✅ Marmite = bouillon traditionnel très riche en minéraux & collagène, saveur supérieure'
      }
    }
  };

  const recetteActuelle = recettes[recetteType] || recettes.lentilles;

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
              🕐 {recetteActuelle.duree} • Phase 3 protéines & lipides
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
              color: '#4CAF50',
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
                  background: '#E8F5E9',
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
                  background: methodPreferee === 'cookeo' ? '#E8F5E9' : 'white',
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
                  background: methodPreferee === 'marmite' ? '#E8F5E9' : 'white',
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
              color: '#4CAF50',
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
                etape === '' ? (
                  <li key={idx} style={{ height: '12px' }}></li>
                ) : (
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
                )
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
