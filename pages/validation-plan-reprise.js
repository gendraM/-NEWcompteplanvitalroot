import { useState, useEffect, useMemo } from 'react'
import alimentsRepriseJeune from '../data/alimentsRepriseJeune'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { validerProgrammeReprise } from '../lib/jeuneUtils'
import {
  choixCoursesComplets,
  creerConfigurationCoursesReprise,
  genererListeCoursesPersonnalisee,
  grouperListeCoursesReprise
} from '../lib/listeCoursesReprise'

export default function ValidationPlanReprise() {
  // ============================================
  // HOOKS D'ÉTAT (INITIALISATION EN PREMIER)
  // ============================================
  const router = useRouter()
  
  const [programme, setProgramme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkboxLu, setCheckboxLu] = useState(false)
  const [checkboxEngage, setCheckboxEngage] = useState(false)
  const [validating, setValidating] = useState(false)
  const [message, setMessage] = useState('')
  const [choixCourses, setChoixCourses] = useState({})

  // ============================================
  // USEEFFECT - CHARGEMENT PROGRAMME
  // ============================================
  useEffect(() => {
    const chargerProgramme = async () => {
      try {
        setLoading(true)
        setError(null)
        const programmeLocal = localStorage.getItem('programmeReprise')
        if (programmeLocal) {
          const parsed = JSON.parse(programmeLocal)
          setProgramme(parsed)
          setLoading(false)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id) {
          const { data: programmeDistant, error: erreurProgramme } = await supabase
            .from('reprises_alimentaires')
            .select('*')
            .eq('user_id', user.id)
            .eq('statut', 'proposition')
            .order('plan_genere_le', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (erreurProgramme) throw erreurProgramme
          if (programmeDistant) {
            localStorage.setItem('programmeReprise', JSON.stringify(programmeDistant))
            setProgramme(programmeDistant)
            setLoading(false)
            return
          }
        }

        setError('Aucun programme de reprise en attente de validation.')
        setLoading(false)
      } catch (err) {
        console.error('Erreur chargement:', err)
        setError('Erreur lors du chargement du programme.')
        setLoading(false)
      }
    }

    chargerProgramme()
  }, [])

  // ============================================
  // VARIABLES CALCULÉES
  // ============================================
  const configurationCourses = useMemo(
    () => programme ? creerConfigurationCoursesReprise(programme) : { periode: null, indispensables: [], groupes: [] },
    [programme]
  )
  const choixComplets = choixCoursesComplets(configurationCourses, choixCourses)
  const listeCoursesPersonnalisee = useMemo(
    () => programme ? genererListeCoursesPersonnalisee(programme, choixCourses) : [],
    [programme, choixCourses]
  )
  const listeCoursesGroupee = grouperListeCoursesReprise(listeCoursesPersonnalisee)
  const peutValider = checkboxLu && checkboxEngage && choixComplets && !validating

  useEffect(() => {
    if (!programme) return
    setChoixCourses(programme.options?.choix_courses || {})
  }, [programme?.id, programme?.statut])

  // ============================================
  // HANDLERS / FONCTIONS
  // ============================================
  const basculerChoixCourse = (groupeId, nom) => {
    setChoixCourses(choixActuels => {
      const groupe = choixActuels[groupeId] || []
      const prochainsChoix = {
        ...choixActuels,
        [groupeId]: groupe.includes(nom)
          ? groupe.filter(item => item !== nom)
          : [...groupe, nom]
      }
      if (programme) {
        const programmeAvecChoix = {
          ...programme,
          liste_courses: genererListeCoursesPersonnalisee(programme, prochainsChoix),
          options: {
            ...(programme.options || {}),
            choix_courses: prochainsChoix,
            liste_courses_personnalisee: false,
            periode_liste_courses: configurationCourses.periode
          }
        }
        localStorage.setItem('programmeReprise', JSON.stringify(programmeAvecChoix))
      }
      return prochainsChoix
    })
  }

  const handleValider = async () => {
    if (!peutValider) return;
    setValidating(true);
    setError(null);

    if (!programme) {
      setError('Aucun plan à valider. Merci de régénérer le plan.');
      setValidating(false);
      return;
    }

    try {
      const optionsPersonnalisees = {
        ...(programme.options || {}),
        choix_courses: choixCourses,
        liste_courses_personnalisee: true,
        periode_liste_courses: configurationCourses.periode
      };
      let programmeValide = {
        ...programme,
        statut: 'plan_valide',
        liste_courses: listeCoursesPersonnalisee,
        options: optionsPersonnalisees
      };
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.id && programme.id) {
        const resultat = await validerProgrammeReprise(programme.id, user.id, {
          listeCourses: listeCoursesPersonnalisee,
          choixCourses,
          periode: configurationCourses.periode,
          optionsExistantes: programme.options
        });
        if (!resultat.success) throw new Error(resultat.message);
        programmeValide = {
          ...programmeValide,
          ...resultat.programme,
          jours_detailles: programme.jours_detailles || programme.jours || []
        };
      }

      localStorage.setItem('programmeRepriseValide', JSON.stringify(programmeValide));
      localStorage.removeItem('programmeReprise');
      setProgramme(programmeValide);
      setMessage('✅ Programme validé ! Il reste lié au même parcours et ta copie locale est conservée.');

      setTimeout(() => {
        router.push('/reprise-alimentaire-apres-jeune');
      }, 1200);
    } catch (e) {
      console.error('Erreur validation du programme:', e);
      setError(e.message || 'Erreur lors de la sauvegarde du plan.');
      setValidating(false);
    }
  }

  // ============================================
  // RENDU JSX
  // ============================================
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>⏳ Chargement du programme...</h1>
      </div>
    )
  }

  if (error || !programme) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>❌ {error || 'Programme introuvable'}</h1>
        <p style={{ marginTop: '1rem', color: '#666' }}>
          Aucun programme de reprise n'est actuellement en attente de validation.
        </p>
        <Link href="/jeune" style={{ 
          display: 'inline-block', 
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          background: '#4CAF50',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px'
        }}>
          ← Retour au jeûne
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>
          📋 Validation de ton plan de reprise
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Jeûne de {programme.duree_jeune_jours} jours → Reprise de {programme.duree_reprise_jours} jours
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
          Du {new Date(programme.date_debut_reprise).toLocaleDateString('fr-FR')} au {new Date(programme.date_fin_reprise).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* PHASES EN MODE SCROLL-SNAP (REELS/SHORTS) */}
      <div
        style={{
          scrollSnapType: 'y mandatory',
          overflowY: 'auto',
          maxHeight: '80vh',
          minHeight: '400px',
          marginBottom: '2rem',
          borderRadius: '16px',
          background: '#f8f8fc',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          position: 'relative',
        }}
      >
        <h2 style={{ margin: '1.2rem 0 1.2rem 0', fontSize: '1.3rem', color: '#333', textAlign:'center' }}>
          🗓️ Les 5 phases de ta reprise (scroll vertical)
        </h2>
        {programme.phases && Object.entries(programme.phases).map(([phaseKey, phase], idx) => {
          const phaseNum = parseInt(phaseKey.replace('phase', ''))
          const couleurs = ['#E3F2FD', '#F3E5F5', '#FFF3E0', '#E8F5E9', '#FFF8E1']
          const couleursBordure = ['#2196F3', '#9C27B0', '#FF9800', '#4CAF50', '#FFB300']
          const alimentsPhase = alimentsRepriseJeune
            .filter(a => a.phase === phaseNum)
            .sort((a, b) => (b.favoriseCetose ? 1 : 0) - (a.favoriseCetose ? 1 : 0))
            .slice(0, 4)
          const emojiCat = {
            liquide: '🥤',
            légume: '🥕',
            protéine: '🥚',
            lipide: '🥑',
            féculent: '🍚',
            fruit: '🍏',
            "": '🍽️'
          }
          // Exemples de menus par phase (cohérent avec la phase)
          const exemplesMenu = [
            ["Bouillon de légumes clair", "Eau citronnée", "Jus de carotte dilué"],
            ["Purée de courgette", "Compote maison", "Carottes vapeur"],
            ["Lentilles corail", "Riz basmati", "Légumes vapeur", "Œuf mollet en fin de phase"],
            ["Poulet ou dinde vapeur", "Poisson blanc en papillote", "Féculent doux", "Petite crudité à partir du 2e jour"],
            ["Saumon vapeur", "Pain complet au levain", "Lentilles vertes", "Fruit frais"]
          ]
          // Semaine-type par phase (rappel explicite de la phase)
          const semainesType = [
            [
              "Lundi : Bouillon de légumes, eau citronnée",
              "Mardi : Bouillon, jus de carotte dilué",
              "Mercredi : Bouillon, compote maison",
              "Jeudi : Bouillon, légumes vapeur",
              "Vendredi : Bouillon, jus de légumes",
              "Samedi : Bouillon, eau citronnée",
              "Dimanche : Bouillon, compote maison"
            ],
            [
              "Lundi : Purée de courgette, compote maison",
              "Mardi : Légumes vapeur, riz semi-complet",
              "Mercredi : Légumes + compote, bouillon",
              "Jeudi : Riz + légumes, compote",
              "Vendredi : Légumes, céréales douces, fruits cuits",
              "Samedi : Légumes, compote",
              "Dimanche : Riz, légumes, fruits cuits"
            ],
            [
              "Lundi : Légumes + œuf mollet, compote",
              "Mardi : Légumes vapeur, riz, œuf",
              "Mercredi : Légumes + avocat, bouillon",
              "Jeudi : Riz + légumes, œuf poché en fin de phase",
              "Vendredi : Légumes, céréales douces, fruits cuits",
              "Samedi : Légumes, œuf, compote",
              "Dimanche : Riz, légumes, fruits cuits"
            ],
            [
              "Lundi : Poulet vapeur, légumes cuits",
              "Mardi : Poisson blanc en papillote, concombre épluché",
              "Mercredi : Dinde vapeur, carotte très finement râpée",
              "Jeudi : Poisson blanc, riz complet",
              "Vendredi : Poulet, patate douce, tomate pelée",
              "Samedi : Dinde, légumes cuits",
              "Dimanche : Poisson blanc, quinoa"
            ],
            [
              "Lundi : Pain complet au levain, lentilles vertes, légumes vapeur",
              "Mardi : Pâtes complètes, saumon vapeur, salade verte",
              "Mercredi : Fromage chèvre, sarrasin, légumes cuits",
              "Jeudi : Pois chiches, légumes, pomme bio",
              "Vendredi : Épeautre complet, maquereau, légumes vapeur",
              "Samedi : Yaourt fermenté, fruits frais, noix de cajou",
              "Dimanche : Bœuf maigre, légumes variés, kiwi"
            ]
          ]
          return (
            <section
              key={phaseKey}
              style={{
                scrollSnapAlign: 'start',
                minHeight: 'calc(80vh - 60px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2.2rem 1.2rem 2.2rem 1.2rem',
                margin: '0 auto',
                background: couleurs[phaseNum-1],
                borderLeft: `6px solid ${couleursBordure[phaseNum-1]}`,
                borderRadius: '18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                marginBottom: '2rem',
                maxWidth: 600,
                width: '90%',
                position: 'relative',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div style={{display:'flex', alignItems:'center', gap:'0.7rem', marginBottom:'0.7rem'}}>
                <div style={{
                  width:48, height:48, borderRadius:'50%', background:couleursBordure[phaseNum-1],
                  display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'2rem', fontWeight:700
                }}>{['💧','🥬','🥚','🍒','🍽️'][phaseNum-1]}</div>
                <div style={{fontWeight:700, fontSize:'1.2rem', color:'#222'}}>Phase {phaseNum} <span style={{fontWeight:400, fontSize:'1rem', color:'#666'}}>J{phase.debut} à J{phase.fin} ({phase.fin - phase.debut + 1} jours)</span></div>
              </div>
              <div style={{fontWeight:600, color:'#333', fontSize:'1.1rem', display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem'}}>
                <span style={{fontSize:'1.3rem'}}>🎯</span> {phase.objectif}
              </div>
              <div style={{margin:'0.5rem 0 0.2rem 0', fontWeight:600, color:'#444'}}>Aliments principaux :</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'0.5rem 0.7rem', justifyContent:'center', marginBottom:'0.5rem'}}>
                {alimentsPhase.map((a) => (
                  <span key={a.nom} style={{
                    background:'#fff',
                    border:`1.5px solid ${couleursBordure[phaseNum-1]}`,
                    borderRadius:'20px',
                    padding:'0.25rem 0.9rem',
                    fontWeight:500,
                    fontSize:'1.05rem',
                    display:'flex', alignItems:'center', gap:'0.5rem',
                    boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
                    cursor:'pointer',
                    transition:'box-shadow 0.2s',
                  }} title={a.conseil ? a.conseil : ''}>
                    <span style={{fontSize:'1.15rem'}}>{emojiCat[a.categorie] || '🍽️'}</span> {a.nom}
                  </span>
                ))}
              </div>
              <div style={{margin:'0.7rem 0 0.2rem 0', fontWeight:600, color:'#444'}}>Exemple de menu :</div>
              <ul style={{margin:0, paddingLeft:'1.2rem', color:'#333', fontSize:'1.05rem', textAlign:'left'}}>
                {exemplesMenu[phaseNum-1].map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              {/* SEMAINE-TYPE PAR PHASE */}
              <div style={{
                background: '#F3E5F5',
                padding: '1.1rem',
                borderRadius: '10px',
                margin: '1.2rem 0 0.5rem 0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                width: '100%'
              }}>
                <h3 style={{margin:'0 0 0.7rem 0', fontSize:'1.1rem', color:'#7B1FA2'}}>
                  📅 Exemple de semaine-type <span style={{fontWeight:400, fontSize:'0.98rem', color:'#333'}}>pour la phase {phaseNum}</span>
                </h3>
                <ul style={{margin:0, paddingLeft:'1.2rem', color:'#444', fontSize:'1rem'}}>
                  {semainesType[phaseNum-1].map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <p style={{margin:'0.7rem 0 0 0', fontSize:'0.93rem', color:'#7B1FA2', fontStyle:'italic'}}>À adapter selon ton plan et tes envies, en respectant la progression !</p>
              </div>
              {/* Indicateur de progression */}
              <div style={{position:'absolute', right:16, top:16, display:'flex', flexDirection:'column', gap:6}}>
                {Object.keys(programme.phases).map((_, i) => (
                  <span key={i} style={{
                    width:10, height:10, borderRadius:'50%',
                    background: i === idx ? couleursBordure[phaseNum-1] : '#bbb',
                    opacity: i === idx ? 1 : 0.4,
                    marginBottom:2,
                    border: i === idx ? '2px solid #fff' : 'none',
                    transition:'background 0.2s'
                  }} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* SEMAINE-TYPE déplacé dans chaque phase pour cohérence */}

      {/* PERSONNALISATION DE LA LISTE DE COURSES */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: '#333' }}>
          🛒 Préparons tes courses — {configurationCourses.periode?.libelle}
        </h2>
        <p style={{ margin: '0 0 1.25rem 0', color: '#555', lineHeight: 1.5 }}>
          Les indispensables sont ajoutés automatiquement. Pour les autres familles,
          choisis seulement les aliments que tu comptes réellement utiliser.
        </p>

        {configurationCourses.indispensables.length > 0 && (
          <div style={{ background: '#eefbf3', border: '1px solid #86d9a4', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.65rem 0', color: '#176b3a', fontSize: '1.05rem' }}>
              Indispensable pour démarrer
            </h3>
            {configurationCourses.indispensables.map(article => (
              <div key={`${article.phase}-${article.nom}`} style={{ marginBottom: 6, color: '#234b34' }}>
                ✓ <strong>{article.nom}</strong> — {article.quantite}
                {article.preparation && <span style={{ color: '#5d7466' }}> · {article.preparation}</span>}
              </div>
            ))}
          </div>
        )}

        {configurationCourses.groupes.map(groupe => {
          const selection = choixCourses[groupe.id] || []
          const groupeComplet = selection.length >= groupe.minimum
          return (
            <fieldset key={`${groupe.phase}-${groupe.id}`} style={{
              border: `1px solid ${groupeComplet ? '#b9c2d0' : '#f0a6a6'}`,
              borderRadius: 10,
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <legend style={{ fontWeight: 700, color: '#39435a', padding: '0 6px' }}>
                Phase {groupe.phase} — {groupe.titre}
              </legend>
              <div style={{ fontSize: '0.85rem', color: groupeComplet ? '#55705f' : '#a13b3b', marginBottom: 10 }}>
                {groupeComplet ? `${selection.length} choix retenu${selection.length > 1 ? 's' : ''}` : `Choisis au moins ${groupe.minimum} option`}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
                {groupe.options.map(option => {
                  const estSelectionnee = selection.includes(option.nom)
                  return (
                    <label key={option.nom} style={{
                      display: 'flex',
                      gap: 9,
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `1px solid ${estSelectionnee ? '#667eea' : '#d8dde7'}`,
                      background: estSelectionnee ? '#eef0ff' : '#fff',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={estSelectionnee}
                        onChange={() => basculerChoixCourse(groupe.id, option.nom)}
                        style={{ marginTop: 3, width: 18, height: 18 }}
                      />
                      <span>
                        <strong style={{ color: '#30384b' }}>{option.nom}</strong>
                        {option.preparation && <span style={{ display: 'block', fontSize: '0.82rem', color: '#667085', marginTop: 3 }}>{option.preparation}</span>}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )
        })}

        {Object.keys(listeCoursesGroupee).length > 0 && (
          <div style={{ background: '#fff9e8', border: '1px solid #f1cf71', borderRadius: 10, padding: '1rem', marginTop: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.8rem 0', color: '#7d5a00' }}>Aperçu de ta liste personnalisée</h3>
            {Object.entries(listeCoursesGroupee).map(([categorie, aliments]) => (
              <div key={categorie} style={{ marginBottom: '0.8rem' }}>
                <strong style={{ textTransform: 'capitalize', color: '#66501c' }}>{categorie}</strong>
                <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0 }}>
                  {aliments.map((aliment, idx) => (
                    <li key={`${aliment.nom}-${idx}`} style={{ marginBottom: 5 }}>
                      {aliment.nom} — <strong>{aliment.quantite}</strong>
                      {aliment.preparation && <span style={{ color: '#6c6c6c' }}> · {aliment.preparation}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p style={{ margin: '0.8rem 0 0 0', color: '#756328', fontSize: '0.85rem' }}>
              Quantités estimées selon les portions de reprise et les jours concernés.
            </p>
          </div>
        )}
      </div>

      {/* CHECKBOXES DE VALIDATION */}
      <div style={{ 
        background: '#FFF9C4',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        border: '2px solid #FDD835'
      }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#F57F17' }}>
          ✅ Engagement
        </h2>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          marginBottom: '1rem',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          <input 
            type="checkbox" 
            checked={checkboxLu}
            onChange={(e) => setCheckboxLu(e.target.checked)}
            style={{ 
              marginRight: '0.75rem', 
              marginTop: '0.25rem',
              width: '20px',
              height: '20px',
              cursor: 'pointer'
            }}
          />
          <span>
            J'ai lu et compris le programme de reprise alimentaire sur {programme.duree_reprise_jours} jours, 
            avec ses 5 phases progressives.
          </span>
        </label>

        <label style={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          <input 
            type="checkbox" 
            checked={checkboxEngage}
            onChange={(e) => setCheckboxEngage(e.target.checked)}
            style={{ 
              marginRight: '0.75rem', 
              marginTop: '0.25rem',
              width: '20px',
              height: '20px',
              cursor: 'pointer'
            }}
          />
          <span style={{color:'#1976d2', fontWeight:600}}>
            J’ai conscience que je dois m’engager à suivre strictement ce programme pour conserver les bienfaits de mon jeûne et fortifier mon pouvoir de volonté.
          </span>
        </label>
      </div>

      {/* BOUTONS D'ACTION */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <Link href="/jeune" style={{ 
          padding: '1rem 2rem',
          background: '#e0e0e0',
          color: '#333',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '500',
          transition: 'background 0.2s'
        }}>
          ← Retour
        </Link>

        <button
          onClick={handleValider}
          disabled={!peutValider}
          style={{
            padding: '1rem 2rem',
            background: peutValider ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: peutValider ? 'pointer' : 'not-allowed',
            opacity: peutValider ? 1 : 0.6,
            transition: 'all 0.2s'
          }}
        >
          {validating ? '⏳ Validation...' : '✅ Valider mon plan'}
        </button>
      </div>

      {/* MESSAGE D'INFO */}
      {(message || error) && (
        <div style={{ 
          background: error ? '#ffebee' : '#E3F2FD',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '1.05rem',
          color: error ? '#c62828' : '#1565C0',
          textAlign: 'center',
          fontWeight: 600,
          marginBottom: '1rem',
          whiteSpace: 'pre-line'
        }}>
          {error ? `❌ ${error}` : message}
        </div>
      )}
      {!message && !error && (
        <div style={{ 
          background: '#E3F2FD',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '1.05rem',
          color: '#1565C0',
          textAlign: 'center',
          fontWeight: 600
        }}>
          ✅ Programme généré ! À toi de jouer : chaque jour compte pour ancrer durablement les bienfaits de ton jeûne.<br/>
          <span style={{fontWeight:400, fontSize:'0.95rem'}}>Tu pourras retrouver ton plan validé dans l’onglet « Reprise alimentaire ».</span>
        </div>
      )}

      {/* BOUTON VOIR LE PLAN VALIDÉ */}
      <div style={{textAlign:'center', margin:'2rem 0'}}>
        <button
          onClick={() => {
            // Ne pas écraser si déjà validé
            const planValide = localStorage.getItem('programmeRepriseValide');
            if (!planValide && programme) {
              localStorage.setItem('programmeRepriseValide', JSON.stringify(programme));
            }
            window.location.href = '/reprise-alimentaire-apres-jeune';
          }}
          style={{
            padding:'0.75rem 2rem',
            background:'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
            color:'white',
            border:'none',
            borderRadius:'8px',
            fontSize:'1rem',
            fontWeight:'600',
            cursor:'pointer',
            boxShadow:'0 2px 8px rgba(67,206,162,0.08)'
          }}
        >
          👀 Visualiser le plan validé
        </button>
      </div>
    </div>
  )
}
