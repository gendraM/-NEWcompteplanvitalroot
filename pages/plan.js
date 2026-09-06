import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import useUserReferentiel from "../lib/useUserReferentiel";
import {
  calculerKcalPlanifiees,
  calculerTotauxPlanning,
  deplacerRepasPlanifie,
  serialiserQuantitePlanifiee,
  trouverAlimentReferentiel
} from "../lib/planificationRepas";
import {
  MODES_HORIZON_PLANNING,
  naviguerDansPlanning,
  obtenirPeriodePlanning
} from "../lib/horizonPlanning";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import HorizonPlanning from "../components/HorizonPlanning";
import PlanificateurRepas from "../components/PlanificateurRepas";
import ListeCoursesGeneralePlan from "../components/ListeCoursesGeneralePlan";
import { CONTEXTE_LISTE_GENERAL, construireContexteCristallisation } from "../lib/contexteListeCourses";

const typesRepas = [
  { nom: "Petit-déjeuner", emoji: "🥐", color: "#ffe082" },
  { nom: "Déjeuner", emoji: "🍽️", color: "#b3e5fc" },
  { nom: "Dîner", emoji: "🍲", color: "#c8e6c9" },
  { nom: "Collation", emoji: "🍏", color: "#f8bbd0" }
];

// On commence par Dimanche pour que la 0e colonne soit toujours Dimanche
const joursSemaine = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const moisNoms = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const reglesGestion = {
  "féculent": "Féculents cuits : 50-80g max/jour. Riz : 2 CS bombées. Pâtes : 3 CS bombées.",
  "protéine": "Protéines animales : 100-120g max/jour.",
  "légume": "Légumes : à volonté, privilégier la variété.",
  "fruit": "Fruits : 2 à 3 portions/jour.",
  "extra": "Extras : 3/semaine max, portion raisonnable, jamais à jeun."
};

function getDaysInMonth(year, month) {
  const days = [];
  const nbDays = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= nbDays; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}
function toYYYYMMDD(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
}

