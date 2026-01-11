/**
 * BUDGET EXTRAS CARD - Affichage budget calorique extras hebdomadaire
 * Phase 3 : Budget Calorique
 * Date : 10 janvier 2026
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculerProfilComplet } from '../lib/routeurPoids';

export default function BudgetExtrasCard({ userId }) {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    
    chargerBudgetExtras();
  }, [userId]);

  async function chargerBudgetExtras() {
    try {
      setLoading(true);
      setError(null);

      // 1. Récupérer profil utilisateur (pour calculs routeur poids)
      const { data: profil, error: profilError } = await supabase
        .from('profil')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profilError) throw profilError;

      // 2. Vérifier si profil complet (sexe, niveau_activite)
      if (!profil.sexe || !profil.niveau_activite) {
        setBudgetData({
          profilIncomplet: true,
          message: "Complétez votre profil (sexe, niveau d'activité) pour voir votre budget extras."
        });
        setLoading(false);
        return;
      }

      // 3. Calculer budget via routeur poids
      const calculs = calculerProfilComplet(profil);
      if (!calculs) {
        throw new Error('Impossible de calculer le budget extras');
      }

      // 4. Obtenir date lundi de la semaine actuelle
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, remonter à lundi précédent
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);
      const dateSemaine = monday.toISOString().split('T')[0];

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
        .gte('date_creation', dateSemaine)
        .lt('date_creation', new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

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
        tdee: calculs.tdee
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
      marginBottom: '1rem'
    }}>
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
    </div>
  );
}
