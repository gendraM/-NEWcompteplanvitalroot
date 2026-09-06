import { useEffect, useState } from "react";
import { sauvegarderEngagements, chargerJournalDefi, validerEtapeDefi } from "../lib/journalDefisUtils";

export default function JournalDefiPersonnalise({ defi, jourActuel, onProgressionUpdate }) {
  const [notePersonnelle, setNotePersonnelle] = useState("");
  const [journalCharge, setJournalCharge] = useState(false);
  const [etapeValidee, setEtapeValidee] = useState(false);
  const [reussi, setReussi] = useState(null);
  const [message, setMessage] = useState("");
  const [validationEnCours, setValidationEnCours] = useState(false);

  const objectif = defi?.description?.trim() || defi?.nom || "Mon défi du jour";

  useEffect(() => {
    if (!defi?.id || !jourActuel) return;

    let actif = true;
    const charger = async () => {
      setJournalCharge(false);
      setNotePersonnelle("");
      setEtapeValidee(false);
      setReussi(null);
      setMessage("");
      try {
        const journal = await chargerJournalDefi(defi.id, jourActuel);
        if (!actif) return;
        if (journal) {
          setNotePersonnelle(journal.note_personnelle || "");
          setEtapeValidee(Boolean(journal.valide));
          const engagement = Array.isArray(journal.engagements) ? journal.engagements[0] : null;
          if (journal.valide) setReussi(true);
          else if (engagement && (engagement.valide === false || engagement.tenu === false)) setReussi(false);
        }
      } catch (error) {
        console.error("Erreur chargement journal:", error);
        if (actif) setMessage("Erreur lors du chargement du journal");
      } finally {
        if (actif) setJournalCharge(true);
      }
    };

    charger();
    return () => { actif = false; };
  }, [defi?.id, jourActuel]);

  const enregistrerJournee = async () => {
    if (reussi === null || validationEnCours || etapeValidee) return;

    setValidationEnCours(true);
    setMessage("");
    const maintenant = new Date();
    const engagement = {
      texte: objectif,
      valide: reussi,
      tenu: reussi,
      date_declaration: maintenant.toISOString(),
      date_jour: maintenant.toLocaleDateString("fr-FR"),
      heure_declaration: maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      date_validation: maintenant.toISOString(),
      heure_validation: maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };

    try {
      const sauvegarde = await sauvegarderEngagements(defi.id, jourActuel, [engagement], notePersonnelle);
      if (!sauvegarde?.success) {
        setMessage(sauvegarde?.error || "Impossible d'enregistrer cette journée");
        return;
      }

      const result = await validerEtapeDefi(defi.id, jourActuel, [engagement]);
      if (!result?.success) {
        setMessage(result?.error || "Impossible de valider cette journée");
        return;
      }

      if (result.dejaValidee || result.etapeValidee) {
        setEtapeValidee(true);
        setReussi(true);
        setMessage(result.dejaValidee
          ? "✓ Cette journée était déjà validée. Elle n'a pas été comptée deux fois."
          : `✓ Journée validée ! Progression : ${result.newProgress}/${defi.duree}`);
        if (typeof result.newProgress === "number" && onProgressionUpdate) {
          await onProgressionUpdate(result.newProgress);
        }
      } else {
        setEtapeValidee(false);
        setMessage("Journée enregistrée. Ce n'était pas réussi aujourd'hui, et ce n'est pas grave : le défi continue demain.");
      }
    } catch (error) {
      console.error("Erreur validation défi personnalisé:", error);
      setMessage("Erreur lors de l'enregistrement de la journée");
    } finally {
      setValidationEnCours(false);
    }
  };

  if (!journalCharge) {
    return <div style={{ padding: "40px 0", textAlign: "center", color: "#6B7280" }}>⏳ Chargement...</div>;
  }

  const dateComplete = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{
        background: "linear-gradient(to right, #8B5CF6, #4F46E5)", borderRadius: 16,
        boxShadow: "0 20px 25px -5px rgba(0,0,0,.1)", padding: 24, color: "white"
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: 6 }}>{defi.nom}</h2>
        <p style={{ opacity: .85, marginBottom: 12, textTransform: "capitalize" }}>📆 {dateComplete}</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>📅 Jour {jourActuel} / {defi.duree}</span>
          <span>✅ {defi.progress || 0} jours validés</span>
        </div>
      </div>

      <div style={{
        background: "linear-gradient(to bottom right, #FAF5FF, #FCE7F3)", borderRadius: 16,
        boxShadow: "0 10px 15px -3px rgba(0,0,0,.1)", padding: 24, border: "2px solid #E9D5FF"
      }}>
        <div style={{ fontSize: "2rem", marginBottom: 8 }}>🌙</div>
        <h3 style={{ color: "#581C87", fontSize: "1.3rem", marginBottom: 8 }}>Mon point du jour</h3>
        <p style={{ color: "#6B21A8", marginBottom: 20 }}>Ton défi est déjà ton engagement. Tu n'as rien d'autre à inventer.</p>

        <div style={{ background: "white", borderRadius: 12, padding: 18, border: "2px solid #F3E8FF", marginBottom: 20 }}>
          <div style={{ fontSize: ".8rem", color: "#7E22CE", fontWeight: 700, marginBottom: 6 }}>MON OBJECTIF</div>
          <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#1F2937" }}>{objectif}</div>
        </div>

        {!etapeValidee ? (
          <>
            <p style={{ fontWeight: 700, color: "#374151", marginBottom: 12 }}>Aujourd'hui, est-ce que tu as réussi à respecter cet objectif ?</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <button type="button" onClick={() => setReussi(true)} style={{
                padding: 14, borderRadius: 12, border: reussi === true ? "3px solid #10B981" : "2px solid #D1FAE5",
                background: reussi === true ? "#D1FAE5" : "white", fontWeight: 700, cursor: "pointer"
              }}>✓ Oui</button>
              <button type="button" onClick={() => setReussi(false)} style={{
                padding: 14, borderRadius: 12, border: reussi === false ? "3px solid #A78BFA" : "2px solid #EDE9FE",
                background: reussi === false ? "#EDE9FE" : "white", fontWeight: 700, cursor: "pointer"
              }}>Pas cette fois</button>
            </div>

            <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: 8 }}>📝 Un mot sur ta journée (optionnel)</label>
            <textarea value={notePersonnelle} onChange={e => setNotePersonnelle(e.target.value)}
              placeholder="Ce qui t'a aidé, ce qui a été difficile, ce que tu ressens..." rows={3}
              style={{ width: "100%", padding: 12, border: "2px solid #E9D5FF", borderRadius: 12, fontSize: "1rem", resize: "vertical", marginBottom: 18 }} />

            <button type="button" onClick={enregistrerJournee} disabled={reussi === null || validationEnCours}
              style={{ width: "100%", padding: 16, border: "none", borderRadius: 12, color: "white", fontWeight: 700, fontSize: "1.05rem",
                background: reussi === null ? "#9CA3AF" : "linear-gradient(to right, #9333EA, #DB2777)",
                cursor: reussi === null ? "not-allowed" : "pointer" }}>
              {validationEnCours ? "Enregistrement..." : "Enregistrer ma journée"}
            </button>
          </>
        ) : (
          <div style={{ padding: 16, borderRadius: 12, background: "#D1FAE5", color: "#065F46", fontWeight: 700, textAlign: "center" }}>
            ✓ Cette journée est validée
          </div>
        )}
      </div>

      {message && <div style={{ padding: 16, borderRadius: 12, background: message.startsWith("✓") ? "#ECFDF5" : "#FFFBEB", color: "#374151", fontWeight: 600 }}>{message}</div>}
    </div>
  );
}
