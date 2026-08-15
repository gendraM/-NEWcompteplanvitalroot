
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import HistoriquePreparationsModal from '../components/HistoriquePreparationsModal';
import { useAuth } from '../contexts/AuthContext';
import {
  getHistoriquePreparationsJeune,
  getHistoriquePreparationsJeuneSupabase,
  restaurerPreparationJeune,
  restaurerPreparationJeuneSupabase,
  supprimerPreparationJeuneDefinitivement,
  supprimerPreparationJeuneSupabase
} from '../lib/preparationsJeune';

export default function HistoriquePreparationsJeune() {
  const [historique, setHistorique] = useState([]);
  const [corbeille, setCorbeille] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const chargerHistorique = async () => {
      const historiqueLocal = getHistoriquePreparationsJeune();
      const corbeilleLocale = JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]');

      if (!user) {
        setHistorique(historiqueLocal);
        setCorbeille(corbeilleLocale);
        return;
      }

      try {
        const historiqueCloud = await getHistoriquePreparationsJeuneSupabase(user.id);
        const actives = historiqueCloud.filter(prep => prep.statut !== 'supprime');
        const supprimees = historiqueCloud.filter(prep => prep.statut === 'supprime');
        setHistorique(actives.length > 0 ? actives : historiqueLocal);
        setCorbeille(supprimees.length > 0 ? supprimees : corbeilleLocale);
      } catch (error) {
        console.warn('Historique Supabase indisponible, fallback localStorage:', error);
        setHistorique(historiqueLocal);
        setCorbeille(corbeilleLocale);
      }
    };

    chargerHistorique();
  }, [authLoading, user]);

  const handleRestaurer = async (id) => {
    if (user) {
      try {
        await restaurerPreparationJeuneSupabase(user.id, id);
      } catch (error) {
        console.warn('Restauration Supabase indisponible, restauration locale:', error);
      }
    }
    restaurerPreparationJeune(id);
    const restauree = corbeille.find(prep => prep.id === id);
    if (restauree) {
      setHistorique(prev => [{ ...restauree, statut: 'termine' }, ...prev]);
      setCorbeille(prev => prev.filter(prep => prep.id !== id));
    }
  };

  const handleSupprimerDefinitivement = async (id) => {
    if (user) {
      await supprimerPreparationJeuneSupabase(user.id, id);
    }
    supprimerPreparationJeuneDefinitivement(id);
    setCorbeille(prev => prev.filter(prep => prep.id !== id));
  };

  useEffect(() => {
    if (!showModal) {
      router.replace('/preparation-jeune');
    }
  }, [showModal, router]);
  if (!showModal) return null;

  return (
    <HistoriquePreparationsModal
      historiquePreparations={historique}
      preparationsSupprimees={corbeille}
      onRestaurer={handleRestaurer}
      onSupprimerDefinitivement={handleSupprimerDefinitivement}
      onFermer={() => setShowModal(false)}
    />
  );
}
