import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navigation from '../components/Navigation';
import BilanMensuelModal from '../components/BilanMensuelModal';
import ComparaisonBilansModal from '../components/ComparaisonBilansModal';
import styles from '../styles/HistoriqueBilansMensuels.module.css';

export default function HistoriqueBilansMensuels() {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bilanSelectionne, setBilanSelectionne] = useState(null);
  const [comparaisonOuverte, setComparaisonOuverte] = useState(false);

  useEffect(() => {
    chargerBilans();
  }, []);

  const chargerBilans = async () => {
    try {
      console.log('[HISTORIQUE] Chargement des bilans...');
      const { data, error } = await supabase
        .from('bilans_mensuels')
        .select('*')
        .order('annee', { ascending: false })
        .order('mois', { ascending: false });

      if (error) {
        console.error('[HISTORIQUE] Erreur chargement:', error);
      } else {
        console.log('[HISTORIQUE] Bilans chargés:', data?.length || 0);
        setBilans(data || []);
      }
    } catch (err) {
      console.error('[HISTORIQUE] Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const ouvrirBilan = (bilan) => {
    console.log('[HISTORIQUE] Ouverture bilan:', bilan.mois, bilan.annee);
    setBilanSelectionne(bilan);
  };

  const fermerModal = () => {
    setBilanSelectionne(null);
  };

  const getNomMois = (mois) => {
    const moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNoms[mois - 1];
  };

  const getStatutEmoji = (bilan) => {
    if (bilan.valide) return '✅';
    return '📊';
  };

  const getStatutLabel = (bilan) => {
    if (bilan.valide) return 'Validé';
    return 'Brouillon';
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Chargement de l'historique...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>📈 Historique des bilans mensuels</h1>
          <p className={styles.subtitle}>
            Consultez vos bilans mensuels sauvegardés
          </p>
          <button
            onClick={() => setComparaisonOuverte(true)}
            className={styles.compareButton}
            disabled={bilans.length < 2}
          >
            ⚖️ Comparer des bilans
          </button>
        </header>

        {bilans.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <h2>Aucun bilan sauvegardé</h2>
            <p>
              Les bilans mensuels apparaîtront ici après validation
              de la dernière semaine de chaque mois.
            </p>
          </div>
        ) : (
          <div className={styles.bilansList}>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{bilans.length}</span>
                <span className={styles.statLabel}>Bilans</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>
                  {bilans.filter(b => b.valide).length}
                </span>
                <span className={styles.statLabel}>Validés</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>
                  {bilans[0] ? `${getNomMois(bilans[0].mois)} ${bilans[0].annee}` : '-'}
                </span>
                <span className={styles.statLabel}>Plus récent</span>
              </div>
            </div>

            <div className={styles.bilansGrid}>
              {bilans.map((bilan) => (
                <div
                  key={bilan.id}
                  className={styles.bilanCard}
                  onClick={() => ouvrirBilan(bilan)}
                >
                  <div className={styles.bilanHeader}>
                    <div className={styles.bilanDate}>
                      <span className={styles.mois}>{getNomMois(bilan.mois)}</span>
                      <span className={styles.annee}>{bilan.annee}</span>
                    </div>
                    <div className={`${styles.statut} ${bilan.valide ? styles.valide : styles.brouillon}`}>
                      <span className={styles.statutEmoji}>{getStatutEmoji(bilan)}</span>
                      <span className={styles.statutLabel}>{getStatutLabel(bilan)}</span>
                    </div>
                  </div>

                  <div className={styles.bilanMetadata}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📅</span>
                      <span className={styles.metaText}>
                        {bilan.nb_jours_saisis || 0} / {bilan.nb_jours_total || 0} jours
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📊</span>
                      <span className={styles.metaText}>6 sections</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>🕐</span>
                      <span className={styles.metaText}>
                        {new Date(bilan.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className={styles.bilanSections}>
                    {bilan.section_1_tendance_poids && (
                      <span className={styles.sectionBadge}>⚖️ Poids</span>
                    )}
                    {bilan.section_2_budget_calorique && (
                      <span className={styles.sectionBadge}>🔥 Budget</span>
                    )}
                    {bilan.section_3_patterns && (
                      <span className={styles.sectionBadge}>📊 Patterns</span>
                    )}
                    {bilan.section_4_qualite_nutritionnelle && (
                      <span className={styles.sectionBadge}>🥗 Qualité</span>
                    )}
                    {bilan.section_5_bien_etre && (
                      <span className={styles.sectionBadge}>😊 Bien-être</span>
                    )}
                    {bilan.section_6_projection && (
                      <span className={styles.sectionBadge}>🎯 Projection</span>
                    )}
                  </div>

                  <button className={styles.voirButton}>
                    👁️ Consulter le bilan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {bilanSelectionne && (
          <BilanMensuelModal
            isOpen={true}
            mois={bilanSelectionne.mois}
            annee={bilanSelectionne.annee}
            onClose={fermerModal}
          />
        )}

        <ComparaisonBilansModal
          isOpen={comparaisonOuverte}
          onClose={() => setComparaisonOuverte(false)}
          bilans={bilans}
        />
      </div>
    </>
  );
}
