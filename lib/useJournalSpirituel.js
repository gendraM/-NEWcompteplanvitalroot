/**
 * Hook personnalisé pour gérer localStorage + Supabase avec fallback gracieux
 * Si Supabase échoue, utilise localStorage automatiquement
 * 🆕 Support mode archive pour consultation jeûnes terminés
 */

import { useState, useEffect } from 'react';
import * as API from './journalSpirituelAPI';
import { recupererDonneesSpirituellesArchivees } from './journalSpirituelArchive';

const getStorageKey = (key, userId) => (userId ? `${key}_${userId}` : key);

const loadLocalJson = (key, fallback, userId) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = localStorage.getItem(getStorageKey(key, userId));
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const saveLocalJson = (key, value, userId) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(key, userId), JSON.stringify(value));
};

/**
 * Hook pour les méditations avec fallback localStorage
 * 🆕 Support mode archive
 */
export const useMeditations = (modeArchive = false, idJeuneArchive = null, userId = null) => {
  const [meditations, setMeditations] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeSupabase, setModeSupabase] = useState(false);

  // Charger au montage
  useEffect(() => {
    charger();
  }, [modeArchive, idJeuneArchive, userId]);

  const charger = async () => {
    setChargement(true);
    try {
      // 🆕 MODE ARCHIVE : charger depuis archives
      if (modeArchive && idJeuneArchive) {
        const donneesArchivees = await recupererDonneesSpirituellesArchivees(idJeuneArchive, userId);
        setMeditations(donneesArchivees?.meditations || []);
        setModeSupabase(false);
        console.log('📿 Méditations archivées chargées:', donneesArchivees?.meditations?.length || 0);
        return;
      }

      // MODE NORMAL : Essayer Supabase d'abord
      const data = await API.getMeditations(userId);
      setMeditations(data);
      setModeSupabase(true);
      console.log('✅ Méditations chargées depuis Supabase');
    } catch (error) {
      // Fallback localStorage
      console.warn('⚠️ Supabase indisponible, utilisation localStorage:', error.message);
      setMeditations(loadLocalJson('meditationsHistorique', [], userId));
      setModeSupabase(false);
    } finally {
      setChargement(false);
    }
  };

  const ajouter = async (meditation) => {
    // 🆕 Bloquer ajout en mode archive
    if (modeArchive) {
      alert('⚠️ Mode archive : impossible d\'ajouter une méditation');
      return null;
    }

    setChargement(true);
    try {
      if (modeSupabase) {
        // Essayer Supabase
        const data = await API.createMeditation(meditation, userId);
        await charger();
        return data;
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      // Fallback localStorage
      console.warn('⚠️ Sauvegarde localStorage:', error.message);
      const nouvelle = {
        id: Date.now(),
        date: new Date().toISOString(),
        jour_jeune: meditation.jourJeune,
        duree: meditation.duree,
        type_meditation: meditation.type,
        notes: meditation.notes || '',
        ressenti: meditation.ressenti || ''
      };
      const nouveau = [nouvelle, ...meditations];
      setMeditations(nouveau);
      saveLocalJson('meditationsHistorique', nouveau, userId);
      return nouvelle;
    } finally {
      setChargement(false);
    }
  };

  const supprimer = async (id) => {
    // 🆕 Bloquer suppression en mode archive
    if (modeArchive) {
      alert('⚠️ Mode archive : impossible de supprimer une méditation');
      return;
    }

    setChargement(true);
    try {
      if (modeSupabase) {
        await API.deleteMeditation(id, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      // Fallback localStorage
      const nouveau = meditations.filter(m => m.id !== id);
      setMeditations(nouveau);
      saveLocalJson('meditationsHistorique', nouveau, userId);
    } finally {
      setChargement(false);
    }
  };

  return { 
    meditations, 
    chargement, 
    loading: chargement,
    modeSupabase: modeArchive ? false : modeSupabase, 
    modeArchive,
    ajouter, 
    supprimer, 
    recharger: charger 
  };
};

/**
 * Hook pour les versets avec fallback localStorage
 */
export const useVersets = (userId = null) => {
  const [versets, setVersets] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeSupabase, setModeSupabase] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setChargement(true);
    try {
      const data = await API.getVersets(userId);
      setVersets(data);
      setModeSupabase(true);
    } catch (error) {
      setVersets(loadLocalJson('versets', [], userId));
      setModeSupabase(false);
    } finally {
      setChargement(false);
    }
  };

  const ajouter = async (verset) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.createVerset(verset, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveau = {
        id: Date.now(),
        date: new Date().toISOString(),
        ...verset
      };
      const nouveaux = [nouveau, ...versets];
      setVersets(nouveaux);
      saveLocalJson('versets', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  const modifier = async (id, updates) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.updateVerset(id, updates, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = versets.map(v => v.id === id ? { ...v, ...updates } : v);
      setVersets(nouveaux);
    saveLocalJson('versets', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  const supprimer = async (id) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.deleteVerset(id, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = versets.filter(v => v.id !== id);
      setVersets(nouveaux);
    saveLocalJson('versets', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  return { versets, chargement, loading: chargement, modeSupabase, mode: modeSupabase, ajouter, modifier, supprimer, recharger: charger };
};

/**
 * Hook pour les questions avec fallback localStorage
 */
export const useQuestions = (userId = null) => {
  const [questions, setQuestions] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeSupabase, setModeSupabase] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setChargement(true);
    try {
      const data = await API.getQuestions(userId);
      setQuestions(data);
      setModeSupabase(true);
    } catch (error) {
      setQuestions(loadLocalJson('questions', [], userId));
      setModeSupabase(false);
    } finally {
      setChargement(false);
    }
  };

  const ajouter = async (question) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.createQuestion(question, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveau = { id: Date.now(), date: new Date().toISOString(), ...question };
      const nouveaux = [nouveau, ...questions];
      setQuestions(nouveaux);
      saveLocalJson('questions', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  const modifier = async (id, updates) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.updateQuestion(id, updates, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = questions.map(q => q.id === id ? { ...q, ...updates } : q);
      setQuestions(nouveaux);
      saveLocalJson('questions', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  const supprimer = async (id) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.deleteQuestion(id, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = questions.filter(q => q.id !== id);
      setQuestions(nouveaux);
      saveLocalJson('questions', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  return { questions, chargement, loading: chargement, modeSupabase, mode: modeSupabase, ajouter, modifier, supprimer, recharger: charger };
};

/**
 * Hook pour les intentions avec fallback localStorage
 */
export const useIntentions = (userId = null) => {
  const [intentions, setIntentions] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeSupabase, setModeSupabase] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setChargement(true);
    try {
      const data = await API.getIntentions(userId);
      setIntentions(data);
      setModeSupabase(true);
    } catch (error) {
      setIntentions(loadLocalJson('intentions', [], userId));
      setModeSupabase(false);
    } finally {
      setChargement(false);
    }
  };

  const ajouter = async (intention) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.createIntention(intention, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveau = { id: Date.now(), date: new Date().toISOString(), ...intention };
      const nouveaux = [nouveau, ...intentions];
      setIntentions(nouveaux);
      saveLocalJson('intentions', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  const modifier = async (id, updates) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.updateIntention(id, updates, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = intentions.map(i => i.id === id ? { ...i, ...updates } : i);
      setIntentions(nouveaux);
      saveLocalJson('intentions', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  const supprimer = async (id) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.deleteIntention(id, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = intentions.filter(i => i.id !== id);
      setIntentions(nouveaux);
      saveLocalJson('intentions', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  return { intentions, chargement, loading: chargement, modeSupabase, mode: modeSupabase, ajouter, modifier, supprimer, recharger: charger };
};

/**
 * Hook pour les écrits avec fallback localStorage
 */
export const useEcrits = (userId = null) => {
  const [ecrits, setEcrits] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeSupabase, setModeSupabase] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setChargement(true);
    try {
      const data = await API.getEcrits(userId);
      setEcrits(data);
      setModeSupabase(true);
    } catch (error) {
      setEcrits(loadLocalJson('ecrits', [], userId));
      setModeSupabase(false);
    } finally {
      setChargement(false);
    }
  };

  const ajouter = async (ecrit) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.createEcrit(ecrit, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveau = { id: Date.now(), date: new Date().toISOString(), ...ecrit };
      const nouveaux = [nouveau, ...ecrits];
      setEcrits(nouveaux);
      saveLocalJson('ecrits', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  const modifier = async (id, updates) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.updateEcrit(id, updates, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = ecrits.map(e => e.id === id ? { ...e, ...updates } : e);
      setEcrits(nouveaux);
      saveLocalJson('ecrits', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  const supprimer = async (id) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.deleteEcrit(id, userId);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = ecrits.filter(e => e.id !== id);
      setEcrits(nouveaux);
      saveLocalJson('ecrits', nouveaux, userId);
    } finally {
      setChargement(false);
    }
  };

  return { ecrits, chargement, loading: chargement, modeSupabase, mode: modeSupabase, ajouter, modifier, supprimer, recharger: charger };
};
