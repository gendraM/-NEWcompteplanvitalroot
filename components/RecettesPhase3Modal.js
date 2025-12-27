/**
 * 🥘 RECETTES DÉTAILLÉES PHASE 3
 * Modal avec instructions précises Cookeo/Marmite pour protéines & lipides
 * Architecture identique à RecettesPhase2Modal.js (succès éprouvé)
 * Recettes Phase 3 selon documentation officielle
 */

import { useState } from 'react';

export default function RecettesPhase3Modal({ isOpen, onClose, recetteType = 'oeufs' }) {
  const [methodPreferee, setMethodPreferee] = useState('cookeo');

  const recettes = {
    oeufs: {
      nom: 'Œufs mollets & pochés Phase 3',
      duree: 'Protéine Phase 3',
      ingredients: [
        '1 œuf moyen (calibre M)',
        'Eau pour cuisson',
        'Option : 1 pincée de sel marin'
      ],
      cookeo: {
        etapes: [
          'Pour œuf mollet : Trivet dans la cuve + 200ml eau',
          'Ajouter œuf dans panier vapeur (coquille intacte)',
          'Cuisson sous pression 6 minutes',
          'Trempage 1-2 min dans eau froide pour arrêter cuisson',
          'Écoquage délicat (blanc ferme, jaune coulant)',
          'Servir tiède avec pain complet si souhaité',
          '',
          'Pour œuf poché : Remplir 3/4 eau, ajouter œuf dans petit bol inox',
          'Mettre bol sur trivet',
          'Cuisson sous pression 5 minutes',
          'Sortir délicatement avec cuillère'
        ],
        conseil: 'Œuf mollet : meilleur contrôle cuisson, jaune parfait coulant'
      },
      marmite: {
        etapes: [
          'Pour œuf mollet : Porter eau à ébullition légère',
          'Ajouter œuf délicatement avec cuillère',
          'Laisser 6-7 minutes selon calibre œuf',
          'Vérifier cuisson (blanc ferme, jaune coulant)',
          'Refroidissement eau froide 1 min',
          'Écoquage très délicat du bout des doigts',
          '',
          'Pour œuf poché : Eau frémissante + 1 cc vinaigre blanc',
          'Former petit vortex dans l\'eau',
          'Casser œuf dans petit bol, verser doucement',
          'Laisser 3-4 minutes',
          'Sortir avec écumoire'
        ],
        conseil: 'Méthode traditionnelle, contrôle parfait de la cuisson'
      }
    },
    avocat: {
      nom: 'Avocat mûr Phase 3',
      duree: 'Collation J16h ou repas',
      ingredients: [
        '1 avocat moyen bien mûr',
        'Jus de citron (1/2 citron)',
        'Sel marin, poivre optionnel'
      ],
      cookeo: {
        etapes: [
          'L\'avocat NE se cuit PAS au Cookeo',
          'Choisir avocat vraiment mûr (cède légèrement à la pression)',
          'Couper en deux dans le sens de la longueur',
          'Retirer le noyau délicatement',
          'À la cuillère, extraire la chair très mûre',
          'Écraser légèrement à la fourchette pour texture lisse',
          'Ajouter jus citron frais immédiatement (prévient oxydation)',
          'Servir de suite pour éviter brunissement'
        ],
        conseil: 'Pas de cuisson ! Conserve nutriments + acides gras bénéfiques'
      },
      marmite: {
        etapes: [
          'L\'avocat ne cuit jamais',
          'Choisir avocat bien mûr mais pas surcouit',
          'Vérifier maturité : cède doucement au toucher',
          'Couper en deux, retirer noyau',
          'Manger à la cuillère directement ou écraser',
          'Pincée sel marin, goutte citron frais',
          'Consommer immédiatement après préparation',
          'Si préparation à l\'avance : film alimentaire + frigo max 2h'
        ],
        conseil: 'Cru = conservation acides gras essentiels, meilleure digestibilité'
      }
    },
    huiles: {
      nom: 'Huiles vierges Phase 3',
      duree: 'Matin + Soir',
      ingredients: [
        'Huile olive vierge première pression OU',
        'Huile de coco vierge OU',
        'Beurre clarifié (ghee)'
      ],
      cookeo: {
        etapes: [
          'Huiles ne se cuisent PAS au Cookeo directement',
          'Huile d\'olive : ajouter CRU après cuisson',
          'Utiliser sur légumes cuits, poisson, yaourt',
          'Dosage : 0.5 CS (8ml) J8, 0.75 CS (12ml) J9, 1 CS (15ml) J10',
          'Bien mélanger pour répartition homogène',
          'Conservation : flacon opaque, température ambiante',
          'Huile coco : peut supporter légère chaleur',
          'Beurre clarifié : sans lactose, permet chaleur douce'
        ],
        conseil: 'Huiles : toujours crues pour préserver oméga-3 et antioxydants'
      },
      marmite: {
        etapes: [
          'Preparation des huiles : aucune cuisson',
          'Mesurer précisément selon jour reprise',
          'Huile olive : première pression à froid OBLIGATOIRE',
          'Garder flacon dans placard frais + obscur',
          'Ne pas exposer à la lumière (oxydation)',
          'Ajouter en final de préparation',
          'Bien émulsionner avec autres ingrédients',
          'Vérifier date péremption (consomm avant 6 mois ouvert)'
        ],
        conseil: 'Qualité supérieure = meilleure absorption nutriments + biodisponibilité'
      }
    },
    fromage: {
      nom: 'Fromage blanc & Yaourt Phase 3',
      duree: 'Protéine Phase 3',
      ingredients: [
        '100g fromage blanc 0% OU',
        '125g yaourt nature 0% (sans sucre)',
        'Option : 1 cc miel pur (très peu)'
      ],
      cookeo: {
        etapes: [
          'Fromage blanc & yaourt NE se cuisent PAS',
          'Sortir du frigo 15 min avant consommation',
          'Température ambiante optimale pour goût + digestion',
          'Bien vérifier : nature, 0% matière grasse, SANS sucre',
          'Lire étiquette : pas d\'additifs, pas d\'aspartame',
          'Portion : 100g fromage blanc OU 125g yaourt',
          'Servir dans bol propre',
          'Possibilité ajouter 1 cc huile d\'olive par-dessus',
          'Consommer dans 1-2h après sortie du frigo'
        ],
        conseil: 'Froid = meilleure conservation probiotiques, meilleure texture'
      },
      marmite: {
        etapes: [
          'Jamais de cuisson',
          'Vérifier provenance : lait entier fermenté de qualité',
          'Si intolérance lactose : remplacer par boisson coco/amande',
          'Conservation : frigo, porte (zone moins froide)',
          'DDLC : strictement respecter, ne pas dépasser',
          'Après ouverture : couvrir, frigo max 3 jours',
          'Sensation visqueuse = normal, signe probiotiques vivants',
          'Goût légèrement acide = fermentation saine'
        ],
        conseil: 'Ferments vivants = aide reconstruction intestinale post-jeûne'
      }
    },
    poisson: {
      nom: 'Poisson gras vapeur Phase 3',
      duree: 'Repas principal (13h)',
      ingredients: [
        '80-100g saumon/sardines frais OU',
        '80g thon nature boîte OU',
        '80g poisson blanc (lieu, cabillaud)',
        'Sel marin, herbes (optionnel)'
      ],
      cookeo: {
        etapes: [
          'Poisson frais : nettoyer, retirer arêtes visibles',
          'Placer sur papier sulforisé dans panier vapeur',
          'Trivet + 200ml eau dans cuve',
          'Saumon : 8 min sous pression',
          'Poisson blanc : 6 min sous pression',
          'Vérifier cuisson : chair opaque, s\'émiette facilement',
          'Sortir délicatement, laisser reposer 2 min',
          'Arroser d\'huile olive crue si souhaité',
          'Poisson boîte : égoutter minutieusement, réchauffer à peine'
        ],
        conseil: 'Vapeur = préserve oméga-3, évite oxydation graisses nobles'
      },
      marmite: {
        etapes: [
          'Poisson dans panier vapeur au-dessus eau frémissante',
          'Saumon : 12-15 min selon épaisseur',
          'Poisson blanc : 10-12 min',
          'Sardines fraîches : 8-10 min',
          'Vérifier tendreté à la fourchette (chair blanche opaque)',
          'Poisson vapeur ne doit pas s\'émietter (signe surcuisson)',
          'Laisser tiédir légèrement avant service',
          'Poisson boîte : vider eau, mélanger avec huile, servir tiède'
        ],
        conseil: 'Cuisson douce préserve nutriments, meilleure assimilation protéines'
      }
    }
  };

  const recetteActuelle = recettes[recetteType] || recettes.oeufs;

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
