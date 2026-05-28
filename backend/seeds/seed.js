'use strict';

require('dotenv').config();

const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

// ── Données de test ──────────────────────────────────────────
const MOT_DE_PASSE = 'noutong1';

// Noms réalistes camerounais pour compléter les classes
const NOMS_SUPPLEMENTAIRES = [
  ['ATANGANA','Pierre'],['BELINGA','Rose'],['BIKELE','Samuel'],['BONGO','Yvette'],
  ['DJOUMESSI','Alain'],['EBANGA','Cécile'],['EKOTTO','Rodrigue'],['ELOUNDOU','Martine'],
  ['ENGAMBA','Thierry'],['ETOA','Sandrine'],['EWANE','Bertrand'],['EYENGA','Nadège'],
  ['FOUDA','Christophe'],['GUIFO','Laure'],['HAMADOU','Ibrahim'],['ISSA','Fatima'],
  ['KAMDEM','Serge'],['KENFACK','Brigitte'],['KOUAM','Didier'],['KUETE','Estelle'],
  ['LEKENE','Franck'],['MANGA','Solange'],['MBARGA','Hervé'],['MBELE','Joëlle'],
  ['MBIA','Stéphane'],['MBOUA','Véronique'],['MEKONGO','Arnaud'],['MENYE','Claudine'],
  ['MESSINA','Gaston'],['METOGO','Isabelle'],['MFOU','Lionel'],['MINKO','Aurore'],
  ['MINYEM','Cédric'],['MOUKOURI','Danielle'],['MVONDO','Éric'],['NANGA','Sylvestre'],
  ['NDZANA','Pauline'],['NGAH','Romuald'],['NGONO','Adèle'],['NGUEMA','Blaise'],
  ['NJIKE','Carole'],['NKOA','Désiré'],['NKOULOU','Élise'],['NTONGA','Fabrice'],
  ['NYOBE','Gisèle'],['OBAMA','Henri'],['OMBOLO','Irène'],['OWONA','Jacques'],
  ['OYONO','Karine'],['SAMBA','Léon'],['TCHOUPO','Mireille'],['TENE','Nicolas'],
  ['TSIMI','Odette'],['WAMBA','Pascal'],['YOMBI','Quentin'],['ZANG','Rachel'],
  ['ZOGO','Serge'],['ABOMO','Thérèse'],['AKONO','Ulrich'],['ALIMA','Vanessa'],
  ['AMOUGOU','William'],['ANDELA','Xavière'],['ASSAMBA','Yves'],['AYISSI','Zoé'],
];

