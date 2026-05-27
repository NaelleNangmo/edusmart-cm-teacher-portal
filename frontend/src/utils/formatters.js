/**
 * Utilitaires de formatage pour EDUSMART-CM
 */

/**
 * Retourne les initiales d'un utilisateur
 * @param {string} nom
 * @param {string} prenom
 * @returns {string}
 */
export function getInitials(nom = '', prenom = '') {
  return `${(prenom[0] || '').toUpperCase()}${(nom[0] || '').toUpperCase()}`;
}

/**
 * Formate une date relative (ex: "Il y a 2h", "Hier", "12 jan.")
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 1) return "À l'instant";
  if (diff < 60) return `Il y a ${diff} min`;
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
  const days = Math.floor(diff / 1440);
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days}j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

/**
 * Formate une date longue (ex: "mercredi 15 janvier 2025")
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDateLong(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/**
 * Retourne la classe CSS pour une note (/20)
 * @param {number} note
 * @returns {string}
 */
export function getNoteClass(note) {
  const n = parseFloat(note);
  if (n >= 14) return 'note-good';
  if (n >= 10) return 'note-mid';
  return 'note-low';
}

/**
 * Retourne la classe CSS pour une moyenne (/20)
 * @param {number} moy
 * @returns {string}
 */
export function getMoyClass(moy) {
  const n = parseFloat(moy);
  if (n >= 14) return 'moy-excellent';
  if (n >= 12) return 'moy-bien';
  if (n >= 10) return 'moy-moyen';
  return 'moy-faible';
}

/**
 * Retourne le flag d'absence (critique / warning / normal)
 * @param {number} nbAbsences
 * @returns {string}
 */
export function getAbsenceFlag(nbAbsences) {
  if (nbAbsences >= 7) return 'critique';
  if (nbAbsences >= 3) return 'warning';
  return 'normal';
}
