import { useState, useMemo } from 'react';
import ModalGuideQN from './ModalGuideQN';
import referentielAliments from '../data/referentiel';

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
  const [showGuideQN, setShowGuideQN] = useState(false);

  // Extraire dynamiquement toutes les catégories distinctes du référentiel
  const categoriesReferentiel = useMemo(() => {
    const set = new Set();
    referentielAliments.forEach(a => {
      if (a.categorie && typeof a.categorie === 'string') set.add(a.categorie);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, []);

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
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <label style={{margin:0}}>Catégorie</label>
        <span style={{cursor:'pointer',color:'#1976d2',fontWeight:700,fontSize:18,position:'relative'}}
          tabIndex={0}
          aria-label="Information catégorie"
          onFocus={e=>e.target.nextSibling.style.display='block'}
          onBlur={e=>e.target.nextSibling.style.display='none'}
          onMouseEnter={e=>e.target.nextSibling.style.display='block'}
          onMouseLeave={e=>e.target.nextSibling.style.display='none'}
        >
          i
          <span style={{
            display:'none',position:'absolute',left:'110%',top:0,zIndex:10,
            background:'#fff',border:'1px solid #1976d2',borderRadius:6,padding:'10px 14px',fontSize:13,minWidth:320,
            boxShadow:'0 2px 8px #1976d255',color:'#222',fontWeight:400
          }}>
            <b>Catégorie</b> : grande famille d’aliments (ex : féculent, protéine, snack, asiatique, etc.)<br/>
            <b>Sous-catégorie</b> : précision sur le type ou l’origine (ex : “Chocolat”, “Brochette japonaise”, “marque”, “recette maison”…).<br/>
            <span style={{color:'#1976d2'}}>Utilisez la catégorie pour le classement principal, la sous-catégorie pour affiner.</span>
            <hr style={{margin:'8px 0'}}/>
            <b>Comment classer mon aliment ?</b><br/>
            <ul style={{paddingLeft:18,margin:'6px 0'}}>
              <li><b>Féculent</b> : galette de maïs, purée de patate douce maison<br/><i>Sous-catégorie : “galette”, “purée maison”</i></li>
              <li><b>Protéine</b> : omelette végétale, steak de pois chiche<br/><i>Sous-catégorie : “omelette”, “végétal”, “pois chiche”</i></li>
              <li><b>Légume</b> : poêlée de légumes oubliés, soupe froide maison<br/><i>Sous-catégorie : “poêlée”, “soupe maison”</i></li>
              <li><b>Fruit</b> : compote de mangue, salade de fruits exotiques<br/><i>Sous-catégorie : “compote”, “salade maison”</i></li>
              <li><b>Boisson</b> : boisson lactée végétale, smoothie cacao<br/><i>Sous-catégorie : “lait végétal”, “smoothie”</i></li>
              <li><b>Snack</b> : chips de patate douce, crackers sésame<br/><i>Sous-catégorie : “chips”, “crackers”</i></li>
              <li><b>Dessert</b> : flan coco, mousse de patate douce<br/><i>Sous-catégorie : “flan”, “mousse”</i></li>
              <li><b>Confiserie</b> : pâte de fruit artisanale, nougat tendre<br/><i>Sous-catégorie : “pâte de fruit”, “nougat”</i></li>
              <li><b>Fast-food</b> : burger végétal maison, wrap lentilles<br/><i>Sous-catégorie : “burger maison”, “wrap”</i></li>
              <li><b>Salade</b> : salade de quinoa, taboulé libanais<br/><i>Sous-catégorie : “quinoa”, “taboulé”</i></li>
              <li><b>Sandwich</b> : panini aubergine, sandwich houmous<br/><i>Sous-catégorie : “panini”, “houmous”</i></li>
              <li><b>Tarte</b> : tarte courgette chèvre, quiche sans pâte<br/><i>Sous-catégorie : “tarte”, “quiche”</i></li>
              <li><b>Produit laitier</b> : boisson lactée chocolatée, yaourt végétal<br/><i>Sous-catégorie : “lait chocolaté”, “yaourt végétal”</i></li>
            </ul>
            <span style={{color:'#1976d2',fontSize:12}}>Astuce : si tu hésites, inspire-toi des produits similaires dans l’autocomplete ou choisis la catégorie la plus générale, puis précise en sous-catégorie.</span>
          </span>
        </span>
        <select value={categorie} onChange={e => setCategorie(e.target.value)}>
          <option value="">Choisir</option>
          {categoriesReferentiel.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
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
          <option value="cl">cl</option>
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
        <button type="button" style={{marginLeft:8}} onClick={() => setShowGuideQN(true)}>En savoir plus sur QN</button>
      </div>
      <ModalGuideQN open={showGuideQN} onClose={() => setShowGuideQN(false)} />
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
