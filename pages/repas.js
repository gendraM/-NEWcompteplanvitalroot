import BandeauDefiActif from '../components/BandeauDefiActif';
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// ═══════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES - FORMATAGE DATES
// ═══════════════════════════════════════════════════════════

/**
 * Formate une date de manière contextuelle
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {string} - Format contextualisé
 */
function formatDateContextuelle(dateStr) {
  if (!dateStr) return '—';
  
  const date = new Date(dateStr + 'T00:00:00');
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  
  const diffTime = aujourdhui.getTime() - date.getTime();
  const diffJours = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffJours === 0) return 'Aujourd\'hui';
  if (diffJours === 1) return 'Hier';
  if (diffJours > 1 && diffJours < 7) return `Il y a ${diffJours} jours`;
  
  // Format court pour dates anciennes
  const jours = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  const jourSemaine = jours[date.getDay()];
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  
  return `${jourSemaine} ${jour}/${mois}`;
}

/**
 * Regroupe les repas par période
 * @param {Array} repas - Liste des repas
 * @returns {Object} - Repas regroupés par période
 */
function regrouperParPeriode(repas) {
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  const aujourdhuiStr = aujourdhui.toISOString().slice(0, 10);
  
  // Calculer début de semaine (lundi)
  const dayOfWeek = aujourdhui.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const debutSemaine = new Date(aujourdhui);
  debutSemaine.setDate(aujourdhui.getDate() + diffToMonday);
  const debutSemaineStr = debutSemaine.toISOString().slice(0, 10);
  
  // Calculer début semaine dernière
  const debutSemaineDerniere = new Date(debutSemaine);
  debutSemaineDerniere.setDate(debutSemaine.getDate() - 7);
  const debutSemaineDerniereStr = debutSemaineDerniere.toISOString().slice(0, 10);
  
  const groupes = {
    aujourdhui: [],
    cette_semaine: [],
    semaine_derniere: [],
    plus_ancien: []
  };
  
  repas.forEach(r => {
    if (r.date === aujourdhuiStr) {
      groupes.aujourdhui.push(r);
    } else if (r.date >= debutSemaineStr) {
      groupes.cette_semaine.push(r);
    } else if (r.date >= debutSemaineDerniereStr) {
      groupes.semaine_derniere.push(r);
    } else {
      groupes.plus_ancien.push(r);
    }
  });
  
  return groupes;
}

// ═══════════════════════════════════════════════════════════

function RepasForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(
    initial || {
      date: "",
      type: "",
      aliment: "",
      categorie: "",
      quantite: "",
      kcal: "",
    }
  );
  const [isFastFood, setIsFastFood] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(form);
    if (isFastFood) {
      const { supabase } = await import('../lib/supabaseClient');
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData?.user?.id || null;
      const { error } = await supabase.from('fast_food_history').insert([
        {
          user_id,
          date: form.date,
          restaurant: 'Manuel (édition)',
          aliments: [{ nom: form.aliment, quantite: form.quantite }]
        }
      ]);
      if (error) {
        alert('Erreur lors de l’enregistrement du fast food : ' + error.message);
      }
    }
  };

  return (
    <>
      <BandeauDefiActif
        defi={{ nom: "Défi test", duree: 5 }}
        progression={3}
        onOpenJournal={() => {}}
      />
      <form onSubmit={handleSubmit} style={{ marginBottom: 24, background: "#f9f9f9", padding: 16, borderRadius: 10 }}>
        <h2>{initial?.id ? "Modifier le repas" : "Ajouter un repas"}</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <input name="date" type="date" value={form.date || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 120 }} />
          <input name="type" placeholder="Type (petit-déj, déjeuner, etc.)" value={form.type || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 120 }} />
          <input name="aliment" placeholder="Aliment" value={form.aliment || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 120 }} />
          <input name="categorie" placeholder="Catégorie" value={form.categorie || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 120 }} />
          <input name="quantite" placeholder="Quantité" value={form.quantite || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 80 }} />
          <input name="kcal" placeholder="Kcal" type="number" value={form.kcal || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 80 }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ marginRight: 16 }}>
            <input type="checkbox" checked={isFastFood} onChange={e => setIsFastFood(e.target.checked)} /> Fast food ?
          </label>
          <button type="submit" style={{ marginRight: 8, background: "#4caf50", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>
            {initial?.id ? "Enregistrer" : "Ajouter"}
          </button>
          <button type="button" onClick={onCancel} style={{ background: "#ccc", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      </form>
    </>
  );
}

export default function Repas() {
  const [repas, setRepas] = useState([]);
  const [fastFoodRepas, setFastFoodRepas] = useState([]);
  const [repasDebug, setRepasDebug] = useState([]);
  const [objectifCalorique, setObjectifCalorique] = useState(null);
  const [caloriesDuJour, setCaloriesDuJour] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(true);
  const [editRepas, setEditRepas] = useState(null);
  
  // ═══ NOUVEAUX FILTRES ═══
  const [filtre, setFiltre] = useState('tout'); // 'tout' | 'extras' | 'fastfood'
  const [periode, setPeriode] = useState('tout'); // 'tout' | 'jour' | 'semaine' | 'mois' | 'personnalisee'
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  useEffect(() => {
    setObjectifCalorique(1800);
  }, []);

  useEffect(() => {
    async function fetchCaloriesForDay(dateRef) {
      const { data, error } = await supabase
        .from("repas_reels")
        .select("kcal, date, type, aliment")
        .eq("date", dateRef);
      if (!error && Array.isArray(data)) {
        setRepasDebug(data);
        const total = data.reduce((sum, r) => sum + (parseInt(r.kcal, 10) || 0), 0);
        setCaloriesDuJour(total);
      } else {
        setRepasDebug([]);
        setCaloriesDuJour(0);
      }
    }
    fetchCaloriesForDay(selectedDate);
  }, [selectedDate, repas]);

  useEffect(() => {
    fetchRepas();
    fetchFastFoodRepas();
  }, []);

  const fetchRepas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("repas_reels")
      .select("*")
      .order("date", { ascending: false })
      .order("id", { ascending: false });
    if (!error) setRepas(data || []);
    setLoading(false);
  };

  const fetchFastFoodRepas = async () => {
    const { data, error } = await supabase
      .from('fast_food_history')
      .select('*');
    if (!error) setFastFoodRepas(data || []);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce repas ?")) return;
    await supabase.from("repas_reels").delete().eq("id", id);
    fetchRepas();
  };

  const handleEdit = (repasToEdit) => {
    setEditRepas(repasToEdit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSave = async (form) => {
    if (editRepas?.id) {
      await supabase
        .from("repas_reels")
        .update({
          date: form.date,
          type: form.type,
          aliment: form.aliment,
          categorie: form.categorie,
          quantite: form.quantite,
          kcal: form.kcal,
        })
        .eq("id", editRepas.id);
    }
    setEditRepas(null);
    await fetchRepas();
    await fetchFastFoodRepas();
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      {/* Suivi calorique du jour dynamique avec date de référence bien visible */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px #1976d211", padding: 18, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span role="img" aria-label="bol">🥗</span> Suivi alimentaire du jour
          <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18, background: '#e3f2fd', borderRadius: 8, padding: '4px 12px', marginLeft: 12 }}>
            {selectedDate}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Objectif calorique du jour : </span>
          <span style={{ fontWeight: 700, color: "#ff9800", fontSize: 18 }}>
            {(objectifCalorique !== null && objectifCalorique !== undefined) ? `${objectifCalorique} kcal` : "…"}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Consommé ce jour : </span>
          <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18 }}>
            {caloriesDuJour} kcal
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Reste à consommer : </span>
          <span style={{
            fontWeight: 700,
            color: caloriesDuJour > objectifCalorique ? "#e53935" : "#43a047",
            fontSize: 18
          }}>
            {(objectifCalorique !== null && objectifCalorique !== undefined && caloriesDuJour !== null)
              ? (objectifCalorique - caloriesDuJour) + " kcal"
              : "..."}
          </span>
        </div>
      </div>
      {/* Debug : liste des repas du jour et leurs calories (toujours visible) */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", cursor: "pointer", fontWeight: 600 }}
        >
          ← Retour
        </button>
        <a href="/tableau-de-bord" style={{ textDecoration: 'none' }}>
          <button
            style={{ background: "#43a047", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", cursor: "pointer", fontWeight: 600 }}
          >
            🏠 Voir mon tableau de bord
          </button>
        </a>
      </div>
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>🗑️ Gérer mes repas</h1>
      
      {/* ═══ FILTRES ═══ */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: 8 }}>
        {/* Ligne 1 : Type de repas */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Type de repas :</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setFiltre('tout')}
              style={{
                padding: '0.5rem 1rem',
                border: filtre === 'tout' ? '2px solid #1976d2' : '1px solid #ddd',
                background: filtre === 'tout' ? '#1976d2' : '#fff',
                color: filtre === 'tout' ? '#fff' : '#333',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: filtre === 'tout' ? 'bold' : 'normal'
              }}
            >
              📋 Tout
            </button>
            <button
              onClick={() => setFiltre('extras')}
              style={{
                padding: '0.5rem 1rem',
                border: filtre === 'extras' ? '2px solid #ff9800' : '1px solid #ddd',
                background: filtre === 'extras' ? '#ff9800' : '#fff',
                color: filtre === 'extras' ? '#fff' : '#333',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: filtre === 'extras' ? 'bold' : 'normal'
              }}
            >
              ⭐ Extras uniquement
            </button>
            <button
              onClick={() => setFiltre('fastfood')}
              style={{
                padding: '0.5rem 1rem',
                border: filtre === 'fastfood' ? '2px solid #e91e63' : '1px solid #ddd',
                background: filtre === 'fastfood' ? '#e91e63' : '#fff',
                color: filtre === 'fastfood' ? '#fff' : '#333',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: filtre === 'fastfood' ? 'bold' : 'normal'
              }}
            >
              🍔 Fast-food
            </button>
          </div>
        </div>
        
        {/* Ligne 2 : Période */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Période :</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPeriode('tout')}
              style={{
                padding: '0.5rem 1rem',
                border: periode === 'tout' ? '2px solid #43a047' : '1px solid #ddd',
                background: periode === 'tout' ? '#43a047' : '#fff',
                color: periode === 'tout' ? '#fff' : '#333',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: periode === 'tout' ? 'bold' : 'normal'
              }}
            >
              Tout
            </button>
            <button
              onClick={() => setPeriode('jour')}
              style={{
                padding: '0.5rem 1rem',
                border: periode === 'jour' ? '2px solid #43a047' : '1px solid #ddd',
                background: periode === 'jour' ? '#43a047' : '#fff',
                color: periode === 'jour' ? '#fff' : '#333',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: periode === 'jour' ? 'bold' : 'normal'
              }}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setPeriode('semaine')}
              style={{
                padding: '0.5rem 1rem',
                border: periode === 'semaine' ? '2px solid #43a047' : '1px solid #ddd',
                background: periode === 'semaine' ? '#43a047' : '#fff',
                color: periode === 'semaine' ? '#fff' : '#333',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: periode === 'semaine' ? 'bold' : 'normal'
              }}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setPeriode('mois')}
              style={{
                padding: '0.5rem 1rem',
                border: periode === 'mois' ? '2px solid #43a047' : '1px solid #ddd',
                background: periode === 'mois' ? '#43a047' : '#fff',
                color: periode === 'mois' ? '#fff' : '#333',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: periode === 'mois' ? 'bold' : 'normal'
              }}
            >
              Ce mois
            </button>
            <button
              onClick={() => setPeriode('personnalisee')}
              style={{
                padding: '0.5rem 1rem',
                border: periode === 'personnalisee' ? '2px solid #1976d2' : '1px solid #ddd',
                background: periode === 'personnalisee' ? '#1976d2' : '#fff',
                color: periode === 'personnalisee' ? '#fff' : '#333',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: periode === 'personnalisee' ? 'bold' : 'normal'
              }}
            >
              Période personnalisée
            </button>
            {periode === 'personnalisee' && (
              <>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={e => setDateDebut(e.target.value)}
                  style={{ marginLeft: 8, marginRight: 4, padding: '0.3rem', borderRadius: 4, border: '1px solid #bbb' }}
                  placeholder="Début"
                  min="2000-01-01"
                  max={dateFin || undefined}
                />
                <span>→</span>
                <input
                  type="date"
                  value={dateFin}
                  onChange={e => setDateFin(e.target.value)}
                  style={{ marginLeft: 4, padding: '0.3rem', borderRadius: 4, border: '1px solid #bbb' }}
                  placeholder="Fin"
                  min={dateDebut || undefined}
                  max={new Date().toISOString().slice(0,10)}
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Formulaire d'édition (s'affiche uniquement si on est en mode édition) */}
      {editRepas && (
        <RepasForm
          initial={editRepas}
          onCancel={() => setEditRepas(null)}
          onSave={handleFormSave}
        />
      )}
      {loading ? (
        <div>Chargement…</div>
      ) : repas.length === 0 ? (
        <div>Aucun repas enregistré.</div>
      ) : (
        <>
          {/* ═══ FONCTION DE FILTRAGE ═══ */}
          {(() => {
            let repasFiltres = [...repas];
            
            // Filtre par type
            if (filtre === 'extras') {
              repasFiltres = repasFiltres.filter(r => r.est_extra === true);
            } else if (filtre === 'fastfood') {
              repasFiltres = repasFiltres.filter(r => r.tag || r.categorie === 'fast-food');
            }
            
            // Filtre par période
            const aujourdhui = new Date().toISOString().slice(0, 10);
            const debutSemaine = (() => {
              const today = new Date();
              const dayOfWeek = today.getDay();
              const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
              const monday = new Date(today);
              monday.setDate(today.getDate() + diffToMonday);
              return monday.toISOString().slice(0, 10);
            })();
            const debutMois = new Date().toISOString().slice(0, 7); // YYYY-MM
            
            if (periode === 'jour') {
              repasFiltres = repasFiltres.filter(r => r.date === aujourdhui);
            } else if (periode === 'semaine') {
              repasFiltres = repasFiltres.filter(r => r.date >= debutSemaine);
            } else if (periode === 'mois') {
              repasFiltres = repasFiltres.filter(r => r.date && r.date.startsWith(debutMois));
            } else if (periode === 'personnalisee' && dateDebut && dateFin) {
              repasFiltres = repasFiltres.filter(r => r.date >= dateDebut && r.date <= dateFin);
            }
            
            // Compteur
            const totalFiltres = repasFiltres.length;
            const totalKcal = repasFiltres.reduce((sum, r) => sum + (parseInt(r.kcal, 10) || 0), 0);
            
            // Si un filtre de période est actif, ne pas regrouper
            const afficherRegroupement = periode === 'tout';
            
            // Regrouper par période uniquement si pas de filtre période
            const groupes = afficherRegroupement ? regrouperParPeriode(repasFiltres) : null;
            
            // Calculer les dates de périodes pour affichage
            const aujourdhuiDate = new Date();
            aujourdhuiDate.setHours(0, 0, 0, 0);
            const aujourdhuiStr = aujourdhuiDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            // Semaine actuelle
            const dayOfWeek = aujourdhuiDate.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const lundiSemaine = new Date(aujourdhuiDate);
            lundiSemaine.setDate(aujourdhuiDate.getDate() + diffToMonday);
            const dimancheSemaine = new Date(lundiSemaine);
            dimancheSemaine.setDate(lundiSemaine.getDate() + 6);
            const semaineStr = `${lundiSemaine.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} → ${dimancheSemaine.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;
            
            // Semaine dernière
            const lundiSemaineDerniere = new Date(lundiSemaine);
            lundiSemaineDerniere.setDate(lundiSemaine.getDate() - 7);
            const dimancheSemaineDerniere = new Date(lundiSemaineDerniere);
            dimancheSemaineDerniere.setDate(lundiSemaineDerniere.getDate() + 6);
            const semaineDerniereStr = `${lundiSemaineDerniere.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} → ${dimancheSemaineDerniere.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;
            
            // Fonction pour rendre une section
            const renderSection = (titre, emoji, couleur, repasSection, datesPeriode = null) => {
              if (repasSection.length === 0) return null;
              
              const kcalSection = repasSection.reduce((sum, r) => sum + (parseInt(r.kcal, 10) || 0), 0);
              
              return (
                <div key={titre} style={{ marginBottom: '2rem' }}>
                  {/* En-tête section */}
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: couleur,
                    borderRadius: '8px 8px 0 0',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      {emoji} {titre}
                      {datesPeriode && (
                        <span style={{ fontWeight: 'normal', fontSize: '0.85rem', marginLeft: '0.5rem', opacity: 0.9 }}>
                          ({datesPeriode})
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '0.9rem', opacity: 0.95 }}>
                      {repasSection.length} repas • {kcalSection} kcal
                    </span>
                  </div>
                  
                  {/* Tableau des repas */}
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Date</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Type</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Aliment</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Catégorie</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Quantité</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Kcal</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {repasSection.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 8, border: "1px solid #ddd", position: 'relative' }} title={r.date}>
                  <span style={{ fontWeight: '600' }}>{formatDateContextuelle(r.date)}</span>
                  {/* Validation semaine (dîner du dimanche) */}
                  {(() => {
                    const d = new Date(r.date);
                    if (d.getDay() === 0 && r.type === "Dîner") {
                      return (
                        <span style={{
                          marginLeft: 8,
                          fontWeight: 700,
                          color: r.validee ? '#43a047' : '#e53935',
                          fontSize: 13,
                          background: r.validee ? '#e8f5e9' : '#fffbe6',
                          borderRadius: 6,
                          padding: '2px 8px',
                          border: r.validee ? '1px solid #43a047' : '1px solid #e53935',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          {r.validee ? '✅ Semaine validée' : 'Non validée'}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.type || <span style={{ color: '#bbb' }}>—</span>}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {r.aliment ? (
                    <span>
                      {r.est_extra && <span style={{ marginRight: 6, fontSize: '1.2em' }} title="Extra">⭐</span>}
                      {r.aliment}
                      {r.planifie && (
                        <span style={{ marginLeft: 6, color: '#1976d2', fontWeight: 600, fontSize: '0.95em', background: '#e3f2fd', borderRadius: 4, padding: '2px 6px' }} title="Repas planifié">Planifié</span>
                      )}
                    </span>
                  ) : <span style={{ color: '#bbb' }}>—</span>}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {r.categorie ? r.categorie : <span style={{ color: '#bbb' }}>—</span>}
                  {(fastFoodRepas.some(ff =>
                    ff.date === r.date &&
                    ff.aliments?.some(a =>
                      a.nom?.trim().toLowerCase() === r.aliment?.trim().toLowerCase()
                    )
                  ) || r.tag || r.categorie === 'fast-food') && (
                    <span style={{ marginLeft: 6, fontSize: '1.3em' }} title="Fast food">🍔</span>
                  )}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.quantite ? r.quantite : <span style={{ color: '#bbb' }}>—</span>}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.kcal ? r.kcal : <span style={{ color: '#bbb' }}>—</span>}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  <button style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", marginRight: 8 }} onClick={() => handleEdit(r)}>Modifier</button>
                  <button style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }} onClick={() => handleDelete(r.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
                </div>
              );
            };
            
            return (
              <>
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#e3f2fd', borderRadius: 6, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    📊 <strong>{totalFiltres} repas</strong> trouvés • <strong>{totalKcal} kcal</strong> au total
                  </span>
                  {afficherRegroupement && repasFiltres.length > 0 && (
                    <span style={{ color: '#1976d2', fontWeight: 500, fontSize: '0.97em' }}>
                      du {(() => {
                        // Chercher la date la plus ancienne
                        const dates = repasFiltres.map(r => r.date).filter(Boolean).sort();
                        if (dates.length === 0) return '';
                        const debut = dates[0];
                        const fin = new Date().toISOString().slice(0, 10);
                        return `${debut} jusqu’à aujourd’hui`;
                      })()}
                    </span>
                  )}
                </div>
                
                {totalFiltres === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    Aucun repas correspondant aux filtres sélectionnés.
                  </div>
                ) : (
                  // Affichage simple sans regroupement quand filtre période actif
                  <>
                    {periode === 'jour' && renderSection('JOUR SÉLECTIONNÉ', '📅', '#43a047', repasFiltres, repasFiltres.length > 0 ?
                      new Date(repasFiltres[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null)}
                    {periode === 'semaine' && renderSection('SEMAINE SÉLECTIONNÉE', '📆', '#1976d2', repasFiltres, (() => {
                      if (repasFiltres.length === 0) return null;
                      const dates = repasFiltres.map(r => r.date).filter(Boolean).sort();
                      if (dates.length === 0) return null;
                      const debut = new Date(dates[0]);
                      const fin = new Date(dates[dates.length - 1]);
                      return `${debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} → ${fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
                    })())}
                    {periode === 'mois' && renderSection('MOIS SÉLECTIONNÉ', '🗓️', '#ff9800', repasFiltres, (() => {
                      if (repasFiltres.length === 0) return null;
                      const dates = repasFiltres.map(r => r.date).filter(Boolean).sort();
                      if (dates.length === 0) return null;
                      const debut = new Date(dates[0]);
                      return debut.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                    })())}
                    {periode === 'personnalisee' && renderSection('PÉRIODE PERSONNALISÉE', '📅', '#1976d2', repasFiltres, (() => {
                      if (!dateDebut || !dateFin) return null;
                      const debut = new Date(dateDebut);
                      const fin = new Date(dateFin);
                      return `${debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} → ${fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
                    })())}
                  </>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}