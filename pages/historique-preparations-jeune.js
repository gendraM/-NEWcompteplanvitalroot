
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import HistoriquePreparationsModal from '../components/HistoriquePreparationsModal';
import { supabase } from '../lib/supabaseClient';
import {
  getHistoriquePreparationsJeune,
  getHistoriquePreparationsJeuneSupabase,
  restaurerPreparationJeune,
  supprimerPreparationJeuneDefinitivement
} from '../lib/preparationsJeune';

function getSortDate(preparation) {
  return preparation?.updatedAt || preparation?.createdAt || preparation?.dateFin || preparation?.dateDebut || 0;
}

function mergeHistorique(localHistorique = [], cloudHistorique = []) {
  const byId = new Map();
  const mergedRaw = [...localHistorique, ...cloudHistorique];

  for (const prep of mergedRaw) {
    if (!prep) continue;
    const key = prep.id || `${prep.dateDebut || ''}-${prep.dateFin || ''}-${prep.createdAt || ''}`;
    if (!byId.has(key)) {
      byId.set(key, prep);
      continue;
    }

    const existing = byId.get(key);
    const existingDate = new Date(getSortDate(existing)).getTime();
    const candidateDate = new Date(getSortDate(prep)).getTime();
    if (candidateDate >= existingDate) {
      byId.set(key, { ...existing, ...prep });
    }
  }

  return [...byId.values()].sort((a, b) => new Date(getSortDate(b)).getTime() - new Date(getSortDate(a)).getTime());
}

export default function HistoriquePreparationsJeune() {
  const [historique, setHistorique] = useState([]);
  const [corbeille, setCorbeille] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  const loadHistorique = async (resolvedUserId = userId) => {
    const localHistorique = getHistoriquePreparationsJeune();
    const cloudHistorique = resolvedUserId
      ? await getHistoriquePreparationsJeuneSupabase(resolvedUserId)
      : [];

    setHistorique(mergeHistorique(localHistorique, cloudHistorique));
    if (typeof window !== 'undefined') {
      setCorbeille(JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]'));
    }
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      let resolvedUserId = null;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        resolvedUserId = data?.user?.id || null;
      } catch (e) {
        console.warn('Utilisateur non récupéré pour historique préparations jeune', e);
      }

      if (!mounted) return;
      setUserId(resolvedUserId);
      await loadHistorique(resolvedUserId);
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRestaurer = (id) => {
    restaurerPreparationJeune(id);
    loadHistorique();
  };

  const handleSupprimerDefinitivement = (id) => {
    supprimerPreparationJeuneDefinitivement(id);
    loadHistorique();
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
      userId={userId}
      onRestaurer={handleRestaurer}
      onSupprimerDefinitivement={handleSupprimerDefinitivement}
      onHistoriqueChange={loadHistorique}
      onFermer={() => setShowModal(false)}
    />
  );
}
