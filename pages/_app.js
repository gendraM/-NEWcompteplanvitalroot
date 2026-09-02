import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SupabaseProvider, supabase } from '../lib/supabaseClient';
import { AuthProvider } from '../contexts/AuthContext';
import { DefisProvider } from '../components/DefisContext';
import BandeauCompletionProfil from '../components/BandeauCompletionProfil';
import Navigation from '../components/Navigation';
import ModeTestParcoursJeune from '../components/ModeTestParcoursJeune';
import MyWayDashboardEntry from '../components/MyWayDashboardEntry';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [afficherBandeau, setAfficherBandeau] = useState(false);
  const [profilVerifie, setProfilVerifie] = useState(false);

  useEffect(() => {
    const verifierProfilComplet = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setProfilVerifie(true);
          return;
        }

        const { data: profil, error } = await supabase
          .from('profil')
          .select('sexe, niveau_activite')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && profil) {
          if (!profil.sexe || !profil.niveau_activite) {
            setAfficherBandeau(true);
          }
        }
        setProfilVerifie(true);
      } catch (err) {
        console.error('Erreur vérification profil:', err);
        setProfilVerifie(true);
      }
    };

    verifierProfilComplet();
  }, []);

  const masquerBandeau = () => {
    setAfficherBandeau(false);
  };

  return (
    <SupabaseProvider>
      <AuthProvider>
        <DefisProvider>
          <Navigation />
          <ModeTestParcoursJeune />
          {profilVerifie && afficherBandeau && <BandeauCompletionProfil onClose={masquerBandeau} />}
          {router.pathname === '/tableau-de-bord' && <MyWayDashboardEntry />}
          <Component {...pageProps} />
        </DefisProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default MyApp;
