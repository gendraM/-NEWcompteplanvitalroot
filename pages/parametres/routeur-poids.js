/**
 * PAGE PARAMÈTRES - ROUTEUR POIDS
 * Interface dédiée configuration routeur poids
 * Phase 1
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import RouteurPoidsConfig from '../../components/RouteurPoidsConfig';
import Link from 'next/link';

export default function RouteurPoidsPage() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement profil existant
  useEffect(() => {
    async function fetchProfil() {
      const { data, error } = await supabase
        .from('profil')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setProfil(data);
      }
      setLoading(false);
    }

    fetchProfil();
  }, []);

  // Sauvegarde configuration
  const handleSave = async (data) => {
    if (!profil) {
      // Création nouveau profil
      const { error } = await supabase
        .from('profil')
        .insert(data);
      
      if (error) throw error;
    } else {
      // Mise à jour profil existant
      const { error } = await supabase
        .from('profil')
        .update(data)
        .eq('id', profil.id);
      
      if (error) throw error;
    }

    // Recharger profil
    const { data: updated } = await supabase
      .from('profil')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (updated) {
      setProfil(updated);
    }
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    },
    header: {
      textAlign: 'center',
      color: '#fff',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    subtitle: {
      fontSize: '1.1rem',
      opacity: 0.9
    },
    backButton: {
      background: 'rgba(255,255,255,0.9)',
      color: '#667eea',
      border: '2px solid rgba(255,255,255,1)',
      borderRadius: 24,
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      marginBottom: '2rem',
      display: 'inline-block',
      textDecoration: 'none',
      transition: 'all 0.2s',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    },
    loadingBox: {
      background: '#fff',
      borderRadius: 16,
      padding: '3rem',
      textAlign: 'center',
      maxWidth: 600,
      margin: '0 auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>
          <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⏳</div>
          <div style={{fontSize: '1.2rem', color: '#666'}}>
            Chargement de votre profil...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Routeur Poids</h1>
        <p style={styles.subtitle}>
          Configuration de vos indicateurs métaboliques personnalisés
        </p>
      </div>

      <Link 
        href="/"
        style={styles.backButton}
        onMouseEnter={(e) => {
          e.target.style.background = '#fff';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.9)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        ← Retour à l'accueil
      </Link>

      <RouteurPoidsConfig
        profilInitial={profil || {}}
        onSave={handleSave}
        afficherCalculs={true}
      />
    </div>
  );
}
