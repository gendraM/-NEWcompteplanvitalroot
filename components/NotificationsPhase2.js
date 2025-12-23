/**
 * 🔔 NOTIFICATIONS DOUCES - PHASE 2
 * Système de notifications discrètes pour respecter les horaires Phase 2
 * Architecture identique à NotificationsPhase1.js (succès éprouvé)
 * Horaires Phase 2 selon documentation officielle ligne 369
 */

import { useState, useEffect } from 'react';

export default function NotificationsPhase2({ phase, jourNum, isActive = false }) {
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Horaires Phase 2 selon documentation officielle (J3→J4→J5)
  const horairesPhase2 = [
    { 
      heure: '08:00', 
      label: '8h', 
      aliment: 'Compote maison', 
      quantite: jourNum === 3 ? '+ 1 càc huile' : jourNum === 4 ? '+ 1 càs huile' : '+ 1,5 càs huile', 
      type: 'matin' 
    },
    { 
      heure: '11:00', 
      label: '11h', 
      aliment: 'Bouillon légumes filtré', 
      quantite: '200ml', 
      type: 'matinee' 
    },
    { 
      heure: '13:00', 
      label: '13h', 
      aliment: jourNum === 5 ? 'Purée fibres douces + 30g avocat' : 'Purée fibres douces', 
      quantite: '150-180g', 
      type: 'midi' 
    },
    { 
      heure: '16:00', 
      label: '16h', 
      aliment: 'Fruit cuit', 
      quantite: '1 moyen (pomme/poire)', 
      type: 'aprem' 
    },
    { 
      heure: '19:00', 
      label: '19h', 
      aliment: 'Purée + huile', 
      quantite: jourNum === 3 ? '+ 1 càc' : jourNum === 4 ? '+ 1 càs' : '+ 1,5 càs', 
      type: 'soir' 
    }
  ];

  // Mise à jour du temps courant (identique Phase 1)
  useEffect(() => {
    if (!isActive || phase !== 2) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Vérification chaque minute

    return () => clearInterval(timer);
  }, [isActive, phase]);

  // Génération des notifications (logique identique Phase 1)
  useEffect(() => {
    if (!isActive || phase !== 2) {
      setNotifications([]);
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const newNotifications = horairesPhase2
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
          id: `notif-phase2-${horaire.heure}-J${jourNum}`
        };
      });

    setNotifications(newNotifications);
  }, [currentTime, isActive, phase, jourNum]);

  // Ne pas afficher si pas Phase 2 ou pas actif
  if (!isActive || phase !== 2 || notifications.length === 0) {
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
            borderRadius: '12px',
            marginBottom: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '0.9rem',
            border: '2px solid rgba(255,255,255,0.2)',
            backdrop: 'blur(10px)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px'
          }}>
            <span style={{
              fontWeight: '700',
              fontSize: '1rem'
            }}>
              {notif.label} - {notif.message}
            </span>
            <span style={{
              fontSize: '1.1rem'
            }}>
              {notif.status === 'current' ? '🟢' : notif.status === 'upcoming' ? '🔵' : '🟠'}
            </span>
          </div>
          
          <div style={{
            fontSize: '0.85rem',
            lineHeight: '1.3',
            opacity: 0.95
          }}>
            <strong>{notif.aliment}</strong><br/>
            {notif.quantite}
          </div>
          
          {jourNum && (
            <div style={{
              fontSize: '0.75rem',
              marginTop: '6px',
              padding: '4px 8px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              J{jourNum} - Phase 2 fibres douces
            </div>
          )}
        </div>
      ))}
    </div>
  );
}