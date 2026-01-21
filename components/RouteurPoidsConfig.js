/**
 * ROUTEUR POIDS CONFIG - Interface configuration routeur poids
 * Phase 1 : Composant dédié configuration profil pour calculs métaboliques
 * Date : 10 janvier 2026
 */

import { useState, useEffect } from 'react';
import { calculerProfilComplet } from '../lib/routeurPoids';

export default function RouteurPoidsConfig({ 
  profilInitial = {}, 
  onSave, 
  afficherCalculs = true 
}) {
  // États formulaire
  const [sexe, setSexe] = useState(profilInitial.sexe || '');
  const [age, setAge] = useState(profilInitial.age || '');
  const [taille, setTaille] = useState(profilInitial.taille || '');
  const [poidsDepart, setPoidsDepart] = useState(profilInitial.poids_de_depart || '');
  const [niveauActivite, setNiveauActivite] = useState(profilInitial.niveau_activite || '');
  const [objectif, setObjectif] = useState(profilInitial.objectif || '');
  
  // États calculs
  const [calculs, setCalculs] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // États accordéons (pour afficher/masquer explications)
  const [bmrOpen, setBmrOpen] = useState(false);
  const [tdeeOpen, setTdeeOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [apportOpen, setApportOpen] = useState(false);

  // Recalcul automatique des indicateurs
  useEffect(() => {
    if (sexe && age && taille && poidsDepart && niveauActivite && objectif) {
      const objetPoids = parseFloat(poidsDepart) > parseFloat(objectif) ? 'perte' : 
                        (parseFloat(poidsDepart) < parseFloat(objectif) ? 'prise' : 'maintien');
      
      const profil = {
        sexe,
        age: parseInt(age),
        taille: parseFloat(taille),
        poids_de_depart: parseFloat(poidsDepart),
        niveau_activite: niveauActivite,
        objectif: objetPoids
      };

      const resultats = calculerProfilComplet(profil);
      setCalculs(resultats);
    } else {
      setCalculs(null);
    }
  }, [sexe, age, taille, poidsDepart, niveauActivite, objectif]);

  // Sauvegarde
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sexe || !age || !taille || !poidsDepart || !niveauActivite || !objectif) {
      setMessage('⚠️ Merci de remplir tous les champs');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const data = {
        sexe,
        age: parseInt(age),
        taille: parseFloat(taille),
        poids_de_depart: parseFloat(poidsDepart),
        niveau_activite: niveauActivite,
        objectif: parseFloat(objectif)
      };

      if (onSave) {
        await onSave(data);
        setMessage('✅ Configuration enregistrée avec succès !');
      }
    } catch (error) {
      setMessage('❌ Erreur lors de l\'enregistrement : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      background: '#fff',
      borderRadius: 16,
      padding: '2rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      maxWidth: 600,
      margin: '0 auto'
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontWeight: 600,
      color: '#555',
      marginBottom: '0.5rem',
      fontSize: '0.95rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e0e0e0',
      borderRadius: 8,
      fontSize: '1rem',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e0e0e0',
      borderRadius: 8,
      fontSize: '1rem',
      background: '#fff',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    hint: {
      fontSize: '0.85rem',
      color: '#888',
      marginTop: '0.25rem',
      fontStyle: 'italic'
    },
    calculsBox: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      borderRadius: 12,
      padding: '1.5rem',
      marginTop: '2rem'
    },
    calculsTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    explicationBox: {
      fontSize: '0.85rem',
      opacity: 0.9,
      marginBottom: '1rem',
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.15)',
      borderRadius: 8,
      borderLeft: '3px solid rgba(255,255,255,0.5)'
    },
    calculsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1rem'
    },
    calculItem: {
      background: 'rgba(255,255,255,0.2)',
      padding: '1rem',
      borderRadius: 8
    },
    calculLabel: {
      fontSize: '0.85rem',
      opacity: 0.9,
      marginBottom: '0.25rem'
    },
    calculValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    disclaimer: {
      fontSize: '0.8rem',
      opacity: 0.8,
      marginTop: '1rem',
      fontStyle: 'italic'
    },
    accordeonButton: {
      background: 'rgba(255,255,255,0.2)',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '0.4rem 0.8rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: '0.5rem',
      transition: 'background 0.2s',
      width: '100%'
    },
    accordeonContent: {
      marginTop: '0.75rem',
      padding: '1rem',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: 8,
      fontSize: '0.85rem',
      lineHeight: '1.6'
    },
    button: {
      background: 'linear-gradient(90deg, #27ae60 0%, #2980b9 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: 24,
      padding: '1rem 2rem',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.6 : 1,
      width: '100%',
      marginTop: '1rem',
      transition: 'transform 0.2s'
    },
    message: {
      padding: '1rem',
      borderRadius: 8,
      marginTop: '1rem',
      textAlign: 'center',
      fontWeight: 500,
      background: message.includes('✅') ? '#d4edda' : '#f8d7da',
      color: message.includes('✅') ? '#155724' : '#721c24',
      border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        ⚙️ Configuration Routeur Poids
      </div>

      <form onSubmit={handleSubmit}>
        {/* Sexe */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Sexe *
          </label>
          <select
            style={styles.select}
            value={sexe}
            onChange={(e) => setSexe(e.target.value)}
            required
          >
            <option value="">-- Sélectionner --</option>
            <option value="F">Femme</option>
            <option value="M">Homme</option>
          </select>
          <div style={styles.hint}>
            Utilisé pour le calcul du métabolisme de base (BMR)
          </div>
        </div>

        {/* Âge */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Âge (années) *</label>
          <input
            style={styles.input}
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="18"
            max="100"
            required
          />
        </div>

        {/* Taille */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Taille (cm) *</label>
          <input
            style={styles.input}
            type="number"
            value={taille}
            onChange={(e) => setTaille(e.target.value)}
            min="140"
            max="220"
            step="0.1"
            required
          />
        </div>

        {/* Poids actuel */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Poids actuel (kg) *</label>
          <input
            style={styles.input}
            type="number"
            value={poidsDepart}
            onChange={(e) => setPoidsDepart(e.target.value)}
            min="40"
            max="200"
            step="0.1"
            required
          />
        </div>

        {/* Niveau activité */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Niveau d'activité physique *
          </label>
          <select
            style={styles.select}
            value={niveauActivite}
            onChange={(e) => setNiveauActivite(e.target.value)}
            required
          >
            <option value="">-- Sélectionner --</option>
            <option value="sedentaire">🪑 Sédentaire (peu ou pas d'exercice)</option>
            <option value="modere">🚶 Modéré (exercice 3-5 jours/semaine)</option>
            <option value="actif">🏃 Actif (exercice intense 6-7 jours/semaine)</option>
            <option value="intense">💪 Très actif (sportif professionnel)</option>
          </select>
          <div style={styles.hint}>
            Détermine votre dépense énergétique quotidienne (TDEE)
          </div>
        </div>

        {/* Objectif poids */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Objectif de poids (kg) *</label>
          <input
            style={styles.input}
            type="number"
            value={objectif}
            onChange={(e) => setObjectif(e.target.value)}
            min="40"
            max="200"
            step="0.1"
            required
          />
        </div>

        {/* Bouton */}
        <button 
          type="submit" 
          style={styles.button}
          disabled={loading}
          onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          {loading ? '⏳ Enregistrement...' : '💾 Enregistrer la configuration'}
        </button>

        {/* Message */}
        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}
      </form>

      {/* Calculs automatiques */}
      {afficherCalculs && calculs && (
        <div style={styles.calculsBox}>
          <div style={styles.calculsTitle}>
            📊 Vos indicateurs personnalisés
          </div>
          
          <div style={{fontSize: '0.85rem', opacity: 0.85, marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.15)', borderRadius: 8, borderLeft: '3px solid rgba(255,255,255,0.5)'}}>
            💡 <strong>À savoir :</strong> Plus votre poids actuel est élevé, plus votre métabolisme brûle de calories. Quand vous perdez du poids, vos besoins caloriques diminuent naturellement.
          </div>
          
          <div style={styles.calculsGrid}>
            {/* BMR */}
            <div style={styles.calculItem}>
              <div style={styles.calculLabel}>🔥 BMR (métabolisme de base)</div>
              <div style={styles.calculValue}>{calculs.bmr} kcal/jour</div>
              <button 
                style={styles.accordeonButton}
                onClick={() => setBmrOpen(!bmrOpen)}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                {bmrOpen ? '▲ Masquer' : '▼ En savoir plus'}
              </button>
              {bmrOpen && (
                <div style={styles.accordeonContent}>
                  <strong>📖 Explication :</strong><br/>
                  C'est l'énergie que votre corps brûle au repos total (respirer, digérer, faire battre le cœur...).
                  <br/><br/>
                  <strong>🧮 Votre cas :</strong><br/>
                  {sexe === 'F' ? 'Femme' : 'Homme'}, {age} ans, {taille < 10 ? Math.round(taille * 100) : taille} cm, {poidsDepart} kg<br/>
                  → BMR = {calculs.bmr} kcal/jour
                  <br/><br/>
                  <strong>⚡ Concrètement :</strong><br/>
                  Vous brûlez <strong>{Math.round(calculs.bmr / 24)} kcal/heure</strong> même en dormant !
                </div>
              )}
            </div>
            
            {/* TDEE */}
            <div style={styles.calculItem}>
              <div style={styles.calculLabel}>⚡ TDEE (dépense totale)</div>
              <div style={styles.calculValue}>{calculs.tdee} kcal/jour</div>
              <button 
                style={styles.accordeonButton}
                onClick={() => setTdeeOpen(!tdeeOpen)}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                {tdeeOpen ? '▲ Masquer' : '▼ En savoir plus'}
              </button>
              {tdeeOpen && (
                <div style={styles.accordeonContent}>
                  <strong>📖 Explication :</strong><br/>
                  Total Daily Energy Expenditure = BMR + activités quotidiennes (marcher, escaliers, sport...).
                  <br/><br/>
                  <strong>🧮 Votre cas :</strong><br/>
                  BMR ({calculs.bmr} kcal) × Niveau {niveauActivite}<br/>
                  → TDEE = {calculs.tdee} kcal/jour
                  <br/><br/>
                  <strong>⚡ Concrètement :</strong><br/>
                  C'est ce que vous brûlez <strong>réellement chaque jour</strong> avec votre mode de vie actuel.
                </div>
              )}
            </div>
            
            {/* Budget extras */}
            <div style={styles.calculItem}>
              <div style={styles.calculLabel}>🎁 Budget extras hebdo</div>
              <div style={styles.calculValue}>{calculs.budgetExtras} kcal</div>
              <button 
                style={styles.accordeonButton}
                onClick={() => setBudgetOpen(!budgetOpen)}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                {budgetOpen ? '▲ Masquer' : '▼ En savoir plus'}
              </button>
              {budgetOpen && (
                <div style={styles.accordeonContent}>
                  <strong>📖 Explication :</strong><br/>
                  Votre "bonus" hebdomadaire pour petits plaisirs sans compromettre vos objectifs.
                  <br/><br/>
                  <strong>🧮 Votre cas :</strong><br/>
                  Budget : {calculs.budgetExtras} kcal/semaine<br/>
                  → Soit <strong>{Math.round(calculs.budgetExtras / 7)} kcal/jour</strong>
                  <br/><br/>
                  <strong>🍫 Exemples :</strong><br/>
                  • 1 carré chocolat (70 kcal)<br/>
                  • 15g fromage (60 kcal)<br/>
                  • 1 verre vin (100 kcal)<br/>
                  • 1 petit yaourt sucré (80 kcal)
                </div>
              )}
            </div>
            
            {/* Apport calorique cible */}
            <div style={styles.calculItem}>
              <div style={styles.calculLabel}>🎯 Apport calorique cible</div>
              <div style={styles.calculValue}>{calculs.apport_calorique_cible} kcal/jour</div>
              <button 
                style={styles.accordeonButton}
                onClick={() => setApportOpen(!apportOpen)}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                {apportOpen ? '▲ Masquer' : '▼ En savoir plus'}
              </button>
              {apportOpen && (
                <div style={styles.accordeonContent}>
                  <strong>📖 Explication :</strong><br/>
                  Votre objectif calorique quotidien pour {parseFloat(poidsDepart) > parseFloat(objectif) ? 'perdre du poids' : (parseFloat(poidsDepart) < parseFloat(objectif) ? 'prendre du poids' : 'maintenir votre poids')}.
                  <br/><br/>
                  <strong>🧮 Votre cas :</strong><br/>
                  {parseFloat(poidsDepart) > parseFloat(objectif) && (
                    <>
                      Déficit : {calculs.tdee - calculs.apport_calorique_cible} kcal/jour<br/>
                      ({calculs.tdee} TDEE - {calculs.apport_calorique_cible} cible)
                    </>
                  )}
                  {parseFloat(poidsDepart) === parseFloat(objectif) && (
                    <>Maintien : {calculs.apport_calorique_cible} kcal/jour (= TDEE)</>
                  )}
                  {parseFloat(poidsDepart) < parseFloat(objectif) && (
                    <>
                      Surplus : {calculs.apport_calorique_cible - calculs.tdee} kcal/jour<br/>
                      ({calculs.apport_calorique_cible} cible - {calculs.tdee} TDEE)
                    </>
                  )}
                  <br/><br/>
                  <strong>📉 Estimation :</strong><br/>
                  {parseFloat(poidsDepart) > parseFloat(objectif) && (
                    <>≈ {Math.round((calculs.tdee - calculs.apport_calorique_cible) * 30 / 7700)} kg de perte/mois</>
                  )}
                  {parseFloat(poidsDepart) < parseFloat(objectif) && (
                    <>≈ {Math.round((calculs.apport_calorique_cible - calculs.tdee) * 30 / 7700)} kg de prise/mois</>
                  )}
                  {parseFloat(poidsDepart) === parseFloat(objectif) && (
                    <>Stabilisation du poids actuel</>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={styles.disclaimer}>
            {calculs.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
