/**
 * 🔔 NOTIFICATIONS DOUCES - PHASE 1
 * Système de notifications discrètes pour respecter les horaires Phase 1
 * S'intègre harmonieusement avec les critères de validation existants
 */

import { useState, useEffect } from 'react';

export default function NotificationsPhase1({ phase, jourNum, isActive = false }) {
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Horaires Phase 1 selon documentation officielle
  const horairesPhase1 = [
    { heure: '08:00', label: '8h', aliment: 'Bouillon de légumes clair', quantite: '150-200ml', type: 'matin' },
    { heure: '11:00', label: '11h', aliment: 'Eau citronnée ou eau de cuisson', quantite: '150ml', type: 'matinee' },
    { heure: '13:00', label: '13h', aliment: jourNum === 1 ? 'Bouillon de légumes' : 'Bouillon + purée carotte', quantite: '200ml', type: 'midi' },
    { heure: '16:00', label: '16h', aliment: 'Jus dilué ou bouillon', quantite: '100-150ml', type: 'aprem' },
    { heure: '19:00', label: '19h', aliment: jourNum === 1 ? 'Bouillon de légumes' : 'Bouillon + purée lisse', quantite: '200ml', type: 'soir' }
  ];

  // Mise à jour du temps courant
  useEffect(() => {
    if (!isActive || phase !== 1) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Vérification chaque minute

    return () => clearInterval(timer);
  }, [isActive, phase]);

  // Génération des notifications
  useEffect(() => {
    if (!isActive || phase !== 1) {
      setNotifications([]);
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const newNotifications = horairesPhase1
      .filter(horaire => {
        const [heureTarget, minuteTarget] = horaire.heure.split(':').map(Number);
        const diffMinutes = (currentHour - heureTarget) * 60 + (currentMinute - minuteTarget);
        
        // Notification 30min avant + au moment exact + 30min après si pas pris
        return (diffMinutes >= -30 && diffMinutes <= 30);
      })
      .map(horaire => {
        const [heureTarget, minuteTarget] = horaire.heure.split(':').map(Number);
        const diffMinutes = (currentHour - heureTarget) * 60 + (currentMinute - minuteTarget);
        
        let status = 'upcoming'; // upcoming, current, overdue
        let message = '';
        
        if (diffMinutes < -10) {
          status = 'upcoming';
          message = `Dans ${Math.abs(diffMinutes)} min`;
        } else if (diffMinutes >= -10 && diffMinutes <= 10) {
          status = 'current';
          message = 'C\'est le moment !';
        } else {
          status = 'overdue';
          message = `${diffMinutes} min de retard`;
        }

        return {
          ...horaire,
          status,
          message,
          id: `notif-${horaire.heure}-${jourNum}`
        };
      });

    setNotifications(newNotifications);
  }, [currentTime, isActive, phase, jourNum]);

  // Ne pas afficher si pas Phase 1 ou pas actif
  if (!isActive || phase !== 1 || notifications.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 60,
      maxWidth: '300px'
    }}>
      {notifications.map(notif => (
        <div
          key={notif.id}
          style={{
            background: notif.status === 'current' ? 'linear-gradient(135deg, #4CAF50, #66BB6A)' : 
                       notif.status === 'upcoming' ? 'linear-gradient(135deg, #2196F3, #42A5F5)' :
                       'linear-gradient(135deg, #FF9800, #FFB74D)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: 12,
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: `2px solid ${notif.status === 'current' ? '#4CAF50' : notif.status === 'upcoming' ? '#2196F3' : '#FF9800'}`,
            animation: notif.status === 'current' ? 'pulse 2s infinite' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: '1em' }}>
              {notif.status === 'current' ? '🔔' : notif.status === 'upcoming' ? '⏰' : '⚠️'} {notif.label}
            </span>
            <span style={{ fontSize: '0.8em', opacity: 0.9 }}>{notif.message}</span>
          </div>
          
          <div style={{ fontSize: '0.85em', opacity: 0.95 }}>
            <strong>{notif.aliment}</strong>
          </div>
          
          <div style={{ fontSize: '0.8em', opacity: 0.9, marginTop: 2 }}>
            📏 {notif.quantite}
          </div>
          
          {jourNum === 1 && notif.type === 'midi' && (
            <div style={{ fontSize: '0.75em', opacity: 0.8, marginTop: 4, fontStyle: 'italic' }}>
              💡 J1 : liquides uniquement
            </div>
          )}
          
          {jourNum === 2 && (notif.type === 'midi' || notif.type === 'soir') && (
            <div style={{ fontSize: '0.75em', opacity: 0.8, marginTop: 4, fontStyle: 'italic' }}>
              ✨ J2 : purées autorisées
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}