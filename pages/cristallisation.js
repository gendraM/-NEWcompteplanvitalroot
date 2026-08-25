import { useState, useEffect } from 'react';
import DefiCard from '../components/DefiCard';
import { genererDefisCristallisation } from '../lib/defisCristallisationGenerator';
import { analyseContexteReprise } from '../lib/analyseContexteReprise';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { CRITERES_CRISTALLISATION } from '../data/referentiel';

export default function Cristallisation() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // === ÉTATS LOCALSTORAGE (Progression) ===
  const [programmeCristallisation, setProgrammeCristallisation] = useState(null);
  const [dateDebutCristallisation, setDateDebutCristallisation] = useState(null);
  const [jourEnCours, setJourEnCours] = useState(1);
  const [joursValides, setJoursValides] = useState([]);
  
  // === ÉTATS SUPABASE (Données) ===
  const [repasRecents, setRepasRecents] = useState([]);
  const [poidsActuel, setPoidsActuel] = useState(null);
  const [poidsReference, setPoidsReference] = useState(null);
  const [scoreQualite, setScoreQualite] = useState(0);
  const [chargement, setChargement] = useState(true);

  // === DÉTECTION CLIENT ===
  useEffect(() => {
    setIsClient(true);
  }, []);

  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    if (!isClient) return;
    chargerDonnees();
  }, [isClient]);

  const chargerDonnees = async () => {
    try {
      setChargement(true);

      // 🧪 MODE TEST : Vérifier si données test existent
      const modeTest = localStorage.getItem('TEST_context') === 'cristallisation';
      const cleProgr = modeTest ? 'TEST_programmeCristallisation' : 'programmeCristallisation';
      console.log('[CRISTALLISATION] Mode:', modeTest ? 'TEST' : 'PRODUCTION', '- Clé:', cleProgr);

      // 1️⃣ LOCALSTORAGE - Programme cristallisation
      const programmeStr = localStorage.getItem(cleProgr);
      if (programmeStr) {
        const programme = JSON.parse(programmeStr);
        setProgrammeCristallisation(programme);
        setDateDebutCristallisation(programme.dateDebut);
        setPoidsReference(programme.poidsReference);
        
        // Calculer jour en cours
        const dateDebut = new Date(programme.dateDebut);
        const aujourdhui = new Date();
        const diffJours = Math.floor((aujourdhui - dateDebut) / (1000 * 60 * 60 * 24));
        setJourEnCours(Math.min(diffJours + 1, 45));
      }

      // 2️⃣ LOCALSTORAGE - Jours validés
      const cleJours = modeTest ? 'TEST_joursValidesCristallisation' : 'joursValidesCristallisation';
      const joursStr = localStorage.getItem(cleJours);
      if (joursStr) {
        setJoursValides(JSON.parse(joursStr));
      }

      // 2️⃣ SUPABASE - Repas récents (7 derniers jours)
      const dateIlYa7Jours = new Date();
      dateIlYa7Jours.setDate(dateIlYa7Jours.getDate() - 7);
      
      const { data: repas } = await supabase
        .from('repas_reels')
        .select('*')
        .gte('date', dateIlYa7Jours.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (repas) {
        setRepasRecents(repas);
        calculerScoreQualite(repas);
      }

      // 3️⃣ SUPABASE - Poids actuel (dernier enregistré)
      const { data: dernierPoids } = await supabase
        .from('profil')
        .select('poids_actuel')
        .single();
      
      if (dernierPoids) {
        setPoidsActuel(dernierPoids.poids_actuel);
      }

    } catch (error) {
      console.error('Erreur chargement données cristallisation:', error);
    } finally {
      setChargement(false);
    }
  };

  const calculerScoreQualite = (repas) => {
    if (!repas || repas.length === 0) {
      setScoreQualite(0);
      return;
    }

    // Score basé sur qualité nutritionnelle (à affiner selon referentiel)
    const totalRepas = repas.length;
    const repasQualite = repas.filter(r => !r.est_extra).length;
    const score = (repasQualite / totalRepas) * 5;
    setScoreQualite(Math.round(score * 10) / 10);
  };

  const calculerProgression = () => {
    if (!jourEnCours) return 0;
    return Math.round((jourEnCours / 45) * 100);
  };

  const getDateFin = () => {
    if (!dateDebutCristallisation) return '';
    const dateFin = new Date(dateDebutCristallisation);
    dateFin.setDate(dateFin.getDate() + 44);
    return dateFin.toLocaleDateString('fr-FR');
  };

  const getEcartPoids = () => {
    if (!poidsActuel || !poidsReference) return 0;
    return Math.round((poidsActuel - poidsReference) * 10) / 10;
  };

  const getMessagePoids = () => {
    const ecart = getEcartPoids();
    if (ecart === 0) return "🟢 Ton poids est stable, continue !";
    if (ecart > 0 && ecart <= 1) return "🟡 Légère hausse, c'est normal pendant la stabilisation.";
    if (ecart > 1) return "🟠 Attention, surveille tes extras et portions.";
    return "🟢 Excellent, ton poids est stable.";
  };

  const allerSuiviQuotidien = () => {
    router.push('/cristallisation-quotidien');
  };

  // === SI PAS DE PROGRAMME ===
  if (isClient && !programmeCristallisation && !chargement) {
    return (
      <div style={{ padding: 20, textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
        <h1>🏔️ Phase Cristallisation</h1>
        <p style={{ marginBottom: 30, color: '#666' }}>
          Tu n'as pas encore commencé la phase de cristallisation.
        </p>
        <p style={{ marginBottom: 20, color: '#666' }}>
          Cette phase débute automatiquement après avoir terminé ta reprise alimentaire.
        </p>
        <button
          onClick={() => router.push('/reprise-alimentaire-apres-jeune')}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ← Retour à la reprise
        </button>
      </div>
    );
  }

  if (!isClient || chargement) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  // === GÉNÉRATION DES DÉFIS COMPORTEMENTAUX (uniquement phase cristallisation) ===
  let defisCristallisation = [];
  let debugDifficultes = [];
  let debugContextes = [];
  // DEBUG : Affichage du programme brut (toujours visible tout en haut)
  const cleDebug = (typeof window !== 'undefined' && localStorage.getItem('TEST_context') === 'cristallisation') ? 'TEST_programmeCristallisation' : 'programmeCristallisation';
  let debugProgramme = null;
  if (typeof window !== 'undefined') {
    try {
      debugProgramme = JSON.parse(localStorage.getItem(cleDebug) || 'null');
    } catch(e) { debugProgramme = null; }
  }


  if (programmeCristallisation && programmeCristallisation.bilanReprise) {
    // Analyse contextuelle du texte libre si présent
    let difficultes = programmeCristallisation.bilanReprise.difficultes || [];
    let contextes = programmeCristallisation.bilanReprise.contextes || [];
    // Correction experte : si aucune difficulté n'est présente, on analyse dynamiquement le texte libre ou le champ "autre"
    if ((!difficultes || difficultes.length === 0)) {
      const texteLibre = programmeCristallisation.bilanReprise.texteLibre || programmeCristallisation.bilanReprise.autre || '';
      if (texteLibre && typeof texteLibre === 'string') {
        const analyse = analyseContexteReprise(texteLibre);
        difficultes = Array.from(new Set([...(difficultes || []), ...(analyse.difficultes || [])]));
        contextes = Array.from(new Set([...(contextes || []), ...(analyse.contexte ? [analyse.contexte] : [])]));
      }
    }
    debugDifficultes = difficultes;
    debugContextes = contextes;
    defisCristallisation = genererDefisCristallisation({ difficultes, contextes });
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* DEBUG : Affichage brut du programme de cristallisation (toujours visible) */}
      {debugProgramme && (
        <div style={{background:'#e3f2fd',border:'2px solid #1976d2',borderRadius:10,padding:14,marginBottom:18,overflowX:'auto'}}>
          <b>Programme cristallisation (JSON brut) :</b><br/>
          <pre style={{fontSize:13,whiteSpace:'pre-wrap',wordBreak:'break-all',margin:0}}>{JSON.stringify(debugProgramme, null, 2)}</pre>
        </div>
      )}
      {/* HEADER BANDEAU */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: '24px',
        color: '#fff',
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>
          🏆 CRISTALLISATION
        </h1>
        <div style={{ fontSize: 15, opacity: 0.95, marginBottom: 16 }}>
          Du {new Date(dateDebutCristallisation).toLocaleDateString('fr-FR')} au {getDateFin()} • Jour {jourEnCours}/45
        </div>
        
        {/* Barre de progression */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 20,
          height: 24,
          overflow: 'hidden',
          marginBottom: 12
        }}>
          <div style={{
            background: '#4caf50',
            height: '100%',
            width: `${calculerProgression()}%`,
            transition: 'width 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 8,
            fontSize: 12,
            fontWeight: 600
          }}>
            {calculerProgression()}%
          </div>
        </div>

        {/* Bouton suivi quotidien */}
        <button
          onClick={allerSuiviQuotidien}
          style={{
            background: '#fff',
            color: '#667eea',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          📅 Mon suivi quotidien →
        </button>
      </div>

      {/* BILAN REPRISE */}
      {programmeCristallisation?.bilanReprise && (
        <div style={{
          background: '#f5f5f5',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 20, color: '#333' }}>
            📊 Ton bilan reprise
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Jeûne</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {programmeCristallisation.bilanReprise.dureeJeune} jours
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Reprise</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {programmeCristallisation.bilanReprise.dureeReprise} jours
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Conformité</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#4caf50' }}>
                {programmeCristallisation.bilanReprise.tauxConformite}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Poids fin</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {poidsReference} kg
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUIVI POIDS */}
      <div style={{
        background: '#fff',
        border: '2px solid #e0e0e0',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 20, color: '#333' }}>
          ⚖️ Suivi poids
        </h2>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
            📍 Référence : {poidsReference} kg (fin reprise)
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            📈 Aujourd'hui : {poidsActuel || '—'} kg
          </div>
          {poidsActuel && (
            <div style={{ fontSize: 16, color: getEcartPoids() > 1 ? '#ff9800' : '#4caf50' }}>
              ({getEcartPoids() > 0 ? '+' : ''}{getEcartPoids()} kg)
            </div>
          )}
        </div>
        <div style={{
          background: '#f5f5f5',
          borderRadius: 8,
          padding: 12,
          fontSize: 14,
          marginBottom: 12
        }}>
          {getMessagePoids()}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => {/* TODO: Ouvrir modal saisie poids */}}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              flex: 1
            }}
          >
            📊 Saisir mon poids
          </button>
          <button
            onClick={() => {/* TODO: Afficher historique */}}
            style={{
              background: '#fff',
              color: '#1976d2',
              border: '2px solid #1976d2',
              borderRadius: 6,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              flex: 1
            }}
          >
            📈 Voir historique
          </button>
        </div>
      </div>

      {/* QUALITÉ NUTRITIONNELLE */}
      <div style={{
        background: '#fff',
        border: '2px solid #e0e0e0',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 20, color: '#333' }}>
          🥗 Qualité nutritionnelle
        </h2>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 16, marginBottom: 8 }}>
            Score de la semaine : <span style={{ 
              color: scoreQualite >= 4 ? '#4caf50' : scoreQualite >= 3 ? '#ff9800' : '#f44336',
              fontWeight: 600
            }}>
              {scoreQualite}/5
            </span>
          </div>
          <div style={{ fontSize: 24, marginBottom: 8 }}>
            {'★'.repeat(Math.round(scoreQualite))}{'☆'.repeat(5 - Math.round(scoreQualite))}
          </div>
        </div>
        <div style={{
          background: '#f5f5f5',
          borderRadius: 8,
          padding: 12,
          fontSize: 14
        }}>
          {scoreQualite >= 4 ? '✅ Tu privilégies des aliments de qualité !' :
           scoreQualite >= 3 ? '🟡 Bonne base, essaie d\'améliorer encore' :
           '🟠 Attention à la qualité de tes aliments'}
        </div>
      </div>

      {/* DEBUG : Affichage brut du programme de cristallisation */}
      {debugProgramme && (
        <div style={{background:'#e3f2fd',border:'1.5px dashed #1976d2',borderRadius:8,padding:12,marginBottom:16}}>
          <b>Programme cristallisation (JSON brut) :</b><br/>
          <pre style={{fontSize:12,whiteSpace:'pre-wrap',wordBreak:'break-all',margin:0}}>{JSON.stringify(debugProgramme, null, 2)}</pre>
        </div>
      )}
      {/* DEBUG : Affichage brut des difficultés/contextes */}
      {debugDifficultes.length > 0 && (
        <div style={{background:'#fffbe6',border:'1.5px dashed #fbc02d',borderRadius:8,padding:12,marginBottom:16}}>
          <b>Difficultés transmises :</b> <span style={{fontFamily:'monospace',fontSize:13}}>{JSON.stringify(debugDifficultes)}</span><br/>
          <b>Contextes transmis :</b> <span style={{fontFamily:'monospace',fontSize:13}}>{JSON.stringify(debugContextes)}</span>
        </div>
      )}
      {/* DÉFIS COMPORTEMENTAUX CRISTALLISATION */}
      {programmeCristallisation && defisCristallisation.length > 0 && (
        <div style={{
          background: '#f5f7ff',
          border: '2px solid #667eea',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 20, color: '#333' }}>
            🎯 Défis comportementaux personnalisés
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {defisCristallisation.map((defi, idx) => (
              <DefiCard key={idx} defi={defi} />
            ))}
          </div>
        </div>
      )}
      <div style={{
        background: '#e8f5e9',
        border: '2px solid #66bb6a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#1b5e20' }}>🛒 Planifier mes repas et mes courses</h2>
        <p style={{ margin: '0 0 14px', color: '#455a64' }}>
          Prépare tes repas et ta liste depuis le plan général, avec le contexte de ton parcours de cristallisation.
        </p>
        <button type="button" onClick={() => router.push('/plan?source=cristallisation')} style={{ background: '#2e7d32', color: 'white', border: 0, borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
          Ouvrir mon plan et mes courses →
        </button>
      </div>
      {/* MESSAGE CONSTRUCTION */}
      <div style={{
        background: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🚧</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Page en construction
        </div>
        <div style={{ fontSize: 14, color: '#666' }}>
          Les sections suivantes seront ajoutées prochainement :
          <br />• Jeûnes ponctuels (16h, 24h, 48h)
          <br />• Statistiques détaillées
        </div>
      </div>
    </div>
  );
}