export default function Plan() {
  const router = useRouter();
  const today = new Date();
  const dateDuJour = toYYYYMMDD(today);
  const [modeAffichage, setModeAffichage] = useState(MODES_HORIZON_PLANNING.SEMAINE);
  const [dateAncrage, setDateAncrage] = useState(dateDuJour);

  // Etat planning
  const [planning, setPlanning] = useState({});
  const [type, setType] = useState(typesRepas[0].nom);
  const [selectedDate, setSelectedDate] = useState(dateDuJour);
  const [suggestions, setSuggestions] = useState([]);
  const [erreurPlanning, setErreurPlanning] = useState("");
  const [loading, setLoading] = useState(false);
  const [importFeedback, setImportFeedback] = useState("");
  const [feedbackPlanning, setFeedbackPlanning] = useState("");

  // Etat motivation/mois
  const [mantra, setMantra] = useState("");
  const [objectif, setObjectif] = useState("");
  const [theme, setTheme] = useState("");
  const [valideInfos, setValideInfos] = useState({ mantra: "", objectif: "", theme: "" });
  const [userId, setUserId] = useState(null);
  const [contexteListeCourses, setContexteListeCourses] = useState(CONTEXTE_LISTE_GENERAL);
  const { referentielComplet, refresh: refreshReferentiel } = useUserReferentiel(userId);

  useEffect(() => {
    let actif = true;
    supabase.auth.getUser().then(({ data }) => {
      if (actif) setUserId(data?.user?.id || null);
    });
    return () => { actif = false; };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const source = Array.isArray(router.query.source) ? router.query.source[0] : router.query.source;
    if (source !== 'cristallisation') {
      setContexteListeCourses(CONTEXTE_LISTE_GENERAL);
      return;
    }
    if (!userId) return;

    let actif = true;
    const chargerContexte = async () => {
      const parcoursId = Array.isArray(router.query.parcours_id) ? router.query.parcours_id[0] : router.query.parcours_id;
      let requete = supabase
        .from('parcours_cristallisation')
        .select('id, criteres_personnalises, bilan_reprise')
        .eq('user_id', userId);
      requete = parcoursId
        ? requete.eq('id', parcoursId)
        : requete.eq('statut', 'en_cours').order('date_debut', { ascending: false }).limit(1);
      const { data } = await requete.maybeSingle();
      if (actif) setContexteListeCourses(construireContexteCristallisation(data));
    };
    chargerContexte();
    return () => { actif = false; };
  }, [router.isReady, router.query.source, router.query.parcours_id, userId]);

  // Récupère les valeurs de localStorage côté client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMantra(localStorage.getItem("mantra") || "");
      setObjectif(localStorage.getItem("objectif") || "");
      setTheme(localStorage.getItem("theme") || "");
      setValideInfos({
        mantra: localStorage.getItem("mantra") || "",
        objectif: localStorage.getItem("objectif") || "",
        theme: localStorage.getItem("theme") || ""
      });
    }
  }, []);

  const periode = obtenirPeriodePlanning(modeAffichage, dateAncrage);
  const dateAncrageObjet = new Date(`${dateAncrage}T12:00:00`);
  const year = dateAncrageObjet.getFullYear();
  const month = dateAncrageObjet.getMonth();
  const days = getDaysInMonth(year, month);

  // Récupère seulement la période actuellement affichée.
  const fetchPlanning = async () => {
    if (!userId) {
      setPlanning({});
      return;
    }
    setLoading(true);
    const start = periode.debut;
    const end = periode.fin;
    const { data, error } = await supabase
      .from("repas_planifies")
      .select("*")
      .eq("user_id", userId)
      .gte("date", start)
      .lte("date", end);
    if (error) {
      setErreurPlanning(`Le planning n’a pas pu être chargé : ${error.message}`);
      setLoading(false);
      return { data: null, error };
    }
    const grouped = {};
    data?.forEach(r => {
      grouped[r.date] = grouped[r.date] || [];
      grouped[r.date].push(r);
    });
    setPlanning(grouped);
    setErreurPlanning("");
    setLoading(false);
    return { data: data || [], error: null };
  };

  useEffect(() => { fetchPlanning(); }, [periode.debut, periode.fin, userId]);

  // Suggestions personnalisées (bons ressentis)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!userId) return setSuggestions([]);
      const { data } = await supabase
        .from("repas_reels")
        .select("aliment, categorie")
        .eq("user_id", userId)
        .eq("ressenti", "satisfait")
        .eq("satiete", "oui")
        .limit(10);
      setSuggestions(data || []);
    };
    fetchSuggestions();
  }, [userId]);

  const afficherLignesEnregistrees = lignes => {
    if (!Array.isArray(lignes) || !lignes.length) return;
    setPlanning(courant => {
      const suivant = { ...courant };
      lignes.forEach(ligne => {
        const dateLigne = ligne.date;
        const existantes = suivant[dateLigne] || [];
        suivant[dateLigne] = existantes.some(item => item.id === ligne.id)
          ? existantes
          : [...existantes, ligne];
      });
      return suivant;
    });
  };

  const choisirDate = date => {
    setSelectedDate(date);
    setFeedbackPlanning(`Le ${new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR')} est prêt à être planifié.`);
    setTimeout(() => document.getElementById('planificateur-repas')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const changerHorizon = mode => {
    setModeAffichage(mode);
    setFeedbackPlanning('');
  };

  const naviguer = direction => {
    const nouvelleDate = naviguerDansPlanning(modeAffichage, dateAncrage, direction);
    if (nouvelleDate) setDateAncrage(nouvelleDate);
    setFeedbackPlanning('');
  };

  const revenirAujourdhui = () => {
    setDateAncrage(dateDuJour);
    setSelectedDate(dateDuJour);
    setFeedbackPlanning('');
  };

  const deplacerRepas = async (lignes, nouvelleDate) => {
    setErreurPlanning('');
    setFeedbackPlanning('');
    const { error } = await deplacerRepasPlanifie(supabase, lignes, nouvelleDate, userId);
    if (error) {
      setErreurPlanning(`Le repas n’a pas pu être déplacé : ${error.message}`);
      return false;
    }
    await fetchPlanning();
    setFeedbackPlanning(`${lignes.length > 1 ? 'Toute l’assiette a' : 'Le repas a'} été déplacé${lignes.length > 1 ? 'e' : ''} au ${new Date(`${nouvelleDate}T12:00:00`).toLocaleDateString('fr-FR')}.`);
    return true;
  };

  const supprimerLignePlanifiee = async ligne => {
    setErreurPlanning('');
    const { error } = await supabase
      .from("repas_planifies")
      .delete()
      .eq("id", ligne.id)
      .eq("user_id", userId);
    if (error) {
      setErreurPlanning(`L’aliment n’a pas pu être supprimé : ${error.message}`);
      return;
    }
    await fetchPlanning();
    setFeedbackPlanning(`${ligne.aliment} a été retiré du planning.`);
  };

  // Validation et sauvegarde des infos du mois
  const handleValideInfos = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mantra", mantra);
      localStorage.setItem("objectif", objectif);
      localStorage.setItem("theme", theme);
    }
    setValideInfos({ mantra, objectif, theme });
  };

  const nbJoursPlanifies = periode.dates.filter(date => planning[date]?.length).length;
  const totauxPlanning = calculerTotauxPlanning(planning, referentielComplet);

  // EXPORT MODELE (CSV/XLSX) avec toutes colonnes utiles
  const handleExport = (format = "csv") => {
    const rows = [
      ["Date", "Jour", "Type", "Aliment", "Catégorie", "Quantité", "Unité", "Kcal"]
    ];
    days.forEach(dateObj => {
      const dateJJMMAAAA = dateObj.toLocaleDateString("fr-FR");
      const jourSemaine = joursSemaine[dateObj.getDay()];
      typesRepas.forEach(typeR => {
        rows.push([
          dateJJMMAAAA,
          jourSemaine,
          typeR.nom,
          "",
          "",
          "",
          "",
          ""
        ]);
      });
    });
    if (format === "csv") {
      const csv = Papa.unparse(rows, { delimiter: ";" });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `planning-modele-${moisNoms[month]}-${year}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "xlsx") {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Planning");
      XLSX.writeFile(wb, `planning-modele-${moisNoms[month]}-${year}.xlsx`);
    }
  };

  // IMPORT CSV/XLSX, recharge le planning
  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true); setImportFeedback("");
    let repas = [];
    try {
      if (file.name.endsWith(".csv")) {
        const text = await file.text();
        const possibleSeparators = [",", ";", "\t"];
        let best = { data: [], count: 0 };
        for (const sep of possibleSeparators) {
          const res = Papa.parse(text, { delimiter: sep, header: true, skipEmptyLines: true });
          if (res.data.length > best.count) best = { data: res.data, count: res.data.length };
        }
        repas = best.data.map(r => {
          let d = r.Date || r["date"];
          if (d && typeof d === "string" && d.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [jour, mois, annee] = d.split("/");
            d = `${annee}-${mois.padStart(2, "0")}-${jour.padStart(2, "0")}`;
          } else if (d && typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // ok
          } else {
            d = null;
          }
          return {
            date: d,
            type: r.Type || r["type"] || "",
            aliment: r.Aliment || r["aliment"] || "",
            categorie: r.Catégorie || r["Categorie"] || r["categorie"] || "",
            quantite: serialiserQuantitePlanifiee(
              r.Quantité || r.Quantite || r.quantite,
              r.Unité || r.Unite || r.unite
            ),
            kcal: Number(r.Kcal ?? r.kcal) >= 0 && String(r.Kcal ?? r.kcal).trim() !== ""
              ? Math.round(Number(r.Kcal ?? r.kcal))
              : null
          };
        }).filter(r => !!r.date && !!r.type && !!r.aliment);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        repas = json.map(r => {
          let d = r.Date || r["date"];
          if (d && typeof d === "string" && d.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [jour, mois, annee] = d.split("/");
            d = `${annee}-${mois.padStart(2, "0")}-${jour.padStart(2, "0")}`;
          } else if (d && typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // ok
          } else {
            d = null;
          }
          return {
            date: d,
            type: r.Type || r["type"] || "",
            aliment: r.Aliment || r["aliment"] || "",
            categorie: r.Catégorie || r["Categorie"] || r["categorie"] || "",
            quantite: serialiserQuantitePlanifiee(
              r.Quantité || r.Quantite || r.quantite,
              r.Unité || r.Unite || r.unite
            ),
            kcal: Number(r.Kcal ?? r.kcal) >= 0 && String(r.Kcal ?? r.kcal).trim() !== ""
              ? Math.round(Number(r.Kcal ?? r.kcal))
              : null
          };
        }).filter(r => !!r.date && !!r.type && !!r.aliment);
      } else {
        setImportFeedback("Format de fichier non supporté. Import CSV ou XLSX seulement.");
        setLoading(false); return;
      }
      repas = repas.map(item => {
        const alimentReference = trouverAlimentReferentiel(referentielComplet, item.aliment);
        if (!alimentReference) return item;
        const calories = item.kcal === null && item.quantite
          ? calculerKcalPlanifiees(alimentReference, item.quantite, alimentReference.unite)
          : null;
        return {
          ...item,
          categorie: item.categorie || alimentReference.categorie || "",
          kcal: calories?.statut === "ok" ? calories.kcal : item.kcal
        };
      });
      if (repas.length === 0) {
        setImportFeedback("Aucun repas valide trouvé dans le fichier. Vérifie séparateur/format ou télécharge le modèle.");
        setLoading(false); return;
      }
      await supabase.from("repas_planifies").insert(repas.map(item => ({ ...item, user_id: userId })));
      setImportFeedback("Importation terminée !");
      fetchPlanning(); // recharge le planning
    } catch (err) {
      setImportFeedback("Erreur lors de l'import : " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="page-planning" style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      {/* 1. Bouton retour */}
      <button 
        onClick={() => window.history.back()}
        style={{
          marginBottom: 16,
          background: "#e3f2fd",
          border: "none",
          borderRadius: 8,
          padding: "8px 16px",
          fontWeight: 600,
          fontSize: 16,
          cursor: "pointer"
        }}
      >
        ⬅️ Retour
      </button>

      {/* 2. Titre */}
      <h1 style={{ textAlign: "center", marginBottom: 8 }}>🌟 Mon planning alimentaire</h1>

      {/* 3. Import/export */}
      <div className="outils-import-export" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 16 }}>
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleImportFile}
          style={{ marginRight: 8 }}
        />
        <button
          onClick={() => handleExport("xlsx")}
          style={{ background: "#90caf9", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 600, marginRight: 8 }}
        >Valider (télécharger le modèle Excel)</button>
        <button
          onClick={() => handleExport("csv")}
          style={{ background: "#b3e5fc", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}
        >Valider (télécharger le modèle CSV)</button>
        {importFeedback && (
          <span style={{ marginLeft: 16, color: importFeedback.includes("terminée") ? "green" : "red", fontWeight: 600 }}>
            {importFeedback}
          </span>
        )}
      </div>

      {/* 4. Motivation du mois */}
      <div style={{
        margin: "16px 0 24px 0",
        textAlign: "center",
        background: "#e3f2fd",
        borderRadius: 12,
        padding: 16,
        fontWeight: 500,
        fontSize: 18
      }}>
        <span>🎯 <b>Mantra :</b></span>
        <input
          value={mantra}
          onChange={e => setMantra(e.target.value)}
          placeholder="Ex : Je prends soin de moi chaque jour !"
          style={{
            marginLeft: 8,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #90caf9",
            width: 220,
            fontSize: 16
          }}
        />
        <span style={{ marginLeft: 12 }}>🏆 <b>Objectif :</b></span>
        <input
          value={objectif}
          onChange={e => setObjectif(e.target.value)}
          placeholder="Ex : Atteindre 70kg"
          style={{
            marginLeft: 8,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #90caf9",
            width: 160,
            fontSize: 16
          }}
        />
        <span style={{ marginLeft: 12 }}>🍏 <b>Thème :</b></span>
        <input
          value={theme}
          onChange={e => setTheme(e.target.value)}
          placeholder="Ex : Méditerranéen"
          style={{
            marginLeft: 8,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #90caf9",
            width: 160,
            fontSize: 16
          }}
        />
        <button
          onClick={handleValideInfos}
          style={{
            marginLeft: 16,
            background: "#90caf9",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Valider
        </button>
        {/* Affichage infos validées */}
        <div style={{ marginTop: 12, fontSize: 16, color: "#1976d2" }}>
          <b>Mantra :</b> {valideInfos.mantra} &nbsp; | &nbsp;
          <b>Objectif :</b> {valideInfos.objectif} &nbsp; | &nbsp;
          <b>Thème :</b> {valideInfos.theme}
        </div>
      </div>

      <HorizonPlanning
        mode={modeAffichage}
        periode={periode}
        planning={planning}
        selectedDate={selectedDate}
        referentiel={referentielComplet}
        totauxPlanning={totauxPlanning}
        onModeChange={changerHorizon}
        onPrevious={() => naviguer(-1)}
        onNext={() => naviguer(1)}
        onToday={revenirAujourdhui}
        onSelectDate={choisirDate}
        onMove={deplacerRepas}
        onDelete={supprimerLignePlanifiee}
      />

      <div className="repere-periode">
        {loading ? 'Chargement du planning…' : `${nbJoursPlanifies} jour${nbJoursPlanifies > 1 ? 's ont' : ' a'} déjà un repère dans cette période.`}
      </div>

      {erreurPlanning && <div role="alert" className="message-planning erreur-planning">{erreurPlanning}</div>}
      {feedbackPlanning && <div role="status" className="message-planning succes-planning">{feedbackPlanning}</div>}

      <div id="planificateur-repas">
        <PlanificateurRepas
          supabase={supabase}
          userId={userId}
          referentiel={referentielComplet}
          date={selectedDate}
          type={type}
          suggestions={suggestions}
          reglesGestion={reglesGestion}
          onChangeDate={date => {
            setSelectedDate(date);
            setDateAncrage(date);
          }}
          onChangeType={setType}
          onReferentielChange={refreshReferentiel}
          onPlanningRecorded={afficherLignesEnregistrees}
          onPlanningChange={fetchPlanning}
        />
      </div>

      <ListeCoursesGeneralePlan
        supabase={supabase}
        userId={userId}
        referentiel={referentielComplet}
        contexte={contexteListeCourses}
      />

      {/* 10. Export planning rempli */}
      <button
        onClick={() => {
          const rows = [["Date", "Jour", "Type", "Aliment", "Catégorie", "Quantité", "Kcal"]];
          Object.entries(planning).forEach(([date, repasArray]) => {
            const dObj = new Date(date);
            const jour = joursSemaine[dObj.getDay()];
            const dateJJMMAAAA = dObj.toLocaleDateString("fr-FR");
            repasArray.forEach(r => {
              rows.push([
                dateJJMMAAAA,
                jour,
                r.type,
                r.aliment,
                r.categorie || "",
                r.quantite || "",
                r.kcal ?? ""
              ]);
            });
          });
          const csv = Papa.unparse(rows, { delimiter: ";" });
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "planning-alimentaire.csv";
          a.click();
          URL.revokeObjectURL(url);
        }}
        style={{
          margin: "24px auto 0",
          display: "block",
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontWeight: 600,
          fontSize: 16,
          cursor: "pointer"
        }}
      >
        📤 Exporter mon planning rempli (.csv)
      </button>

      {/* 11. Coach du mois */}
      <div style={{
        marginTop: 32,
        textAlign: "center",
        fontSize: 16,
        color: "#888"
      }}>
        <span>👑 <b>Le coach du mois :</b> "N’oublie pas, chaque petit pas compte ! Tu es sur la bonne voie."</span>
      </div>

      {/* 12. Responsive style */}
      <style jsx global>{`
        .repere-periode {
          width: fit-content;
          max-width: 100%;
          margin: 0 auto 14px;
          border-radius: 20px;
          padding: 7px 16px;
          background: #f3e5f5;
          color: #6a1b9a;
          font-weight: 700;
          text-align: center;
        }
        .message-planning {
          margin: 0 0 14px;
          border-radius: 9px;
          padding: 10px;
          font-weight: 700;
        }
        .erreur-planning { color: #b71c1c; background: #ffebee; }
        .succes-planning { color: #1b5e20; background: #e8f5e9; }
        @media (max-width: 700px) {
          .page-planning { padding: 14px !important; }
          .outils-import-export { flex-direction: column; align-items: stretch !important; gap: 9px !important; }
          .outils-import-export > * { width: 100%; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
