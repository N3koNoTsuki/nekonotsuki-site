# NekoNoTsuki 猫 — Site personnel

Site web personnel multi-pages avec esthétique japonaise kawaii/Vocaloid.

## Stack

- **React** (Vite) — framework UI
- **React Router** — navigation multi-pages
- **i18next** — internationalisation FR / EN / JP
- **Framer Motion** — animations légères
- **CSS Modules** — styles scopés par composant

## Lancer le projet

```bash
npm install
npm run dev
```

Le site sera disponible sur `http://localhost:5173`.

## Personnaliser le contenu

Tout le contenu modifiable est dans `src/data/` — aucun besoin de toucher aux composants React.

### Timeline (`src/data/timeline.js`)

```js
{
  year: "2025",
  title: { fr: "...", en: "...", jp: "..." },
  description: { fr: "...", en: "...", jp: "..." },
  icon: "🎓"
}
```

### Projets (`src/data/projects.js`)

```js
{
  title: "MonProjet",
  description: { fr: "...", en: "...", jp: "..." },
  tags: ["Rust", "Python"],
  github: "https://github.com/...",
  status: { fr: "En cours", en: "In progress", jp: "進行中" }
}
```

### Favoris (`src/data/favorites.js`)

```js
{
  name: "Hatsune Miku",
  image: "/images/miku.jpg",   // fichier dans /public/images/
  category: "music"            // games | anime | manga | music | songs
}
```

### Compétences et centres d'intérêt (`src/data/skills.js`)

Modifier les tableaux `skills` et `interests`.

### Avatar

Déposer votre photo dans `public/images/avatar.jpg` — elle s'affichera automatiquement sur la page d'accueil.

### Traductions UI

Modifier `src/locales/fr.json`, `en.json`, `jp.json` pour les libellés de navigation, boutons, etc.

## Déployer sur GitHub Pages

1. Dans `vite.config.js`, décommenter et adapter :
   ```js
   base: '/nom-du-repo/',
   ```

2. Build :
   ```bash
   npm run build
   ```

3. Déployer le dossier `dist/` sur GitHub Pages.

### GitHub Actions (déploiement automatique)

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Déployer sur Vercel

Importer le projet sur vercel.com — aucune configuration supplémentaire requise.
