/**
 * Hook personnalisé pour gérer localStorage + Supabase avec fallback gracieux
 * Si Supabase échoue, utilise localStorage automatiquement
 * 🆕 Support mode archive pour consultation jeûnes terminés
 */

import { useState, useEffect } from 'react';
import * as API from './journalSpirituelAPI';
import { recupererDonneesSpirituellesArchivees } from './journalSpirituelArchive';

/**
 * Hook pour les méditations avec fallback localStorage
 * 🆕 Support mode archive
 */
export const useMeditations = (modeArchive = false, idJeuneArchive = null) => {
  const [meditations, setMeditations] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeSupabase, setModeSupabase] = useState(false);

  // Charger au montage
  useEffect(() => {
    charger();
  }, [modeArchive, idJeuneArchive]);

  const charger = async () => {
    setChargement(true);
    try {
      // 🆕 MODE ARCHIVE : charger depuis archives
      if (modeArchive && idJeuneArchive) {
        const donneesArchivees = await recupererDonneesSpirituellesArchivees(idJeuneArchive);
        setMeditations(donneesArchivees?.meditations || []);
        setModeSupabase(false);
        console.log('📿 Méditations archivées chargées:', donneesArchivees?.meditations?.length || 0);
        return;
      }

      // MODE NORMAL : Essayer Supabase d'abord
      const data = await API.getMeditations();
      setMeditations(data);
      setModeSupabase(true);
      console.log('✅ Méditations chargées depuis Supabase');
    } catch (error) {
      // Fallback localStorage
      console.warn('⚠️ Supabase indisponible, utilisation localStorage:', error.message);
      const local = localStorage.getItem('meditationsHistorique');
      if (local) {
        setMeditations(JSON.parse(local));
      }
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
        const data = await API.createMeditation(meditation);
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
      localStorage.setItem('meditationsHistorique', JSON.stringify(nouveau));
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
        await API.deleteMeditation(id);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      // Fallback localStorage
      const nouveau = meditations.filter(m => m.id !== id);
      setMeditations(nouveau);
      localStorage.setItem('meditationsHistorique', JSON.stringify(nouveau));
    } finally {
      setChargement(false);
    }
  };

  return { 
    meditations, 
    chargement, 
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
export const useVersets = () => {
  const [versets, setVersets] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeSupabase, setModeSupabase] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setChargement(true);
    try {
      const data = await API.getVersets();
      setVersets(data);
      setModeSupabase(true);
    } catch (error) {
      const local = localStorage.getItem('versets');
      if (local) setVersets(JSON.parse(local));
      setModeSupabase(false);
    } finally {
      setChargement(false);
    }
  };

  const ajouter = async (verset) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.createVerset(verset);
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
      localStorage.setItem('versets', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  const modifier = async (id, updates) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.updateVerset(id, updates);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = versets.map(v => v.id === id ? { ...v, ...updates } : v);
      setVersets(nouveaux);
      localStorage.setItem('versets', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  const supprimer = async (id) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.deleteVerset(id);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = versets.filter(v => v.id !== id);
      setVersets(nouveaux);
      localStorage.setItem('versets', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  return { versets, chargement, modeSupabase, ajouter, modifier, supprimer, recharger: charger };
};

/**
 * Hook pour les questions avec fallback localStorage
 */
export const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeSupabase, setModeSupabase] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setChargement(true);
    try {
      const data = await API.getQuestions();
      setQuestions(data);
      setModeSupabase(true);
    } catch (error) {
      const local = localStorage.getItem('questions');
      if (local) setQuestions(JSON.parse(local));
      setModeSupabase(false);
    } finally {
      setChargement(false);
    }
  };

  const ajouter = async (question) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.createQuestion(question);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveau = { id: Date.now(), date: new Date().toISOString(), ...question };
      const nouveaux = [nouveau, ...questions];
      setQuestions(nouveaux);
      localStorage.setItem('questions', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  const modifier = async (id, updates) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.updateQuestion(id, updates);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = questions.map(q => q.id === id ? { ...q, ...updates } : q);
      setQuestions(nouveaux);
      localStorage.setItem('questions', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  const supprimer = async (id) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.deleteQuestion(id);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = questions.filter(q => q.id !== id);
      setQuestions(nouveaux);
      localStorage.setItem('questions', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  return { questions, chargement, modeSupabase, ajouter, modifier, supprimer, recharger: charger };
};

/**
 * Hook pour les intentions avec fallback localStorage
 */
export const useIntentions = () => {
  const [intentions, setIntentions] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeSupabase, setModeSupabase] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setChargement(true);
    try {
      const data = await API.getIntentions();
      setIntentions(data);
      setModeSupabase(true);
    } catch (error) {
      const local = localStorage.getItem('intentions');
      if (local) setIntentions(JSON.parse(local));
      setModeSupabase(false);
    } finally {
      setChargement(false);
    }
  };

  const ajouter = async (intention) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.createIntention(intention);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveau = { id: Date.now(), date: new Date().toISOString(), ...intention };
      const nouveaux = [nouveau, ...intentions];
      setIntentions(nouveaux);
      localStorage.setItem('intentions', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  const modifier = async (id, updates) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.updateIntention(id, updates);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = intentions.map(i => i.id === id ? { ...i, ...updates } : i);
      setIntentions(nouveaux);
      localStorage.setItem('intentions', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  const supprimer = async (id) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.deleteIntention(id);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = intentions.filter(i => i.id !== id);
      setIntentions(nouveaux);
      localStorage.setItem('intentions', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  return { intentions, chargement, modeSupabase, ajouter, modifier, supprimer, recharger: charger };
};

/**
 * Hook pour les écrits avec fallback localStorage
 */
export const useEcrits = () => {
  const [ecrits, setEcrits] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeSupabase, setModeSupabase] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setChargement(true);
    try {
      const data = await API.getEcrits();
      setEcrits(data);
      setModeSupabase(true);
    } catch (error) {
      const local = localStorage.getItem('ecrits');
      if (local) setEcrits(JSON.parse(local));
      setModeSupabase(false);
    } finally {
      setChargement(false);
    }
  };

  const ajouter = async (ecrit) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.createEcrit(ecrit);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveau = { id: Date.now(), date: new Date().toISOString(), ...ecrit };
      const nouveaux = [nouveau, ...ecrits];
      setEcrits(nouveaux);
      localStorage.setItem('ecrits', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  const modifier = async (id, updates) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.updateEcrit(id, updates);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = ecrits.map(e => e.id === id ? { ...e, ...updates } : e);
      setEcrits(nouveaux);
      localStorage.setItem('ecrits', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  const supprimer = async (id) => {
    setChargement(true);
    try {
      if (modeSupabase) {
        await API.deleteEcrit(id);
        await charger();
      } else {
        throw new Error('Mode localStorage');
      }
    } catch (error) {
      const nouveaux = ecrits.filter(e => e.id !== id);
      setEcrits(nouveaux);
      localStorage.setItem('ecrits', JSON.stringify(nouveaux));
    } finally {
      setChargement(false);
    }
  };

  return { ecrits, chargement, modeSupabase, ajouter, modifier, supprimer, recharger: charger };
};
