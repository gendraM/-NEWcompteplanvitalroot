import { useMemo, useState } from 'react';
import ListeCoursesPratique from './ListeCoursesPratique';
import {
  choixCoursesComplets,
  creerConfigurationCoursesReprise,
  genererListeCoursesPersonnalisee,
  initialiserEtatsListeCourses
} from '../lib/listeCoursesReprise';

export default function PreparationPeriodeCourses({ programme, debut, fin, periodeExistante, onSave }) {
  const [choix, setChoix] = useState(periodeExistante?.choix || {});
  const configuration = useMemo(() => creerConfigurationCoursesReprise(programme, fin, debut), [programme, debut, fin]);
  const liste = useMemo(
    () => periodeExistante?.liste || initialiserEtatsListeCourses(genererListeCoursesPersonnalisee(programme, choix, fin, debut)),
    [programme, choix, fin, debut, periodeExistante]
  );

  if (periodeExistante) {
    return <ListeCoursesPratique programme={{ ...programme, options:{ ...(programme.options || {}), choix_courses:periodeExistante.choix } }} listeCourses={periodeExistante.liste} debutJour={debut} finJour={fin} titre={`Courses suivantes — J${debut} à J${fin}`} onChange={(prochaineListe, prochainsChoix) => onSave({ debut, fin, liste:prochaineListe, choix:prochainsChoix })} />;
  }

  const basculer = (groupeId, nom) => setChoix(actuels => ({
    ...actuels,
    [groupeId]: (actuels[groupeId] || []).includes(nom)
      ? actuels[groupeId].filter(item => item !== nom)
      : [...(actuels[groupeId] || []), nom]
  }));

  return (
    <section style={{ background:'#eef5ff', border:'1px solid #9ebbe5', borderRadius:12, padding:'1rem 1.2rem', marginBottom:'2rem' }}>
      <h2 style={{ margin:'0 0 0.4rem', color:'#254f87', fontSize:'1.18rem' }}>Préparer les courses suivantes — J{debut} à J{fin}</h2>
      <p style={{ color:'#4c6079' }}>Cette liste utilise le même programme de reprise. Choisis au moins une option dans chaque groupe utile pour cette période.</p>
      {configuration.groupes.map(groupe => (
        <fieldset key={groupe.id} style={{ border:'1px solid #b7c9e4', borderRadius:8, marginBottom:10 }}>
          <legend style={{ fontWeight:700 }}>{groupe.titre}</legend>
          {groupe.options.map(option => (
            <label key={option.nom} style={{ display:'block', padding:'5px 2px' }}>
              <input type="checkbox" checked={(choix[groupe.id] || []).includes(option.nom)} onChange={() => basculer(groupe.id, option.nom)} /> {option.nom}
            </label>
          ))}
        </fieldset>
      ))}
      <button type="button" disabled={!choixCoursesComplets(configuration, choix)} onClick={() => onSave({ debut, fin, choix, liste:initialiserEtatsListeCourses(genererListeCoursesPersonnalisee(programme, choix, fin, debut)) })} style={{ padding:'0.7rem 1rem', border:0, borderRadius:8, background:choixCoursesComplets(configuration, choix) ? '#315f9e' : '#aaa', color:'#fff' }}>Enregistrer cette nouvelle période</button>
    </section>
  );
}
