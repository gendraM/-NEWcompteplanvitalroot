import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import dashboardStyles from "../styles/dashboard.module.css";
import DashboardSummary from "../components/DashboardSummary";
import DashboardDetails from "../components/DashboardDetails";
import DashboardEvolution from "../components/DashboardEvolution";
import { useAuth } from "../contexts/AuthContext";
import { chargerDonneesDashboard } from "../lib/dashboardData";
import { construireSyntheseTableauDeBord, construireMealSignals, compterExtrasObserves } from "../lib/dashboardSynthesis";
import { getFastFoodRhythm } from "../lib/fastFoodRhythm";
import { regrouperRepasReelsParOccurrence } from "../lib/alignementRepas";
import { getFastFoodRewards } from "../lib/fastFoodRewards";
import { supabase } from "../lib/supabaseClient";
import { Line, Pie, Doughnut } from "react-chartjs-2";
import TimelineProgression from "../components/TimelineProgression";
import BadgeCard from "../components/BadgeCard";
import ExtrasBadgesSection from "../components/ExtrasBadgesSection";
import DrawerValidation from "../components/DrawerValidation";
import { getSemainesNonValidees, calculerExtrasSemaine, compterMomentsExtras, genererMessageFeedback, calculerVariation, formatDate } from "../lib/validationSemaine";
import { calculerProgressionExtras } from "../lib/extrasProgression";
import { synchroniserBadgesPalierExtras, synchroniserEvenementsPalierExtras } from "../lib/extrasBadges";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const COLORS = ["#43cea2", "#1976d2", "#ffb347", "#ff6b6b", "#b39ddb", "#4dd0e1"];
// Fonction utilitaire hors composant React
function getMotivationMessage({ progression }) {
  return progression.message || 'Observer, comprendre, ajuster : les données renseignées racontent ton parcours.';
}

