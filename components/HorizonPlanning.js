import React, { useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { MODES_HORIZON_PLANNING, regrouperRepasPlanifies } from '../lib/horizonPlanning';
import { normaliserRepasPlanifie } from '../lib/planificationRepas';

const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const TYPES_REPAS = {
  'Petit-déjeuner': { emoji: '🥐', couleur: '#fff3cd' },
  'Déjeuner': { emoji: '🍽️', couleur: '#e3f2fd' },
  'Dîner': { emoji: '🍲', couleur: '#e8f5e9' },
  'Collation': { emoji: '🍏', couleur: '#fce4ec' }
};

function dateLocale(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
}

function titrePeriode(periode) {
  if (!periode?.dates?.length) return '';
  if (periode.mode === MODES_HORIZON_PLANNING.MOIS) {
    return new Date(`${periode.debut}T12:00:00`).toLocaleDateString('fr-FR', {
      month: 'long', year: 'numeric'
    });
  }
  const debut = new Date(`${periode.debut}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const fin = new Date(`${periode.fin}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${debut} – ${fin}`;
}

function CarteRepas({ groupe, index, referentiel, onMove, onDelete, actionsVisibles = true, compact = false }) {
  const [deplacementOuvert, setDeplacementOuvert] = useState(false);
  const [nouvelleDate, setNouvelleDate] = useState(groupe.date || '');
  const type = TYPES_REPAS[groupe.type] || { emoji: '🍽️', couleur: '#f5f5f5' };
  const lignes = groupe.lignes.map(ligne => normaliserRepasPlanifie(ligne, referentiel));
  const total = lignes.reduce((somme, ligne) => somme + Number(ligne.kcal_calculees || 0), 0);
  const estCompose = lignes.length > 1;

  return (
    <Draggable draggableId={groupe.cle} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`carte-repas ${compact ? 'carte-repas-compacte' : ''} ${snapshot.isDragging ? 'en-deplacement' : ''}`}
          style={{ background: type.couleur, ...provided.draggableProps.style }}
          aria-label={`${groupe.type}, carte déplaçable`}
        >
          <div className="entete-repas">
            <span className="poignee" aria-hidden="true">☰</span>
            <strong>{type.emoji} {groupe.type}</strong>
            {estCompose && <span className="badge-assiette">Assiette · {lignes.length} aliments</span>}
          </div>

          <div className="lignes-repas">
            {lignes.map(ligne => (
              <div className="ligne-repas" key={ligne.id}>
                <span>
                  <b>{ligne.aliment}</b>
                  <small>
                    {ligne.quantite_affichee || 'Quantité non renseignée'}
                    {ligne.kcal_calculees !== null ? ` · ${ligne.kcal_calculees} kcal` : ' · Calories non renseignées'}
                  </small>
                </span>
                {actionsVisibles && (
                  <button type="button" className="supprimer" onClick={() => onDelete(ligne)} aria-label={`Supprimer ${ligne.aliment}`}>
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          {total > 0 && <div className="total-repas">Total : {total} kcal</div>}

          {actionsVisibles && (
            <>
              <button type="button" className="ouvrir-deplacement" onClick={() => setDeplacementOuvert(ouvert => !ouvert)}>
                {deplacementOuvert ? 'Annuler le déplacement' : estCompose ? 'Déplacer toute l’assiette' : 'Déplacer ce repas'}
              </button>
              {deplacementOuvert && (
                <div className="choix-deplacement">
                  <label>
                    Nouveau jour
                    <input type="date" value={nouvelleDate} onChange={event => setNouvelleDate(event.target.value)} />
                  </label>
                  <button
                    type="button"
                    disabled={!nouvelleDate || nouvelleDate === groupe.date}
                    onClick={async () => {
                      const reussi = await onMove(groupe.lignes, nouvelleDate);
                      if (reussi) setDeplacementOuvert(false);
                    }}
                  >
                    Confirmer
                  </button>
                </div>
              )}
            </>
          )}
        </article>
      )}
    </Draggable>
  );
}

function JourSemaineCompact({
  date,
  repas,
  ouvert,
  selectedDate,
  referentiel,
  totalJour,
  onToggle,
  onSelectDate,
  onMove,
  onDelete
}) {
  const groupes = useMemo(() => regrouperRepasPlanifies(repas), [repas]);
  const jour = new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

  return (
    <section className={`jour-semaine ${ouvert ? 'jour-semaine-ouvert' : ''} ${selectedDate === date ? 'jour-semaine-selectionne' : ''}`}>
      <button type="button" className="entete-jour-semaine" onClick={onToggle} aria-expanded={ouvert}>
        <span><strong>{jour}</strong><small>{groupes.length ? `${groupes.length} repas` : 'Journée libre'}</small></span>
        <span aria-hidden="true">{ouvert ? '−' : '+'}</span>
      </button>
      <Droppable droppableId={date}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`zone-semaine ${snapshot.isDraggingOver ? 'zone-active' : ''}`}
          >
            {groupes.map((groupe, index) => (
              <CarteRepas
                key={groupe.cle}
                groupe={groupe}
                index={index}
                referentiel={referentiel}
                onMove={onMove}
                onDelete={onDelete}
                actionsVisibles={ouvert}
                compact
              />
            ))}
            {!groupes.length && <p className="jour-vide-compact">Dépose un repas ici</p>}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {repas.length > 0 && <div className="total-semaine">{totalJour?.totalJour || 0} kcal{!totalJour?.complet ? ' · partiel' : ''}</div>}
      {ouvert && (
        <button type="button" className="planifier-jour" onClick={() => onSelectDate(date)}>
          {selectedDate === date ? 'Ajouter un repas à ce jour' : 'Planifier ce jour'}
        </button>
      )}
    </section>
  );
}

function VueSemaine({ periode, planning, selectedDate, referentiel, totauxPlanning, onSelectDate, onMove, onDelete }) {
  const [dateOuverte, setDateOuverte] = useState(selectedDate);
  return (
    <div className="grille-semaine">
      {periode.dates.map(date => (
        <JourSemaineCompact
          key={date}
          date={date}
          repas={planning[date] || []}
          ouvert={dateOuverte === date}
          selectedDate={selectedDate}
          referentiel={referentiel}
          totalJour={totauxPlanning[date]}
          onToggle={() => setDateOuverte(courante => courante === date ? null : date)}
          onSelectDate={onSelectDate}
          onMove={onMove}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function JourDetaille({ date, repas, selectedDate, referentiel, totalJour, onSelectDate, onMove, onDelete }) {
  const groupes = useMemo(() => regrouperRepasPlanifies(repas), [repas]);
  return (
    <section className={`jour-detaille ${selectedDate === date ? 'jour-selectionne' : ''}`}>
      <header>
        <div>
          <h3>{dateLocale(date)}</h3>
          <span>{groupes.length ? `${groupes.length} repère${groupes.length > 1 ? 's' : ''}` : 'Journée libre'}</span>
        </div>
        <button type="button" onClick={() => onSelectDate(date)}>
          {selectedDate === date ? 'Jour choisi' : 'Planifier ce jour'}
        </button>
      </header>
      <Droppable droppableId={date}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`zone-depot ${snapshot.isDraggingOver ? 'zone-active' : ''}`}
          >
            {groupes.map((groupe, index) => (
              <CarteRepas
                key={groupe.cle}
                groupe={groupe}
                index={index}
                referentiel={referentiel}
                onMove={onMove}
                onDelete={onDelete}
              />
            ))}
            {!groupes.length && <p className="jour-vide">Dépose un repas ici ou choisis ce jour pour le planifier.</p>}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {repas.length > 0 && (
        <div className="total-jour">
          Total du jour : {totalJour?.totalJour || 0} kcal{!totalJour?.complet ? ' (partiel)' : ''}
        </div>
      )}
    </section>
  );
}

function ApercuMois({ periode, planning, referentiel, totauxPlanning, onOpenDate }) {
  const [dateApercu, setDateApercu] = useState(null);
  const premierJour = new Date(`${periode.debut}T12:00:00`).getDay();
  const cellulesVides = (premierJour + 6) % 7;
  const lignesApercu = dateApercu ? planning[dateApercu] || [] : [];
  const groupesApercu = regrouperRepasPlanifies(lignesApercu);

  return (
    <div className="apercu-mois">
      <div className="jours-semaine">{JOURS_COURTS.map(jour => <b key={jour}>{jour}</b>)}</div>
      <div className="grille-mois">
        {Array.from({ length: cellulesVides }, (_, index) => <span className="hors-mois" key={`vide-${index}`} />)}
        {periode.dates.map(date => {
          const groupes = regrouperRepasPlanifies(planning[date] || []);
          const totalJour = totauxPlanning[date]?.totalJour || 0;
          return (
            <div className={`jour-mois ${dateApercu === date ? 'jour-mois-selectionne' : ''}`} key={date}>
              <button
                type="button"
                onClick={() => setDateApercu(courante => courante === date ? null : date)}
                aria-expanded={dateApercu === date}
                aria-controls="detail-jour-mois"
                aria-label={`${dateLocale(date)}, ${groupes.length ? `${groupes.length} repas planifié${groupes.length > 1 ? 's' : ''}, ${totalJour} kilocalories` : 'journée libre'}`}
              >
                <strong>{Number(date.slice(-2))}</strong>
                <span>{groupes.length ? `${groupes.length} repas` : 'Libre'}</span>
                {groupes.length > 0 && <small>{totalJour} kcal</small>}
              </button>
            </div>
          );
        })}
      </div>
      <p className="aide-mois">Choisis un jour pour consulter son contenu. La planification détaillée reste dans la vue semaine.</p>

      {dateApercu && (
        <section className="detail-jour-mois" id="detail-jour-mois" aria-live="polite">
          <header>
            <div>
              <h3>{dateLocale(dateApercu)}</h3>
              <span>{groupesApercu.length ? `${groupesApercu.length} repas prévu${groupesApercu.length > 1 ? 's' : ''}` : 'Journée libre'}</span>
            </div>
            <button type="button" className="fermer-detail-mois" onClick={() => setDateApercu(null)} aria-label="Fermer le résumé du jour">×</button>
          </header>

          {groupesApercu.length ? (
            <div className="repas-detail-mois">
              {groupesApercu.map(groupe => {
                const type = TYPES_REPAS[groupe.type] || { emoji: '🍽️' };
                const lignes = groupe.lignes.map(ligne => normaliserRepasPlanifie(ligne, referentiel));
                const totalRepas = lignes.reduce((somme, ligne) => somme + Number(ligne.kcal_calculees || 0), 0);
                return (
                  <article key={groupe.cle}>
                    <strong>{type.emoji} {groupe.type}</strong>
                    {lignes.map(ligne => (
                      <div className="ligne-detail-mois" key={ligne.id}>
                        <span>{ligne.aliment}</span>
                        <small>
                          {ligne.quantite_affichee || 'Quantité non renseignée'}
                          {ligne.kcal_calculees !== null ? ` · ${ligne.kcal_calculees} kcal` : ' · Calories non renseignées'}
                        </small>
                      </div>
                    ))}
                    {totalRepas > 0 && <b className="total-detail-repas">Total du repas : {totalRepas} kcal</b>}
                  </article>
                );
              })}
              <div className="total-detail-jour">Total du jour : {totauxPlanning[dateApercu]?.totalJour || 0} kcal{!totauxPlanning[dateApercu]?.complet ? ' (partiel)' : ''}</div>
            </div>
          ) : (
            <p className="aucun-repas-mois">Aucun repas n’est encore prévu pour cette journée.</p>
          )}

          <button type="button" className="ouvrir-semaine-mois" onClick={() => onOpenDate(dateApercu)}>
            {groupesApercu.length ? 'Voir cette journée dans ma semaine' : 'Planifier cette journée'}
          </button>
        </section>
      )}
    </div>
  );
}

export default function HorizonPlanning({
  mode,
  periode,
  planning,
  selectedDate,
  referentiel,
  totauxPlanning,
  onModeChange,
  onPrevious,
  onNext,
  onToday,
  onSelectDate,
  onMove,
  onDelete
}) {
  const groupesParCle = useMemo(() => {
    const index = new Map();
    Object.values(planning).forEach(lignes => {
      regrouperRepasPlanifies(lignes).forEach(groupe => index.set(groupe.cle, groupe));
    });
    return index;
  }, [planning]);

  if (!periode) return null;

  const onDragEnd = result => {
    if (!result.destination || result.source.droppableId === result.destination.droppableId) return;
    const groupe = groupesParCle.get(result.draggableId);
    if (groupe) onMove(groupe.lignes, result.destination.droppableId);
  };

  return (
    <section className="horizon-planning" aria-label="Planning alimentaire">
      <div className="choix-horizon" role="group" aria-label="Période du planning">
        <button className={mode === MODES_HORIZON_PLANNING.SEMAINE ? 'actif' : ''} onClick={() => onModeChange(MODES_HORIZON_PLANNING.SEMAINE)}>Cette semaine</button>
        <button className={mode === MODES_HORIZON_PLANNING.QUINZE_JOURS ? 'actif' : ''} onClick={() => onModeChange(MODES_HORIZON_PLANNING.QUINZE_JOURS)}>15 prochains jours</button>
        <button className={mode === MODES_HORIZON_PLANNING.MOIS ? 'actif' : ''} onClick={() => onModeChange(MODES_HORIZON_PLANNING.MOIS)}>Aperçu du mois</button>
      </div>

      <div className="navigation-periode">
        <button type="button" onClick={onPrevious} aria-label="Période précédente">←</button>
        <strong>{titrePeriode(periode)}</strong>
        <button type="button" onClick={onNext} aria-label="Période suivante">→</button>
        <button type="button" className="aujourdhui" onClick={onToday}>Aujourd’hui</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {mode === MODES_HORIZON_PLANNING.MOIS ? (
          <ApercuMois
            periode={periode}
            planning={planning}
            referentiel={referentiel}
            totauxPlanning={totauxPlanning}
            onOpenDate={date => {
              onSelectDate(date);
              onModeChange(MODES_HORIZON_PLANNING.SEMAINE);
            }}
          />
        ) : mode === MODES_HORIZON_PLANNING.SEMAINE ? (
          <VueSemaine
            periode={periode}
            planning={planning}
            selectedDate={selectedDate}
            referentiel={referentiel}
            totauxPlanning={totauxPlanning}
            onSelectDate={onSelectDate}
            onMove={onMove}
            onDelete={onDelete}
          />
        ) : (
          <div className="liste-jours">
            {periode.dates.map(date => (
              <JourDetaille
                key={date}
                date={date}
                repas={planning[date] || []}
                selectedDate={selectedDate}
                referentiel={referentiel}
                totalJour={totauxPlanning[date]}
                onSelectDate={onSelectDate}
                onMove={onMove}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </DragDropContext>

      <style jsx global>{`
        .horizon-planning { margin: 20px 0 24px; }
        .horizon-planning button { cursor: pointer; font: inherit; }
        .choix-horizon { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; max-width: 720px; margin: 0 auto 16px; }
        .choix-horizon button { min-height: 44px; border: 1px solid #90caf9; border-radius: 10px; padding: 8px; background: white; color: #1565c0; font-weight: 700; }
        .choix-horizon .actif { background: #1976d2; color: white; border-color: #1976d2; }
        .navigation-periode { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; margin-bottom: 16px; text-transform: capitalize; }
        .navigation-periode button { min-height: 40px; border: 0; border-radius: 9px; padding: 7px 13px; background: #e3f2fd; color: #0d47a1; font-weight: 700; }
        .navigation-periode strong { min-width: 220px; text-align: center; }
        .navigation-periode .aujourdhui { background: #f3e5f5; color: #6a1b9a; }
        .liste-jours { display: grid; gap: 14px; }
        .grille-semaine { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; align-items: start; }
        .jour-semaine { min-width: 0; border: 1px solid #bbdefb; border-radius: 11px; background: white; overflow: hidden; }
        .jour-semaine-selectionne { box-shadow: 0 0 0 2px #d1c4e9; }
        .entete-jour-semaine { width: 100%; min-height: 54px; display: flex; align-items: center; justify-content: space-between; gap: 5px; border: 0; padding: 8px; background: #e3f2fd; color: #0d47a1; text-transform: capitalize; text-align: left; }
        .entete-jour-semaine > span:first-child { min-width: 0; display: grid; }
        .entete-jour-semaine small { color: #607d8b; font-size: 11px; font-weight: 600; }
        .zone-semaine { min-height: 52px; display: grid; gap: 6px; padding: 6px; border: 2px dashed transparent; transition: background .15s, border-color .15s; }
        .jour-vide-compact { min-height: 38px; display: grid; place-items: center; margin: 0; border: 1px dashed #b0bec5; border-radius: 7px; padding: 5px; color: #607d8b; font-size: 11px; text-align: center; }
        .total-semaine { padding: 3px 7px 7px; color: #455a64; font-size: 11px; font-weight: 700; text-align: right; }
        .planifier-jour { width: calc(100% - 12px); min-height: 36px; margin: 0 6px 7px; border: 0; border-radius: 8px; padding: 6px; background: #ede7f6; color: #6a1b9a; font-size: 12px; font-weight: 700; }
        .jours-semaine, .grille-mois { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
        .jours-semaine { text-align: center; color: #546e7a; margin-bottom: 5px; font-size: 13px; }
        .hors-mois { min-height: 66px; }
        .jour-mois { min-width: 0; min-height: 72px; display: grid; border: 1px solid #cfd8dc; border-radius: 9px; background: white; color: #263238; }
        .jour-mois button { min-width: 0; display: grid; align-content: center; justify-items: center; gap: 2px; border: 0; border-radius: inherit; padding: 4px 2px; background: transparent; color: inherit; }
        .jour-mois span { color: #1976d2; font-size: 12px; }
        .jour-mois small { color: #546e7a; font-size: 10px; }
        .jour-mois-selectionne { outline: 3px solid #7e57c2; border-color: transparent; }
        .aide-mois { color: #607d8b; text-align: center; font-size: 14px; }
        .detail-jour-mois { max-width: 720px; margin: 14px auto 0; border: 1px solid #bbdefb; border-left: 7px solid #42a5f5; border-radius: 14px; padding: 14px; background: white; }
        .detail-jour-mois > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        .detail-jour-mois h3 { margin: 0; text-transform: capitalize; }
        .detail-jour-mois header span { display: block; margin-top: 3px; color: #607d8b; font-size: 14px; }
        .fermer-detail-mois { min-width: 40px; min-height: 40px; border: 0; border-radius: 50%; background: #eceff1; color: #37474f; font-size: 22px !important; }
        .repas-detail-mois { display: grid; gap: 9px; }
        .repas-detail-mois article { border-radius: 9px; padding: 10px; background: #f5f7f8; }
        .ligne-detail-mois { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; padding-top: 5px; }
        .ligne-detail-mois small { color: #546e7a; text-align: right; }
        .total-detail-repas { display: block; margin-top: 6px; color: #455a64; text-align: right; font-size: 13px; }
        .total-detail-jour { color: #37474f; text-align: right; font-weight: 700; }
        .aucun-repas-mois { margin: 0 0 10px; color: #607d8b; }
        .ouvrir-semaine-mois { width: 100%; min-height: 44px; margin-top: 12px; border: 0; border-radius: 9px; padding: 9px 12px; background: #1976d2; color: white; font-weight: 700; }
        :global(.jour-detaille) { border: 1px solid #bbdefb; border-left: 7px solid #42a5f5; border-radius: 14px; padding: 14px; background: white; }
        :global(.jour-detaille.jour-selectionne) { box-shadow: 0 0 0 3px #d1c4e9; }
        :global(.jour-detaille > header) { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        :global(.jour-detaille h3) { margin: 0; text-transform: capitalize; }
        :global(.jour-detaille header span) { display: block; color: #607d8b; font-size: 14px; margin-top: 3px; }
        :global(.jour-detaille header button) { flex: 0 0 auto; min-height: 40px; border: 0; border-radius: 9px; padding: 8px 12px; background: #ede7f6; color: #6a1b9a; font-weight: 700; }
        :global(.zone-depot) { min-height: 76px; display: grid; gap: 9px; border: 2px dashed transparent; border-radius: 11px; transition: background .15s, border-color .15s; }
        :global(.zone-depot.zone-active), .zone-active { background: #e8f5e9; border-color: #43a047; }
        :global(.jour-vide) { min-height: 72px; display: grid; place-items: center; margin: 0; border: 2px dashed #cfd8dc; border-radius: 10px; padding: 10px; color: #607d8b; text-align: center; }
        :global(.carte-repas) { border: 1px solid #cfd8dc; border-radius: 10px; padding: 10px; color: #263238; cursor: grab; }
        :global(.carte-repas.en-deplacement) { box-shadow: 0 8px 24px rgba(0,0,0,.18); }
        :global(.entete-repas) { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        :global(.poignee) { border: 0; background: transparent; color: #546e7a; font-size: 20px; line-height: 1; cursor: grab; }
        :global(.badge-assiette) { border-radius: 20px; padding: 3px 8px; background: rgba(255,255,255,.8); color: #6a1b9a; font-size: 12px; font-weight: 700; }
        :global(.lignes-repas) { margin-top: 7px; }
        :global(.ligne-repas) { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-top: 1px solid rgba(84,110,122,.14); }
        :global(.ligne-repas > span) { flex: 1; }
        :global(.ligne-repas small) { display: block; color: #546e7a; margin-top: 2px; }
        :global(.supprimer) { border: 0; background: transparent; min-width: 38px; min-height: 38px; }
        :global(.total-repas), :global(.total-jour) { margin-top: 7px; text-align: right; font-weight: 700; color: #37474f; }
        :global(.ouvrir-deplacement) { margin-top: 8px; border: 0; border-radius: 8px; padding: 7px 10px; background: white; color: #1565c0; font-weight: 700; }
        :global(.choix-deplacement) { display: flex; flex-wrap: wrap; align-items: end; gap: 9px; margin-top: 9px; padding: 9px; background: rgba(255,255,255,.75); border-radius: 9px; }
        :global(.choix-deplacement label) { display: grid; gap: 4px; font-weight: 700; flex: 1 1 180px; }
        :global(.choix-deplacement input), :global(.choix-deplacement button) { min-height: 40px; border: 1px solid #b0bec5; border-radius: 8px; padding: 7px 10px; background: white; }
        :global(.choix-deplacement button) { border: 0; background: #1976d2; color: white; font-weight: 700; }
        :global(.choix-deplacement button:disabled) { background: #b0bec5; }
        :global(.carte-repas-compacte) { padding: 7px; font-size: 12px; }
        :global(.carte-repas-compacte .entete-repas) { gap: 4px; }
        :global(.carte-repas-compacte .poignee) { font-size: 15px; }
        :global(.carte-repas-compacte .badge-assiette) { width: 100%; padding: 2px 5px; font-size: 10px; }
        :global(.carte-repas-compacte .ligne-repas) { padding: 4px 0; }
        :global(.carte-repas-compacte .ligne-repas small) { font-size: 10px; }
        :global(.carte-repas-compacte .total-repas) { font-size: 11px; }
        @media (max-width: 600px) {
          .choix-horizon { grid-template-columns: 1fr; }
          .navigation-periode strong { order: -1; width: 100%; }
          .grille-semaine { grid-template-columns: 1fr; gap: 7px; }
          .jour-semaine { display: grid; grid-template-columns: minmax(96px, .3fr) 1fr auto; align-items: start; }
          .jour-semaine-ouvert { grid-template-columns: 1fr; }
          .entete-jour-semaine { height: 100%; min-height: 58px; }
          .jour-semaine-ouvert .entete-jour-semaine { height: auto; }
          .zone-semaine { min-height: 58px; padding: 4px; }
          .total-semaine { align-self: center; padding: 7px; white-space: nowrap; }
          .jour-semaine-ouvert .total-semaine { padding: 3px 7px 7px; }
          :global(.carte-repas-compacte .lignes-repas) { margin-top: 4px; }
          :global(.jour-detaille > header) { align-items: flex-start; }
          :global(.jour-detaille > header button) { max-width: 130px; }
          :global(.choix-deplacement > *) { width: 100%; }
          .jour-mois, .hors-mois { min-height: 66px; }
          .jour-mois span { font-size: 10px; }
          .jour-mois small { font-size: 9px; }
          .ligne-detail-mois { grid-template-columns: 1fr; gap: 1px; }
          .ligne-detail-mois small { text-align: left; }
        }
      `}</style>
    </section>
  );
}
