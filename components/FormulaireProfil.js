export default function FormulaireProfil({
  poids,
  setPoids,
  taille,
  setTaille,
  age,
  setAge,
  sexe,
  setSexe,
  niveauActivite,
  setNiveauActivite,
  objectif,
  setObjectif,
  delai,
  setDelai,
  pourquoi,
  setPourquoi,
  handleSubmit,
  buttonLabel,
  buttonStyle
}) {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Poids de départ (kg)</label>
        <input
          type="number"
          value={poids}
          onChange={(e) => setPoids(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Taille (cm)</label>
        <input
          type="number"
          value={taille}
          onChange={(e) => setTaille(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Âge</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Sexe</label>
        <select
          value={sexe}
          onChange={(e) => setSexe(e.target.value)}
          required
        >
          <option value="">-- Sélectionner --</option>
          <option value="F">Femme</option>
          <option value="M">Homme</option>
        </select>
      </div>

      <div>
        <label>Niveau d'activité physique</label>
        <select
          value={niveauActivite}
          onChange={(e) => setNiveauActivite(e.target.value)}
          required
        >
          <option value="">-- Sélectionner --</option>
          <option value="sedentaire">Sédentaire (peu ou pas d'exercice)</option>
          <option value="modere">Modérément actif (exercice 3-5 jours/semaine)</option>
          <option value="actif">Actif (exercice intense 6-7 jours/semaine)</option>
          <option value="intense">Très actif (exercice quotidien intense)</option>
        </select>
      </div>

      <div>
        <label>Objectif de poids (kg)</label>
        <input
          type="number"
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          required
        />
      </div>

      <div>
        <label>En combien de mois souhaitez-vous atteindre cet objectif&nbsp;?</label>
        <input
          type="number"
          value={delai}
          onChange={(e) => setDelai(e.target.value)}
          min="1"
          required
        />
      </div>

      <div>
        <label>Pourquoi ce projet ?</label>
        <textarea
          value={pourquoi}
          onChange={(e) => setPourquoi(e.target.value)}
          required
        />
      </div>

      {/* Le bouton submit est passé par le parent */}
      <button type="submit" style={buttonStyle}>{buttonLabel}</button>
    </form>
  );
}