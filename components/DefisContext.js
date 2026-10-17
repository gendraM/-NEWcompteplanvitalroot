import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { chargerDefisNavigation } from '../lib/navigationOwnedData';

const DefisContext = createContext();
export function useDefis() { return useContext(DefisContext); }

export function DefisProvider({ children }) {
    const { user, loading: authLoading } = useAuth();
    const userId = user?.id || null;
    const sequence = useRef(0);
    const [state, setState] = useState({ userId: null, defis: [], loading: true, error: null });
    const refreshDefis = useCallback(async () => {
        const request = ++sequence.current;
        if (authLoading || !userId) {
            setState({ userId: null, defis: [], loading: authLoading, error: null });
            return;
        }
        setState(previous => ({ ...previous, loading: true, error: null }));
        try {
            const defis = await chargerDefisNavigation(supabase, userId);
            if (request === sequence.current) setState({ userId, defis, loading: false, error: null });
        } catch {
            if (request === sequence.current) setState({ userId, defis: [], loading: false, error: 'Erreur lors du chargement des défis' });
        }
    }, [userId, authLoading]);

    useEffect(() => {
        refreshDefis();
        return () => { sequence.current += 1; };
    }, [refreshDefis]);

    // Masquer immédiatement les données d'une ancienne session, avant les effets.
    const defis = !authLoading && state.userId === userId ? state.defis : [];
    const loading = authLoading || Boolean(userId && state.userId !== userId) || state.loading;
    const error = state.userId === userId ? state.error : null;
    const defisEnCours = defis.filter(defi => defi.status === 'en cours');
    return <DefisContext.Provider value={{ defis, defisEnCours, loading, error, refreshDefis }}>
        {children}
    </DefisContext.Provider>;
}