async function seed() {
  const client = await pool.connect();
  console.log('[SEED] Connexion établie. Début du seed…');

  try {
    await client.query('BEGIN');

    // ── Nettoyage dans l'ordre des dépendances ───────────────
    await client.query('TRUNCATE TABLE messages, appreciations, absences, notes, evaluations, enseignant_classes, eleves, matieres, classes, utilisateurs, etablissements RESTART IDENTITY CASCADE');
    console.log('[SEED] Tables vidées.');

    // ── 1. Établissement ─────────────────────────────────────
    const etabRes = await client.query(
      `INSERT INTO etablissements (nom, ville, type) VALUES ($1, $2, $3) RETURNING id`,
      ['Lycée Bilingue d\'Essos', 'Yaoundé', 'lycee']
    );
    const etabId = etabRes.rows[0].id;
    console.log(`[SEED] Établissement créé (id=${etabId})`);

    // ── 2. Hash du mot de passe ──────────────────────────────
    const hash = await bcrypt.hash(MOT_DE_PASSE, 12);

    // ── 3. Utilisateurs ──────────────────────────────────────
    const utilisateurs = [
      { nom: 'ONANA',  prenom: 'Paul',       email: 'onana.paul@lycee-essos.edu',         role: 'proviseur'   },
      { nom: 'NKOMO',  prenom: 'Jean-Paul',   email: 'nkomo.jeanpaul@lycee-essos.edu',     role: 'enseignant'  },
      { nom: 'MBIDA',  prenom: 'Emmanuel',    email: 'mbida.emmanuel@lycee-essos.edu',     role: 'enseignant'  },
      { nom: 'FOGUE',  prenom: 'Nathalie',    email: 'fogue.nathalie@lycee-essos.edu',     role: 'enseignant'  },
      { nom: 'NGUELE', prenom: 'Marie-Claire',email: 'nguele.cpe@lycee-essos.edu',         role: 'cpe'         },
      { nom: 'ZANGA',  prenom: 'Bernadette',  email: 'zanga.secretariat@lycee-essos.edu',  role: 'secretariat' },
    ];

    const userIds = {};
    for (const u of utilisateurs) {
      const res = await client.query(
        `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, etablissement_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [u.nom, u.prenom, u.email, hash, u.role, etabId]
      );
      userIds[u.email] = res.rows[0].id;
    }
    console.log(`[SEED] ${utilisateurs.length} utilisateurs créés.`);

    const nkomoId = userIds['nkomo.jeanpaul@lycee-essos.edu'];

    // ── 4. Matières ──────────────────────────────────────────
    const matieres = [
      { nom: 'Mathématiques',   coefficient: 5, heures_semaine: 4 },
      { nom: 'Physique-Chimie', coefficient: 4, heures_semaine: 3 },
      { nom: 'Français',        coefficient: 4, heures_semaine: 4 },
      { nom: 'Histoire-Géo',    coefficient: 3, heures_semaine: 3 },
      { nom: 'Anglais',         coefficient: 3, heures_semaine: 3 },
      { nom: 'SVT',             coefficient: 3, heures_semaine: 2 },
      { nom: 'Philosophie',     coefficient: 3, heures_semaine: 2 },
      { nom: 'EPS',             coefficient: 2, heures_semaine: 2 },
    ];

    const matiereIds = {};
    for (const m of matieres) {
      const res = await client.query(
        `INSERT INTO matieres (nom, coefficient, heures_semaine) VALUES ($1, $2, $3) RETURNING id`,
        [m.nom, m.coefficient, m.heures_semaine]
      );
      matiereIds[m.nom] = res.rows[0].id;
    }
    console.log(`[SEED] ${matieres.length} matières créées.`);

    const mathId = matiereIds['Mathématiques'];

    // ── 5. Classes ───────────────────────────────────────────
    const classes = [
      { nom: 'Terminale C', niveau: 'Terminale', nbEleves: 52 },
      { nom: 'Première D',  niveau: 'Première',  nbEleves: 48 },
      { nom: 'Seconde C',   niveau: 'Seconde',   nbEleves: 47 },
      { nom: 'Terminale A', niveau: 'Terminale', nbEleves: 45 },
      { nom: 'Première C',  niveau: 'Première',  nbEleves: 50 },
    ];

    const classeIds = {};
    for (const c of classes) {
      const res = await client.query(
        `INSERT INTO classes (nom, niveau, etablissement_id) VALUES ($1, $2, $3) RETURNING id`,
        [c.nom, c.niveau, etabId]
      );
      classeIds[c.nom] = { id: res.rows[0].id, nbEleves: c.nbEleves };
    }
    console.log(`[SEED] ${classes.length} classes créées.`);

    // ── 6. Affectations enseignant ↔ classes ─────────────────
    const affectations = [
      { userId: nkomoId, classeNom: 'Terminale C', matiereNom: 'Mathématiques' },
      { userId: nkomoId, classeNom: 'Première D',  matiereNom: 'Mathématiques' },
      { userId: nkomoId, classeNom: 'Seconde C',   matiereNom: 'Mathématiques' },
    ];

    for (const a of affectations) {
      await client.query(
        `INSERT INTO enseignant_classes (utilisateur_id, classe_id, matiere_id, annee_scolaire, trimestre)
         VALUES ($1, $2, $3, $4, $5)`,
        [a.userId, classeIds[a.classeNom].id, matiereIds[a.matiereNom], '2024-2025', 2]
      );
    }
    console.log('[SEED] Affectations enseignant créées.');

    // ── 7. Élèves ────────────────────────────────────────────
    // Élèves nommés de la maquette (Terminale C)
    const elevesNommes = [
      { nom: 'ABANDA',  prenom: 'Etienne', matricule: 'MAT-2024-001' },
      { nom: 'BIYONG',  prenom: 'Marie',   matricule: 'MAT-2024-002' },
      { nom: 'ESSOMBA', prenom: 'Clara',   matricule: 'MAT-2024-003' },
      { nom: 'NDONGO',  prenom: 'Noël',    matricule: 'MAT-2024-004' },
      { nom: 'KAMGA',   prenom: 'Fatou',   matricule: 'MAT-2024-005' },
      { nom: 'ONANA',   prenom: 'Patrick', matricule: 'MAT-2024-006' },
      { nom: 'ZANG',    prenom: 'Sylvie',  matricule: 'MAT-2024-007' },
    ];

    let matriculeCounter = 8;
    const eleveIds = { termC: [], premD: [], secC: [] };

    // Terminale C — 52 élèves
    const classeTermC = classeIds['Terminale C'].id;
    for (const e of elevesNommes) {
      const res = await client.query(
        `INSERT INTO eleves (nom, prenom, matricule, classe_id, etablissement_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [e.nom, e.prenom, e.matricule, classeTermC, etabId]
      );
      eleveIds.termC.push(res.rows[0].id);
    }
    // Compléter jusqu'à 52
    for (let i = 0; i < 52 - elevesNommes.length; i++) {
      const [nom, prenom] = NOMS_SUPPLEMENTAIRES[i % NOMS_SUPPLEMENTAIRES.length];
      const mat = `MAT-2024-${String(matriculeCounter).padStart(3, '0')}`;
      matriculeCounter++;
      const res = await client.query(
        `INSERT INTO eleves (nom, prenom, matricule, classe_id, etablissement_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [nom, prenom, mat, classeTermC, etabId]
      );
      eleveIds.termC.push(res.rows[0].id);
    }

    // Première D — 48 élèves
    const classePremD = classeIds['Première D'].id;
    for (let i = 0; i < 48; i++) {
      const [nom, prenom] = NOMS_SUPPLEMENTAIRES[(i + 10) % NOMS_SUPPLEMENTAIRES.length];
      const mat = `PRD-2024-${String(i + 1).padStart(3, '0')}`;
      const res = await client.query(
        `INSERT INTO eleves (nom, prenom, matricule, classe_id, etablissement_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [nom, prenom, mat, classePremD, etabId]
      );
      eleveIds.premD.push(res.rows[0].id);
    }

    // Seconde C — 47 élèves
    const classeSecC = classeIds['Seconde C'].id;
    for (let i = 0; i < 47; i++) {
      const [nom, prenom] = NOMS_SUPPLEMENTAIRES[(i + 20) % NOMS_SUPPLEMENTAIRES.length];
      const mat = `SEC-2024-${String(i + 1).padStart(3, '0')}`;
      const res = await client.query(
        `INSERT INTO eleves (nom, prenom, matricule, classe_id, etablissement_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [nom, prenom, mat, classeSecC, etabId]
      );
      eleveIds.secC.push(res.rows[0].id);
    }
    console.log(`[SEED] Élèves créés : 52 (Terminale C) + 48 (Première D) + 47 (Seconde C)`);

    // ── 8. Évaluations ───────────────────────────────────────
    const evalRes1 = await client.query(
      `INSERT INTO evaluations (type, numero, date, coefficient, classe_id, matiere_id, enseignant_id, trimestre)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['DS', 1, '2024-11-20', 2, classeTermC, mathId, nkomoId, 2]
    );
    const evalDS1Id = evalRes1.rows[0].id;

    const evalRes2 = await client.query(
      `INSERT INTO evaluations (type, numero, date, coefficient, classe_id, matiere_id, enseignant_id, trimestre)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['DS', 2, '2025-01-15', 2, classeTermC, mathId, nkomoId, 2]
    );
    const evalDS2Id = evalRes2.rows[0].id;

    const evalRes3 = await client.query(
      `INSERT INTO evaluations (type, numero, date, coefficient, classe_id, matiere_id, enseignant_id, trimestre)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['Interrogation', 1, '2024-12-05', 1, classeTermC, mathId, nkomoId, 2]
    );
    const evalInterro1Id = evalRes3.rows[0].id;

    // DS1 pour Première D
    const evalRes4 = await client.query(
      `INSERT INTO evaluations (type, numero, date, coefficient, classe_id, matiere_id, enseignant_id, trimestre)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['DS', 1, '2024-11-25', 2, classePremD, mathId, nkomoId, 2]
    );
    const evalPremDS1Id = evalRes4.rows[0].id;

    console.log('[SEED] Évaluations créées.');

    // ── 9. Notes pour Terminale C ────────────────────────────
    // Notes DS2 (maquette : ABANDA=18, BIYONG=15, ESSOMBA=14, NDONGO=11, KAMGA=5)
    const notesDS2 = [18, 15, 14, 11, 5, 13, 9];
    const notesDS1 = [16, 14, 12, 10, 6, 12, 8];
    const notesInterro1 = [17, 13, 15, 9, 7, 14, 10];

    for (let i = 0; i < eleveIds.termC.length; i++) {
      const eleveId = eleveIds.termC[i];
      // DS2
      const noteDS2 = i < notesDS2.length ? notesDS2[i] : parseFloat((Math.random() * 14 + 4).toFixed(1));
      await client.query(
        `INSERT INTO notes (evaluation_id, eleve_id, valeur) VALUES ($1, $2, $3)`,
        [evalDS2Id, eleveId, noteDS2]
      );
      // DS1
      const noteDS1 = i < notesDS1.length ? notesDS1[i] : parseFloat((Math.random() * 14 + 4).toFixed(1));
      await client.query(
        `INSERT INTO notes (evaluation_id, eleve_id, valeur) VALUES ($1, $2, $3)`,
        [evalDS1Id, eleveId, noteDS1]
      );
      // Interro1
      const noteI1 = i < notesInterro1.length ? notesInterro1[i] : parseFloat((Math.random() * 14 + 4).toFixed(1));
      await client.query(
        `INSERT INTO notes (evaluation_id, eleve_id, valeur) VALUES ($1, $2, $3)`,
        [evalInterro1Id, eleveId, noteI1]
      );
    }

    // Notes DS1 pour Première D
    for (let i = 0; i < eleveIds.premD.length; i++) {
      const note = parseFloat((Math.random() * 14 + 5).toFixed(1));
      await client.query(
        `INSERT INTO notes (evaluation_id, eleve_id, valeur) VALUES ($1, $2, $3)`,
        [evalPremDS1Id, eleveIds.premD[i], note]
      );
    }
    console.log('[SEED] Notes créées.');

    // ── 10. Absences ─────────────────────────────────────────
    // KAMGA Fatou (index 4) = 7 absences (critique)
    // ZANG Sylvie (index 6) = 4 absences (warning)
    // BIYONG Marie (index 1) = 3 absences (warning)
    const absencesData = [
      // KAMGA Fatou — 7 absences
      { eleveIdx: 4, dates: ['2025-01-06','2025-01-08','2025-01-10','2025-01-13','2025-01-14','2025-01-15','2025-01-16'], motif: 'sans_motif' },
      // ZANG Sylvie — 4 absences
      { eleveIdx: 6, dates: ['2025-01-07','2025-01-09','2025-01-13','2025-01-15'], motif: 'maladie' },
      // BIYONG Marie — 3 absences
      { eleveIdx: 1, dates: ['2025-01-08','2025-01-10','2025-01-14'], motif: 'sans_motif' },
    ];

    for (const abs of absencesData) {
      const eleveId = eleveIds.termC[abs.eleveIdx];
      for (const date of abs.dates) {
        await client.query(
          `INSERT INTO absences (eleve_id, enseignant_id, classe_id, date, motif, statut)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (eleve_id, enseignant_id, classe_id, date) DO NOTHING`,
          [eleveId, nkomoId, classeTermC, date, abs.motif, 'absent']
        );
      }
    }
    console.log('[SEED] Absences créées.');

    // ── 11. Appréciations (34/52 pour Terminale C) ───────────
    const appreciationsTextes = [
      'Élève sérieux, participatif. Bons résultats, continue ainsi.',
      'Résultats encourageants. Effort à maintenir pour progresser davantage.',
      'Très bon niveau général. Méthodes solides et autonomie remarquable.',
      'Manque de rigueur. Doit fournir plus d\'efforts réguliers.',
      'Niveau insuffisant. Un soutien est nécessaire pour rattraper le programme.',
      'Bonne participation en classe. Les résultats sont satisfaisants.',
      'Élève appliqué(e). Progrès notables depuis le début du trimestre.',
      'Doit améliorer sa concentration et sa régularité dans le travail.',
      'Excellent trimestre. Félicitations pour les efforts fournis.',
      'Des lacunes persistent. Un travail de fond est nécessaire.',
    ];

    for (let i = 0; i < 34; i++) {
      const texte = appreciationsTextes[i % appreciationsTextes.length];
      await client.query(
        `INSERT INTO appreciations (eleve_id, enseignant_id, classe_id, trimestre, texte)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (eleve_id, enseignant_id, classe_id, trimestre) DO NOTHING`,
        [eleveIds.termC[i], nkomoId, classeTermC, 2, texte]
      );
    }

    // Appréciations Première D (3/48)
    for (let i = 0; i < 3; i++) {
      await client.query(
        `INSERT INTO appreciations (eleve_id, enseignant_id, classe_id, trimestre, texte)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (eleve_id, enseignant_id, classe_id, trimestre) DO NOTHING`,
        [eleveIds.premD[i], nkomoId, classePremD, 2, appreciationsTextes[i]]
      );
    }
    console.log('[SEED] Appréciations créées.');

    // ── 12. Messages ─────────────────────────────────────────
    const proviseurId = userIds['onana.paul@lycee-essos.edu'];
    const ngueleId    = userIds['nguele.cpe@lycee-essos.edu'];
    const mbidaId     = userIds['mbida.emmanuel@lycee-essos.edu'];
    const zangaId     = userIds['zanga.secretariat@lycee-essos.edu'];

    const messagesData = [
      {
        expediteur: proviseurId,
        destinataire: nkomoId,
        objet: 'Réunion pédagogique du lundi 20 janvier 2025',
        corps: 'Chers collègues,\n\nJe vous convie à une réunion pédagogique qui se tiendra le lundi 20 janvier 2025 à 14h00 en salle des professeurs.\n\nOrdre du jour :\n1. Bilan du 1er trimestre\n2. Points de vigilance assiduité\n3. Calendrier des compositions T2\n4. Questions diverses\n\nVotre présence est indispensable.\n\nCordialement,\nM. ONANA Paul, Proviseur',
        lu: false,
      },
      {
        expediteur: ngueleId,
        destinataire: nkomoId,
        objet: 'Suivi assiduité — KAMGA Fatou',
        corps: 'Monsieur Nkomo,\n\nJe vous contacte au sujet de l\'élève KAMGA Fatou (Terminale C) qui cumule 7 absences ce trimestre. Pourriez-vous me faire un retour sur son comportement en classe ?\n\nCordialement,\nMme NGUELE, CPE',
        lu: false,
      },
      {
        expediteur: mbidaId,
        destinataire: nkomoId,
        objet: 'Harmonisation du programme T2',
        corps: 'Bonjour Jean-Paul,\n\nJe souhaitais qu\'on se concerte sur l\'avancement du programme de Terminale C pour le T2. Quand es-tu disponible ?\n\nCordialement,\nEmmanuel',
        lu: false,
      },
      {
        expediteur: proviseurId,
        destinataire: nkomoId,
        objet: 'Bonne année et objectifs T2',
        corps: 'Chers collègues,\n\nJe vous souhaite une excellente année 2025. Le trimestre 2 sera décisif pour nos élèves. Comptons sur votre engagement.\n\nCordialement,\nM. ONANA Paul',
        lu: true,
      },
      {
        expediteur: zangaId,
        destinataire: nkomoId,
        objet: 'Clôture T1 — rappel dates limites',
        corps: 'Bonjour,\n\nRappel : la saisie des notes du T1 doit être finalisée avant le 20 décembre. Merci de votre diligence.\n\nMme ZANGA, Secrétariat',
        lu: true,
      },
    ];

    for (const m of messagesData) {
      await client.query(
        `INSERT INTO messages (expediteur_id, destinataire_id, objet, corps, lu)
         VALUES ($1, $2, $3, $4, $5)`,
        [m.expediteur, m.destinataire, m.objet, m.corps, m.lu]
      );
    }
    console.log('[SEED] Messages créés.');

    await client.query('COMMIT');
    console.log('[SEED] ✓ Seed terminé avec succès !');
    console.log('[SEED] Comptes de test (mot de passe : noutong1) :');
    console.log('  - onana.paul@lycee-essos.edu (proviseur)');
    console.log('  - nkomo.jeanpaul@lycee-essos.edu (enseignant)');
    console.log('  - mbida.emmanuel@lycee-essos.edu (enseignant)');
    console.log('  - fogue.nathalie@lycee-essos.edu (enseignant)');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[SEED] ✗ Erreur :', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
