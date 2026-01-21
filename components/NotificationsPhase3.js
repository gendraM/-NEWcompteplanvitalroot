/**
 * 🔔 NOTIFICATIONS PROTÉINES & LIPIDES - PHASE 3
 * Système de notifications pour reconstruction tissulaire
 * Architecture identique à NotificationsPhase2.js (succès éprouvé)
 * Horaires Phase 3 : 8h (Huile) / 11h (Protéine) / 13h (Repas) / 16h (Gras) / 19h (Protéine + Huile)
 */

import { useState, useEffect } from 'react';

export default function NotificationsPhase3({ phase, jourNum, isActive = false }) {
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Horaires Phase 3 : Progression J8→J9→J10
  const horairesPhase3 = [
    { 
      heure: '08:00', 
      label: '8h', 
      aliment: 'Huile vierge', 
      quantite: jourNum === 8 ? '0.5 CS' : jourNum === 9 ? '0.75 CS' : '1 CS', 
      type: 'matin' 
    },
    { 
      heure: '11:00', 
      label: '11h', 
      aliment: 'Protéine délicate', 
      quantite: jourNum === 8 ? '1 œuf mollet' : jourNum === 9 ? '1 œuf poché' : 'Fromage blanc 100g', 
      type: 'matinee' 
    },
    { 
      heure: '13:00', 
      label: '13h', 
      aliment: jourNum === 8 ? 'Poisson blanc vapeur' : jourNum === 9 ? 'Saumon vapeur' : 'Sardines nature', 
      quantite: jourNum === 8 ? '80g' : jourNum === 9 ? '100g' : '80g', 
      type: 'midi' 
    },
    { 
      heure: '16h', 
      label: '16h', 
      aliment: 'Gras sain', 
      quantite: jourNum === 8 ? '1/4 avocat ou 1 cc purée amandes' : jourNum === 9 ? '1/4 avocat + 0.5 CC huile' : '1/4 avocat + 1 cc huile', 
      type: 'aprem' 
    },
    { 
      heure: '19:00', 
      label: '19h', 
      aliment: 'Protéine + Huile', 
      quantite: jourNum === 8 ? 'Yaourt 0% + 0.5 CS huile' : jourNum === 9 ? 'Fromage blanc + 0.75 CS huile' : 'Thon nature + 1 CS huile', 
      type: 'soir' 
    }
  ];

  // Mise à jour du temps courant (identique Phase 1-2)
  useEffect(() => {
    if (!isActive || phase !== 3) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Vérification chaque minute

    return () => clearInterval(timer);
  }, [isActive, phase]);

  // Génération des notifications (logique identique Phase 1-2)
  useEffect(() => {
    if (!isActive || phase !== 3) {
      setNotifications([]);
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const newNotifications = horairesPhase3
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
          id: `notif-phase3-${horaire.heure}-J${jourNum}`
        };
      });

    setNotifications(newNotifications);
  }, [currentTime, isActive, phase, jourNum]);

  // Ne pas afficher si pas Phase 3 ou pas actif
  if (!isActive || phase !== 3 || notifications.length === 0) {
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
              J{jourNum} - Phase 3 protéines & lipides
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
