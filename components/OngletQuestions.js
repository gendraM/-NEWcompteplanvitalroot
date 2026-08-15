import { useState } from 'react';
import { useQuestions } from '../lib/useJournalSpirituel';
import styles from '../styles/OngletQuestions.module.css';

export default function OngletQuestions({ jourJeune, modeArchive = false, idJeuneArchive = null, periodeArchive = null, userId = null }) {
  // Hook Supabase avec fallback localStorage
  const { questions: reponsesStockees, loading, mode, ajouter, modifier, supprimer } = useQuestions(userId, modeArchive, idJeuneArchive, periodeArchive);
  
  // États locaux pour le formulaire
  const [questionActive, setQuestionActive] = useState(null);
  const [reponse, setReponse] = useState('');
  const [afficherHistorique, setAfficherHistorique] = useState(false);
  const [questionPersonnalisee, setQuestionPersonnalisee] = useState('');
  const [modeAjoutQuestion, setModeAjoutQuestion] = useState(false);

  // Afficher loading pendant chargement
  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement des questions...</div>;
  }

  // Questions guidées par jour (8 questions rotatives sur J1-J15)
  const questionsGuidees = [
    // J1, J8
    { 
      id: 'q1', 
      question: "Qu'est-ce qui m'a poussé(e) à commencer ce jeûne ? Quelle est mon intention profonde ?",
      jours: [1, 8]
    },
    // J2, J9
    { 
      id: 'q2', 
      question: "Quelles émotions ou résistances émergent en moi aujourd'hui ? Qu'essaient-elles de me dire ?",
      jours: [2, 9]
    },
    // J3, J10
    { 
      id: 'q3', 
      question: "Pour quoi suis-je reconnaissant(e) dans ma vie en ce moment ?",
      jours: [3, 10]
    },
    // J4, J11
    { 
      id: 'q4', 
      question: "Quelle partie de moi-même ai-je négligée ? Comment puis-je mieux prendre soin de mon être intérieur ?",
      jours: [4, 11]
    },
    // J5, J12
    { 
      id: 'q5', 
      question: "Si je pouvais parler à Dieu/l'Univers/ma sagesse intérieure, que lui dirais-je ?",
      jours: [5, 12]
    },
    // J6, J13
    { 
      id: 'q6', 
      question: "Qu'est-ce qui me donne de la force dans les moments difficiles ? Où puis-je puiser davantage ?",
      jours: [6, 13]
    },
    // J7, J14
    { 
      id: 'q7', 
      question: "Quelle transformation souhaite mon cœur ? Quel est le message que mon corps essaie de me transmettre ?",
      jours: [7, 14]
    },
    // Tous les jours
    { 
      id: 'q8', 
      question: "Aujourd'hui, qu'ai-je appris sur moi-même ? Quelle petite victoire puis-je célébrer ?",
      jours: Array.from({length: 15}, (_, i) => i + 1)
    }
  ];

  // Charger les réponses depuis le hook (format compatible)
  const reponses = {};
  reponsesStockees.forEach(r => {
    const cle = `${r.questionId}_J${r.jourJeune}`;
    reponses[cle] = r;
  });

  // Questions disponibles pour le jour actuel
  const questionsDisponibles = jourJeune 
    ? questionsGuidees.filter(q => q.jours.includes(jourJeune))
    : questionsGuidees.filter(q => q.jours.includes(1)); // Par défaut J1

  // Questions personnalisées (filtrées du hook)
  const questionsPerso = reponsesStockees.filter(r => r.type === 'personnalisee');

  // Ouvrir question
  const ouvrirQuestion = (questionId) => {
    setQuestionActive(questionId);
    // Charger réponse existante si disponible
    const cleReponse = `${questionId}_J${jourJeune}`;
    setReponse(reponses[cleReponse] || '');
  };

  // Sauvegarder réponse
  const sauvegarderReponse = async () => {
    if (!reponse.trim()) {
      alert('Veuillez écrire une réponse');
      return;
    }

    const nouvelleReponse = {
      texte: reponse,
      jourJeune: jourJeune,
      questionId: questionActive,
      type: 'guidee'
    };

    await ajouter(nouvelleReponse);
    
    alert('✅ Réponse sauvegardée !');
    setQuestionActive(null);
    setReponse('');
  };

  // Ajouter question personnalisée
  const ajouterQuestionPerso = async () => {
    if (!questionPersonnalisee.trim()) {
      alert('Veuillez saisir une question');
      return;
    }

    const nouvelleQuestion = {
      question: questionPersonnalisee,
      type: 'personnalisee'
    };

    await ajouter(nouvelleQuestion);

    setQuestionPersonnalisee('');
    setModeAjoutQuestion(false);
    alert('✅ Question personnalisée ajoutée !');
  };

  // Supprimer question personnalisée
  const supprimerQuestionPerso = async (id) => {
    if (!confirm('Supprimer cette question ?')) return;

    await supprimer(id);
  };

  // Formater date
  const formaterDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir le texte de la question
  const obtenirTexteQuestion = (questionId) => {
    const questionGuidee = questionsGuidees.find(q => q.id === questionId);
    if (questionGuidee) return questionGuidee.question;
    
    const questionPerso = questionsPerso.find(q => q.id === questionId);
    return questionPerso ? questionPerso.question : 'Question inconnue';
  };

  return (
    <div className={styles.ongletContainer}>
      <h2 className={styles.title}>
        💭 Questions Profondes {mode === 'supabase' ? '☁️' : '💾'}
      </h2>
      
      <div className={styles.infoJour}>
        <span className={styles.jourBadge}>Jour {jourJeune || 1}</span>
        <p className={styles.infoText}>
          {questionsDisponibles.length} question{questionsDisponibles.length > 1 ? 's' : ''} guidée{questionsDisponibles.length > 1 ? 's' : ''} pour aujourd'hui
        </p>
      </div>

      {!questionActive ? (
        <>
          {/* Liste des questions guidées */}
          <div className={styles.questionsSection}>
            <h3 className={styles.sectionTitle}>📋 Questions du jour</h3>
            <div className={styles.questionsList}>
              {questionsDisponibles.map((q, index) => {
                const cleReponse = `${q.id}_J${jourJeune}`;
                const dejaRepondu = !!reponses[cleReponse];
                
                return (
                  <div key={q.id} className={styles.questionCard}>
                    <div className={styles.questionHeader}>
                      <span className={styles.questionNum}>Question {index + 1}</span>
                      {dejaRepondu && <span className={styles.badgeRepondu}>✓ Répondu</span>}
                    </div>
                    <p className={styles.questionTexte}>{q.question}</p>
                    <button
                      onClick={() => ouvrirQuestion(q.id)}
                      className={styles.btnRepondre}
                    >
                      {dejaRepondu ? '📝 Modifier ma réponse' : '✍️ Répondre'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Questions personnalisées */}
          <div className={styles.questionsSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>⭐ Mes questions personnalisées</h3>
              <button
                onClick={() => setModeAjoutQuestion(!modeAjoutQuestion)}
                className={styles.btnAjoutQuestion}
              >
                {modeAjoutQuestion ? '✕ Annuler' : '+ Ajouter'}
              </button>
            </div>

            {modeAjoutQuestion && (
              <div className={styles.ajoutQuestionForm}>
                <textarea
                  value={questionPersonnalisee}
                  onChange={(e) => setQuestionPersonnalisee(e.target.value)}
                  placeholder="Écris ta propre question de réflexion..."
                  className={styles.textarea}
                  rows={3}
                />
                <button
                  onClick={ajouterQuestionPerso}
                  className={styles.btnSauvegarder}
                >
                  💾 Enregistrer cette question
                </button>
              </div>
            )}

            {questionsPerso.length > 0 ? (
              <div className={styles.questionsList}>
                {questionsPerso.map((q) => {
                  const cleReponse = `${q.id}_J${jourJeune}`;
                  const dejaRepondu = !!reponses[cleReponse];
                  
                  return (
                    <div key={q.id} className={styles.questionCard}>
                      <div className={styles.questionHeader}>
                        <div className={styles.questionHeaderLeft}>
                          <span className={styles.questionNum}>⭐ Perso</span>
                          {q.dateCreationFormatee && (
                            <span className={styles.questionDateCreation}>
                              Créée le {q.dateCreationFormatee}
                            </span>
                          )}
                        </div>
                        <div className={styles.headerActions}>
                          {dejaRepondu && <span className={styles.badgeRepondu}>✓ Répondu</span>}
                          <button
                            onClick={() => supprimerQuestionPerso(q.id)}
                            className={styles.btnDeleteMini}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className={styles.questionTexte}>{q.question}</p>
                      <button
                        onClick={() => ouvrirQuestion(q.id)}
                        className={styles.btnRepondre}
                      >
                        {dejaRepondu ? '📝 Modifier ma réponse' : '✍️ Répondre'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              !modeAjoutQuestion && (
                <p className={styles.emptyMessage}>Aucune question personnalisée pour l'instant</p>
              )
            )}
          </div>

          {/* Historique */}
          <div className={styles.historiqueSection}>
            <button
              onClick={() => setAfficherHistorique(!afficherHistorique)}
              className={styles.btnToggleHistorique}
            >
              📚 Historique de mes réflexions ({Object.keys(reponses).length})
              <span className={styles.toggleIcon}>
                {afficherHistorique ? '▼' : '▶'}
              </span>
            </button>

            {afficherHistorique && (
              <div className={styles.historiqueList}>
                {Object.keys(reponses).length === 0 ? (
                  <p className={styles.emptyMessage}>Aucune réponse enregistrée pour l'instant</p>
                ) : (
                  Object.entries(reponses)
                    .sort(([, a], [, b]) => new Date(b.date) - new Date(a.date))
                    .map(([cle, data]) => (
                      <div key={cle} className={styles.reponseCard}>
                        <div className={styles.cardHeader}>
                          <div className={styles.cardHeaderLeft}>
                            <div className={styles.cardJourWrapper}>
                              <span className={styles.cardJour}>Jour {data.jourJeune}</span>
                              <span className={styles.cardDate}>📅 {formaterDate(data.date)}</span>
                            </div>
                          </div>
                          <div className={styles.cardHeaderActions}>
                            <button
                              onClick={() => {
                                setQuestionActive(data.questionId);
                                setReponse(data.texte);
                              }}
                              className={styles.btnEditMini}
                              title="Modifier cette réflexion"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Supprimer cette réflexion ?')) {
                                  const nouvellesReponses = { ...reponses };
                                  delete nouvellesReponses[cle];
                                  setReponses(nouvellesReponses);
                                  localStorage.setItem('questionsReponses', JSON.stringify(nouvellesReponses));
                                }
                              }}
                              className={styles.btnDeleteMini}
                              title="Supprimer cette réflexion"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <p className={styles.cardQuestion}>
                          {obtenirTexteQuestion(data.questionId)}
                        </p>
                        <p className={styles.cardReponse}>{data.texte}</p>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Formulaire de réponse */}
          <div className={styles.reponseForm}>
            <div className={styles.formHeader}>
              <button
                onClick={() => {
                  setQuestionActive(null);
                  setReponse('');
                }}
                className={styles.btnRetour}
              >
                ← Retour
              </button>
              <span className={styles.jourBadge}>Jour {jourJeune || 1}</span>
            </div>

            <div className={styles.questionBox}>
              <h3 className={styles.questionTitre}>💭 Question</h3>
              <p className={styles.questionTexteGrand}>
                {obtenirTexteQuestion(questionActive)}
              </p>
            </div>

            <div className={styles.reponseBox}>
              <h3 className={styles.reponseTitre}>✍️ Ma réponse</h3>
              <textarea
                value={reponse}
                onChange={(e) => setReponse(e.target.value)}
                placeholder="Prends ton temps pour réfléchir et écrire ce qui vient de ton cœur... Aucune limite de caractères."
                className={styles.textareaGrand}
                rows={12}
                autoFocus
              />
              <div className={styles.compteur}>
                {reponse.length} caractère{reponse.length > 1 ? 's' : ''}
              </div>
            </div>

            <button
              onClick={sauvegarderReponse}
              className={styles.btnSauvegarder}
            >
              💾 Sauvegarder ma réflexion
            </button>
          </div>
        </>
      )}
    </div>
  );
}
