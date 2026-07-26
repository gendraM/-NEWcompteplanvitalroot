import React, { useMemo, useState } from 'react';

const DEFAULT_VALUES = {
  qualiteAlimentaire: 'moyenne',
  frequenceExtras: 'occasionnelle',
  repasMoyens: '3',
  challengeRealise: 'non',
  challengeType: '',
  challengeDuree: '',
  evolutionPoids: 'je-ne-sais-pas',
  energieGlobale: 'moyenne'
};

function labelQualite(qualite) {
  const map = {
    'tres-equilibree': 'Tres equilibree',
    'plutot-equilibree': 'Plutot equilibree',
    'moyenne': 'Moyenne',
    'plutot-desequilibree': 'Plutot desequilibree',
    'tres-desequilibree': 'Tres desequilibree'
  };
  return map[qualite] || 'Moyenne';
}

function labelExtras(frequence) {
  const map = {
    'rare': 'Rare',
    'occasionnelle': 'Occasionnelle',
    'frequente': 'Frequente',
    'quotidienne': 'Quotidienne'
  };
  return map[frequence] || 'Occasionnelle';
}

function labelEnergie(energie) {
  const map = {
    'tres-bonne': 'Tres bonne',
    'bonne': 'Bonne',
    'moyenne': 'Moyenne',
    'faible': 'Faible'
  };
  return map[energie] || 'Moyenne';
}

export default function ModeTrouSuiviCard({
  suggestion,
  onSave,
  onDismiss
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_VALUES);

  const classification = useMemo(() => {
    return {
      qualiteAlimentaire: labelQualite(form.qualiteAlimentaire),
      extras: labelExtras(form.frequenceExtras),
      energie: labelEnergie(form.energieGlobale),
      repasMoyens: form.repasMoyens
    };
  }, [form]);

  if (!suggestion) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      classification,
      dateDebut: suggestion.dateDebut,
      dateFin: suggestion.dateFin,
      nbJoursSansSaisie: suggestion.nbJoursSansSaisie
    });

    setOpen(false);
    setForm(DEFAULT_VALUES);
  };

  return (
    <div style={{
      marginBottom: 16,
      border: '1px solid #f59e0b',
      borderRadius: 12,
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      boxShadow: '0 1px 6px rgba(245, 158, 11, 0.18)',
      overflow: 'hidden'
    }}>
      <div style={{ padding: 16 }}>
        <div style={{ fontWeight: 800, color: '#9a3412', marginBottom: 6 }}>
          Trou de suivi detecte
        </div>
        <div style={{ color: '#7c2d12', lineHeight: 1.45, fontSize: 14 }}>
          Aucun repas enregistre depuis {suggestion.nbJoursSansSaisie} jours.
          Souhaites-tu reconstituer la periode du {suggestion.dateDebut} au {suggestion.dateFin} en moins de 2 minutes ?
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            style={{
              background: '#ea580c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 12px'
            }}
          >
            {open ? 'Masquer le questionnaire' : 'Reconstituer cette periode'}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background: '#fff',
              color: '#9a3412',
              border: '1px solid #fed7aa',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 12px'
            }}
          >
            Plus tard
          </button>
        </div>
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={{
          padding: 16,
          borderTop: '1px solid #fed7aa',
          background: 'rgba(255,255,255,0.72)',
          display: 'grid',
          gap: 12
        }}>
          <label style={{ fontSize: 14, color: '#7c2d12', fontWeight: 600 }}>
            Alimentation sur la periode
            <select
              value={form.qualiteAlimentaire}
              onChange={(e) => handleChange('qualiteAlimentaire', e.target.value)}
              style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}
            >
              <option value="tres-equilibree">Tres equilibree</option>
              <option value="plutot-equilibree">Plutot equilibree</option>
              <option value="moyenne">Moyenne</option>
              <option value="plutot-desequilibree">Plutot desequilibree</option>
              <option value="tres-desequilibree">Tres desequilibree</option>
            </select>
          </label>

          <label style={{ fontSize: 14, color: '#7c2d12', fontWeight: 600 }}>
            Frequence des extras
            <select
              value={form.frequenceExtras}
              onChange={(e) => handleChange('frequenceExtras', e.target.value)}
              style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}
            >
              <option value="rare">Rare</option>
              <option value="occasionnelle">Occasionnelle</option>
              <option value="frequente">Frequente</option>
              <option value="quotidienne">Quotidienne</option>
            </select>
          </label>

          <label style={{ fontSize: 14, color: '#7c2d12', fontWeight: 600 }}>
            Nombre de repas moyen par jour
            <select
              value={form.repasMoyens}
              onChange={(e) => handleChange('repasMoyens', e.target.value)}
              style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}
            >
              <option value="1">1 repas</option>
              <option value="2">2 repas</option>
              <option value="3">3 repas</option>
              <option value="4+">4 repas ou plus</option>
            </select>
          </label>

          <label style={{ fontSize: 14, color: '#7c2d12', fontWeight: 600 }}>
            As-tu realise un challenge ou un jeune ?
            <select
              value={form.challengeRealise}
              onChange={(e) => handleChange('challengeRealise', e.target.value)}
              style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}
            >
              <option value="non">Non</option>
              <option value="oui">Oui</option>
            </select>
          </label>

          {form.challengeRealise === 'oui' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input
                type="text"
                value={form.challengeType}
                onChange={(e) => handleChange('challengeType', e.target.value)}
                placeholder="Type"
                style={{ padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}
              />
              <input
                type="text"
                value={form.challengeDuree}
                onChange={(e) => handleChange('challengeDuree', e.target.value)}
                placeholder="Duree"
                style={{ padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}
              />
            </div>
          )}

          <label style={{ fontSize: 14, color: '#7c2d12', fontWeight: 600 }}>
            Evolution du poids
            <select
              value={form.evolutionPoids}
              onChange={(e) => handleChange('evolutionPoids', e.target.value)}
              style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}
            >
              <option value="perte">Perdu du poids</option>
              <option value="stable">Stable</option>
              <option value="prise">Pris du poids</option>
              <option value="je-ne-sais-pas">Je ne sais pas</option>
            </select>
          </label>

          <label style={{ fontSize: 14, color: '#7c2d12', fontWeight: 600 }}>
            Energie globale
            <select
              value={form.energieGlobale}
              onChange={(e) => handleChange('energieGlobale', e.target.value)}
              style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}
            >
              <option value="tres-bonne">Tres bonne</option>
              <option value="bonne">Bonne</option>
              <option value="moyenne">Moyenne</option>
              <option value="faible">Faible</option>
            </select>
          </label>

          <div style={{
            background: '#fff',
            border: '1px solid #fed7aa',
            borderRadius: 8,
            padding: 10,
            fontSize: 13,
            color: '#7c2d12',
            lineHeight: 1.5
          }}>
            Classification de periode: qualite {classification.qualiteAlimentaire}, extras {classification.extras},
            energie {classification.energie}, repas moyens {classification.repasMoyens}.
          </div>

          <button
            type="submit"
            style={{
              background: '#c2410c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              padding: '10px 12px',
              cursor: 'pointer'
            }}
          >
            Enregistrer comme donnees estimees
          </button>
        </form>
      )}
    </div>
  );
}
