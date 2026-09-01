import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DEFIS_STATUS } from '../lib/defisUtils';

const DefisContext = createContext();
export function useDefis() { return useContext(DefisContext); }

export function DefisProvider({ children }) {
    const [defis, setDefis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDefis = async () => {
        setLoading(true);
        setError(null);
        const { data: authData, error: authError } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (authError || !userId) {
            setDefis([]);
            setLoading(false);
            return;
        }
        const { data, error: fetchError } = await supabase.from('defis').select('*').eq('user_id', userId);
        if (fetchError) {
            setError('Erreur lors du chargement des défis');
            setLoading(false);
            return;
        }
        setDefis(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchDefis(); }, []);

    const defisEnCours = defis.filter(defi => defi.status === DEFIS_STATUS.EN_COURS);

    return (
        <DefisContext.Provider value={{ defis, defisEnCours, loading, error, refreshDefis: fetchDefis }}>
            {children}
        </DefisContext.Provider>
    );
}
