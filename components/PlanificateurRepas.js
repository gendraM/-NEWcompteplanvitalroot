import { useEffect, useMemo, useState } from 'react';
import {
  calculerKcalPlanifiees,
  construireComposantAssiette,
  construireOccurrencesAssiette,
  enregistrerAssiettePlanifiee,
  obtenirSaisieParDefaut,
  rechercherAlimentsReferentiel,
  trouverAlimentReferentiel
} from '../lib/planificationRepas';
import {
  creerRepasCompose,
  listerRepasComposes,
  modifierRepasCompose,
  supprimerRepasCompose
} from '../lib/repasComposes';
import FormAjoutAliment from './FormAjoutAliment';

const typesRepas = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'];
const bouton = {
  border: 0,
  borderRadius: 9,
  padding: '9px 14px',
  cursor: 'pointer',
  fontWeight: 700
};

export default function PlanificateurRepas({
  supabase,
  userId,
  referentiel,
  date,
  type,
  suggestions = [],
  reglesGestion = {},
  onChangeDate,
  onChangeType,
  onReferentielChange,
  onPlanningRecorded,
  onPlanningChange
}) {
  const [recherche, setRecherche] = useState('');
  const [quantite, setQuantite] = useState('');
  const [unite, setUnite] = useState('');
  const [kcal, setKcal] = useState(null);
  const [assiette, setAssiette] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [modeleCharge, setModeleCharge] = useState(null);
  const [enregistrerModele, setEnregistrerModele] = useState(false);
  const [nomModele, setNomModele] = useState('');
  const [feedback, setFeedback] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [afficherAjoutPersonnel, setAfficherAjoutPersonnel] = useState(false);

  const alimentSelectionne = useMemo(
    () => trouverAlimentReferentiel(referentiel, recherche),
    [referentiel, recherche]
  );
  const correspondances = useMemo(
    () => rechercherAlimentsReferentiel(referentiel, recherche, 12),
    [referentiel, recherche]
  );
  const totalKcal = assiette.reduce((total, composant) => total + Number(composant.kcal || 0), 0);

  const rechargerModeles = async () => {
    const { data, error } = await listerRepasComposes(supabase, userId);
    if (error) setErreur(`Les repas enregistrés n’ont pas pu être chargés : ${error.message}`);
    else setModeles(data);
  };

  useEffect(() => {
    if (userId) rechargerModeles();
    else setModeles([]);
  }, [userId]);

  useEffect(() => {
    if (!alimentSelectionne) {
      setQuantite('');
      setUnite('');
      setKcal(null);
      return;
    }
    const valeurs = obtenirSaisieParDefaut(alimentSelectionne);
    setQuantite(valeurs.quantite);
    setUnite(valeurs.unite);
    setKcal(valeurs.kcal);
    setErreur('');
  }, [alimentSelectionne]);

  useEffect(() => {
    if (!alimentSelectionne || !quantite || !unite) return setKcal(null);
    const resultat = calculerKcalPlanifiees(alimentSelectionne, quantite, unite);
    setKcal(resultat.statut === 'ok' ? resultat.kcal : null);
  }, [alimentSelectionne, quantite, unite]);

  const choisirAliment = aliment => {
    setRecherche(aliment.nom);
    setErreur('');
    setFeedback('');
  };

  const ajouterAlimentPersonnel = async donnees => {
    if (!userId) return setErreur('Connecte-toi pour ajouter un aliment personnel.');
    setChargement(true);
    setErreur('');
    const { error } = await supabase.from('referentiel_user_custom').insert([{
      user_id: userId,
      aliment_data: donnees,
      statut: 'en_attente',
      date_ajout: new Date().toISOString()
    }]);
    if (error) setErreur(`L’aliment personnel n’a pas été enregistré : ${error.message}`);
    else {
      await onReferentielChange?.();
      setRecherche(donnees.nom);
      setAfficherAjoutPersonnel(false);
      setFeedback(`${donnees.nom} a été ajouté à ton référentiel personnel.`);
    }
    setChargement(false);
  };

  const ajouterAliment = () => {
    setErreur('');
    setFeedback('');
    if (!alimentSelectionne) {
      setErreur('Sélectionne un aliment proposé par le référentiel avant de l’ajouter.');
      return;
    }
    if (assiette.some(item => item.nom === alimentSelectionne.nom)) {
      setErreur(`${alimentSelectionne.nom} est déjà dans ce repas. Modifie directement sa quantité.`);
      return;
    }
    const resultat = construireComposantAssiette(alimentSelectionne, quantite, unite);
    if (resultat.erreur) return setErreur(resultat.erreur);
    setAssiette(courante => [...courante, resultat.composant]);
    setRecherche('');
    setFeedback(`${alimentSelectionne.nom} a été ajouté au repas.`);
  };

  const modifierQuantite = (id, nouvelleQuantite) => {
    setAssiette(courante => courante.map(composant => {
      if (composant.id !== id) return composant;
      const reference = trouverAlimentReferentiel(referentiel, composant.nom);
      const resultat = construireComposantAssiette(reference, nouvelleQuantite, composant.unite, composant.id);
      return resultat.composant || { ...composant, quantite: nouvelleQuantite, kcal: null };
    }));
  };

  const chargerModele = id => {
    const modele = modeles.find(item => item.id === id);
    if (!modele) return;
    setAssiette(modele.composition.map(item => ({ ...item })));
    setModeleCharge(modele);
    setNomModele(modele.nom);
    setEnregistrerModele(false);
    setErreur('');
    setFeedback(`« ${modele.nom} » est chargé. Tu peux ajuster ses portions avant de le planifier.`);
  };

  const mettreAJourModele = async () => {
    if (!modeleCharge) return;
    setChargement(true);
    setErreur('');
    const { error } = await modifierRepasCompose(supabase, modeleCharge.id, {
      userId,
      nom: nomModele,
      composition: assiette
    });
    if (error) setErreur(`Le repas enregistré n’a pas été modifié : ${error.message}`);
    else {
      setFeedback('Le repas enregistré a été mis à jour.');
      await rechargerModeles();
    }
    setChargement(false);
  };

  const dupliquerModele = async modele => {
    setChargement(true);
    setErreur('');
    const { error } = await creerRepasCompose(supabase, {
      userId,
      nom: `${modele.nom} (copie)`,
      composition: modele.composition
    });
    if (error) setErreur(`La copie n’a pas été créée : ${error.message}`);
    else {
      setFeedback('Le repas a été dupliqué.');
      await rechargerModeles();
    }
    setChargement(false);
  };

  const effacerModele = async modele => {
    if (!window.confirm(`Supprimer le repas enregistré « ${modele.nom} » ? Le planning existant restera inchangé.`)) return;
    setChargement(true);
    const { error } = await supprimerRepasCompose(supabase, modele.id, userId);
    if (error) setErreur(`Le repas enregistré n’a pas été supprimé : ${error.message}`);
    else {
      if (modeleCharge?.id === modele.id) setModeleCharge(null);
      setFeedback('Le repas enregistré a été supprimé.');
      await rechargerModeles();
    }
    setChargement(false);
  };

  const planifierRepas = async () => {
    setErreur('');
    setFeedback('');
    if (!userId) return setErreur('Connecte-toi pour enregistrer ce repas.');
    if (!date) return setErreur('Choisis la date du repas.');
    if (!assiette.length) return setErreur('Ajoute au moins un aliment à ce repas.');
    if (assiette.some(item => !Number.isFinite(Number(item.kcal)))) {
      return setErreur('Une portion du repas ne permet pas de calculer les calories. Corrige-la avant de continuer.');
    }
    if (enregistrerModele && assiette.length > 1 && !nomModele.trim()) {
      return setErreur('Donne un nom au repas que tu souhaites réutiliser.');
    }

    const occurrences = construireOccurrencesAssiette(assiette, { userId, date, type });
    if (occurrences.length !== assiette.length) {
      return setErreur('Le repas contient une donnée incomplète et ne peut pas être enregistré.');
    }

    setChargement(true);
    const { data: lignesInserees, error: erreurInsertion } = await enregistrerAssiettePlanifiee(
      supabase,
      assiette,
      { userId, date, type }
    );

    if (erreurInsertion) {
      setErreur(`Le repas n’a pas été enregistré dans le planning : ${erreurInsertion.message}`);
      setChargement(false);
      return;
    }

    onPlanningRecorded?.(lignesInserees || []);
    const rechargement = await onPlanningChange?.();
    let message = `${assiette.length} aliment${assiette.length > 1 ? 's ont' : ' a'} été enregistré${assiette.length > 1 ? 's' : ''} dans le planning.`;
    if (rechargement?.error) {
      message += ' L’enregistrement est confirmé, mais le planning distant n’a pas pu être rechargé.';
    }

    if (enregistrerModele && assiette.length > 1) {
      const { error: erreurModele } = await creerRepasCompose(supabase, {
        userId,
        nom: nomModele,
        composition: assiette
      });
      if (erreurModele) message += ` Le planning est enregistré, mais le modèle réutilisable ne l’est pas : ${erreurModele.message}`;
      else {
        message += ` « ${nomModele.trim()} » est aussi disponible pour une prochaine fois.`;
        await rechargerModeles();
      }
    }

    setFeedback(message);
    setAssiette([]);
    setRecherche('');
    setModeleCharge(null);
    setEnregistrerModele(false);
    setNomModele('');
    setChargement(false);
  };

  return (
    <section className="planificateur-repas">
      <h2>🍽️ Planifier mon repas</h2>
      <p>Choisis le moment une seule fois, puis ajoute tous les aliments de ton assiette.</p>

      <div className="ligne contexte-repas">
        <label>
          Moment
          <select value={type} onChange={event => onChangeType(event.target.value)}>
            {typesRepas.map(item => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={event => onChangeDate(event.target.value)} />
        </label>
      </div>

      {modeles.length > 0 && (
        <label className="modele-select">
          Réutiliser un repas déjà enregistré
          <select value={modeleCharge?.id || ''} onChange={event => chargerModele(event.target.value)}>
            <option value="">Choisir un repas enregistré</option>
            {modeles.map(modele => <option key={modele.id} value={modele.id}>{modele.nom}</option>)}
          </select>
        </label>
      )}

      <div className="ajout-aliment">
        <label>
          Rechercher un aliment
          <input
            list="aliments-planification"
            value={recherche}
            onChange={event => setRecherche(event.target.value)}
            placeholder="Ex. œuf, poulet, haricots verts"
            autoComplete="off"
          />
        </label>
        <datalist id="aliments-planification">
          {correspondances.map(aliment => <option key={aliment.nom} value={aliment.nom}>{aliment.categorie}</option>)}
        </datalist>

        {recherche && !alimentSelectionne && (
          <div className="aliment-absent">
            <p className="aide">Sélectionne une proposition du référentiel. Aucun aliment libre ne sera enregistré par erreur.</p>
            <button type="button" onClick={() => setAfficherAjoutPersonnel(true)}>Ajouter « {recherche} » à mon référentiel personnel</button>
          </div>
        )}

        {afficherAjoutPersonnel && (
          <div className="formulaire-personnel">
            <FormAjoutAliment
              nomInitial={recherche}
              onSave={ajouterAlimentPersonnel}
              onCancel={() => setAfficherAjoutPersonnel(false)}
            />
          </div>
        )}

        {alimentSelectionne && (
          <div className="aliment-selectionne">
            <div>
              <strong>{alimentSelectionne.nom}</strong>
              <span>{alimentSelectionne.categorie || 'Catégorie non renseignée'}</span>
            </div>
            <label>
              Quantité
              <input type="number" min="0.01" step="0.01" value={quantite} onChange={event => setQuantite(event.target.value)} />
            </label>
            <div className="valeur-calculee"><small>Unité</small><strong>{unite || '—'}</strong></div>
            <div className="valeur-calculee"><small>Calories calculées</small><strong>{kcal === null ? '—' : `${kcal} kcal`}</strong></div>
            <button type="button" style={{ ...bouton, background: '#2e7d32', color: 'white' }} onClick={ajouterAliment}>Ajouter à mon repas</button>
          </div>
        )}

        {alimentSelectionne && reglesGestion[alimentSelectionne.categorie] && (
          <p className="regle">📋 {reglesGestion[alimentSelectionne.categorie]}</p>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions">
          <span>Suggestions :</span>
          {suggestions.map((suggestion, index) => (
            <button key={`${suggestion.aliment}-${index}`} type="button" onClick={() => {
              const reference = trouverAlimentReferentiel(referentiel, suggestion.aliment);
              if (reference) choisirAliment(reference);
            }}>{suggestion.aliment}</button>
          ))}
        </div>
      )}

      <div className="assiette">
        <h3>Mon repas</h3>
        {!assiette.length && <p>Aucun aliment ajouté pour le moment.</p>}
        {assiette.map(composant => (
          <div className="composant" key={composant.id}>
            <div><strong>{composant.nom}</strong><small>{composant.categorie}</small></div>
            <label>
              Quantité
              <input type="number" min="0.01" step="0.01" value={composant.quantite} onChange={event => modifierQuantite(composant.id, event.target.value)} />
            </label>
            <span>{composant.unite}</span>
            <strong>{Number.isFinite(Number(composant.kcal)) ? `${composant.kcal} kcal` : 'Calcul impossible'}</strong>
            <button type="button" onClick={() => setAssiette(courante => courante.filter(item => item.id !== composant.id))}>Retirer</button>
          </div>
        ))}
        {assiette.length > 0 && <div className="total">Total du repas : {totalKcal} kcal</div>}
      </div>

      {assiette.length > 1 && !modeleCharge && (
        <div className="sauvegarde-modele">
          <label className="case-option">
            <input type="checkbox" checked={enregistrerModele} onChange={event => setEnregistrerModele(event.target.checked)} />
            Enregistrer aussi ce repas pour le réutiliser
          </label>
          {enregistrerModele && <input value={nomModele} onChange={event => setNomModele(event.target.value)} placeholder="Nom du repas, par exemple Poulet et légumes" />}
        </div>
      )}

      {modeleCharge && (
        <div className="modele-charge">
          <input value={nomModele} onChange={event => setNomModele(event.target.value)} aria-label="Nom du repas enregistré" />
          <button type="button" style={{ ...bouton, background: '#ede7f6', color: '#6a1b9a' }} disabled={chargement} onClick={mettreAJourModele}>Mettre à jour ce repas enregistré</button>
        </div>
      )}

      <button className="validation" type="button" disabled={chargement || !assiette.length} onClick={planifierRepas}>
        {chargement ? 'Enregistrement…' : 'Enregistrer dans mon planning'}
      </button>

      {erreur && <div className="message erreur" role="alert">{erreur}</div>}
      {feedback && <div className="message succes" role="status">{feedback}</div>}

      {modeles.length > 0 && (
        <details className="gestion-modeles">
          <summary>Gérer mes repas enregistrés</summary>
          {modeles.map(modele => (
            <div key={modele.id} className="modele-ligne">
              <div><strong>{modele.nom}</strong><small>{modele.composition.map(item => item.nom).join(' + ')}</small></div>
              <button type="button" onClick={() => chargerModele(modele.id)}>Charger</button>
              <button type="button" onClick={() => dupliquerModele(modele)}>Dupliquer</button>
              <button type="button" onClick={() => effacerModele(modele)}>Supprimer</button>
            </div>
          ))}
        </details>
      )}

      <style jsx>{`
        .planificateur-repas { background: #fffde7; border: 1px solid #ffe082; border-radius: 14px; padding: 18px; margin: 0 0 24px; }
        h2, h3 { margin: 0 0 8px; }
        .ligne, .aliment-selectionne, .composant, .modele-charge, .modele-ligne { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; }
        label { display: grid; gap: 5px; font-weight: 700; }
        input, select { min-height: 40px; border: 1px solid #b0bec5; border-radius: 8px; padding: 7px 10px; background: white; }
        .contexte-repas label { flex: 1 1 220px; }
        .modele-select { margin: 16px 0; }
        .ajout-aliment { background: white; border-radius: 12px; padding: 14px; margin-top: 16px; }
        .ajout-aliment > label { width: 100%; }
        .aliment-selectionne { margin-top: 12px; padding-top: 12px; border-top: 1px solid #eceff1; }
        .aliment-selectionne > div:first-child, .composant > div:first-child, .modele-ligne > div:first-child { display: grid; flex: 1 1 190px; }
        small, .aliment-selectionne span { color: #607d8b; }
        .valeur-calculee { display: grid; min-width: 110px; align-self: center; }
        .aide { color: #c62828; margin: 8px 0 0; }
        .aliment-absent button { border: 0; border-radius: 8px; padding: 8px 10px; background: #e3f2fd; color: #1565c0; cursor: pointer; }
        .formulaire-personnel { margin-top: 12px; padding: 12px; border: 1px solid #ffe082; border-radius: 10px; background: #fffde7; }
        .regle { color: #795548; margin-bottom: 0; }
        .suggestions { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; margin: 12px 0; }
        .suggestions button { border: 0; border-radius: 16px; padding: 6px 10px; background: #c8e6c9; cursor: pointer; }
        .assiette { background: #f5f9ff; border: 1px solid #bbdefb; border-radius: 12px; padding: 14px; margin-top: 16px; }
        .composant { background: white; border-radius: 9px; padding: 9px; margin-top: 8px; }
        .composant input { width: 90px; }
        .composant button, .modele-ligne button { border: 0; border-radius: 8px; padding: 7px 10px; cursor: pointer; }
        .composant button, .modele-ligne button:last-child { background: #ffebee; color: #b71c1c; }
        .total { text-align: right; margin-top: 12px; font-size: 18px; font-weight: 800; }
        .sauvegarde-modele, .modele-charge { margin-top: 14px; padding: 12px; background: #f3e5f5; border-radius: 10px; }
        .case-option { display: flex; align-items: center; grid-template-columns: auto 1fr; }
        .case-option input { min-height: auto; }
        .sauvegarde-modele > input { width: 100%; margin-top: 10px; }
        .validation { display: block; width: 100%; margin-top: 16px; border: 0; border-radius: 10px; padding: 12px; background: #1976d2; color: white; font-weight: 800; cursor: pointer; }
        .validation:disabled { background: #b0bec5; cursor: not-allowed; }
        .message { margin-top: 12px; border-radius: 8px; padding: 10px; font-weight: 700; }
        .erreur { color: #b71c1c; background: #ffebee; }
        .succes { color: #1b5e20; background: #e8f5e9; }
        .gestion-modeles { margin-top: 16px; }
        .gestion-modeles summary { cursor: pointer; font-weight: 700; }
        .modele-ligne { background: white; padding: 9px; margin-top: 8px; border-radius: 8px; }
        @media (max-width: 600px) {
          .aliment-selectionne > *, .composant > *, .modele-charge > * { width: 100%; }
          .composant input { width: 100%; }
        }
      `}</style>
    </section>
  );
}
