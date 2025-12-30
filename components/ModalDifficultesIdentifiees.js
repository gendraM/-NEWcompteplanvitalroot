
import React, { useState } from 'react';

export default function ModalDifficultesIdentifiees({ isOpen, onClose, onSubmit, tauxConformite, tauxValidation }) {
  const [difficultes, setDifficultes] = useState({
    organisation: false,
    tentations: false,
    entourage: false,
    fatigue: false,
    comprehension: false,
    autre: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setDifficultes(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (
      !difficultes.organisation &&
      !difficultes.tentations &&
      !difficultes.entourage &&
      !difficultes.fatigue &&
      !difficultes.comprehension &&
      !difficultes.autre.trim()
    ) {
      alert('Merci de sélectionner ou décrire au moins une difficulté.');
      return;
    }
    onSubmit && onSubmit(difficultes);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: '2.2rem 2.5rem', minWidth: 320, maxWidth: 420, boxShadow: '0 8px 32px #0003', position: 'relative', textAlign: 'center'
      }}>
        <button onClick={onClose} style={{position:'absolute',top:10,right:10,background:'none',border:'none',fontSize:'1.5rem',color:'#1976d2',cursor:'pointer'}}>✖</button>
        <h2 style={{color:'#c62828',fontWeight:800,fontSize:'1.25rem',marginBottom:10}}>Difficultés identifiées</h2>
        <div style={{color:'#444',fontSize:'1.05rem',marginBottom:18}}>
          Nous avons détecté que la reprise n'a pas été optimale.<br/>
          <b>Conformité repas :</b> {tauxConformite}%<br/>
          <b>Jours validés :</b> {tauxValidation}%
        </div>
        <form style={{marginBottom:16, textAlign:'left'}}>
          <div style={{marginBottom:8}}>
            <label><input type="checkbox" name="organisation" checked={difficultes.organisation} onChange={handleChange}/> Manque d'organisation</label>
          </div>
          <div style={{marginBottom:8}}>
            <label><input type="checkbox" name="tentations" checked={difficultes.tentations} onChange={handleChange}/> Tentations alimentaires</label>
          </div>
          <div style={{marginBottom:8}}>
            <label><input type="checkbox" name="entourage" checked={difficultes.entourage} onChange={handleChange}/> Pression de l'entourage</label>
          </div>
          <div style={{marginBottom:8}}>
            <label><input type="checkbox" name="fatigue" checked={difficultes.fatigue} onChange={handleChange}/> Fatigue / manque d'énergie</label>
          </div>
          <div style={{marginBottom:8}}>
            <label><input type="checkbox" name="comprehension" checked={difficultes.comprehension} onChange={handleChange}/> Compréhension des consignes</label>
          </div>
          <div style={{marginBottom:12}}>
            <label>Autre&nbsp;:<br/>
              <textarea name="autre" rows={2} style={{width:'100%',borderRadius:8,border:'1.5px solid #bdbdbd',padding:'0.7rem',fontSize:'1rem',marginTop:4}} value={difficultes.autre} onChange={handleChange} placeholder="Décris en quelques mots..."/>
            </label>
          </div>
        </form>
        <button onClick={handleSubmit} style={{background:'linear-gradient(135deg,#e53935 0%,#c62828 100%)',color:'white',border:'none',borderRadius:8,padding:'0.8rem 1.7rem',fontWeight:700,fontSize:'1.08rem',cursor:'pointer',boxShadow:'0 2px 8px #e5393533'}}>Envoyer</button>
      </div>
    </div>
  );
}
