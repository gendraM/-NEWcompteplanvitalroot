import { useState } from 'react';

/**
 * Formulaire d’ajout d’aliment personnalisé
 * Guidage, validation temps réel, aide QN, correction orthographe
 */
export default function FormAjoutAliment({ nomInitial = '', onSave, onCancel }) {
  const [nom, setNom] = useState(nomInitial);
  const [categorie, setCategorie] = useState('');
  const [sousCategorie, setSousCategorie] = useState('');
  const [unite, setUnite] = useState('g');
  const [quantite, setQuantite] = useState('');
  const [kcal, setKcal] = useState('');
  const [qn, setQn] = useState('');
  const [portionDefaut, setPortionDefaut] = useState('');
  const [marque, setMarque] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [erreur, setErreur] = useState('');

  // Validation temps réel
  function validate() {
    if (!nom.trim()) return 'Nom obligatoire';
    if (!categorie) return 'Catégorie obligatoire';
    if (!unite) return 'Unité obligatoire';
    if (!quantite || isNaN(Number(quantite)) || Number(quantite) <= 0) return 'Quantité invalide';
    if (!kcal || isNaN(Number(kcal)) || Number(kcal) <= 0) return 'Kcal invalide';
    if (!qn || isNaN(Number(qn)) || Number(qn) < 1 || Number(qn) > 5) return 'QN entre 1 et 5';
    return '';
  }

  // Correction orthographe simple (à enrichir)
  function autoCorrectNom(nom) {
    return nom.replace(/\s+/g, ' ').replace(/(^| )([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
  }

  function handleSave() {
    const err = validate();
    if (err) {
      setErreur(err);
      return;
    }
    setErreur('');
    onSave({ nom: autoCorrectNom(nom), categorie, sousCategorie, unite, quantite, kcal, qn, portionDefaut, marque, alternatives });
  }

  return (
    <div className="form-ajout-aliment">
      <h3>Ajouter un aliment personnalisé</h3>
      <div>
        <label>Nom</label>
        <input value={nom} onChange={e => setNom(e.target.value)} />
      </div>
      <div>
        <label>Catégorie</label>
        <select value={categorie} onChange={e => setCategorie(e.target.value)}>
          <option value="">Choisir</option>
          <option value="féculent">Féculent</option>
          <option value="protéine">Protéine</option>
          <option value="légume">Légume</option>
          <option value="fruit">Fruit</option>
          <option value="extra">Extra</option>
          <option value="boisson">Boisson</option>
          <option value="matière grasse">Matière grasse</option>
        </select>
      </div>
      <div>
        <label>Sous-catégorie</label>
        <input value={sousCategorie} onChange={e => setSousCategorie(e.target.value)} />
      </div>
      <div>
        <label>Unité</label>
        <select value={unite} onChange={e => setUnite(e.target.value)}>
          <option value="g">g</option>
          <option value="CS">CS</option>
          <option value="pièce">pièce</option>
          <option value="ml">ml</option>
        </select>
      </div>
      <div>
        <label>Quantité</label>
        <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} />
      </div>
      <div>
        <label>Kcal (pour l’unité)</label>
        <input type="number" value={kcal} onChange={e => setKcal(e.target.value)} />
      </div>
      <div>
        <label>QN (Qualité Nutritionnelle)</label>
        <select value={qn} onChange={e => setQn(e.target.value)}>
          <option value="">Choisir</option>
          <option value="5">5 - Naturel</option>
          <option value="4">4 - Peu transformé</option>
          <option value="3">3 - Transformé modéré</option>
          <option value="2">2 - Transformé industriel</option>
          <option value="1">1 - Ultra-transformé</option>
        </select>
        <button type="button" onClick={() => window.alert('Voir guide QN détaillé')}>En savoir plus sur QN</button>
      </div>
      <div>
        <label>Portion par défaut</label>
        <input value={portionDefaut} onChange={e => setPortionDefaut(e.target.value)} />
      </div>
      <div>
        <label>Marque (optionnel)</label>
        <input value={marque} onChange={e => setMarque(e.target.value)} />
      </div>
      <div>
        <label>Alternatives (optionnel)</label>
        <input value={alternatives.join(', ')} onChange={e => setAlternatives(e.target.value.split(','))} />
      </div>
      {erreur && <div className="erreur">{erreur}</div>}
      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={handleSave}>Enregistrer</button>
        <button type="button" onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}
