
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import DefisEnCoursBanner from './DefisEnCoursBanner';
import StartPreparationModal from './StartPreparationModal';
import UserDebugPanel from './UserDebugPanel';



const navLinks = [
    { href: '/profil', label: 'Profil' },
    { href: '/tableau-de-bord', label: 'Tableau de bord' },
];


const Navigation = () => {
    console.log('[Navigation] Composant monté');

    // ...existing code...
};

export default Navigation;