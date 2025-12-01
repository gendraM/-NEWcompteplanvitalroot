



import React, { useState, useEffect } from 'react';
import { getAnalyse3DerniersJoursRepas } from '../lib/analyseRepas3Jours';
import { genererAnalyseSynthétiqueRepas } from '../lib/analyseRepasSynthétique';
import {
  getPhaseDuJour,
  getCriteresDuJour,
  validerCriteresDuJour
} from '../lib/preparationJeuneMetier';
import styles from './StartPreparationModal.module.css';


const StartPreparationModal = ({ isOpen, onClose, onSave, analyseComportement = [], userId }) => {
    // Pour éviter le mismatch SSR/CSR, on affiche les blocs dynamiques seulement côté client
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);
  // Date de début de préparation (doit être déclarée AVANT tout usage)
  const [startDate, setStartDate] = useState('');
  // Durée du jeûne souhaitée (en jours)
  const [dureeJeune, setDureeJeune] = useState(undefined);
  // Analyse automatique des 3 derniers jours de repas
  const [analyse3Jours, setAnalyse3Jours] = useState([]);
  // Analyse synthétique métier (extras, repas tardifs, conseils...)
  const [analyseSynth, setAnalyseSynth] = useState([]);
  // Affichage/masquage du détail des repas ("En savoir plus")
  const [showRepasDetail, setShowRepasDetail] = useState(false);
  // L'analyse comportementale doit toujours être basée sur la date du jour (création du plan), pas sur startDate !
  // Mode démo : forcer l'utilisation de Supabase même sans userId (pour tests locaux)
  useEffect(() => {
    if (isOpen) {
      const todayStr = new Date().toISOString().slice(0,10);
      // Utiliser un userId de démo si non fourni
      const demoUserId = userId || '00000000-0000-0000-0000-000000000000';
      getAnalyse3DerniersJoursRepas(demoUserId, todayStr).then(res => {
        setAnalyse3Jours(res);
        setAnalyseSynth(genererAnalyseSynthétiqueRepas(res));
      });
    }
  }, [userId, isOpen]);
  // Date et heure du jour (affichage en haut de la modale, côté client uniquement)
  const [dateHeure, setDateHeure] = useState({ date: '', heure: '' });
  useEffect(() => {
    const now = new Date();
    setDateHeure({
      date: now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    });
  }, []);
  // La durée recommandée est 30 jours (métier)
  const dureeRecommandee = 30;
  // Durée réelle calculée automatiquement (date du jour -> date de début du jeûne)
  const [dureeReelle, setDureeReelle] = useState(null);
  const [goal, setGoal] = useState('');
  // Message personnel (texte ou audio/vidéo)
  const [msgType, setMsgType] = useState('texte');
  const [msgTexte, setMsgTexte] = useState('');
  const [msgAudio, setMsgAudio] = useState(null); // à brancher sur un composant d’enregistrement
  // Projection réussite (texte ou audio/vidéo)
  const [projType, setProjType] = useState('texte');
  const [projTexte, setProjTexte] = useState('');
  const [projAudio, setProjAudio] = useState(null);


  // --- Nouvelle logique métier partagée ---
  // Calcul du jour relatif (J-XX) par rapport à la date de début du jeûne (J0)
  const [jourRelatif, setJourRelatif] = useState(null);
  useEffect(() => {
    if (startDate) {
      const dateFin = new Date(startDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      // jourRelatif = nombre de jours avant J0 (ex: -10)
      setJourRelatif(Math.max(0, Math.round((dateFin - today) / (1000 * 60 * 60 * 24))));
    } else {
      setJourRelatif(null);
    }
  }, [startDate]);

  // Récupération de la phase et des critères métier du jour
  const phaseDuJour = jourRelatif !== null ? getPhaseDuJour(-jourRelatif) : null;
  const criteresDuJour = jourRelatif !== null ? getCriteresDuJour(-jourRelatif) : [];
  // Calcul du critère actif du jour (premier critère du jour, ou null)
  const critereActifDuJour = criteresDuJour && criteresDuJour.length > 0 ? criteresDuJour[0] : null;

  const handleSave = () => {
    if (!startDate || !goal || !dureeJeune) {
      alert('Veuillez remplir tous les champs obligatoires (date, durée du jeûne, objectif).');
      return;
    }
    onSave({ startDate, duration: dureeJeune, goal, msgType, msgTexte, msgAudio, projType, projTexte, projAudio });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-live="polite">
      <div className={styles['modal-content']} style={{border: '2.5px solid #334155', boxShadow: '0 0 0 4px #e0e7ef'}}>
        {/* Cadre général et header immersif */}
        <div style={{borderBottom:'2px solid #e0e7ef', paddingBottom:'0.5rem', marginBottom:'1.2rem', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <h2 id="modal-title" style={{margin:0, fontWeight:700, fontSize:'1.35rem', color:'#0f172a', letterSpacing:'-0.5px'}}>🌙 Démarrer ma préparation au jeûne</h2>
          {isClient && dateHeure.date && dateHeure.heure && (
            <span style={{fontSize:'0.98rem', color:'#64748b', fontWeight:500}}>{`Aujourd’hui : ${dateHeure.date} — ${dateHeure.heure}`}</span>
          )}
        </div>
        {/* Résumé période et objectif */}
        <div className={styles['modal-info']} style={{borderBottom:'1.5px solid #e0e7ef', paddingBottom:'0.7rem', marginBottom:'1.1rem'}}>
          <div><b>📅 Date de début choisie :</b> <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          <div style={{marginTop:4}}>
            <b>⏳ Durée de préparation :</b> {dureeReelle !== null ? `${dureeReelle} jours` : '—'}
            <span style={{marginLeft:8, color:'#64748b', fontSize:'0.95em'}}>
              (du {dureeReelle !== null && startDate ? (new Date(new Date(startDate).getTime() - dureeReelle*24*60*60*1000)).toLocaleDateString('fr-FR') : '—'} au {startDate ? new Date(startDate).toLocaleDateString('fr-FR') : '—'})
            </span>
          </div>
          <div style={{marginTop:4}}>
            <b>🥕 Durée du jeûne souhaitée :</b> <input type="number" min="1" max="21" value={dureeJeune === undefined ? '' : dureeJeune} onChange={e => setDureeJeune(e.target.value === '' ? undefined : Number(e.target.value))} placeholder="Ex : 5" style={{width:60,marginLeft:6,marginRight:6}} /> jours
            <span style={{marginLeft:8, color:'#64748b', fontSize:'0.95em'}}>(généralement 5 à 10 jours)</span>
          </div>
          <div><b>🎯 Objectif :</b> <input type="text" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Ex : Jeûne de 5 jours le 15/12/2025" /></div>
        </div>
        {/* Feedback métier si durée réelle < recommandée */}
        {dureeReelle !== null && dureeReelle < dureeRecommandee && (
          <div style={{background:'#fef3c7',color:'#92400e',padding:'8px 12px',borderRadius:8,margin:'10px 0',fontWeight:500, border:'1.5px solid #fde68a'}}>
            ⚠️ Le temps de préparation recommandé est de {dureeRecommandee} jours.<br/>
            Il vous reste seulement {dureeReelle} jours avant le jeûne.<br/>
            Pensez à mieux organiser la prochaine fois pour bénéficier de toutes les phases de préparation !
          </div>
        )}
        {/* Séparateur visuel */}
        <hr style={{border:'none', borderTop:'2px dashed #cbd5e1', margin:'1.2rem 0 1.1rem 0'}} />
        {/* Phases de préparation (nouvelle logique métier partagée) */}
        <section className={styles['modal-phases']}>
          <h3 style={{marginBottom:'0.7rem'}}>🗓️ Phase de préparation du jour</h3>
          {phaseDuJour ? (
            <div style={{
              background:'#f1f5f9',
              border:'2px solid #38bdf8',
              borderRadius:8,
              padding:'12px 16px',
              marginBottom:'1rem',
              boxShadow:'0 2px 8px 0 rgba(56,189,248,0.07)'
            }}>
              <b>{phaseDuJour.nom}</b>
              <div style={{fontStyle:'italic',color:'#0e7490',margin:'4px 0 4px 0',fontSize:'0.98em',background:'#e0f2fe',padding:'4px 8px',borderRadius:6}}>
                🎯 Objectif : {phaseDuJour.objectif || 'Voir fiche métier'}
              </div>
              <ul style={{marginTop:8,marginBottom:0,paddingLeft:18}}>
                {criteresDuJour.length > 0 ? criteresDuJour.map(critere => (
                  <li key={critere.id} style={{
                    color:'#334155',
                    fontWeight:400,
                    display:'flex',
                    alignItems:'center',
                    marginBottom:4
                  }}>
                    {critere.description}
                  </li>
                )) : <li style={{color:'#64748b'}}>Aucun critère à valider aujourd’hui.</li>}
              </ul>
            </div>
          ) : (
            <div style={{color:'#64748b'}}>Veuillez saisir une date pour voir la phase du jour.</div>
          )}
        </section>
        {/* Bloc critère/conseil du jour (restauration conforme audit) */}
        {critereActifDuJour && (
          <section className={styles['modal-jalon']} aria-live="polite">
            <div className={styles['jalon-today']}>
              <span>📍 Critère du jour :</span>
              <div className={styles['jalon-critere']}>
                ➡️ <b>{critereActifDuJour.description}</b>
                {/* Conseil si présent dans le critère (optionnel) */}
                {critereActifDuJour.conseil && (
                  <div className={styles['jalon-conseil']}>💡 {critereActifDuJour.conseil}</div>
                )}
              </div>
            </div>
          </section>
        )}
        {/* Séparateur visuel */}
        <hr style={{border:'none', borderTop:'2px dashed #cbd5e1', margin:'1.2rem 0 1.1rem 0'}} />
        {/* DEBUG: Affichage des états pour diagnostic + contenu brut localStorage.repas + bouton de rafraîchissement */}
        {isClient && (
          <div style={{background:'#fef9c3',color:'#b45309',fontSize:'0.95em',padding:'4px 8px',borderRadius:6,margin:'8px 0'}}>
            <b>DEBUG</b> userId: {userId ? userId : <span style={{color:'#c00'}}>non défini</span>} | analyse3Jours: {analyse3Jours.length} | isOpen: {isOpen ? 'oui' : 'non'}<br/>
            startDate (date métier): <span style={{color:'#0ea5e9'}}>{startDate ? (new Date(startDate)).toLocaleDateString('fr-FR') : <span style={{color:'#c00'}}>non défini</span>}</span><br/>
            date système: <span style={{color:'#64748b'}}>{(new Date()).toLocaleDateString('fr-FR')}</span><br/>
            date de référence utilisée pour l'analyse: <span style={{color:'#0ea5e9'}}>{isOpen ? (new Date()).toLocaleDateString('fr-FR') : <span style={{color:'#c00'}}>non analysé</span>}</span>
            <details style={{marginTop:'6px'}}>
              <summary style={{cursor:'pointer'}}>Voir contenu brut localStorage.repas</summary>
              <pre style={{maxHeight:180,overflow:'auto',background:'#fff7ed',color:'#92400e',fontSize:'0.93em',padding:'6px',borderRadius:'4px',marginTop:'4px'}}>
                {window.localStorage.getItem('repas') ? window.localStorage.getItem('repas') : 'Aucune entrée "repas" dans localStorage'}
              </pre>
            </details>
            <button type="button" style={{marginTop:8,background:'#fde68a',color:'#92400e',border:'1px solid #fbbf24',borderRadius:4,padding:'2px 10px',fontSize:'0.97em',cursor:'pointer'}}
              onClick={async () => {
                const todayStr = new Date().toISOString().slice(0,10);
                // Utiliser la même logique que le useEffect principal
                const demoUserId = userId || '00000000-0000-0000-0000-000000000000';
                const repas = await getAnalyse3DerniersJoursRepas(demoUserId, todayStr);
                window.localStorage.setItem('repas', JSON.stringify(repas.flatMap(j => j.repas)));
                setAnalyse3Jours(repas);
                // Mettre à jour aussi l'analyse synthétique
                setAnalyseSynth(genererAnalyseSynthétiqueRepas(repas));
              }}>
              🔄 Rafraîchir les repas (forcer synchro Supabase → localStorage)
            </button>
          </div>
        )}
        {/* Zone message personnel (texte OU audio/vidéo) */}
        <section className={styles['modal-message']}>
          <h4>📝 Message à toi-même (optionnel)</h4>
          <div style={{color:'#64748b',fontSize:'0.97em',marginBottom:4}}>
            <b>À quoi ça sert ?</b> Ce message est pour toi, il t’aide à garder ta motivation et à te rappeler pourquoi tu fais cette démarche. Il sera visible uniquement par toi.
          </div>
          <div>
            <label><input type="radio" name="msgType" checked={msgType === 'texte'} onChange={() => setMsgType('texte')} /> Texte</label>
            <label style={{marginLeft: '1em'}}><input type="radio" name="msgType" checked={msgType === 'audio'} onChange={() => setMsgType('audio')} /> Audio/vidéo</label>
          </div>
          {msgType === 'texte' ? (
            <textarea value={msgTexte} onChange={e => setMsgTexte(e.target.value)} placeholder="Ex : Je me prépare depuis 30 jours. Mon corps est prêt..." style={{width:'100%',marginTop:4}} />
          ) : (
            <button type="button" style={{marginTop:4}} onClick={() => alert('Fonction d’enregistrement audio/vidéo à venir (conforme fiche métier)')}>🎤 Enregistrer un message vocal/vidéo</button>
          )}
        </section>
        {/* Zone projection sur la réussite (texte OU audio/vidéo) */}
        <section className={styles['modal-projection']}>
          <h4>🌟 Projection sur la réussite (optionnel)</h4>
          <div style={{color:'#64748b',fontSize:'0.97em',marginBottom:4}}>
            <b>À quoi ça sert ?</b> Ici, tu imagines comment tu te sentiras après le jeûne. C’est une projection positive pour renforcer ta confiance et visualiser ta réussite. Ce message t’aidera à garder le cap dans les moments difficiles.
          </div>
          <div>
            <label><input type="radio" name="projType" checked={projType === 'texte'} onChange={() => setProjType('texte')} /> Texte</label>
            <label style={{marginLeft: '1em'}}><input type="radio" name="projType" checked={projType === 'audio'} onChange={() => setProjType('audio')} /> Audio/vidéo</label>
          </div>
          {projType === 'texte' ? (
            <textarea value={projTexte} onChange={e => setProjTexte(e.target.value)} placeholder="Ex : Après ce jeûne, je me sentirai..." style={{width:'100%',marginTop:4}} />
          ) : (
            <button type="button" style={{marginTop:4}} onClick={() => alert('Fonction d’enregistrement audio/vidéo à venir (conforme fiche métier)')}>🎤 Enregistrer un message vocal/vidéo</button>
          )}
        </section>
        {/* Encadré analyse comportementale enrichi */}
        <section className={styles['modal-analyse']}>
          <h4>⚠️ Analyse rapide de ton comportement alimentaire</h4>
          <ul style={{marginBottom:8}}>
            {analyseSynth?.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <div style={{marginTop:8}}>
            <b>🗓️ 3 derniers jours analysés :</b>
            <span style={{marginLeft:8, color:'#64748b', fontSize:'0.97em'}}>
              {analyse3Jours && analyse3Jours.length > 0 &&
                analyse3Jours.map((jour, idx) =>
                  `J-${idx+1} (${jour.date})${idx < analyse3Jours.length-1 ? ' | ' : ''}`
                )
              }
            </span>
            <button type="button" style={{marginLeft:16, fontSize:'0.97em', color:'#0ea5e9', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}
              onClick={() => setShowRepasDetail(v => !v)}>
              {showRepasDetail ? 'Masquer le détail' : 'En savoir plus'}
            </button>
            {showRepasDetail && (
              <ul style={{marginTop:8}}>
                {analyse3Jours.length > 0 && analyse3Jours.some(j => j.repas && j.repas.length > 0) ? (
                  analyse3Jours.map((jour, idx) => (
                    <li key={jour.date} style={{marginBottom:4}}>
                      <span style={{fontWeight:600, color:'#0ea5e9'}}>{`J-${idx+1} (${jour.date})`}</span>
                      <ul style={{marginLeft:12}}>
                        {jour.repas.length > 0 ? jour.repas.map((r, i) => (
                          <li key={r.id || i} style={{color:'#334155'}}>
                            {r.type ? r.type+': ' : ''}{r.aliment} <span style={{color:'#64748b',fontSize:'0.95em'}}>({r.quantite} - {r.kcal} kcal)</span>
                          </li>
                        )) : <li style={{color:'#b91c1c'}}>Aucun repas ce jour</li>}
                      </ul>
                    </li>
                  ))
                ) : (
                  <li style={{color:'#b91c1c'}}>Aucun repas trouvé sur les 3 derniers jours.</li>
                )}
              </ul>
            )}
          </div>
        </section>
          // Affichage/masquage du détail des repas ("En savoir plus")
          const [showRepasDetail, setShowRepasDetail] = useState(false);
        {/* Séparateur visuel */}
        <hr style={{border:'none', borderTop:'2px dashed #cbd5e1', margin:'1.2rem 0 1.1rem 0'}} />
        {/* Actions alignées strictement à droite */}
        <div className={styles['modal-actions']}>
          <button onClick={onClose} style={{background:'#e2e8f0',color:'#334155',fontWeight:600}}>Annuler</button>
          <button onClick={handleSave} autoFocus style={{background:'linear-gradient(90deg,#38bdf8 60%,#0ea5e9 100%)',color:'#fff',fontWeight:700}}>Démarrer ma préparation</button>
        </div>
      </div>
    </div>
  );
};

export default StartPreparationModal;