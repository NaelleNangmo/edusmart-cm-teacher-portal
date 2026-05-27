# EDUSMART-CM — Frontend (React.js)

> Le frontend sera développé en **Phase 2**, après validation complète du backend.

## Stack technique

- React.js (Vite)
- React Router DOM v6
- Axios (HTTP client)
- @tanstack/react-query (cache & état serveur)
- react-hook-form (formulaires)

## Lancement

```bash
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`

## Variable d'environnement

```
VITE_API_URL=http://localhost:3001/api
```

## Référence maquette

La maquette HTML de référence (`edusmart_desktop.html`) définit pixel-perfect
tous les écrans à implémenter. Chaque composant React devra correspondre
exactement à la maquette.

## Écrans à implémenter (Phase 2)

- Splash Screen
- Connexion (Login)
- Dashboard Enseignant
- Dashboard Administrateur
- Mes Classes
- Liste des notes
- Saisie de notes
- Appel du jour (Absences)
- Appréciations
- Rédiger appréciation
- Messagerie (Boîte de réception)
- Composer un message
- Profil & Paramètres
