# EDUSMART-CM — Backend Task Tracker

## Légende
- [ ] À faire
- [~] En cours
- [x] Terminé et testé

---

## Module 0 — Infrastructure & Base

- [x] Configuration base de données (connexion PostgreSQL — `src/config/db.js`)
- [x] Middleware d'erreur global (`src/middleware/errorHandler.js`)
- [x] Middleware d'authentification JWT (`src/middleware/auth.js` — `verifyToken`)
- [x] Middleware de rôles (`requireRole`)
- [x] Middleware de validation (`src/middleware/validate.js`)
- [x] Structure `app.js` et routeur principal `/api`
- [x] Script de migration (`migrations/init.sql` + `migrations/migrate.js`)
- [x] Script de seed (`seeds/seed.js`)
- [x] Commandes npm : `migrate`, `seed`, `dev`, `test`
- [x] Tests Module 0

---

## Module 1 — Authentification

- [x] `POST /api/auth/login`
- [x] `POST /api/auth/logout`
- [x] `GET /api/auth/me`
- [x] `PUT /api/auth/change-password`
- [x] Tests Module 1

---

## Module 2 — Établissements & Classes

- [x] `GET /api/etablissements`
- [x] `GET /api/classes`
- [x] `GET /api/classes/mes-classes`
- [x] `GET /api/classes/:id`
- [x] `GET /api/classes/:id/eleves`
- [x] Tests Module 2

---

## Module 3 — Notes & Évaluations

- [x] `POST /api/evaluations`
- [x] `GET /api/notes/:classe_id`
- [x] `GET /api/notes/:classe_id/stats`
- [x] `POST /api/notes` (bulk)
- [x] `PUT /api/notes/:id`
- [x] `DELETE /api/notes/:id`
- [x] Tests Module 3

---

## Module 4 — Absences

- [x] `GET /api/absences/:classe_id`
- [x] `POST /api/absences/appel`
- [x] `PUT /api/absences/:id`
- [x] `GET /api/absences/eleve/:eleve_id`
- [x] `GET /api/absences/:classe_id/stats`
- [x] Tests Module 4

---

## Module 5 — Appréciations

- [x] `GET /api/appreciations/:classe_id`
- [x] `GET /api/appreciations/:classe_id/stats`
- [x] `POST /api/appreciations`
- [x] `PUT /api/appreciations/:id`
- [x] Tests Module 5

---

## Module 6 — Messagerie

- [x] `GET /api/messages/inbox`
- [x] `GET /api/messages/sent`
- [x] `GET /api/messages/:id`
- [x] `POST /api/messages`
- [x] `DELETE /api/messages/:id`
- [x] `GET /api/messages/unread-count`
- [x] `GET /api/utilisateurs/contacts`
- [x] Tests Module 6

---

## Module 7 — Profil & Administration

- [x] `GET /api/profile`
- [x] `PUT /api/profile`
- [x] `PUT /api/profile/password`
- [x] `GET /api/admin/stats`
- [x] `GET /api/admin/alertes`
- [x] `GET /api/admin/enseignants`
- [x] `POST /api/admin/enseignants`
- [x] `POST /api/admin/classes`
- [x] Tests Module 7

---

## Module 8 — Dashboard

- [x] `GET /api/dashboard/enseignant`
- [x] `GET /api/dashboard/admin`
- [x] Tests Module 8

---

## Module 9 — Finalisation

- [x] Validation inputs sur tous les endpoints (express-validator)
- [x] Pagination sur listes longues (notes, élèves, messages)
- [x] Documentation `API.md`
- [x] `npm test` 100% vert (92/92 tests)
- [x] README.md mis à jour
- [x] TASKS.md complet [x]