export default function TableauDeBord() {
  const { user, loading: authLoading } = useAuth();
  const requestSequence = useRef(0);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [domainErrors, setDomainErrors] = useState([]);
  const [profilDashboard, setProfilDashboard] = useState(null);
  const [periodesReconstituees, setPeriodesReconstituees] = useState([]);
  const [defisDashboard, setDefisDashboard] = useState([]);
  const [fastFoodRhythm, setFastFoodRhythm] = useState(null);
  // Hook pour afficher/masquer l’historique des notes repas (diagnostic)
  // Pagination des badges
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showNotesHistory, setShowNotesHistory] = useState(false);
  // Ajout pour la validation des semaines (fast food et extras)
  const [semainesValidees, setSemainesValidees] = useState([]);
  // Ajout : données d’évolution extras et poids
  const [evolutionExtras, setEvolutionExtras] = useState([]);
  const [evolutionPoids, setEvolutionPoids] = useState([]);
  // Ajout fast food
  const [fastFoodHistory, setFastFoodHistory] = useState([]);
  // Ajout badges fast food
  const [badgesFastFood, setBadgesFastFood] = useState([]);
  const [fastFoodCount, setFastFoodCount] = useState(0);
  const [nextFastFoodDate, setNextFastFoodDate] = useState(null);
  const [fastFoodDelay, setFastFoodDelay] = useState(0);
  // Idéaux et progression
  const [ideauxList, setIdeauxList] = useState([]);
  const [ideauxProgress, setIdeauxProgress] = useState([]);
  // Ajout : gestion de la période sélectionnée
  const [evolutionView, setEvolutionView] = useState('poids');
  const [openDomains, setOpenDomains] = useState([]);
  const [periode, setPeriode] = useState('semaine'); // 'semaine', 'mois', 'annee'
  const [periodeLabel, setPeriodeLabel] = useState('');

  // État pour la bannière de préparation jeûne
  const [preparationData, setPreparationData] = useState(null);
  const [joursRestants, setJoursRestants] = useState(null);

  // État pour le drawer de validation rétroactive
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nbSemainesNonValidees, setNbSemainesNonValidees] = useState(0);
  const [semainesNonValideesFormatees, setSemainesNonValideesFormatees] = useState([]);

  const [poidsData, setPoidsData] = useState([]);
  const [humeurData, setHumeurData] = useState([]);
  const [satieteData, setSatieteData] = useState({ faim: 0, total: 0 });
  const [extrasData, setExtrasData] = useState({ current: 0, quota: 3 });
  const [badges, setBadges] = useState([]);
  const [extrasPalierEvents, setExtrasPalierEvents] = useState([]);
  const [repasReels, setRepasReels] = useState([]);
  const [loading, setLoading] = useState(true);


  // Calcul des bornes de période
  function getPeriodeDates() {
    const now = new Date();
    let debut, fin;
    if (periode === 'semaine') {
      debut = new Date(now);
  debut.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      debut.setHours(0,0,0,0);
      fin = new Date(debut);
  fin.setDate(debut.getDate() + 6);
    } else if (periode === 'mois') {
      debut = new Date(now.getFullYear(), now.getMonth(), 1);
      fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (periode === 'annee') {
      debut = new Date(now.getFullYear(), 0, 1);
      fin = new Date(now.getFullYear(), 11, 31);
    }
    return { debut, fin };
  }

  useEffect(() => {
    const { debut, fin } = getPeriodeDates();
    let label = '';
    if (periode === 'semaine') {
      label = `Semaine du ${debut.toLocaleDateString('fr-FR')} au ${fin.toLocaleDateString('fr-FR')}`;
    } else if (periode === 'mois') {
      label = `Mois de ${debut.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
    } else if (periode === 'annee') {
      label = `Année ${debut.getFullYear()}`;
    }
    setPeriodeLabel(label);
  }, [periode]);
  // Fonction de refresh manuel
  const handleRefresh = async () => {
  const { debut, fin } = getPeriodeDates();
    const debutISO = formatDate(debut, 'yyyy-MM-dd');
    const finISO = formatDate(fin, 'yyyy-MM-dd');
    const sequence = ++requestSequence.current;
    if (!user?.id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const donnees = await chargerDonneesDashboard(supabase, { debut: debutISO, fin: finISO, expectedUserId: user?.id });
      if (sequence !== requestSequence.current) return;
      const { poids: poidsHistory, repas: repasReelsData, semaines, humeurs, ideaux } = donnees;
      setDomainErrors(donnees.errors);
      setLoadedUserId(donnees.userId);
      setPoidsData(poidsHistory);
      setHumeurData(humeurs);
      setRepasReels(repasReelsData);
      setSemainesValidees(semaines);
      setProfilDashboard(donnees.profil);
      setPeriodesReconstituees(donnees.periodes);
      setDefisDashboard(donnees.defis);
      setIdeauxList(ideaux);
      setBadges(donnees.badges);
      setExtrasPalierEvents(donnees.evenementsExtras);
      const nonValidees = getSemainesNonValidees(semaines, 8);
      setNbSemainesNonValidees(nonValidees.length);
      setSemainesNonValideesFormatees(nonValidees);
      const signaux = construireMealSignals(repasReelsData);
      setSatieteData({ faim: signaux.faim.avecFaim, total: signaux.faim.renseignee });
      const quota = calculerProgressionExtras(semaines).palier;
      const momentsExtras = compterMomentsExtras(repasReelsData);
      setExtrasData({ current: momentsExtras, quota });
      // Sans observations, aucun badge « sans extra » n'est déduit d'un zéro.
      setProgression({ badge: null, message: '', quota });
      const ffData = repasReelsData.filter(r => r.categorie === 'fast-food');
      setFastFoodHistory([...ffData].reverse());
      setFastFoodCount(regrouperRepasReelsParOccurrence(ffData).length);
      // Le champ non intégré reste une dépendance explicite, sans valeur fictive.
      const intervalAvailable = donnees.profil && Object.prototype.hasOwnProperty.call(donnees.profil, 'fast_food_interval_days');
      const rhythm = intervalAvailable && !donnees.errors.includes('dernierFastFood')
        ? getFastFoodRhythm({ lastFastFoodDate: donnees.dernierFastFood?.date, intervalDays: donnees.profil.fast_food_interval_days })
        : null;
      setFastFoodRhythm(rhythm);
      setNextFastFoodDate(rhythm?.nextReferenceDate || null);
      setFastFoodDelay(rhythm?.remainingDays ?? null);
      // Synchronisations Extras déjà présentes en consolidation, conservées.
      // Jamais appelées par l'adaptateur de lecture ou en l'absence de semaines.
      if (!donnees.errors.includes('semaines') && semaines.length) {
        try {
          const progressionExtras = calculerProgressionExtras(semaines);
          const synchronisation = await synchroniserBadgesPalierExtras(donnees.userId, progressionExtras, semaines);
          if (sequence !== requestSequence.current) return;
          if (synchronisation.erreurs.length) setDomainErrors(erreurs => [...new Set([...erreurs, 'badges'])]);
          if (synchronisation.nouveaux.length) setBadges(badgesActuels => [
            ...synchronisation.nouveaux,
            ...badgesActuels.filter(b => !synchronisation.nouveaux.some(n => n.code === b.code)),
          ]);
          const synchronisationEvenements = await synchroniserEvenementsPalierExtras(donnees.userId, progressionExtras);
          if (sequence !== requestSequence.current) return;
          if (synchronisationEvenements.error) setDomainErrors(erreurs => [...new Set([...erreurs, 'evenementsExtras'])]);
          else {
            const { data: evenements, error: evenementsError } = await supabase.from('extras_palier_events')
              .select('*').eq('user_id', donnees.userId).order('semaine_decisive', { ascending: true });
            if (sequence !== requestSequence.current) return;
            if (evenementsError) setDomainErrors(erreurs => [...new Set([...erreurs, 'evenementsExtras'])]);
            else setExtrasPalierEvents(evenements || []);
          }
        } catch {
          if (sequence !== requestSequence.current) return;
          setDomainErrors(erreurs => [...new Set([...erreurs, 'badges', 'evenementsExtras'])]);
        }
      }
      // Les récompenses historiques gardent leur contrat 45 jours. Aucune
      // requalification d'un délai personnalisé avec ce moteur non intégré.
      setBadgesFastFood(rhythm?.targetDays === 45
        ? getFastFoodRewards([...ffData].sort((a, b) => a.date.localeCompare(b.date))).badgesFastFood : []);
    // Récupération locale des bornes de période
    // --- Calcul évolution extras ---
    let evoExtras = [];
    if (periode === 'semaine') {
      // Extras par jour
      for (let i = 0; i < 7; i++) {
        const d = new Date(debut);
        d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        const count = compterExtrasObserves(
          repasReelsData?.filter(r => r.date === formatDate(d, 'yyyy-MM-dd')) || []
        );
        evoExtras.push({ label, count });
      }
    } else if (periode === 'mois') {
      // Extras par semaine du mois
      let current = new Date(debut);
      let week = 1;
      while (current <= fin) {
        const weekStart = new Date(current);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const label = `Sem. ${week}`;
        const count = compterExtrasObserves(
          repasReelsData?.filter(r => r.date >= formatDate(weekStart, 'yyyy-MM-dd') && r.date <= formatDate(weekEnd, 'yyyy-MM-dd')) || []
        );
        evoExtras.push({ label, count });
        current.setDate(current.getDate() + 7);
        week++;
      }
    } else if (periode === 'annee') {
      // Extras par mois
      for (let m = 0; m < 12; m++) {
        const monthStart = new Date(debut.getFullYear(), m, 1);
        const monthEnd = new Date(debut.getFullYear(), m + 1, 0);
        const label = monthStart.toLocaleDateString('fr-FR', { month: 'short' });
        const count = compterExtrasObserves(
          repasReelsData?.filter(r => r.date >= formatDate(monthStart, 'yyyy-MM-dd') && r.date <= formatDate(monthEnd, 'yyyy-MM-dd')) || []
        );
        evoExtras.push({ label, count });
      }
    }
    setEvolutionExtras(evoExtras);

    // --- Calcul évolution poids ---
    let evoPoids = [];
    if (periode === 'semaine') {
      for (let i = 0; i < 7; i++) {
        const d = new Date(debut);
        d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        const poids = poidsHistory?.find(p => p.date === formatDate(d, 'yyyy-MM-dd'))?.poids || null;
        evoPoids.push({ label, poids });
      }
    } else if (periode === 'mois') {
      let current = new Date(debut);
      let week = 1;
      while (current <= fin) {
        const weekStart = new Date(current);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const label = `Sem. ${week}`;
        // Moyenne du poids sur la semaine
        const poidsValues = poidsHistory?.filter(p => p.date >= formatDate(weekStart, 'yyyy-MM-dd') && p.date <= formatDate(weekEnd, 'yyyy-MM-dd')).map(p => p.poids) || [];
        const poids = poidsValues.length ? (poidsValues.reduce((a,b)=>a+b,0)/poidsValues.length).toFixed(1) : null;
        evoPoids.push({ label, poids });
        current.setDate(current.getDate() + 7);
        week++;
      }
    } else if (periode === 'annee') {
      for (let m = 0; m < 12; m++) {
        const monthStart = new Date(debut.getFullYear(), m, 1);
        const monthEnd = new Date(debut.getFullYear(), m + 1, 0);
        const label = monthStart.toLocaleDateString('fr-FR', { month: 'short' });
        const poidsValues = poidsHistory?.filter(p => p.date >= formatDate(monthStart, 'yyyy-MM-dd') && p.date <= formatDate(monthEnd, 'yyyy-MM-dd')).map(p => p.poids) || [];
        const poids = poidsValues.length ? (poidsValues.reduce((a,b)=>a+b,0)/poidsValues.length).toFixed(1) : null;
        evoPoids.push({ label, poids });
      }
    }
    setEvolutionPoids(evoPoids);
    } catch {
      if (sequence === requestSequence.current) {
        setLoadedUserId(null);
        setLoadError('Lecture impossible. Connecte-toi ou réessaie pour consulter tes données.');
      }
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  };
    // Historique des extras validés (récupéré depuis la logique du suivi)
    const [weeklyHistory, setWeeklyHistory] = useState([]);
    useEffect(() => {
      // On récupère les repas de la période et on construit l'historique
      if (Array.isArray(repasReels) && repasReels.length > 0) {
        // Utilitaire pour calculer l'historique des extras par semaine
        function getWeeklyExtrasHistory(repas, nbWeeks = 16) {
          let today = new Date();
          let weeks = [];
          let calcMonday = (d) => {
            let date = new Date(d);
            let day = date.getDay();
            let monday = new Date(date);
            monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
            monday.setHours(0,0,0,0);
            return monday;
          };
          let monday = calcMonday(today);
          for(let i=0; i<nbWeeks; i++) {
            let weekStart = new Date(monday);
            weekStart.setDate(monday.getDate() - (i*7));
            weekStart.setHours(0,0,0,0);
            let weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
            // Récupérer la validation depuis l’état local semainesValidees
            const weekStartKey = formatDate(weekStart, 'yyyy-MM-dd');
            let semaineValidee = semainesValidees?.find(sv => sv.weekStart === weekStartKey && sv.validee === true);
            const repasSemaine = repas.filter(r => {
              let d = new Date(r.date);
              d.setHours(0,0,0,0);
              return d >= weekStart && d <= weekEnd;
            });
            let count = compterMomentsExtras(repasSemaine);
            weeks.push({
              weekStart: weekStartKey,
              count,
              isCurrent: (i === 0),
              validee: !!semaineValidee
            });
          }
          return weeks;
        }
  setWeeklyHistory(getWeeklyExtrasHistory(repasReels, 16));
      }
      else setWeeklyHistory([]);
    }, [repasReels, semainesValidees]);

  // Progression badge/message
  const [progression, setProgression] = useState({
    badge: null,
    message: "",
    quota: 3,
  });

  useEffect(() => {
    if (!authLoading && user?.id) handleRefresh();
    else if (!authLoading) { setLoading(false); setLoadedUserId(null); }
    return () => { requestSequence.current += 1; };
  }, [periode, user?.id, authLoading]);

  // Détecter préparation jeûne active
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const prepData = localStorage.getItem('preparationData');
      const prepActive = localStorage.getItem('preparationActive');

      if (prepActive === 'true' && prepData) {
        const data = JSON.parse(prepData);
        setPreparationData(data);

        // Calculer jours restants - utiliser startDate (nom correct dans localStorage)
        if (data.startDate) {
          const dateJeune = new Date(data.startDate);
          const aujourdhui = new Date();
          aujourdhui.setHours(0, 0, 0, 0);
          dateJeune.setHours(0, 0, 0, 0);
          const diff = Math.ceil((dateJeune - aujourdhui) / (1000 * 60 * 60 * 24));
          setJoursRestants(diff);
        }
      } else {
        setPreparationData(null);
        setJoursRestants(null);
      }
    } catch (e) {
      console.error('Erreur détection préparation:', e);
    }
  }, []);

  useEffect(() => {
    setIdeauxProgress(ideauxList.filter(i => i.progression_palier).map(ideal => ({
      id: ideal.id, titre: ideal.titre, image_url: ideal.image_url,
      realise: ideal.progression_palier.faites,
      prevues: ideal.progression_palier.total,
      pourcentage: ideal.progression_palier.total > 0 ? ideal.progression_palier.pourcentage : null,
      statut: ideal.statut,
    })));
  }, [ideauxList]);

  const { debut: dateDebut, fin: dateFin } = getPeriodeDates();
  const dashboardV2 = useMemo(() => construireSyntheseTableauDeBord({
    poids: poidsData,
    poidsDepartParcours: profilDashboard?.poids_de_depart,
    objectifPoids: profilDashboard?.objectif,
    semainesExtras: semainesValidees,
    repas: repasReels,
    humeurCheckins: humeurData,
    ideaux: ideauxList,
    defis: defisDashboard,
    periodes: periodesReconstituees,
    dateDebut: formatDate(dateDebut, 'yyyy-MM-dd'),
    dateFin: formatDate(dateFin, 'yyyy-MM-dd'),
  }), [poidsData, profilDashboard, semainesValidees, repasReels, humeurData, ideauxList, defisDashboard, periodesReconstituees, periode]);

  // Graphiques
  const poidsChartData = {
    labels: poidsData.map((p) =>
      new Date(p.date).toLocaleDateString("fr-FR")
    ),
    datasets: [
      {
        label: "Évolution du poids (kg)",
        data: poidsData.map((p) => p.poids),
        fill: false,
        borderColor: "#4d86de",
        backgroundColor: "#4d86de",
        tension: 0.2,
        pointRadius: 5,
        pointBackgroundColor: "#4d86de",
      },
    ],
  };

  // Humeurs
  const humeurCounts = humeurData.reduce((acc, curr) => {
    acc[curr.humeur] = (acc[curr.humeur] || 0) + 1;
    return acc;
  }, {});
  const humeurChartData = {
    labels: Object.keys(humeurCounts),
    datasets: [
      {
        label: "Répartition des humeurs",
        data: Object.values(humeurCounts),
        backgroundColor: Object.keys(humeurCounts).map(
          (_, i) => COLORS[i % COLORS.length]
        ),
        borderWidth: 1,
      },
    ],
  };

  // Satiété
  const tauxSatiete =
    satieteData.total > 0
      ? ((satieteData.faim / satieteData.total) * 100).toFixed(0)
      : null;
  const satieteChartData = {
    labels: ["Par faim réelle", "Autres raisons"],
    datasets: [
      {
        data: [
          satieteData.faim,
          Math.max(0, satieteData.total - satieteData.faim),
        ],
        backgroundColor: [COLORS[0], COLORS[2]],
      },
    ],
  };

  // Dopamine/Feedback
  const motivation = getMotivationMessage({
    progression,
    extras: extrasData.current,
    humeurCounts,
    tauxSatiete,
  });

  // Handler pour la validation batch depuis le drawer
  const handleValidationBatch = async (weekStartArray) => {
    const validationSequence = requestSequence.current;
    const encoreCourant = () => validationSequence === requestSequence.current;
    try {
      if (!weekStartArray || weekStartArray.length === 0) return false;

      // Trier les dates pour avoir min/max
      const sorted = [...weekStartArray].sort();
      const premiereLundi = sorted[0];
      const dernierLundi = sorted[sorted.length - 1];

      // Calculer la fin de la dernière semaine (dimanche)
      const dernierDimanche = new Date(dernierLundi);
      dernierDimanche.setDate(dernierDimanche.getDate() + 6);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      if (authError || !currentUserId || currentUserId !== loadedUserId || !encoreCourant()) return false;
      const { data: repasReels, error: repasError } = await supabase
        .from('repas_reels').select('*').eq('user_id', currentUserId)
        .gte('date', premiereLundi).lte('date', formatDate(dernierDimanche, 'yyyy-MM-dd'));
      if (!encoreCourant()) return false;
      if (repasError) throw new Error('Lecture des repas impossible.');

      let historiqueProgression = [...semainesValidees];

      // Valider chaque semaine
      for (const weekStart of weekStartArray) {
        if (!encoreCourant()) return false;
        const palier = calculerProgressionExtras(historiqueProgression).palier;
        const extrasInfo = calculerExtrasSemaine(weekStart, repasReels || []);
        const message = genererMessageFeedback(extrasInfo.count, palier);
        const variation = calculerVariation(extrasInfo.count, historiqueProgression, weekStart);

        // Calculer fin de semaine (dimanche)
        const finSemaine = new Date(weekStart);
        finSemaine.setDate(finSemaine.getDate() + 6);
        const finSemaineStr = formatDate(finSemaine, 'yyyy-MM-dd');

        const { data: budgetSemaine } = await supabase
          .from('extras_budget')
          .select('budget_hebdo')
          .eq('user_id', currentUserId)
          .eq('date_semaine', weekStart)
          .maybeSingle();

        if (!encoreCourant()) return false;
        const semaineValidee = {
          weekStart,
          user_id: currentUserId,
          validee: true,
          date_validation: new Date().toISOString(),
          extras_count: extrasInfo.count,
          extras_details: JSON.stringify(extrasInfo.details),
          kcal_extras: extrasInfo.kcalTotal,
          budget_extras: Number(budgetSemaine?.budget_hebdo) || 0,
          message_feedback: message,
          variation: variation
        };
        const { error: validationError } = await supabase.from('semaines_validees').upsert(semaineValidee, { onConflict: 'user_id,weekStart' });
        if (validationError) throw new Error('Validation non enregistrée.');
        historiqueProgression.push(semaineValidee);
      }

      const progressionExtras = calculerProgressionExtras(historiqueProgression);
      const synchronisation = await synchroniserBadgesPalierExtras(
        currentUserId,
        progressionExtras,
        historiqueProgression
      );
      if (!encoreCourant()) return false;
      if (synchronisation.erreurs.length > 0) {
        throw new Error('Les semaines ont été validées, mais les badges Extras n’ont pas tous pu être conservés.');
      }
      if (synchronisation.nouveaux.length > 0) {
        setBadges(badgesActuels => [
          ...synchronisation.nouveaux,
          ...badgesActuels.filter(badge => !synchronisation.nouveaux.some(nouveau => nouveau.code === badge.code)),
        ]);
      }

      const synchronisationEvenements = await synchroniserEvenementsPalierExtras(
        currentUserId,
        progressionExtras
      );
      if (!encoreCourant()) return false;
      if (synchronisationEvenements.error) {
        throw new Error('Les semaines ont été validées, mais l’histoire du parcours Extras n’a pas pu être conservée.');
      }
      const { data: evenements } = await supabase
        .from('extras_palier_events')
        .select('*')
        .eq('user_id', currentUserId)
        .order('semaine_decisive', { ascending: true });
      if (!encoreCourant()) return false;
      setExtrasPalierEvents(evenements || []);

      // Rafraîchir les données
      const { data: semaines } = await supabase
        .from('semaines_validees')
        .select('*').eq('user_id', currentUserId);
      if (!encoreCourant()) return false;
      setSemainesValidees(semaines || []);

      const semainesNonValidees = getSemainesNonValidees(semaines || [], 8);
      setNbSemainesNonValidees(semainesNonValidees.length);

      // getSemainesNonValidees retourne déjà le format attendu
      setSemainesNonValideesFormatees(semainesNonValidees);

      return true;
    } catch (error) {
      console.error('Erreur validation batch:', error);
      return false;
    }
  };

  const extrasEvolutionChartData = { labels: evolutionExtras.map(e => e.label), datasets: [{ label: 'Moments Extras observés', data: evolutionExtras.map(e => e.count), borderColor: '#20b5a5', backgroundColor: '#20b5a5', spanGaps: false }] };
  const repasParJour = new Map();
  regrouperRepasReelsParOccurrence(repasReels).forEach(({ lignes }) => {
    const date = lignes[0]?.date;
    if (date) repasParJour.set(date, (repasParJour.get(date) || 0) + 1);
  });
  const repasDates = [...repasParJour.keys()].sort();
  const repasEvolutionChartData = { labels: repasDates.map(date => new Date(date + 'T12:00:00').toLocaleDateString('fr-FR')), datasets: [{ label: 'Occurrences renseignées', data: repasDates.map(date => repasParJour.get(date)), borderColor: '#ee956a', backgroundColor: '#ee956a', showLine: false }] };
  const detailsDescriptions = {
    poids: 'Mesures observées, évolution agrégée et historique de la période.',
    extras: 'Moments de la période, repères du parcours et événements des paliers.',
    repas: 'Repas par occurrence, faim, satiété et accès aux notes.',
    bienetre: 'Répartition descriptive des humeurs renseignées, sans explication causale.',
    defis: 'États des défis renseignés et accès au module pour agir.',
    ideaux: 'Paliers canoniques, séances réalisées et états des Idéaux.',
    jeune: 'Préparation locale et accès au jeûne et à la reprise.',
    badges: 'Collection existante et récompenses Fast-food historiques.',
    fastfood: 'Événements de période et rythme personnel calculé sur le dernier événement global.',
    regularite: 'Observations, périodes reconstituées et validations hebdomadaires.',
  };

  const detailsContent = {
poids: <>
<div style={{background:'#fff', borderRadius:14, boxShadow:'0 2px 8px #e0e0e0', padding:'1.2rem 2rem', minWidth:170, textAlign:'center'}}>
          <div style={{fontSize:'2.1rem', fontWeight:700, color:'#ffa726'}}>
            {Array.isArray(poidsData) && poidsData.length > 0 ? (poidsData.reduce((acc,p)=>acc+p.poids,0)/poidsData.length).toFixed(1) : '—'}
          </div>
          <div style={{color:'#888', fontWeight:600, fontSize:'1.08rem'}}>Poids moyen</div>
        </div>
<div style={{padding:'1.5rem', background:'#fafafa', borderRadius:'15px', boxShadow:'0 2px 8px #e0e0e0', textAlign:'center', marginBottom:'2rem'}}>
        <h2 style={{marginTop:0, color:COLORS[1]}}>Évolution du Poids</h2>
        <Line
          data={{
            labels: evolutionPoids.map(e => e.label),
            datasets: [{
              label: 'Poids (kg)',
              data: evolutionPoids.map(e => e.poids),
              borderColor: COLORS[1],
              backgroundColor: COLORS[1],
              fill: false,
              tension: 0.2,
              pointRadius: 5,
              pointBackgroundColor: COLORS[3],
            }],
          }}
        />
      </div>
<div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            borderRadius: "15px",
            boxShadow: "0 2px 8px #e0e0e0",
            gridColumn: "1 / -1",
          }}
        >
          <h2 style={{ marginTop: 0, color: COLORS[1] }}>
            Évolution du Poids
          </h2>
          <Line data={poidsChartData} />
        </div>

</>,
extras: <>
<div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            borderRadius: "15px",
            boxShadow: "0 2px 8px #e0e0e0",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0, color: COLORS[2] }}>Extras sur la période</h2>
          <p
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#1976d2",
              margin: "1.1rem 0 0.2rem 0",
            }}
          >
            {repasReels.length ? extrasData.current : '—'} moments · palier {extrasData.quota}/semaine
          </p>
          <p>
            {repasReels.length ? "Moments observés sur la période affichée." : "Aucune observation sur cette période."}
          </p>
        </div>
<div style={{padding:'1.5rem', background:'#fafafa', borderRadius:'15px', boxShadow:'0 2px 8px #e0e0e0', textAlign:'center', marginBottom:'2rem'}}>
        <h2 style={{marginTop:0, color:COLORS[2]}}>Évolution des Extras</h2>
        <Line
          data={{
            labels: evolutionExtras.map(e => e.label),
            datasets: [{
              label: 'Extras',
              data: evolutionExtras.map(e => e.count),
              borderColor: COLORS[2],
              backgroundColor: COLORS[2],
              fill: false,
              tension: 0.2,
              pointRadius: 5,
              pointBackgroundColor: COLORS[3],
            }],
          }}
        />
      </div>
<TimelineProgression history={weeklyHistory.filter(semaine => {
        const fin = new Date(`${semaine.weekStart}T12:00:00`);
        fin.setDate(fin.getDate() + 6);
        return semaine.validee || repasReels.some(r => r.date >= semaine.weekStart && r.date <= formatDate(fin, 'yyyy-MM-dd'));
      })} />
<ExtrasBadgesSection badges={badges.filter(badge => badge.type === 'extras_palier')} events={extrasPalierEvents} />

</>,
repas: <>
<div style={{background:'#fff', borderRadius:14, boxShadow:'0 2px 8px #e0e0e0', padding:'1.2rem 2rem', minWidth:170, textAlign:'center'}}>
          <div style={{fontSize:'2.1rem', fontWeight:700, color:'#1976d2'}}>
            🍽️ {dashboardV2.mealSignals.nombreRepas}
          </div>
          <div style={{color:'#888', fontWeight:600, fontSize:'1.08rem'}}>Repas sur la période</div>
        </div>
<div style={{background:'#fff', borderRadius:14, boxShadow:'0 2px 8px #e0e0e0', padding:'1.2rem 2rem', minWidth:170, textAlign:'center'}}>
          <div style={{fontSize:'2.1rem', fontWeight:700, color:'#2980b9'}}>
            {tauxSatiete === null ? '—' : `${tauxSatiete}%`}
          </div>
          <div style={{color:'#888', fontWeight:600, fontSize:'1.08rem'}}>Repas pris par faim renseignée</div>
        </div>
<div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            borderRadius: "15px",
            boxShadow: "0 2px 8px #e0e0e0",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0, color: COLORS[0] }}>Faim renseignée</h2>
          <Doughnut data={satieteChartData} />
          <p
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#2980b9",
              margin: "1.1rem 0 0.2rem 0",
            }}
          >
            {tauxSatiete === null ? '—' : `${tauxSatiete}%`}
          </p>
          <p style={{ color: "#555" }}>
            des occurrences dont la raison est renseignée ont été prises par faim.
          </p>
          {/* Bouton et historique des notes repas (diagnostic) */}
          <div style={{marginTop:24}}>
            <div style={{
              display: 'inline-block',
              border: '3px solid #ff9800',
              borderRadius: '14px',
              boxShadow: '0 4px 18px #ff980055',
              background: '#fff3e0',
              padding: '18px 28px',
              margin: '12px 0',
            }}>
              <button
                type="button"
                onClick={() => window.location.href='/historique-notes-repas'}
                style={{
                  background: '#ff9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #ff980055',
                  letterSpacing: '1px',
                  outline: '2px solid #fff',
                }}
              >
                Consulter l'historique des notes repas
              </button>
              <div style={{fontSize:14, color:'#ff9800', fontWeight:600, marginTop:8}}>
                Historique des notes repas (diagnostic)
              </div>
            </div>
          </div>
        </div>
<p>Satiété respectée : {dashboardV2.mealSignals.satiete.pourcentageRespectee === null ? 'non renseignée' : dashboardV2.mealSignals.satiete.pourcentageRespectee + '% des occurrences renseignées'}. Alignement confirmé : {dashboardV2.mealSignals.alignementPlan.pourcentage === null ? 'non renseigné' : dashboardV2.mealSignals.alignementPlan.pourcentage + '% des occurrences renseignées'}.</p>
</>,
bienetre: <>
<div style={{background:'#fff', borderRadius:14, boxShadow:'0 2px 8px #e0e0e0', padding:'1.2rem 2rem', minWidth:170, textAlign:'center'}}>
          <div style={{fontSize:'2.1rem', fontWeight:700, color:'#9c27b0'}}>
            {humeurCounts && Object.keys(humeurCounts).length > 0 ? Object.entries(humeurCounts).sort((a,b)=>b[1]-a[1])[0][0] : '—'}
          </div>
          <div style={{color:'#888', fontWeight:600, fontSize:'1.08rem'}}>Humeur dominante</div>
        </div>
<div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            borderRadius: "15px",
            boxShadow: "0 2px 8px #e0e0e0",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0, color: COLORS[4] }}>
            Répartition des humeurs sur la période
          </h2>
          <Pie data={humeurChartData} />
        </div>

</>,
defis: <>

<p>La progression détaillée est indisponible pour le moment. Retrouve les actions et le suivi dans le module Défis.</p>{defisDashboard.length ? <ul>{defisDashboard.map(defi => <li key={defi.id}>{defi.nom} — {defi.status || 'état non renseigné'}</li>)}</ul> : <p>Aucun défi renseigné.</p>}
</>,
ideaux: <>
{ideauxProgress && ideauxProgress.length > 0 && (
        <div style={{padding:'1.2rem', background:'#fff', borderRadius:12, boxShadow:'0 2px 8px #e0e0e0', marginBottom:'1.2rem'}}>
          <h2 style={{marginTop:0, color:'#00bcd4'}}>Progression de mes idéaux</h2>
          <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            {ideauxProgress.map(ip => (
              <div key={ip.id} style={{flex:'1 1 260px', minWidth:220, background:'#fafafa', borderRadius:12, padding:12, display:'flex', gap:12, alignItems:'center'}}>
                <div style={{width:64, height:64, borderRadius:10, overflow:'hidden', flexShrink:0, background:'#eee'}}>
                  {ip.image_url ? (
                    <img src={ip.image_url} alt="visuel" style={{width:'100%', height:'100%', objectFit:'cover', display:'block', filter: `blur(${Math.round(12 * (1 - (ip.pourcentage/100)))}px)`, transition:'filter 0.4s'}} />
                  ) : (
                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#888'}}>{ip.titre ? ip.titre[0] : '–'}</div>
                  )}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700, color:'#1976d2', marginBottom:6, fontSize:15}}>{ip.titre}</div>
                  <div style={{height:10, background:'#e0e0e0', borderRadius:8, overflow:'hidden', marginBottom:6}} aria-hidden>
                    <div style={{width:`${Math.min(100, ip.pourcentage)}%`, height:'100%', background: ip.pourcentage >= 80 ? '#43a047' : ip.pourcentage >= 50 ? '#ffa726' : '#1976d2', transition:'width 0.5s'}} />
                  </div>
                  <div style={{fontSize:13, color:'#555', display:'flex', justifyContent:'space-between'}}>
                    <div>{ip.prevues > 0 ? `${ip.realise} / ${ip.prevues} séances` : "Aucune séance prévue renseignée"}</div>
                    <div style={{fontWeight:800}}>{ip.pourcentage === null ? "—" : `${ip.pourcentage}%`}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
{!ideauxList.length && <p>Aucun Idéal renseigné.</p>}<ul>{ideauxList.map(ideal => <li key={ideal.id}>{ideal.titre} — {ideal.statut || 'état non renseigné'}{ideal.cycle_palier?.repriseNecessaire && ' · Une reprise est à examiner dans le module, sans activation automatique.'}</li>)}</ul>
</>,
jeune: <>
{preparationData && joursRestants !== null && joursRestants >= 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🎯 Préparation au jeûne en cours
            </div>
            <div style={{ fontSize: '1.05rem', opacity: 0.95, marginBottom: '4px' }}>
              <strong>Date prévue :</strong> {new Date(preparationData.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '1.05rem', opacity: 0.95, marginBottom: '4px' }}>
              <strong>Durée :</strong> {preparationData.duration} jours
            </div>
            {preparationData.goal && (
              <div style={{ fontSize: '0.95rem', opacity: 0.9, fontStyle: 'italic', marginTop: '8px' }}>
                💭 "{preparationData.goal}"
              </div>
            )}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            minWidth: '180px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '12px',
              padding: '12px 20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>
                J-{joursRestants}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px' }}>
                {joursRestants === 0 ? "C'est aujourd'hui !" : joursRestants === 1 ? 'jour restant' : 'jours restants'}
              </div>
            </div>
            <Link
              href="/preparation-jeune"
              style={{
                background: '#fff',
                color: '#667eea',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'transform 0.2s',
                display: 'inline-block',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                cursor: 'pointer'
              }}
            >
              📋 Voir ma préparation
            </Link>
          </div>
        </div>
      )}
{!preparationData && <p>Aucune préparation locale renseignée. Consulte les modules pour retrouver ton parcours.</p>}<p>La préparation ci-dessus vient de cet appareil ; l'état persistant du jeûne et de la reprise n'est pas disponible dans cette synthèse.</p><Link href="/preparation-jeune">Ma préparation</Link>{' · '}<Link href="/reprise-alimentaire-apres-jeune">Ma reprise alimentaire</Link>
</>,
badges: <>
<div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            borderRadius: "15px",
            boxShadow: "0 2px 8px #e0e0e0",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0, color: COLORS[3] }}>Mes Succès & Badges</h2>
            {/* Affichage de tous les badges du référentiel, grisé si non débloqué */}
            {/* Pagination : n'affiche que 6 badges, bouton pour voir plus */}
            {(() => {
              const referentiel = require('../lib/defisReferentiel').defisReferentiel;
              const badgesToShow = showAllBadges ? referentiel : referentiel.slice(0, 6);
              return (
                <>
                  <div className="badges-grid" style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'1.2rem'}}>
                    {badgesToShow.map((defi, i) => {
                      const badgeObtenu = badges.some(b => b.nom === defi.nom) || badgesFastFood.some(b => b.nom === defi.nom);
                      const badge = badges.find(b => b.nom === defi.nom) || badgesFastFood.find(b => b.nom === defi.nom);
                      return (
                        <BadgeCard
                          key={i}
                          badge={defi}
                          obtenu={badgeObtenu}
                          justUnlocked={badge && badge.justUnlocked}
                          description={defi.description}
                          style={badgeObtenu ? {} : {
                            background: '#f5f5f5',
                            color: '#bbb',
                            opacity: 0.35,
                            filter: 'grayscale(1)',
                            boxShadow: 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                  {referentiel.length > 6 && !showAllBadges && (
                    <div style={{textAlign:'center',marginTop:'1.2rem'}}>
                      <button style={{background:'#eee',color:'#888',border:'none',borderRadius:8,padding:'7px 18px',fontWeight:600,cursor:'pointer'}} onClick={()=>setShowAllBadges(true)}>
                        Voir tous les badges
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
        </div>
<div style={{padding:'1.5rem', background:'#fffbe6', borderRadius:'15px', boxShadow:'0 2px 8px #ffe0b2', textAlign:'center', margin:'2rem 0'}}>
          <h2 style={{marginTop:0, color:'#e65100'}}>Badges Fast Food</h2>
          {badgesFastFood.length === 0 ? (
            <p style={{color:'#e65100'}}>Aucun badge fast food débloqué pour le moment.</p>
          ) : (
            <ul style={{listStyle:'none', padding:0, margin:0, fontSize:'1.12rem', color:'#e65100', fontWeight:600}}>
              {badgesFastFood.map((badge, i) => (
                <li key={i} style={{marginBottom:'0.5rem'}}>
                  🍔 <span>{badge.nom}</span>
                  <span style={{color:'#888', fontSize:'0.95rem', marginLeft:4}}>{badge.description || ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

</>,
fastfood: <>
<div style={{background:'#fff', borderRadius:14, boxShadow:'0 2px 8px #e0e0e0', padding:'1.2rem 2rem', minWidth:170, textAlign:'center'}}>
          <div style={{fontSize:'2.1rem', fontWeight:700, color:'#e65100'}}>
            🍔 {domainErrors.includes('repas') ? '—' : fastFoodCount}
          </div>
          <div style={{color:'#888', fontWeight:600, fontSize:'1.08rem'}}>Fast food sur la période</div>
          {fastFoodHistory && fastFoodHistory.length > 0 && (
            <div style={{marginTop:8, fontSize:'0.90rem', color:'#666', fontStyle:'italic'}}>
              Dernier : {fastFoodHistory[0]?.tag || "Non identifié"}
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: '0.98rem', color: '#1976d2' }}>
            {!fastFoodRhythm ? 'Rythme personnel indisponible pour le moment.' : <>
              Repère personnel : <b>{fastFoodRhythm.targetDays} jours</b><br />
              {fastFoodRhythm.hasHistory ? <>
                Dernier événement global : <b>{fastFoodRhythm.lastFastFoodDate.toLocaleDateString('fr-FR')}</b><br />
                Prochain repère : <b>{nextFastFoodDate?.toLocaleDateString('fr-FR')}</b><br />
                {fastFoodRhythm.targetReached ? 'Repère atteint.' : `Délai restant : ${fastFoodDelay} jours.`}
              </> : 'Aucun événement Fast-food connu dans ton historique.'}
            </>}
          </div>
          <p style={{ color: '#666', fontSize: 14 }}>
            {domainErrors.includes('repas') ? 'Historique de période indisponible pour le moment.' : fastFoodHistory.length ? 'Historique disponible pour cette période.' : 'Aucun événement renseigné sur cette période. Le rythme utilise ton historique global.'}
          </p>
          {fastFoodRhythm?.targetDays === 45 && fastFoodHistory.length >= 2 && <p>
            {getFastFoodRewards([...fastFoodHistory].sort((a, b) => a.date.localeCompare(b.date))).message}
          </p>}
            <button
              style={{marginTop:12, padding:'7px 18px', background:'#e65100', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer'}}
              onClick={()=>window.location.href='/historique-fast-food'}
            >
              En savoir plus
            </button>
        </div>

</>,
regularite: <>
{nbSemainesNonValidees > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '24px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 107, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
            }}
          >
            🔔 {nbSemainesNonValidees} semaine{nbSemainesNonValidees > 1 ? 's' : ''} à valider
          </button>
        </div>
      )}
{dashboardV2.couverture && <p>{dashboardV2.couverture.joursObserves} jours observés, {dashboardV2.couverture.joursReconstitues} reconstitués, {dashboardV2.couverture.joursSansDonnee} sans donnée. Une absence de saisie n’est pas un échec.</p>}{!nbSemainesNonValidees && <p>Aucune semaine en attente de validation.</p>}
</>,
  };

  // Affichage
  if (loading || authLoading || (user?.id && loadedUserId && user.id !== loadedUserId)) {
    return (
      <div style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}>
        <div style={{textAlign:'center', fontSize:'1.4rem', color:'#1976d2', marginTop:'3rem'}}>
          Chargement de vos statistiques...
        </div>
      </div>
    );
  }

  if (!user?.id || loadError || !loadedUserId) return (
    <main style={{ padding: '2rem', maxWidth: 900, margin: 'auto' }}>
      <h1>Tableau de bord</h1>
      <p role="status">{loadError || 'Connecte-toi pour consulter ton parcours.'}</p>
      <Link href="/login">Me connecter</Link>
      {user?.id && <button type="button" onClick={handleRefresh}>Réessayer</button>}
    </main>
  );

    return (
    <main className={dashboardStyles.dashboard}>
<div className="mpv-header"><div><span className="mpv-eyebrow">MON TABLEAU DE BORD</span><h1>Tableau de Bord</h1><p>Mon parcours, en un regard. L’essentiel pour comprendre ce qui évolue.</p></div><Link href="/suivi">Mon suivi →</Link></div>
<div className="mpv-controls"><label>Période affichée : <select aria-label="Période affichée" value={periode} onChange={e => setPeriode(e.target.value)}><option value="semaine">Semaine</option><option value="mois">Mois</option><option value="annee">Année</option></select></label><span>{periodeLabel}</span><button onClick={handleRefresh}>Rafraîchir les statistiques</button></div>
<DashboardSummary synthese={dashboardV2} errors={domainErrors} extrasChart={<section className="mpv-panel"><h3>Mes moments Extras</h3><p>Moments observés sur la période ; aucune estimation des jours sans saisie.</p>{domainErrors.includes('repas') ? <p role="status">Données indisponibles pour le moment.</p> : evolutionExtras.some(e => e.count != null) ? <div style={{ height: 190 }}><Line data={extrasEvolutionChartData} options={{ maintainAspectRatio: false, spanGaps: false, plugins: { legend: { display: false } } }} /></div> : <p>Aucune observation sur cette période.</p>}<Link href="/extras">Explorer mes Extras →</Link></section>}>
<DashboardEvolution view={evolutionView} onViewChange={setEvolutionView} poids={poidsChartData} extras={extrasEvolutionChartData} repas={repasEvolutionChartData} wellbeing={humeurChartData} errors={domainErrors} />
</DashboardSummary>
{preparationData && joursRestants !== null && joursRestants >= 0 && <p>Préparation enregistrée sur cet appareil : J-{joursRestants}. <Link href="/preparation-jeune">Voir ma préparation</Link></p>}

<DashboardDetails content={detailsContent} descriptions={detailsDescriptions} errors={domainErrors} openDomains={openDomains} onDomainToggle={(id, open) => {
  setOpenDomains(previous => {
    if (previous.includes(id) === open) return previous;
    return open ? [...previous, id] : previous.filter(domain => domain !== id);
  });
}} />
<div
        style={{
          textAlign: "center",
          marginTop: "3.5rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1.2rem",
        }}
      >
        <Link href="/suivi">
          <button
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 1px 6px #e0e0e0",
            }}
          >
            🥗 Voir mon suivi
          </button>
        </Link>
        {/* Accès conditionnel à la préparation au jeûne */}
        {/**
         * Affiche le bouton d'accès à la préparation au jeûne
         * uniquement si un jeûne est programmé (exemple : présence d'un profil avec un champ pourquoi rempli)
         * À adapter selon la logique métier réelle (ici, on simule la condition)
         */}
        {typeof window !== 'undefined' && localStorage.getItem('jeune_programme') === '1' && (
          <Link href="/preparation-jeune">
            <button
              style={{
                background: "#388e3c",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 28px",
                fontWeight: 700,
                fontSize: 17,
                cursor: "pointer",
                boxShadow: "0 1px 6px #e0e0e0",
              }}
            >
              🧘‍♂️ Me préparer à jeûner
            </button>
          </Link>
        )}
        <Link href="/defis">
          <button
            style={{
              background: "#ff9800",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 1px 6px #e0e0e0",
            }}
          >
            🎯 Mes défis
          </button>
        </Link>
        <Link href="/plan">
          <button
            style={{
              background: "#43a047",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 1px 6px #e0e0e0",
            }}
          >
            📅 Planifier mes repas
          </button>
        </Link>
        <Link href="/ideaux">
          <button
            style={{
              background: "#00bcd4",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 1px 6px #e0e0e0",
            }}
          >
            🌟 Mes idéaux / routines
          </button>
        </Link>
        <Link href="/tableau-de-bord">
          <button
            style={{
              background: "#ffa726",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 1px 6px #e0e0e0",
            }}
          >
            🏠 Retour au tableau de bord
          </button>
        </Link>
        <Link href="/profil">
          <button
            style={{
              background: "#9c27b0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 1px 6px #e0e0e0",
            }}
          >
            👤 Voir mon profil
          </button>
        </Link>
      </div>
<DrawerValidation
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        semainesNonValidees={semainesNonValideesFormatees}
        semainesValidees={semainesValidees.map(sv => ({
          weekStart: sv.weekStart || sv.semaine_debut,
          extras_count: sv.extras_count,
          message_feedback: sv.message_feedback,
          date_validation: sv.date_validation
        }))}
        onValider={handleValidationBatch}
        onConsulterFeedback={(semaine) => {
          // Ouvrir le modal de feedback avec les données de la semaine
          console.log('Consulter feedback:', semaine);
          // TODO: Implémenter l'ouverture du ModalFeedbackValidation
        }}
      />
</main>
  );
}
