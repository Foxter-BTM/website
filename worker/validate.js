// Validation serveur du formulaire de contact. Fonctions pures, sans dépendance.
export const PRESTATIONS = ['sinistre', 'peinture', 'debosselage', 'pare-chocs', 'assureur', 'ouverture', 'autre'];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function validateContact(fields) {
  const f = fields || {};
  const data = {
    nom: str(f.nom),
    prenom: str(f.prenom),
    email: str(f.email),
    tel: str(f.tel),
    prestation: str(f.prestation),
    vehicule: str(f.vehicule),
    assureur: str(f.assureur),
    message: str(f.message),
  };
  const errors = {};

  if (data.nom.length < 1 || data.nom.length > 80) errors.nom = 'Veuillez renseigner votre nom';
  if (data.prenom.length < 1 || data.prenom.length > 80) errors.prenom = 'Veuillez renseigner votre prénom';
  if (!EMAIL_RE.test(data.email) || data.email.length > 254) errors.email = 'Email invalide';
  if (data.tel.length > 30) errors.tel = 'Numéro trop long';
  if (!PRESTATIONS.includes(data.prestation)) errors.prestation = 'Sélectionnez une prestation';
  if (data.vehicule.length > 120) errors.vehicule = 'Texte trop long (120 caractères max.)';
  if (data.assureur.length > 120) errors.assureur = 'Texte trop long (120 caractères max.)';
  if (data.message.length < 10) errors.message = 'Veuillez décrire votre demande';
  else if (data.message.length > 3000) errors.message = 'Message trop long (3000 caractères max.)';
  if (str(f.consent) !== 'on') errors.consent = 'Votre accord est nécessaire pour traiter la demande';

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
