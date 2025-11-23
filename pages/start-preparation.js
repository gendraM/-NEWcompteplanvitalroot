import { useRouter } from 'next/router';
import { useState } from 'react';
import StartPreparationModal from '../components/StartPreparationModal';

export default function StartPreparationPage() {
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();

  const [confirmation, setConfirmation] = useState(false);
  const handleStartPreparation = (data) => {
    // Synchronisation d’état avec la page principale si pop-up
    if (window.opener) {
      window.opener.postMessage({ type: 'preparationStarted', data }, '*');
    }
    // Sauvegarde explicite dans localStorage pour /preparation-jeune
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('dateJeune', data.startDate);
      window.localStorage.setItem('dureeJeune', data.duration);
      window.localStorage.setItem('goal', data.goal || '');
      window.localStorage.setItem('preparationActive', 'true');
      window.localStorage.setItem('preparationData', JSON.stringify(data));
      if (data.msgTexte) window.localStorage.setItem('messagePersoPreparation', data.msgTexte);
    }
    setConfirmation(true);
    setShowModal(false);
    // Redirection automatique après confirmation
    setTimeout(() => {
      window.location.href = '/preparation-jeune';
    }, 1800);
  };

  // Si la modale est fermée sans validation, fermer la fenêtre pop-up
  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      if (window.opener) window.close();
    }, 200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <StartPreparationModal isOpen={showModal} onClose={handleClose} onSave={handleStartPreparation} />
      {confirmation && (
        <div style={{background:'#e0ffe0',border:'2px solid #43D9A3',borderRadius:12,padding:'2rem',fontSize:'1.2rem',color:'#15803d',fontWeight:600,boxShadow:'0 2px 12px #43d9a322',position:'absolute',top:'30%',left:'50%',transform:'translate(-50%,-30%)',zIndex:1000}}>
          ✅ Préparation enregistrée avec succès !<br/>
          Redirection vers la page de préparation...
        </div>
      )}
    </div>
  );
}
