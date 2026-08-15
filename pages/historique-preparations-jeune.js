
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import HistoriquePreparationsModal from '../components/HistoriquePreparationsModal';
import { getHistoriquePreparationsJeune, restaurerPreparationJeune, supprimerPreparationJeuneDefinitivement } from '../lib/preparationsJeune';

export default function HistoriquePreparationsJeune() {
  const [historique, setHistorique] = useState([]);
  const [corbeille, setCorbeille] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setHistorique(getHistoriquePreparationsJeune());
    setCorbeille(JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]'));
  }, []);

  const handleRestaurer = (id) => {
    restaurerPreparationJeune(id);
    setHistorique(getHistoriquePreparationsJeune());
    setCorbeille(JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]'));
  };

  const handleSupprimerDefinitivement = (id) => {
    supprimerPreparationJeuneDefinitivement(id);
    setCorbeille(JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]'));
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
