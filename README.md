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
- **Tests** : Jest + Supertest — **93 tests, 100% vert**

### Frontend
- **Framework** : React.js 19 + Vite
- **Routing** : React Router DOM v6
- **HTTP** : Axios
- **State/Cache** : @tanstack/react-query
- **Formulaires** : react-hook-form
- **Design** : CSS custom dark theme — pixel-perfect sur la maquette

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
# 93 tests — 100% vert
```

---

## Modules backend

| Module | Description | Statut |
|--------|-------------|--------|
| 0 | Infrastructure & Base de données | ✅ |
| 1 | Authentification JWT | ✅ |
| 2 | Établissements & Classes | ✅ |
| 3 | Notes & Évaluations | ✅ |
| 4 | Absences | ✅ |
| 5 | Appréciations | ✅ |
| 6 | Messagerie | ✅ |
| 7 | Profil & Administration | ✅ |
| 8 | Dashboard agrégé | ✅ |
| 9 | Finalisation & Documentation | ✅ |

## Modules frontend

| Module | Description | Statut |
|--------|-------------|--------|
| F0 | Setup architecture React | ✅ |
| F1 | Authentification (Login, Splash) | ✅ |
| F2 | Dashboard enseignant & admin | ✅ |
| F3 | Classes & Notes | ✅ |
| F4 | Absences (appel du jour) | ✅ |
| F5 | Appréciations | ✅ |
| F6 | Messagerie | ✅ |
| F7 | Profil & Paramètres | ✅ |

---

## Données de test

Tous les comptes de test utilisent le mot de passe : `noutong1`

| Rôle | Email |
|------|-------|
| Proviseur | `onana.paul@lycee-essos.edu` |
| Enseignant Maths | `nkomo.jeanpaul@lycee-essos.edu` |
| Enseignant PC | `mbida.emmanuel@lycee-essos.edu` |
| Enseignant Français | `fogue.nathalie@lycee-essos.edu` |
| CPE | `nguele.cpe@lycee-essos.edu` |
| Secrétariat | `zanga.secretariat@lycee-essos.edu` |

---

## Convention de branches

| Type | Préfixe | Exemple |
|------|---------|---------|
| Fonctionnalité | `feature/` | `feature/frontend-auth` |
| Correction | `fix/` | `fix/notes-calcul-moyenne` |
| Documentation | `chore/` | `chore/docs-final` |
| Hotfix | `hotfix/` | `hotfix/login-crash` |

Branche principale : `main` — Branche de développement : `develop`

---

*Développé dans le cadre du projet EDUSMART-CM — MINESEC Cameroun*
