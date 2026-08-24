import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useUserReferentiel from "../lib/useUserReferentiel";
import {
  calculerKcalPlanifiees,
  calculerTotauxPlanning,
  normaliserRepasPlanifie,
  obtenirSaisieParDefaut,
  serialiserQuantitePlanifiee,
  trouverAlimentReferentiel
} from "../lib/planificationRepas";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import GestionRepasComposes from "../components/GestionRepasComposes";

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
  // Etat navigation
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Etat planning
  const [planning, setPlanning] = useState({});
  const [aliment, setAliment] = useState("");
  const [type, setType] = useState(typesRepas[0].nom);
  const [selectedDate, setSelectedDate] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [regle, setRegle] = useState("");
  const [categorie, setCategorie] = useState("");
  const [quantite, setQuantite] = useState("");
  const [unite, setUnite] = useState("");
  const [kcal, setKcal] = useState("");
  const [erreurAjout, setErreurAjout] = useState("");
  const [loading, setLoading] = useState(false);
  const [importFeedback, setImportFeedback] = useState("");
  const [comparaison, setComparaison] = useState({ semaineActuelle: 0, semainePrecedente: 0 });

  // Etat motivation/mois
  const [mantra, setMantra] = useState("");
  const [objectif, setObjectif] = useState("");
  const [theme, setTheme] = useState("");
  const [valideInfos, setValideInfos] = useState({ mantra: "", objectif: "", theme: "" });
  const [userId, setUserId] = useState(null);
  const { referentielComplet } = useUserReferentiel(userId);

  useEffect(() => {
    let actif = true;
    supabase.auth.getUser().then(({ data }) => {
      if (actif) setUserId(data?.user?.id || null);
    });
    return () => { actif = false; };
  }, []);

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

  const days = getDaysInMonth(year, month);

  // Récupère les repas planifiés du mois
  const fetchPlanning = async () => {
    if (!userId) {
      setPlanning({});
      return;
    }
    setLoading(true);
    const start = toYYYYMMDD(new Date(year, month, 1));
    const end = toYYYYMMDD(new Date(year, month + 1, 0));
    const { data } = await supabase
      .from("repas_planifies")
      .select("*")
      .eq("user_id", userId)
      .gte("date", start)
      .lte("date", end);
    const grouped = {};
    data?.forEach(r => {
      grouped[r.date] = grouped[r.date] || [];
      grouped[r.date].push(r);
    });
    setPlanning(grouped);
    setLoading(false);
  };

  useEffect(() => { fetchPlanning(); }, [year, month, userId]);

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

  // Met à jour la catégorie et la règle quand on sélectionne un aliment
  useEffect(() => {
    if (!aliment) {
      setCategorie("");
      setRegle("");
      return;
    }
    const found = trouverAlimentReferentiel(referentielComplet, aliment);
    if (found) {
      setCategorie(found.categorie);
      setRegle(reglesGestion[found.categorie] || "");
      const valeurs = obtenirSaisieParDefaut(found);
      setQuantite(valeurs.quantite);
      setUnite(valeurs.unite);
      setKcal(valeurs.kcal === null ? "" : String(valeurs.kcal));
    } else {
      setCategorie("");
      setRegle("");
      setQuantite("");
      setUnite("");
      setKcal("");
    }
  }, [aliment, referentielComplet]);

  useEffect(() => {
    const found = trouverAlimentReferentiel(referentielComplet, aliment);
    if (!found || !quantite || !unite) return;
    const resultat = calculerKcalPlanifiees(found, quantite, unite);
    setKcal(resultat.statut === "ok" ? String(resultat.kcal) : "");
  }, [aliment, quantite, unite, referentielComplet]);

  // Ajouter un repas planifié
  const handleAdd = async () => {
    if (!aliment || !type || !selectedDate) return;
    const quantiteEnregistree = serialiserQuantitePlanifiee(quantite, unite);
    const kcalEnregistrees = Number(kcal);
    if (!quantiteEnregistree || !Number.isFinite(kcalEnregistrees) || kcalEnregistrees < 0) {
      setErreurAjout("Renseigne une quantité, une unité et des calories valides.");
      return;
    }
    setLoading(true);
    setErreurAjout("");
    const { error } = await supabase.from("repas_planifies").insert([
      { user_id: userId, date: selectedDate, type, aliment, categorie, quantite: quantiteEnregistree, kcal: Math.round(kcalEnregistrees) }
    ]);
    if (error) {
      setErreurAjout("Le repas n’a pas pu être enregistré. Réessaie.");
      setLoading(false);
      return;
    }
    setAliment("");
    setQuantite("");
    setUnite("");
    setKcal("");
    setSelectedDate("");
    setLoading(false);
    fetchPlanning();
  };

  // Drag & drop (déplacement d'un repas d'une date à une autre)
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId) return;
    await supabase
      .from("repas_planifies")
      .update({ date: destination.droppableId })
      .eq("id", draggableId)
      .eq("user_id", userId);
    fetchPlanning();
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

  const suggestionsRef = referentielComplet.filter(a => !a.typeRepas || a.typeRepas === type);
  const nbJoursPlanifies = days.filter(d => planning[toYYYYMMDD(d)]?.length).length;
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

  // ----------- CALENDRIER -----------
  // Calcul du premier jour du mois (0 = dimanche)
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Dim, 1 = Lun, ..., 6 = Sam
  // Nombre de semaines à afficher (6 lignes max)
  const nbCells = firstDayOfMonth + days.length;
  const nbWeeks = Math.ceil(nbCells / 7);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
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
      <h1 style={{ textAlign: "center", marginBottom: 8 }}>🌟 Planning alimentaire du mois</h1>

      {/* 3. Import/export */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 16 }}>
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

      {/* 5. Navigation mois */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
        <button onClick={() => setMonth(m => m === 0 ? 11 : m - 1)}>⬅️ Mois précédent</button>
        <span style={{ fontWeight: 600, fontSize: 18 }}>
          {moisNoms[month]} {year}
        </span>
        <button onClick={() => setMonth(m => m === 11 ? 0 : m + 1)}>Mois suivant ➡️</button>
      </div>

      {/* 6. Ajout repas planifié */}
      <div style={{
        marginBottom: 24,
        textAlign: "center",
        background: "#fffde7",
        borderRadius: 10,
        padding: 12,
        fontWeight: 500
      }}>
        <span>➕ <b>Ajoute un repas planifié :</b></span>
        <select value={type} onChange={e => setType(e.target.value)} style={{ marginLeft: 8 }}>
          {typesRepas.map(t => <option key={t.nom}>{t.nom}</option>)}
        </select>
        <input
          list="aliments"
          placeholder="Aliment"
          value={aliment}
          onChange={e => setAliment(e.target.value)}
          style={{ marginLeft: 8, minWidth: 120 }}
        />
        <datalist id="aliments">
          {suggestionsRef.map((a, i) => (
            <option key={i} value={a.nom}>{a.nom}</option>
          ))}
        </datalist>
        <input
          type="number"
          min="0.01"
          step="0.01"
          aria-label="Quantité planifiée"
          placeholder="Quantité"
          value={quantite}
          onChange={e => setQuantite(e.target.value)}
          style={{ marginLeft: 8, width: 90 }}
        />
        <input
          aria-label="Unité de la quantité planifiée"
          placeholder="Unité"
          value={unite}
          onChange={e => setUnite(e.target.value)}
          style={{ marginLeft: 8, width: 80 }}
        />
        <input
          type="number"
          min="0"
          step="1"
          aria-label="Calories planifiées"
          placeholder="Kcal"
          value={kcal}
          onChange={e => setKcal(e.target.value)}
          style={{ marginLeft: 8, width: 85 }}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        <button onClick={handleAdd} style={{ marginLeft: 8 }} disabled={loading}>Ajouter</button>
        {aliment && trouverAlimentReferentiel(referentielComplet, aliment)?.portionDefaut && (
          <div style={{ marginTop: 8, color: "#6d4c41", fontSize: 14 }}>
            Portion proposée : {trouverAlimentReferentiel(referentielComplet, aliment).portionDefaut}
          </div>
        )}
        {erreurAjout && (
          <div role="alert" style={{ marginTop: 8, color: "#c62828", fontWeight: 600 }}>{erreurAjout}</div>
        )}
        <span style={{ marginLeft: 24 }}>Suggestions :</span>
        {suggestions.map((s, i) => (
          <button
            key={i}
            style={{
              marginLeft: 8,
              background: "#c8e6c9",
              border: "none",
              borderRadius: 8,
              padding: "4px 10px",
              cursor: "pointer"
            }}
            onClick={() => setAliment(s.aliment)}
          >
            {s.aliment} ({s.categorie})
          </button>
        ))}
      </div>

      {/* 7. Règle nutritionnelle */}
      {regle && (
        <div style={{
          background: "#fffde7",
          border: "1px solid #ffe082",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          color: "#795548",
          fontWeight: 500,
          maxWidth: 600,
          margin: "0 auto"
        }}>
          <span>📋 <b>Règle à respecter pour ce choix :</b> {regle}</span>
        </div>
      )}

      <GestionRepasComposes
        supabase={supabase}
        userId={userId}
        planning={planning}
        referentiel={referentielComplet}
        date={selectedDate}
        type={type}
        onChangeDate={setSelectedDate}
        onChangeType={setType}
        onPlanningChange={fetchPlanning}
      />

      {/* 8. Progression mois */}
      <div style={{ marginBottom: 16, textAlign: "center" }}>
        <span style={{
          background: "#f8bbd0",
          borderRadius: 8,
          padding: "6px 18px",
          fontWeight: 600,
          color: "#ad1457"
        }}>
          {nbJoursPlanifies}/{days.length} jours planifiés ce mois-ci
        </span>
      </div>
      <div style={{ textAlign: "center", margin: "24px 0", fontWeight: 600 }}>
        <span>📊 Repas respectés cette semaine : {comparaison.semaineActuelle} <br />
          Semaine dernière : {comparaison.semainePrecedente}</span>
      </div>

      {/* 9. Calendrier corrigé */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            minWidth: 700,
            width: "100%",
            borderCollapse: "collapse",
            background: "#fafafa",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
          }}>
            <thead>
              <tr>
                {joursSemaine.map(j => (
                  <th key={j} style={{
                    padding: 8,
                    background: "#e3f2fd",
                    border: "1px solid #90caf9",
                    fontWeight: 700,
                    fontSize: 16
                  }}>{j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(nbWeeks)].map((_, week) => (
                <tr key={week}>
                  {joursSemaine.map((_, dayIdx) => {
                    // Calcul du numéro du jour du mois (1-based)
                    const dayOfMonth = week * 7 + dayIdx - firstDayOfMonth + 1;
                    const dateObj = new Date(year, month, dayOfMonth);
                    const dateStr = toYYYYMMDD(dateObj);
                    const isCurrentMonth = dayOfMonth > 0 && dayOfMonth <= days.length;
                    return (
                      <td
                        key={dayIdx}
                        style={{
                          minWidth: 120,
                          minHeight: 80,
                          border: "1px solid #e0e0e0",
                          background: isCurrentMonth ? "#fff" : "#f0f0f0",
                          verticalAlign: "top",
                          position: "relative"
                        }}
                      >
                        {isCurrentMonth && (
                          <>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                              {dateObj.getDate()} <span style={{ fontSize: 12, color: "#888" }}>({joursSemaine[dayIdx]})</span>
                            </div>
                            <Droppable droppableId={dateStr}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                  {(planning[dateStr] || []).map((r, idx) => {
                                    const repasType = typesRepas.find(t => t.nom === r.type);
                                    const repasAffiche = normaliserRepasPlanifie(r, referentielComplet);
                                    return (
                                      <Draggable key={r.id} draggableId={r.id} index={idx}>
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                              background: repasType?.color || "#fff",
                                              border: "1px solid #ccc",
                                              borderRadius: 8,
                                              padding: 6,
                                              marginBottom: 6,
                                              fontSize: 14,
                                              color: "#1976d2",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 8,
                                              ...provided.draggableProps.style
                                            }}
                                          >
                                            <span style={{ fontSize: 18 }}>{repasType?.emoji}</span>
                                            <span style={{ flex: 1 }}>
                                              <b>{r.type}</b> : {r.aliment}
                                              <span style={{ display: "block", fontSize: 12, color: "#455a64", marginTop: 2 }}>
                                                {repasAffiche.quantite_affichee || "Quantité non renseignée"}
                                                {repasAffiche.kcal_calculees !== null
                                                  ? ` • ${repasAffiche.kcal_calculees} kcal`
                                                  : " • Calories non renseignées"}
                                              </span>
                                            </span>
                                            <button
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                await supabase.from("repas_planifies").delete().eq("id", r.id).eq("user_id", userId);
                                                fetchPlanning();
                                              }}
                                              style={{
                                                background: "none",
                                                border: "none",
                                                color: "#c62828",
                                                cursor: "pointer",
                                                fontSize: 18,
                                                marginLeft: 4
                                              }}
                                              title="Supprimer ce repas"
                                            >
                                              🗑️
                                            </button>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                  {Object.entries(totauxPlanning[dateStr]?.parType || {}).map(([typeRepas, total]) => (
                                    <div key={typeRepas} style={{ fontSize: 12, color: "#37474f", marginTop: 3 }}>
                                      {typeRepas} : <b>{total} kcal</b>
                                    </div>
                                  ))}
                                  {(planning[dateStr] || []).length > 0 && (
                                    <div style={{
                                      borderTop: "1px solid #cfd8dc",
                                      marginTop: 6,
                                      paddingTop: 5,
                                      color: totauxPlanning[dateStr]?.complet ? "#2e7d32" : "#ef6c00",
                                      fontSize: 12,
                                      fontWeight: 700
                                    }}>
                                      Total jour : {totauxPlanning[dateStr]?.totalJour || 0} kcal
                                      {!totauxPlanning[dateStr]?.complet && " (partiel)"}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Droppable>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DragDropContext>

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
        @media (max-width: 600px) {
          input, select, button {
            width: 100% !important;
            margin: 8px 0 !important;
          }
        }
        .dragged-success {
          animation: pop 0.4s;
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
