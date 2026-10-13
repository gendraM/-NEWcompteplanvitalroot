import { useState, useEffect } from 'react';
import { SupabaseProvider, supabase } from '../lib/supabaseClient';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { DefisProvider } from '../components/DefisContext';
import BandeauCompletionProfil from '../components/BandeauCompletionProfil';
import Navigation from '../components/Navigation';
import ModeTestParcoursJeune from '../components/ModeTestParcoursJeune';
import { chargerProfilNavigation } from '../lib/navigationOwnedData';

function AppContent({ Component, pageProps }) {
  const { user, loading: authLoading } = useAuth();
  const [profilUserId, setProfilUserId] = useState(null);
  const [afficherBandeau, setAfficherBandeau] = useState(false);
  const [profilVerifie, setProfilVerifie] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAfficherBandeau(false);
    setProfilVerifie(false);
    setProfilUserId(null);
    if (authLoading || !user?.id) return;
    const verifierProfilComplet = async () => {
      try {
        const profil = await chargerProfilNavigation(supabase, user.id);
        if (cancelled) return;
        setAfficherBandeau(Boolean(profil && (!profil.sexe || !profil.niveau_activite)));
        setProfilUserId(user.id);
        setProfilVerifie(true);
      } catch {
        if (!cancelled) setProfilVerifie(true);
      }
    };
    verifierProfilComplet();
    return () => { cancelled = true; };
  }, [user?.id, authLoading]);

  return <>
    <Navigation />
    <ModeTestParcoursJeune />
    {profilVerifie && profilUserId === user?.id && afficherBandeau && <BandeauCompletionProfil onClose={() => setAfficherBandeau(false)} />}
    <Component {...pageProps} />
  </>;
}

function MyApp(props) {
  return <SupabaseProvider>
    <AuthProvider>
      <DefisProvider><AppContent {...props} /></DefisProvider>
    </AuthProvider>
  </SupabaseProvider>;
}

export default MyApp;
