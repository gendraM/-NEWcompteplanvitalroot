import { useState } from 'react';

/**
 * 🥘 Modal Recettes Phase 5 — Alimentation normale contrôlée
 * 4 recettes essentielles : Poulet blanc, Poisson blanc, Riz complet, Patate douce
 * Couleur : Vert clair (#10B981/#34D399) — gradient cohérent Phase 3
 * Pattern identique à RecettesPhase4Modal.js (prouvé stable)
 */

const RecettesPhase5Modal = ({ isOpen, recetteType = 'saumon', onClose }) => {
  const [methodPreferee, setMethodPreferee] = useState('cookeo');

  // 4 recettes essentielles Phase 5 (fiche métier)
  const recettes = {
    saumon: {
      nom: 'Saumon vapeur ou papillote',
      ingredients: ['100g saumon frais', 'Citron frais', 'Herbes douces'],
      cookeo: {
        duree: '8 min',
        etapes: ['Déposer le saumon en papillote', 'Ajouter citron et herbes', 'Cuire à la vapeur 8 min'],
        conseil: 'Le saumon est introduit en phase 5 ; privilégier vapeur ou papillote.'
      },
      marmite: {
        duree: '10 min',
        etapes: ['Placer le saumon dans le panier vapeur', 'Couvrir et cuire doucement 10 min', 'Ajouter le citron après cuisson'],
        conseil: 'Conserver une texture tendre et éviter la friture.'
      }
    },
    poulet: {
      nom: 'Poulet blanc vapeur',
      ingredients: [
        '200g blanc de poulet fermier',
        '1 pincée sel marin',
        '1 trait jus citron frais',
        'Thym frais (optionnel)'
      ],
      cookeo: {
        duree: '12 min',
        etapes: [
          'Découper blanc poulet en cubes réguliers',
          'Verser 300ml eau dans cuve',
          'Placer trivet avec accessoire vapeur',
          'Poser cubes poulet sur trivet',
          'Couvrir, Sous-pression, 12 min',
          'Relâcher pression naturellement',
          'Arroser jus citron, saupoudrer thym'
        ],
        conseil: 'Blanc parfaitement moelleux. Idéal avec légumes vapeur et riz complet.'
      },
      marmite: {
        duree: '20 min',
        etapes: [
          'Découper blanc poulet en cubes réguliers',
          'Verser 300ml eau dans marmite',
          'Placer grille vapeur',
          'Poser cubes poulet sur grille',
          'Couvrir, feu moyen-doux, 20 min',
          'Vérifier cuisson à la fourchette',
          'Arroser jus citron, saupoudrer thym'
        ],
        conseil: 'Protéine légère et digeste. Parfait pour commencer Phase 5.'
      }
    },
    poisson: {
      nom: 'Poisson blanc papillote',
      ingredients: [
        '180g filet poisson blanc (cabillaud, lieu)',
        'Papier cuisson ou feuille aluminium',
        '1 échalote fine',
        'Citron frais + herbes (estragon, persil)'
      ],
      cookeo: {
        duree: '8 min',
        etapes: [
          'Découper papier cuisson 30x40cm',
          'Poser filet poisson au centre',
          'Ajouter échalote, citron, herbes',
          'Refermer papier en papillote (bordures repliées)',
          'Verser 150ml eau dans cuve',
          'Placer trivet, poser papillote',
          'Couvrir, Sous-pression, 8 min',
          'Relâcher pression naturellement'
        ],
        conseil: 'Papillote garde saveurs et minéraux. Très digestible.'
      },
      marmite: {
        duree: '12 min',
        etapes: [
          'Découper papier cuisson 30x40cm',
          'Poser filet poisson au centre',
          'Ajouter échalote, citron, herbes',
          'Refermer papier en papillote (bordures repliées)',
          'Verser 150ml eau dans marmite',
          'Placer grille vapeur, poser papillote',
          'Couvrir, feu moyen, 12 min',
          'Vérifier papillote gonflée = cuisson OK'
        ],
        conseil: 'Meilleure biodisponibilité oméga-3. Saveur délicate préservée.'
      }
    },
    rizcomplet: {
      nom: 'Riz complet cuit',
      ingredients: [
        '100g riz complet naturel',
        '200ml eau filtrée',
        '1 pincée sel marin',
        'Bouquet garni (bay, thym)'
      ],
      cookeo: {
        duree: '20 min',
        etapes: [
          'Rincer riz complet sous eau froide',
          'Verser dans cuve 100g riz',
          'Ajouter 200ml eau + sel',
          'Ajouter bouquet garni',
          'Couvrir, Sous-pression, 20 min',
          'Relâcher pression naturellement 5 min',
          'Aérer à la fourchette'
        ],
        conseil: 'Texture parfaite — grain tendre sans pâteux. Riche en fibres.'
      },
      marmite: {
        duree: '30 min',
        etapes: [
          'Rincer riz complet sous eau froide',
          'Verser dans marmite 100g riz',
          'Ajouter 200ml eau + sel',
          'Ajouter bouquet garni',
          'Porter à ébullition, feu moyen-doux',
          'Couvrir, laisser cuire 30 min',
          'Ne pas remuer pendant cuisson',
          'Laisser reposer 5 min couvert, aérer à la fourchette'
        ],
        conseil: 'Glucides complexes essentiels pour énergie durable.'
      }
    },
    patatadouce: {
      nom: 'Patate douce vapeur',
      ingredients: [
        '200g patate douce (1 moyenne)',
        'Sel marin',
        'Poivre blanc doux',
        'Trait huile coco vierge (optionnel)'
      ],
      cookeo: {
        duree: '12 min',
        etapes: [
          'Laver patate douce brossée',
          'Peler légèrement ou cuire en peau',
          'Découper en bâtons réguliers',
          'Verser 300ml eau dans cuve',
          'Placer trivet avec accessoire vapeur',
          'Poser bâtons patate sur trivet',
          'Couvrir, Sous-pression, 12 min',
          'Relâcher pression naturellement'
        ],
        conseil: 'Sucres lents importants + minéraux. Très satiéfiant.'
      },
      marmite: {
        duree: '15 min',
        etapes: [
          'Laver patate douce brossée',
          'Peler légèrement ou cuire en peau',
          'Découper en bâtons réguliers',
          'Verser 300ml eau dans marmite',
          'Placer grille vapeur',
          'Poser bâtons patate sur grille',
          'Couvrir, feu moyen, 15 min',
          'Tester fourchette — doit être tendant'
        ],
        conseil: 'Source naturelle sucres + fibres solubles. Idéal soir Phase 5.'
      }
    }
  };

  // ⚠️ Sécurité : fallback sur le saumon, réellement introduit en phase 5
  const recetteActuelle = recettes[recetteType] || recettes.saumon;
  const methodActuelle = recetteActuelle[methodPreferee] || recetteActuelle.cookeo;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient vert clair */}
        <div
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            color: 'white',
            padding: '20px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}
        >
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>
            🥘 {recetteActuelle.nom}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.95 }}>
            Phase 5 — Alimentation normale contrôlée
          </p>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Toggle Cookeo / Marmite */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px', fontWeight: 500 }}>
              Préférence cuisson :
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => setMethodPreferee('cookeo')}
                style={{
                  background: methodPreferee === 'cookeo' ? '#10B981' : '#e0e0e0',
                  color: methodPreferee === 'cookeo' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  fontWeight: methodPreferee === 'cookeo' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🍳 Cookeo
              </button>
              <button
                onClick={() => setMethodPreferee('marmite')}
                style={{
                  background: methodPreferee === 'marmite' ? '#10B981' : '#e0e0e0',
                  color: methodPreferee === 'marmite' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  fontWeight: methodPreferee === 'marmite' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🍲 Marmite
              </button>
            </div>
          </div>

          {/* Ingrédients */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#10B981', fontSize: '1.1rem' }}>
              📋 Ingrédients
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              {recetteActuelle.ingredients.map((ing, idx) => (
                <li key={idx} style={{ color: '#333', marginBottom: '4px' }}>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Étapes cuisson */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#10B981', fontSize: '1.1rem' }}>
              👨‍🍳 {methodPreferee === 'cookeo' ? 'Cookeo' : 'Marmite'} — {methodActuelle.duree}
            </h3>
            <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
              {methodActuelle.etapes.map((etape, idx) => (
                <li key={idx} style={{ color: '#333', marginBottom: '6px' }}>
                  {etape}
                </li>
              ))}
            </ol>
          </div>

          {/* Conseil */}
          <div
            style={{
              background: '#f0f9f7',
              border: '2px solid #10B981',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}
          >
            <p style={{ margin: 0, color: '#065f46', fontSize: '0.95rem' }}>
              <strong>💡 Conseil Phase 5 :</strong> {methodActuelle.conseil}
            </p>
          </div>

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            style={{
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            ✅ Fermer recette
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecettesPhase5Modal;
