import React, { useRef, useEffect, useState } from 'react';
import styles from './BilanHebdoModal.module.css';
import { calculerTendance7j } from '../lib/validationSemaine';

// Squelette minimal pour repartir étape par étape selon le plan métier
export default function BilanHebdoModal({ open, onClose, bilan, onLearnMore, selectedDate }) {
    // Helpers pour les blocs d'analyse textuelle métier
    function isEcartSignificatif(apportsTotaux, objectifHebdo) {
      if (typeof apportsTotaux !== 'number' || typeof objectifHebdo !== 'number') return false;
      return Math.abs(apportsTotaux - objectifHebdo) > 200; // Seuil à ajuster selon métier
    }
    function isExtrasResponsables(apportsTotaux, kcalExtras, objectifHebdo) {
      if (typeof apportsTotaux !== 'number' || typeof kcalExtras !== 'number' || typeof objectifHebdo !== 'number') return false;
      // Si hors extras, on est proche de l'objectif, mais l'écart total est dû aux extras
      const horsExtras = apportsTotaux - kcalExtras;
      return Math.abs(horsExtras - objectifHebdo) < 150 && Math.abs(apportsTotaux - objectifHebdo) > 200;
    }
    function isExtrasHorsBudget(extras, kcalExtras, budgetExtras) {
      if (typeof extras !== 'number' || typeof kcalExtras !== 'number' || typeof budgetExtras !== 'number') return false;
      return extras > 0 && kcalExtras > budgetExtras * 1.2; // Dépassement net du budget
    }
    // Bloc "En savoir plus" (toujours après les blocs chiffrés)
    // Fonction de réduction/extension pour la section "En savoir plus"
    const [showSavoirPlus, setShowSavoirPlus] = React.useState(false);
    function BlocEnSavoirPlus() {
      if (typeof bilan?.apportsTotaux !== 'number' || typeof bilan?.kcalExtras !== 'number' || typeof bilan?.objectifHebdo !== 'number') return null;
      const horsExtras = bilan.apportsTotaux - bilan.kcalExtras;
      const ecart = bilan.apportsTotaux - bilan.objectifHebdo;
      const ecartStr = ecart > 0 ? `+${ecart}` : ecart;
      // Détection dynamique des alertes et encouragements
      const ecartSignificatif = Math.abs(ecart) > 200;
      const extrasHorsBudget = bilan.extras > 0 && bilan.kcalExtras > bilan.budgetExtras * 1.2;
      const extrasConformes = bilan.extras > 0 && bilan.kcalExtras <= bilan.budgetExtras;
      // Couleur de fond dynamique
      let bgColor = '#f9fafb';
      let borderColor = undefined;
      let icon = null;
      let messageAlerte = null;
      if (ecartSignificatif && ecart > 0) {
        bgColor = '#fff7f7';
        borderColor = '#e53935';
        icon = <span style={{fontSize:'1.2em', color:'#e53935', marginRight:6}}>⚠️</span>;
        messageAlerte = <span style={{color:'#e53935', fontWeight:600}}>Point de vigilance : la semaine dépasse nettement l’objectif.</span>;
      } else if (extrasHorsBudget) {
        bgColor = '#fffbe6';
        borderColor = '#eab308';
        icon = <span style={{fontSize:'1.2em', color:'#eab308', marginRight:6}}>⚠️</span>;
        messageAlerte = <span style={{color:'#eab308', fontWeight:600}}>Attention : les extras dépassent largement le budget prévu.</span>;
      } else if (extrasConformes && !ecartSignificatif) {
        bgColor = '#f0fdf4';
        borderColor = '#22c55e';
        icon = <span style={{fontSize:'1.2em', color:'#22c55e', marginRight:6}}>✅</span>;
        messageAlerte = <span style={{color:'#22c55e', fontWeight:600}}>Bravo, extras maîtrisés et semaine dans le cadre !</span>;
      }
      return (
        <section style={{marginBottom: '2rem', background: bgColor, borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #e5e7eb', border: borderColor ? `2px solid ${borderColor}` : undefined}}>
          <h4 style={{color: '#334155', marginBottom: '0.7rem', fontSize: '1.08rem', cursor:'pointer'}} onClick={() => setShowSavoirPlus(v => !v)}>
            {showSavoirPlus ? '▼' : '►'} En savoir plus
          </h4>
          {showSavoirPlus && (
            <>
              {icon && messageAlerte && (
                <div style={{marginBottom:'0.7rem', display:'flex', alignItems:'center'}}>{icon}{messageAlerte}</div>
              )}
              <div style={{marginBottom: '0.6rem'}}>
                <b>Lecture “repas vs extras”</b><br/>
                Sans extras, ta semaine est à <b>{horsExtras}</b> kcal.<br/>
                Avec extras, elle monte à <b>{bilan.apportsTotaux}</b> kcal.<br/>
                <span style={{color:'#64748b'}}>→ Ça signifie que la différence se joue majoritairement sur les extras, pas sur les repas.</span>
              </div>
              <div style={{marginBottom: '0.6rem'}}>
                <b>Lecture “écart expliqué”</b><br/>
                Objectif : <b>{bilan.objectifHebdo}</b> kcal<br/>
                Réalisé : <b>{bilan.apportsTotaux}</b> kcal<br/>
                <span style={{color:'#64748b'}}>→ {ecartStr} kcal : c’est le signal principal de la semaine.</span>
              </div>
              <div style={{marginBottom: '0.6rem'}}>
                <b>Lecture “fréquence vs intensité”</b><br/>
                Extras : <b>{bilan.extras}</b><br/>
                Poids calorique extras : <b>{bilan.kcalExtras}</b> kcal<br/>
                Budget extras : <b>{bilan.budgetExtras}</b> kcal<br/>
                <span style={{color:'#64748b'}}>→ Cette semaine, les extras sont à la fois présents (fréquence) et très lourds (intensité).</span>
              </div>
            </>
          )}
        </section>
      );
    }
    // Bloc "Lecture de la semaine" (diagnostic global)
    function BlocLectureSemaine() {
      const { apportsTotaux, objectifHebdo, kcalExtras, extras, budgetExtras } = bilan || {};
      // Log au début de la fonction
      console.log('[LectureSemaine] Début BlocLectureSemaine');
      // Log des valeurs d'entrée
      console.log('[LectureSemaine] apportsTotaux:', apportsTotaux, 'objectifHebdo:', objectifHebdo, 'kcalExtras:', kcalExtras, 'extras:', extras, 'budgetExtras:', budgetExtras);
      if (
        typeof apportsTotaux !== 'number' ||
        typeof objectifHebdo !== 'number' ||
        typeof kcalExtras !== 'number' ||
        typeof extras !== 'number' ||
        typeof budgetExtras !== 'number'
      ) {
        console.log('[LectureSemaine] Données manquantes, bloc non affiché');
        return null;
      }

      // Génération séquentielle des phrases métier validées
      const phrases = [];
      const horsExtras = apportsTotaux - kcalExtras;
      const ecartSignificatif = Math.abs(apportsTotaux - objectifHebdo) > 200;
      const extrasResponsables = Math.abs(horsExtras - objectifHebdo) < 150 && ecartSignificatif;
      const extrasHorsBudget = extras > 0 && kcalExtras > budgetExtras * 1.2;
      const causeUniqueExtras = extrasResponsables && extrasHorsBudget;
      const causesMultiples = Math.abs(horsExtras - objectifHebdo) > 200 && extrasHorsBudget;
      // Log des conditions métier
      console.log('[LectureSemaine] horsExtras:', horsExtras);
      console.log('[LectureSemaine] ecartSignificatif:', ecartSignificatif);
      console.log('[LectureSemaine] extrasResponsables:', extrasResponsables);
      console.log('[LectureSemaine] extrasHorsBudget:', extrasHorsBudget);
      console.log('[LectureSemaine] causeUniqueExtras:', causeUniqueExtras);
      console.log('[LectureSemaine] causesMultiples:', causesMultiples);

      // Bloc complet strict métier (4 phrases) si cause unique extras
      if (causeUniqueExtras) {
        console.log('[LectureSemaine] Cas causeUniqueExtras (séquence complète)');
        phrases.push('Cette semaine, la trajectoire globale s’éloigne de l’objectif hebdomadaire.');
        phrases.push('L’écart constaté ne s’explique pas par les repas hors extras, qui restent proches du cadre prévu, mais par le poids cumulé des extras sur la semaine.');
        phrases.push('Le nombre d’extras consommés, combiné à leur charge calorique totale, place cette semaine hors zone d’équilibre par rapport au budget fixé.');
      }
      // Sinon, séquence dynamique selon la réalité
      else {
        if (ecartSignificatif) {
          console.log('[LectureSemaine] Cas ecartSignificatif');
          phrases.push('Cette semaine, la trajectoire globale s’éloigne de l’objectif hebdomadaire.');
        } else {
          console.log('[LectureSemaine] Cas conformité');
          phrases.push('Cette semaine reste proche de l’objectif, bravo, continue sur cette lancée.');
        }
        if (extrasResponsables) {
          console.log('[LectureSemaine] Cas extrasResponsables');
          phrases.push('L’écart constaté ne s’explique pas par les repas hors extras, qui restent proches du cadre prévu, mais par le poids cumulé des extras sur la semaine.');
        } else if (Math.abs(horsExtras - objectifHebdo) > 200) {
          console.log('[LectureSemaine] Cas repas hors cadre');
          phrases.push('Les repas principaux de la semaine dépassent le cadre prévu : il est important de retrouver une structure plus régulière pour revenir à l’équilibre.');
        }
        if (extrasHorsBudget) {
          console.log('[LectureSemaine] Cas extrasHorsBudget');
          phrases.push('Le nombre d’extras consommés, combiné à leur charge calorique totale, place cette semaine hors zone d’équilibre par rapport au budget fixé.');
        }
      }
      // Phrase d’observation fine (lecture claire/cause unique extras)
      let phraseClair = null;
      if (causeUniqueExtras) {
        console.log('[LectureSemaine] Affichage phraseClair causeUniqueExtras');
        phraseClair = <div style={{marginBottom:'0.6rem', fontWeight:600, color:'#0f172a'}}>👉 La lecture est claire : ce ne sont pas les repas qui déséquilibrent la semaine, mais la manière dont les extras se sont exprimés.</div>;
      } else if (causesMultiples) {
        console.log('[LectureSemaine] Affichage phraseClair causesMultiples');
        phraseClair = <div style={{marginBottom:'0.6rem', fontWeight:600, color:'#0f172a'}}>👉 Plusieurs facteurs expliquent l’écart cette semaine : repas et extras contribuent tous deux à la situation observée.</div>;
      }
      // Log des phrases générées
      console.log('[LectureSemaine] Phrases générées:', phrases);
      return (
        <section style={{marginBottom: '2rem', background: '#f1f5f9', borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #cbd5e1'}}>
          <h4 style={{color: '#0f172a', marginBottom: '0.7rem', fontSize: '1.08rem'}}>Lecture de la semaine</h4>
          {phrases.map((p, i) => (
            <div key={i} style={{marginBottom: '0.6rem'}}>{p}</div>
          ))}
          {phraseClair}
        </section>
      );
    }
    // Bloc rétractable/accordion pour la Section 2 — Tendance & Trajectoire
  
    function AccordionTendance() {
      const [open, setOpen] = useState(false);
      return (
        <div style={{marginTop: '0.5rem'}}>
          <button
            aria-expanded={open}
            aria-controls="tendance-details"
            onClick={() => setOpen(o => !o)}
            style={{
              background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 8,
              padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: open ? 10 : 0
            }}
          >
            {open ? 'Masquer le détail ▲' : 'Voir le détail ▼'}
          </button>
          {open && (
            <div id="tendance-details" style={{marginTop: '0.7rem', background: '#f0f6ff', borderRadius: 8, padding: '1rem 1.2rem', boxShadow: '0 1px 4px #b3d8f7'}}>
              {/* Section 2.1 - Tendance 7j (semaine courante) */}
              {(() => {
                const { apportsTotaux, objectifHebdo } = bilan || {};
                if (!apportsTotaux || !objectifHebdo) {
                  return <div style={{color: '#666', fontSize: '0.95rem'}}>Données insuffisantes pour calculer la tendance</div>;
                }
                
                const tendance = calculerTendance7j(apportsTotaux, objectifHebdo);
                
                return (
                  <div style={{marginBottom: '1.2rem'}}>
                    <div style={{
                      display: 'inline-block',
                      background: tendance.couleur,
                      color: '#fff',
                      padding: '0.4rem 0.9rem',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      marginBottom: '0.6rem'
                    }}>
                      {tendance.label}
                    </div>
                    <div style={{fontSize: '0.95rem', color: '#2a4d8f', lineHeight: 1.5}}>
                      {tendance.verbatim}
                    </div>
                    <div style={{fontSize: '0.85rem', color: '#666', marginTop: '0.4rem', fontStyle: 'italic'}}>
                      Écart hebdomadaire : {tendance.ecart >= 0 ? '+' : ''}{tendance.ecart} kcal
                    </div>
                    <div style={{fontSize: '0.9rem', color: tendance.type === 'perte' ? '#27ae60' : tendance.type === 'surplus' ? '#e74c3c' : '#666', marginTop: '0.5rem', fontWeight: 500}}>
                      {tendance.projection}
                    </div>
                  </div>
                );
              })()}
              
              {/* Step 2 - Comparaison N/N-1 */}
              <ComparaisonN1Block />
              
              {/* Placeholder pour les prochaines étapes */}
              <div style={{fontSize: '0.85rem', color: '#999', marginTop: '1rem', borderTop: '1px dashed #ddd', paddingTop: '0.8rem'}}>
                📊 Moyenne 14j et Trajectoire : à venir
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Composant Comparaison N/N-1
    function ComparaisonN1Block() {
      const { apportsTotaux, objectifHebdo } = bilan || {};
      const [comparaison, setComparaison] = React.useState(null);
      const [loading, setLoading] = React.useState(true);
      
      React.useEffect(() => {
        async function fetchComparaison() {
          if (!selectedDate || !apportsTotaux || !objectifHebdo) {
            setLoading(false);
            return;
          }
          
          try {
            const { calculerTendance7j, calculerComparaisonN1, getMonday, formatDate } = await import('../lib/validationSemaine');
            const { supabase } = await import('../lib/supabaseClient');
            
            const selectedWeekStart = formatDate(getMonday(selectedDate), 'yyyy-MM-dd');
            const tendanceN = calculerTendance7j(apportsTotaux, objectifHebdo);
            const ecartN = tendanceN.ecart;
            
            // Fetch semaine N-1
            const dateN1 = new Date(selectedWeekStart);
            dateN1.setDate(dateN1.getDate() - 7);
            const weekStartN1 = formatDate(dateN1, 'yyyy-MM-dd');
            
            const { data, error } = await supabase
              .from('semaines_validees')
              .select('ecart_hebdo, objectif_hebdo, apports_totaux')
              .eq('weekStart', weekStartN1)
              .single();
            
            if (error || !data || data.ecart_hebdo === null) {
              console.log('[Comparaison N/N-1] Pas de semaine N-1 avec données complètes');
              setLoading(false);
              setComparaison(null); // Pas de semaine précédente
              return;
            }
            
            const ecartN1 = data.ecart_hebdo;
            const apportsTotauxN1 = data.apports_totaux;
            const objectifN1 = data.objectif_hebdo;
            const comp = await calculerComparaisonN1(ecartN, ecartN1, tendanceN.type, selectedWeekStart, supabase);
            // Ajouter les données N-1 pour affichage Option 2
            comp.apportsTotauxN1 = apportsTotauxN1;
            comp.objectifN1 = objectifN1;
            comp.apportsTotauxN = apportsTotaux;
            comp.objectifN = objectifHebdo;
            
            // Calculer dates formatées pour affichage
            const dateDebN1 = new Date(weekStartN1);
            const dateFinN1 = new Date(weekStartN1);
            dateFinN1.setDate(dateFinN1.getDate() + 6);
            const dateDebN = new Date(selectedWeekStart);
            const dateFinN = new Date(selectedWeekStart);
            dateFinN.setDate(dateFinN.getDate() + 6);
            
            comp.periodeN1 = `${dateDebN1.getDate().toString().padStart(2, '0')}→${dateFinN1.getDate().toString().padStart(2, '0')} ${dateFinN1.toLocaleDateString('fr-FR', {month: 'short'})}`;
            comp.periodeN = `${dateDebN.getDate().toString().padStart(2, '0')}→${dateFinN.getDate().toString().padStart(2, '0')} ${dateFinN.toLocaleDateString('fr-FR', {month: 'short'})}`;
            
            setComparaison(comp);
          } catch (err) {
            console.error('[Comparaison N/N-1] Erreur:', err);
          } finally {
            setLoading(false);
          }
        }
        
        fetchComparaison();
      }, [selectedDate, apportsTotaux, objectifHebdo]);
      
      if (loading) return null;
      if (!comparaison) return null;
      
      return (
        <div style={{marginTop: '1.2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem'}}>
          <div style={{fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.6rem'}}>
            📊 Comparaison avec la semaine dernière
          </div>
          
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            background: comparaison.couleur,
            color: '#fff',
            padding: '0.3rem 0.7rem',
            borderRadius: 6,
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '0.6rem'
          }}>
            {comparaison.badge}
          </div>
          
          {/* Verbatim principal */}
          <div style={{fontSize: '0.95rem', color: '#2a4d8f', lineHeight: 1.5, marginBottom: '0.6rem'}}
               dangerouslySetInnerHTML={{__html: comparaison.verbatim.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />
          
          {/* Verbatim renforcé (3 semaines) */}
          {comparaison.renforcementVerbatim && (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: 6,
              padding: '0.7rem',
              marginTop: '0.8rem',
              fontSize: '0.9rem',
              color: '#856404',
              lineHeight: 1.5
            }}
                 dangerouslySetInnerHTML={{__html: comparaison.renforcementVerbatim.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />
          )}
          
          {/* Analyse comparative détaillée (Option 2 - Format calcul visuel pédagogique) */}
          <div style={{
            fontSize: '0.85rem',
            color: '#555',
            marginTop: '0.8rem',
            background: '#f8f9fa',
            padding: '0.8rem',
            borderRadius: 6,
            borderLeft: '3px solid ' + comparaison.couleur
          }}>
            <div style={{fontWeight: 600, marginBottom: '0.7rem'}}>📊 Analyse comparative :</div>
            
            {/* Semaine N-1 */}
            <div style={{marginBottom: '0.8rem'}}>
              <div style={{fontWeight: 600, fontSize: '0.9rem', color: '#2c3e50', marginBottom: '0.3rem'}}>
                Semaine N-1 ({comparaison.periodeN1})
              </div>
              <div style={{paddingLeft: '1rem', lineHeight: 1.6}}>
                <div style={{color: '#333'}}>Total consommé : <strong>{comparaison.apportsTotauxN1?.toLocaleString()} kcal</strong></div>
                <div style={{color: '#666'}}>- Objectif : {comparaison.objectifN1?.toLocaleString()} kcal</div>
                <div style={{color: comparaison.ecartN1 > 0 ? '#e74c3c' : '#27ae60', fontWeight: 600, marginTop: '0.2rem'}}>
                  = Écart : {comparaison.ecartN1 >= 0 ? '+' : ''}{comparaison.ecartN1} kcal {comparaison.ecartN1 > 0 ? '📈' : '📉'}
                </div>
              </div>
            </div>
            
            {/* Semaine N */}
            <div style={{marginBottom: '0.8rem'}}>
              <div style={{fontWeight: 600, fontSize: '0.9rem', color: '#2c3e50', marginBottom: '0.3rem'}}>
                Semaine N ({comparaison.periodeN})
              </div>
              <div style={{paddingLeft: '1rem', lineHeight: 1.6}}>
                <div style={{color: '#333'}}>Total consommé : <strong>{comparaison.apportsTotauxN?.toLocaleString()} kcal</strong></div>
                <div style={{color: '#666'}}>- Objectif : {comparaison.objectifN?.toLocaleString()} kcal</div>
                <div style={{color: comparaison.ecartN > 0 ? '#e74c3c' : '#27ae60', fontWeight: 600, marginTop: '0.2rem'}}>
                  = Écart : {comparaison.ecartN >= 0 ? '+' : ''}{comparaison.ecartN} kcal {comparaison.ecartN > 0 ? '📈' : '📉'}
                </div>
              </div>
            </div>
            
            {/* Évolution texte adaptatif avec symbole → */}
            <div style={{
              marginTop: '0.7rem',
              paddingTop: '0.7rem',
              borderTop: '2px solid #ddd',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: comparaison.couleur
            }}>
              → {comparaison.evolutionTexte}
            </div>
          </div>
        </div>
      );
    }
    // Blocs approfondis (affichage conditionnel)
    function BlocApprofondi() {
      const { apportsTotaux, objectifHebdo, kcalExtras, extras, budgetExtras } = bilan || {};
      const horsExtras = apportsTotaux - kcalExtras;
      // Répartition de l’écart
      const showRepartition = isExtrasResponsables(apportsTotaux, kcalExtras, objectifHebdo);
      // Fréquence vs charge
      const showFreqCharge = extras > 0 && kcalExtras > budgetExtras * 1.2;
      // Lecture de trajectoire (toujours affiché)
      return (
        <section style={{marginBottom: '2rem', background: '#f8fafc', borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #e0e7ef'}}>
          {showRepartition && (
            <div style={{marginBottom: '0.6rem'}}>
              <b>🔍 Répartition de l’écart</b><br/>
              Sans extras, la semaine reste proche de la trajectoire cible.<br/>
              L’ajout des extras fait basculer l’équilibre hebdomadaire au-delà de l’objectif.
            </div>
          )}
          {showFreqCharge && (
            <div style={{marginBottom: '0.6rem'}}>
              <b>🔍 Fréquence vs charge</b><br/>
              Le nombre d’extras consommés et leur poids calorique total indiquent une concentration des écarts sur peu d’événements, mais à fort impact.
            </div>
          )}
          <div style={{marginBottom: '0.6rem'}}>
            <b>🔍 Lecture de trajectoire</b><br/>
            Si ce type de semaine se répète, la trajectoire hebdomadaire ne pourra pas se rééquilibrer uniquement par les repas.
          </div>
        </section>
      );
    }
  const modalRef = useRef(null);

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  // ...existing code...
  // Génération du verbatim automatique métier pour la lecture des extras (strictement conforme aux 4 cas métier)
  function getVerbatimLectureExtras(extras, kcalExtras, budgetExtras) {
    if (typeof extras !== 'number' || typeof kcalExtras !== 'number' || typeof budgetExtras !== 'number') return '';
    // Cas 1 : Peu d’extras, mais très caloriques (1–2 extras, kcal extras > budget)
    if (extras >= 1 && extras <= 2 && kcalExtras > budgetExtras) {
      return 'Cette semaine, les extras ont été peu nombreux mais très chargés. Leur impact vient surtout de leur intensité.';
    }
    // Cas 2 : Plusieurs extras, charge modérée (3–6 extras, kcal extras <= budget)
    if (extras >= 3 && extras <= 6 && kcalExtras <= budgetExtras) {
      return 'Cette semaine, les extras ont été fréquents mais répartis en petites quantités. Leur impact vient de l’accumulation.';
    }
    // Cas 3 : Plusieurs extras, charge élevée (5+ extras, kcal extras > budget)
    if (extras >= 5 && kcalExtras > budgetExtras) {
      return 'Cette semaine, les extras ont été à la fois fréquents et chargés. La répétition et l’intensité se sont additionnées.';
    }
    // Cas 4 : Extras maîtrisés (3 extras, kcal extras <= budget)
    if (extras === 3 && kcalExtras <= budgetExtras) {
      return 'Cette semaine, le nombre et la charge des extras sont restés dans le budget prévu.';
    }
    // Cas générique : si aucun cas strict ne correspond, phrase douce
    if (extras === 0 || kcalExtras === 0) {
      return 'Les extras ont été très limités cette semaine, leur impact est marginal.';
    }
    // Cas de dépassement modéré (autres situations)
    if (kcalExtras > budgetExtras) {
      return 'Cette semaine, les extras ont dépassé le budget prévu. À surveiller pour retrouver l’équilibre.';
    }
    // Cas de maintien modéré
    if (kcalExtras <= budgetExtras) {
      return 'Les extras sont restés dans une zone raisonnable cette semaine.';
    }
    return '';
  }

  return (
    <div
      className={styles.overlay}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      ref={modalRef}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
    >
      <div className={styles.modal}>
        {/* Titre, période, phrase pédagogique */}
        <h2 style={{marginBottom: '0.7rem', color: '#1976d2'}}>Bilan de ta semaine alimentaire</h2>
        <div style={{fontWeight: 500, color: '#444', marginBottom: '0.5rem', fontSize: '1.08rem'}}>
          {selectedDate ? (() => {
            const refDate = new Date(selectedDate);
            const day = refDate.getDay();
            const monday = new Date(refDate);
            monday.setDate(refDate.getDate() - ((day + 6) % 7));
            monday.setHours(0,0,0,0);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23,59,59,999);
            const fmt = d => d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit', year: '2-digit' });
            return `Semaine du lundi ${fmt(monday)} au dimanche ${fmt(sunday)}`;
          })() : ''}
        </div>
        <div style={{fontStyle: 'italic', color: '#1976d2', marginBottom: '1.2rem', fontSize: '1.01rem'}}>
          Ton corps évolue dans le temps. Ce bilan te montre la trajectoire, pas un jugement.
        </div>
        {/* Bloc diagnostic dynamique métier (Lecture de la semaine) */}
        {BlocLectureSemaine()}
        {/* Résumé des données principales */}
        <section style={{marginBottom: '2rem', background: '#f4f8ff', borderRadius: 12, padding: '1.2rem 1.5rem', boxShadow: '0 1px 6px #dbeafe'}}>
          <h3 style={{marginBottom: '1rem', color: '#1976d2', fontSize: '1.15rem'}}>Résumé des données principales</h3>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.08rem'}}>
            {/* Calories totales consommées (avec et hors extras) */}
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>Calories consommées (hors extras)&nbsp;:</span> <span style={{fontWeight:700, color:'#1976d2'}}>{
                typeof bilan?.apportsTotaux === 'number' && typeof bilan?.kcalExtras === 'number'
                  ? (bilan.apportsTotaux - bilan.kcalExtras)
                  : '—'
              }</span> kcal
            </li>
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>Calories consommées (total avec extras)&nbsp;:</span> <span style={{fontWeight:700, color:'#1976d2'}}>{
                typeof bilan?.apportsTotaux === 'number' ? bilan.apportsTotaux : '—'
              }</span> kcal
            </li>
            {/* Objectif hebdomadaire (incluant extras) */}
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>Objectif hebdomadaire (incluant extras)&nbsp;:</span> <span style={{fontWeight:700}}>{
                typeof bilan?.objectifHebdo === 'number' ? bilan.objectifHebdo : '—'
              }</span> kcal
            </li>
            {/* Écart hebdomadaire */}
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>Écart hebdomadaire&nbsp;:</span> <span style={{fontWeight:700, color:'#e53935'}}>{
                typeof bilan?.apportsTotaux === 'number' && typeof bilan?.objectifHebdo === 'number'
                  ? ((bilan.apportsTotaux - bilan.objectifHebdo) > 0 ? '+' : '') + (bilan.apportsTotaux - bilan.objectifHebdo) + ' kcal'
                  : '—'
              }</span>
            </li>
          </ul>
          {/* Phrase de lecture automatique selon l'écart */}
          <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#1976d2', fontSize: '1.04rem'}}>
            {(() => {
              if (typeof bilan?.apportsTotaux === 'number' && typeof bilan?.objectifHebdo === 'number') {
                const ecart = bilan.apportsTotaux - bilan.objectifHebdo;
                if (ecart < -100) {
                  return "Cette semaine crée un déficit énergétique. Elle va dans le sens de la perte de poids.";
                } else if (ecart > 100) {
                  return "Cette semaine est plus riche en énergie. Le corps aura besoin de temps pour s’ajuster.";
                } else {
                  return "Cette semaine est globalement en maintien. La trajectoire est stable.";
                }
              }
              return null;
            })()}
          </div>
        </section>
          {/* Section 2 — Tendance & Trajectoire (bloc rétractable) */}
          <div style={{marginBottom: '2rem', background: '#eaf6ff', borderRadius: 12, padding: '1.2rem 1.5rem', boxShadow: '0 1px 6px #b3d8f7'}}>
            <h2 style={{fontWeight: 'bold', fontSize: '1.15rem', color: '#2a4d8f', marginBottom: 4}}>Ta dynamique dans le temps — trajectoire sur 14J</h2>
            <p style={{fontStyle: 'italic', color: '#555', marginBottom: 12}}>Ce qui se construit semaine après semaine</p>
            {/* Bloc rétractable/accordion */}
            <AccordionTendance />
          </div>
        {/* Lecture des extras de la semaine */}
        <section style={{marginBottom: '2rem', background: '#fffef6', borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #fde68a'}}>
          <h3 style={{color: '#b45309', marginBottom: '0.7rem', fontSize: '1.13rem'}}>Lecture des extras de la semaine</h3>
          <div style={{fontStyle: 'italic', color: '#444', marginBottom: '0.7rem', fontSize: '1.01rem'}}>
            Ici, on regarde comment les extras se sont exprimés cette semaine : par leur nombre et par leur poids calorique total.
          </div>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.07rem'}}>
            <li style={{marginBottom: 7}}>
              <span style={{fontWeight:600}}>Nombre d’extras consommés&nbsp;:</span> <span style={{fontWeight:700, color:'#b45309'}}>{typeof bilan?.extras === 'number' ? bilan.extras : '—'}</span>
            </li>
            <li style={{marginBottom: 7}}>
              <span style={{fontWeight:600}}>Total kcal consommées via extras&nbsp;:</span> <span style={{fontWeight:700, color:'#eab308'}}>{typeof bilan?.kcalExtras === 'number' ? bilan.kcalExtras : '—'}</span> kcal
            </li>
            <li style={{marginBottom: 7}}>
              <span style={{fontWeight:600}}>Budget extras hebdo&nbsp;:</span> <span style={{fontWeight:700, color:'#2563eb'}}>{typeof bilan?.budgetExtras === 'number' ? bilan.budgetExtras : '—'}</span> kcal
            </li>
          </ul>
          <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#2563eb', fontSize: '1.04rem'}}>
            {getVerbatimLectureExtras(bilan?.extras, bilan?.kcalExtras, bilan?.budgetExtras)}
          </div>
        </section>
        {/* Bloc En savoir plus (analyse croisée) */}
        {BlocEnSavoirPlus()}
        {/* Plus de bloc approfondi en bas : tout est fusionné dans la lecture principale */}
      </div>
    </div>
  );
}
