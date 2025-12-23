import React, { useState, useEffect } from 'react';

/**
 * Composant Timer intégré pour Phase 1 
 * Affiche les horaires recommandés et notifications douces
 * S'intègre harmonieusement avec le système de validation existant
 */
export default function TimerPhase1({ jourNum, onNotificationDouce }) {
  const [heureActuelle, setHeureActuelle] = useState(new Date());
  const [notificationsAffiches, setNotificationsAffiches] = useState([]);

  // Horaires Phase 1 selon documentation officielle
  const horairesPhase1 = [
    { heure: '08:00', label: '8h00', aliments: jourNum === 1 ? 'Bouillon de légumes (150-200ml)' : 'Bouillon de légumes (150-200ml)' },
    { heure: '11:00', label: '11h00', aliments: 'Eau citronnée ou eau de cuisson légumes (150ml)' },
    { heure: '13:00', label: '13h00', aliments: jourNum === 1 ? 'Bouillon (200ml)' : 'Bouillon (200ml) + Purée lisse (100g)' },
    { heure: '16:00', label: '16h00', aliments: 'Jus dilué (100-150ml) ou bouillon' },
    { heure: '19:00', label: '19h00', aliments: jourNum === 1 ? 'Bouillon (200ml)' : 'Bouillon (200ml) + Purée lisse (100-150g)' }
  ];

  // Mise à jour de l'heure chaque minute
  useEffect(() => {
    const interval = setInterval(() => {
      setHeureActuelle(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Notifications douces 15 min avant chaque prise
  useEffect(() => {
    const maintenant = new Date();
    const heureActuelleStr = maintenant.getHours().toString().padStart(2, '0') + ':' + maintenant.getMinutes().toString().padStart(2, '0');

    horairesPhase1.forEach((horaire) => {
      const [heures, minutes] = horaire.heure.split(':').map(Number);
      const heureNotif = new Date();
      heureNotif.setHours(heures, minutes - 15, 0, 0);

      const heureNotifStr = heureNotif.getHours().toString().padStart(2, '0') + ':' + heureNotif.getMinutes().toString().padStart(2, '0');

      // Vérifier si c'est le moment de la notification (±2 minutes)
      if (heureActuelleStr === heureNotifStr && !notificationsAffiches.includes(horaire.label)) {
        // Notification douce sans casser l'existant
        if (onNotificationDouce) {
          onNotificationDouce({
            type: 'phase1-timer',
            message: `⏰ Dans 15min (${horaire.label}) : ${horaire.aliments}`,
            horaire: horaire.label
          });
        }
        setNotificationsAffiches(prev => [...prev, horaire.label]);
      }
    });
  }, [heureActuelle, horairesPhase1, notificationsAffiches, onNotificationDouce]);

  const getStatutHoraire = (horaireStr) => {
    const [heures, minutes] = horaireStr.split(':').map(Number);
    const maintenant = new Date();
    const heureTargetMin = new Date();
    const heureTargetMax = new Date();
    
    heureTargetMin.setHours(heures, minutes, 0, 0);
    heureTargetMax.setHours(heures, minutes + 30, 0, 0); // Fenêtre de 30min
    
    if (maintenant < heureTargetMin) return 'a-venir';
    if (maintenant >= heureTargetMin && maintenant <= heureTargetMax) return 'maintenant';
    return 'passe';
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      borderRadius: 12,
      padding: '1rem',
      marginBottom: '1rem',
      border: '1px solid #90caf9'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: '0.8rem',
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#1565c0'
      }}>
        ⏰ Timeline Phase 1 - J{jourNum} {jourNum === 1 ? '(Liquides uniquement)' : '(Liquides + Purées)'}
      </div>

      <div style={{
        display: 'grid',
        gap: '0.6rem'
      }}>
        {horairesPhase1.map((horaire, index) => {
          const statut = getStatutHoraire(horaire.heure);
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0.8rem',
                borderRadius: 8,
                backgroundColor: statut === 'maintenant' ? '#c8e6c9' : statut === 'passe' ? '#f5f5f5' : '#ffffff',
                border: statut === 'maintenant' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                minWidth: 60,
                fontWeight: 700,
                color: statut === 'maintenant' ? '#2e7d32' : statut === 'passe' ? '#757575' : '#1565c0',
                fontSize: '1.1rem'
              }}>
                {horaire.label}
              </div>
              <div style={{
                flex: 1,
                color: statut === 'passe' ? '#757575' : '#333',
                fontSize: '0.95rem'
              }}>
                {horaire.aliments}
              </div>
              <div style={{
                fontSize: '1.2rem',
                opacity: statut === 'passe' ? 0.5 : 1
              }}>
                {statut === 'maintenant' ? '🟢' : statut === 'passe' ? '✅' : '⏳'}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '0.8rem',
        padding: '0.6rem',
        backgroundColor: 'rgba(255,193,7,0.1)',
        border: '1px solid #ffc107',
        borderRadius: 8,
        fontSize: '0.85rem',
        color: '#f57c00',
        fontStyle: 'italic'
      }}>
        💡 Astuce : Prépare tes bouillons à l'avance et sirote lentement. Écoute toujours ton corps !
      </div>
    </div>
  );
}