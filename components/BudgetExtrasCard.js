/**
 * BUDGET EXTRAS CARD - Affichage budget calorique extras hebdomadaire
 * Phase 3 : Budget Calorique
 * Date : 10 janvier 2026
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculerProfilComplet } from '../lib/routeurPoids';

export default function BudgetExtrasCard({ userId, selectedDate }) {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modeLocalStorage, setModeLocalStorage] = useState(false);

  useEffect(() => {
    // Mode localStorage : pas d'authentification
    if (!userId) {
      setModeLocalStorage(true);
    }
    chargerBudgetExtras();
    // eslint-disable-next-line
  }, [userId, selectedDate]);

  async function chargerBudgetExtras() {
    try {
      setLoading(true);
      setError(null);

      // 1. Récupérer profil utilisateur (pour calculs routeur poids)
      // MODE LOCALSTORAGE : sans filtre user_id
      const query = supabase.from('profil').select('*').order('created_at', { ascending: false }).limit(1);
      
      // MODE AUTHENTIFIÉ : avec filtre user_id
      if (userId) {
        query.eq('user_id', userId);
      }
      
      const { data: profil, error: profilError } = await query.single();

      if (profilError) throw profilError;

      // 2. Vérifier si profil complet (sexe, niveau_activite)
      if (!profil || !profil.sexe || !profil.niveau_activite) {
        setBudgetData({
          profilIncomplet: true,
          message: "Complétez votre profil (sexe, niveau d'activité) pour voir votre budget extras."
        });
        setLoading(false);
        return;
      }

      // IMPORTANT: Transformer objectif kg → objectif type (perte/maintien/prise)
      let objectifType = 'perte'; // Défaut
      if (profil.poids_de_depart && profil.objectif) {
        if (profil.poids_de_depart > profil.objectif) {
          objectifType = 'perte';
        } else if (profil.poids_de_depart < profil.objectif) {
          objectifType = 'prise';
        } else {
          objectifType = 'maintien';
        }
      }

      // Créer profil complet pour calculs
      const profilComplet = {
        sexe: profil.sexe,
        age: profil.age,
        taille: profil.taille,
        poids_de_depart: profil.poids_de_depart,
        niveau_activite: profil.niveau_activite,
        objectif: objectifType // Ici c'est le type, pas le kg
      };

      console.log('[BudgetExtrasCard] Profil pour calcul:', profilComplet);

      // 3. Calculer budget via routeur poids
      const calculs = calculerProfilComplet(profilComplet);
      console.log('[BudgetExtrasCard] Résultat calculs:', calculs);
      
      if (!calculs) {
        throw new Error(`Impossible de calculer le budget extras. Profil: ${JSON.stringify(profilComplet)}`);
      }

      // 4. Obtenir date lundi de la semaine de référence (selectedDate ou aujourd'hui)
      let refDate = selectedDate ? new Date(selectedDate) : new Date();
      refDate.setHours(0, 0, 0, 0);
      const dayOfWeek = refDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(refDate);
      monday.setDate(refDate.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);
      const dateSemaine = monday.toISOString().split('T')[0];
      // Calcul du dimanche inclus (fin de semaine = dimanche 23:59:59)
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      const finSemaine = sunday.toISOString().split('T')[0];
      // Pour affichage période
      function fmt(d) {
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      const periodeSemaine = `Semaine du ${fmt(monday)} au ${fmt(sunday)}`;

      // ═══════════════════════════════════════════════════════════
      // MODE LOCALSTORAGE : Calcul simplifié sans table extras_budget
      // ═══════════════════════════════════════════════════════════
      if (!userId) {
        // Récupérer extras de la semaine directement
        console.log('[BudgetExtrasCard] Recherche extras entre', dateSemaine, 'et', finSemaine);
        

        const { data: repas, error: repasError } = await supabase
          .from('repas_reels')
          .select('kcal, date, aliment, est_extra')
          .eq('est_extra', true)
          .gte('date', dateSemaine)
          .lte('date', finSemaine); // Inclure le dimanche

        if (repasError) throw repasError;

        // Filtrage JS strict sur la période semaine (pour éviter tout débordement)
        const repasFiltres = (repas || []).filter(r => {
          const d = new Date(r.date);
          d.setHours(0,0,0,0);
          return d >= monday && d <= sunday;
        });

        console.log('[BudgetExtrasCard] Extras trouvés (filtrés):', repasFiltres);
        console.log('[BudgetExtrasCard] Nombre d\'extras:', repasFiltres.length);

        // Afficher détail de chaque extra
        repasFiltres.forEach((r, i) => {
          console.log(`  Extra ${i+1}: ${r.aliment} - ${r.kcal} kcal (${r.date})`);
        });

        const budgetConsomme = repasFiltres.reduce((sum, r) => sum + (r.kcal || 0), 0);
        console.log('[BudgetExtrasCard] Budget consommé:', budgetConsomme, 'kcal');
        const budgetLibre = calculs.budgetExtras - budgetConsomme;
        const pourcentageConsomme = Math.round((budgetConsomme / calculs.budgetExtras) * 100);

        setBudgetData({
          profilIncomplet: false,
          modeLocalStorage: true,
          budget_hebdo: calculs.budgetExtras,
          budget_consomme: budgetConsomme,
          budget_reserve: 0,
          budget_libre: budgetLibre,
          pourcentage_consomme: pourcentageConsomme,
          objectif: objectifType,
          tdee: calculs.tdee,
          extras_detail: repasFiltres, // Liste filtrée des extras pour affichage
          periodeSemaine
        });

        setLoading(false);
        return;
      }

      // ═══════════════════════════════════════════════════════════
      // MODE AUTHENTIFIÉ : Utilisation table extras_budget
      // ═══════════════════════════════════════════════════════════

      // 5. Récupérer ou créer entrée budget pour cette semaine
      let { data: budgetSemaine, error: budgetError } = await supabase
        .from('extras_budget')
        .select('*')
        .eq('user_id', userId)
        .eq('date_semaine', dateSemaine)
        .maybeSingle();

      if (budgetError) throw budgetError;

      // Si pas de budget pour cette semaine, le créer
      if (!budgetSemaine) {
        const { data: nouveauBudget, error: createError } = await supabase
          .from('extras_budget')
          .insert({
            user_id: userId,
            date_semaine: dateSemaine,
            budget_hebdo: calculs.budgetExtras,
            budget_consomme: 0,
            budget_reserve: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        budgetSemaine = nouveauBudget;
      } else {
        // Mettre à jour budget_hebdo si profil a changé
        if (budgetSemaine.budget_hebdo !== calculs.budgetExtras) {
          const { data: budgetMisAJour, error: updateError } = await supabase
            .from('extras_budget')
            .update({ budget_hebdo: calculs.budgetExtras })
            .eq('id', budgetSemaine.id)
            .select()
            .single();

          if (updateError) throw updateError;
          budgetSemaine = budgetMisAJour;
        }
      }

      // 6. Calculer budget consommé cette semaine (somme kcal extras)
      const { data: repas, error: repasError } = await supabase
        .from('repas_reels')
        .select('kcal')
        .eq('user_id', userId)
        .eq('est_extra', true)
        .gte('date', dateSemaine)
        .lte('date', finSemaine); // Inclure le dimanche

      if (repasError) throw repasError;

      const budgetConsomme = repas.reduce((sum, r) => sum + (r.kcal || 0), 0);

      // Mettre à jour budget_consomme dans BDD
      if (budgetConsomme !== budgetSemaine.budget_consomme) {
        const { error: updateConsommeError } = await supabase
          .from('extras_budget')
          .update({ budget_consomme: budgetConsomme })
          .eq('id', budgetSemaine.id);

        if (updateConsommeError) throw updateConsommeError;
        budgetSemaine.budget_consomme = budgetConsomme;
      }

      // 7. Construire données pour affichage
      const budgetLibre = budgetSemaine.budget_hebdo - budgetSemaine.budget_consomme - budgetSemaine.budget_reserve;
      const pourcentageConsomme = Math.round((budgetSemaine.budget_consomme / budgetSemaine.budget_hebdo) * 100);

      setBudgetData({
        profilIncomplet: false,
        budget_hebdo: budgetSemaine.budget_hebdo,
        budget_consomme: budgetSemaine.budget_consomme,
        budget_reserve: budgetSemaine.budget_reserve,
        budget_libre: budgetLibre,
        pourcentage_consomme: pourcentageConsomme,
        objectif: profil.objectif || 'perte',
        tdee: calculs.tdee,
        periodeSemaine
      });

      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement budget extras:', err);
      setError(err.message);
      setLoading(false);
    }
  }

  // États de chargement et erreur
  if (loading) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: 8 }}>
        Chargement budget extras...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', background: '#ffe5e5', borderRadius: 8, color: '#d32f2f' }}>
        ⚠️ Erreur : {error}
      </div>
    );
  }

  if (!budgetData) return null;

  // Profil incomplet : afficher message CTA
  if (budgetData.profilIncomplet) {
    return (
      <div style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
        borderRadius: 12,
        color: '#fff',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          💰 Budget Extras Personnalisé
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '1rem' }}>
          {budgetData.message}
        </div>
        <a 
          href="/parametres/routeur-poids" 
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: '#fff',
            color: '#19547b',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Compléter mon profil →
        </a>
      </div>
    );
  }

  // Déterminer couleur selon niveau de consommation
  let couleurBudget = '#4caf50'; // Vert : budget OK
  if (budgetData.pourcentage_consomme >= 100) {
    couleurBudget = '#f44336'; // Rouge : dépassement
  } else if (budgetData.pourcentage_consomme >= 80) {
    couleurBudget = '#ff9800'; // Orange : attention
  }

  return (
    <div style={{
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 12,
      color: '#fff',
      marginBottom: '1rem',
      position: 'relative'
    }}>
      {/* Affichage de la période de la semaine de référence */}
      <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: 0.2 }}>
        📅 {budgetData.periodeSemaine}
      </div>
      {/* Badge mode localStorage */}
      {budgetData.modeLocalStorage && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          padding: '0.25rem 0.5rem',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: 4,
          fontSize: '0.7rem',
          fontWeight: 'bold'
        }}>
          MODE TEST
        </div>
      )}
      
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        💰 Budget Extras Hebdomadaire
      </div>

      {/* Budget total */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '1rem',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: 8
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Budget total</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {budgetData.budget_hebdo} kcal
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          Objectif : {budgetData.objectif === 'perte' ? 'Perte' : budgetData.objectif === 'maintien' ? 'Maintien' : 'Prise'}
        </div>
      </div>

      {/* Barre de progression */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '0.85rem',
          marginBottom: '0.5rem',
          opacity: 0.95
        }}>
          <span>Consommé : {budgetData.budget_consomme} kcal</span>
          <span>{budgetData.pourcentage_consomme}%</span>
        </div>
        <div style={{ 
          height: 12, 
          background: 'rgba(255,255,255,0.3)', 
          borderRadius: 6,
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${Math.min(budgetData.pourcentage_consomme, 100)}%`, 
            height: '100%', 
            background: couleurBudget,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Budget libre */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem',
        background: budgetData.budget_libre < 0 ? 'rgba(244,67,54,0.3)' : 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        border: budgetData.budget_libre < 0 ? '2px solid #f44336' : 'none'
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
            {budgetData.budget_libre < 0 ? '⚠️ Dépassement' : '✅ Budget disponible'}
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
            {budgetData.budget_libre} kcal
          </div>
        </div>
        {budgetData.budget_reserve > 0 && (
          <div style={{ fontSize: '0.8rem', opacity: 0.85, textAlign: 'right' }}>
            <div>Réservé</div>
            <div style={{ fontWeight: 'bold' }}>{budgetData.budget_reserve} kcal</div>
          </div>
        )}
      </div>

      {/* Message selon état budget */}
      {budgetData.budget_libre < 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: 8,
          fontSize: '0.85rem'
        }}>
          <strong>💡 Pas de panique !</strong><br/>
          Le budget extras se réinitialise chaque lundi. Les calories non consommées favorisent votre perte de poids.
        </div>
      )}

      {budgetData.budget_libre > 0 && budgetData.budget_libre < 150 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: 8,
          fontSize: '0.85rem'
        }}>
          <strong>⚠️ Budget bientôt épuisé</strong><br/>
          Il vous reste environ 1 mini extra (&lt; 150 kcal).
        </div>
      )}

      {/* DÉTAIL DES EXTRAS CONSOMMÉS */}
      {budgetData.extras_detail && budgetData.extras_detail.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: 'rgba(255,255,255,0.15)', 
          borderRadius: 8
        }}>
          <div style={{ 
            fontSize: '0.95rem', 
            fontWeight: 'bold', 
            marginBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>📋 Extras consommés cette semaine ({budgetData.extras_detail.length})</span>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {budgetData.extras_detail.map((extra, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: index < budgetData.extras_detail.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <span style={{ opacity: 0.8 }}>
                    {new Date(extra.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                  </span>
                  {' • '}
                  <span style={{ fontWeight: 'bold' }}>{extra.aliment || 'Sans nom'}</span>
                </div>
                <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {extra.kcal} kcal
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
