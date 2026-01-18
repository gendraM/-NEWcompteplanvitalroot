import React, { useRef, useEffect } from 'react';
import styles from './BilanHebdoModal.module.css';

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
          <h4 style={{color: '#334155', marginBottom: '0.7rem', fontSize: '1.08rem'}}>En savoir plus</h4>
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
