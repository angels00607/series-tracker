# Series Journal

Application web 100 % frontend pour suivre ses séries, inspirée de TV Time dans une version légère et publiable sur GitHub Pages.

## Fonctionnalités

- Recherche de séries via l’API publique TVMaze.
- Ajout et suppression de séries dans une bibliothèque locale.
- Suivi des épisodes vus, par épisode, saison ou série complète.
- Progression par série et statistiques globales.
- Calendrier simple des épisodes à venir.
- Export et import JSON avec validation minimale.
- Sauvegarde et chargement optionnels depuis un fichier JSON GitHub via token personnel.
- Mode clair et mode sombre.

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

Le workflow `.github/workflows/deploy.yml` publie automatiquement l’application sur GitHub Pages à chaque push sur `main`.

Si le repository ne s’appelle pas `series-tracker`, modifie la ligne suivante dans le workflow :

```bash
VITE_BASE_PATH=/series-tracker/ npm run build
```

en remplaçant `series-tracker` par le nom exact du repository.

Dans GitHub, active ensuite `Settings > Pages > Build and deployment > GitHub Actions`.

## Sécurité GitHub Sync

La synchronisation GitHub intégrée à l’application est optionnelle. Le token personnel n’est stocké dans le navigateur que si l’utilisateur coche explicitement l’option “Mémoriser le token sur cet appareil”.
