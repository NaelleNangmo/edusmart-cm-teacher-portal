# EDUSMART-CM Teacher Portal

Portail numérique enseignant développé pour le **MINESEC (Cameroun)**.
Application web permettant aux enseignants du secondaire de gérer leurs classes, saisir les notes, enregistrer les absences, rédiger des appréciations et communiquer avec l'administration.

---

## Structure du dépôt

```
edusmart-cm-teacher-portal/
├── backend/        # API REST Node.js/Express/PostgreSQL
├── frontend/       # Application React.js (portail enseignant)
├── README.md
└── .gitignore
```

---

## Stack technique

### Backend
- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : PostgreSQL (driver `pg`)
- **Authentification** : JWT (`jsonwebtoken`) + hachage (`bcryptjs`)
- **Validation** : `express-validator`
- **Sécurité** : `helmet`, `cors`
- **Logging** : `morgan`
- **Tests** : Jest + Supertest

### Frontend
- **Framework** : React.js + React Router DOM
- **HTTP** : Axios
- **State/Cache** : @tanstack/react-query
- **Formulaires** : react-hook-form
- **Build** : Vite

---

## Instructions de lancement

### Prérequis
- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### Backend

```bash
cd backend
npm install
# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Créer la base de données PostgreSQL
createdb edusmartdb

# Exécuter les migrations
npm run migrate

# Insérer les données de test
npm run seed

# Démarrer le serveur de développement
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`

### Tests (backend)

```bash
cd backend
npm test
```

---

## Modules backend

| Module | Description | Statut |
|--------|-------------|--------|
| 0 | Infrastructure & Base de données | 🔄 En cours |
| 1 | Authentification JWT | ⏳ À faire |
| 2 | Établissements & Classes | ⏳ À faire |
| 3 | Notes & Évaluations | ⏳ À faire |
| 4 | Absences | ⏳ À faire |
| 5 | Appréciations | ⏳ À faire |
| 6 | Messagerie | ⏳ À faire |
| 7 | Profil & Administration | ⏳ À faire |
| 8 | Dashboard agrégé | ⏳ À faire |
| 9 | Finalisation & Documentation | ⏳ À faire |

---

## Données de test

Tous les comptes de test utilisent le mot de passe : `noutong1`

- **Proviseur** : `onana.paul@lycee-essos.edu`
- **Enseignant Maths** : `nkomo.jeanpaul@lycee-essos.edu`
- **Enseignant PC** : `mbida.emmanuel@lycee-essos.edu`
- **Enseignant Français** : `fogue.nathalie@lycee-essos.edu`

---

*Développé dans le cadre du projet EDUSMART-CM — MINESEC Cameroun*
