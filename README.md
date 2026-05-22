# NekoNoTsuki 猫 — Site personnel

> Site web personnel multi-pages, trilingue FR / EN / JP, avec esthétique japonaise kawaii/Vocaloid.

**Stack :** React (Vite) · React Router · i18next · Framer Motion · CSS Modules

---

## Démarrage rapide

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Ce qu'il reste à faire

### 1. Ajouter ton avatar

Dépose ta photo ici :
```
public/images/avatar.jpg
```
Elle apparaît automatiquement dans le hero de la page d'accueil. Si absente, un `猫` s'affiche en fallback.

### 2. Ajouter les images des favoris

Pour chaque favori dans `src/data/favorites.js`, dépose l'image dans `public/images/` et renseigne le champ `image` :

```js
{ name: "Hatsune Miku", image: "/images/miku.jpg", category: "music" }
```

Catégories disponibles : `games` · `anime` · `manga` · `music` · `songs`

### 3. Compléter les données

Tous les contenus sont dans `src/data/` — aucun composant React à modifier.

| Fichier | Contenu |
|---|---|
| `src/data/timeline.js` | Événements de la frise chronologique |
| `src/data/projects.js` | Projets GitHub avec tags et statut |
| `src/data/favorites.js` | Jeux, anime, manga, musique, chansons |
| `src/data/skills.js` | Compétences techniques + centres d'intérêt |

**Exemple — ajouter un projet :**
```js
{
  title: "MonProjet",
  description: {
    fr: "Description en français.",
    en: "Description in English.",
    jp: "日本語の説明。"
  },
  tags: ["Rust", "Python"],
  github: "https://github.com/N3koNoTsuki/MonProjet",
  status: { fr: "En cours", en: "In progress", jp: "進行中" }
  //        ↑ ou : "Terminé" / "Done" / "完了"
}
```

**Exemple — ajouter un événement timeline :**
```js
{
  year: "2026",
  title: { fr: "...", en: "...", jp: "..." },
  description: { fr: "...", en: "...", jp: "..." },
  icon: "🎯"
}
```

### 4. Ajouter des liens sociaux

Dans `src/components/Footer.jsx`, dupliquer le bloc `<a>` existant pour ajouter d'autres réseaux (Twitter/X, Discord, etc.).

### 5. Personnaliser les traductions UI

Modifier `src/locales/fr.json`, `en.json`, `jp.json` pour les libellés de navigation, boutons, titres de sections.

---

## Déployer sur GitHub Pages

### Option A — Déploiement manuel

1. Dans `vite.config.js`, décommenter et adapter :
   ```js
   base: '/nekonotsuki-site/',
   ```

2. Build et push :
   ```bash
   npm run build
   # Copier le dossier dist/ sur la branche gh-pages
   ```

3. Sur GitHub → Settings → Pages → choisir la branche `gh-pages`.

### Option B — GitHub Actions (recommandé, automatique à chaque push)

1. Dans `vite.config.js`, décommenter :
   ```js
   base: '/nekonotsuki-site/',
   ```

2. Créer le fichier `.github/workflows/deploy.yml` :
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       permissions:
         contents: write
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

3. Push → le site se déploie automatiquement sur `https://n3konotsuki.github.io/nekonotsuki-site/`.

### Option C — Vercel (le plus simple)

Importer le projet sur [vercel.com](https://vercel.com) — zéro configuration requise, déploiement automatique à chaque push sur `main`.

---

## Structure du projet

```
src/
├── i18n.js              ← configuration i18next (persist localStorage)
├── App.jsx              ← routing principal
├── styles/
│   ├── variables.css    ← palette, typographie, effets (modifier ici pour changer le thème)
│   └── global.css       ← reset + polices Google Fonts
├── locales/
│   ├── fr.json          ← traductions françaises
│   ├── en.json          ← traductions anglaises
│   └── jp.json          ← traductions japonaises
├── data/                ← ✏️ tout le contenu personnalisable ici
│   ├── timeline.js
│   ├── projects.js
│   ├── favorites.js
│   └── skills.js
├── components/
│   ├── Navbar.jsx       ← navigation fixe + toggle langue + hamburger mobile
│   └── Footer.jsx       ← liens sociaux + copyright
└── pages/
    ├── Home.jsx         ← hero + pétales sakura + CTA
    ├── Timeline.jsx     ← frise chronologique alternée
    ├── About.jsx        ← présentation + skills + langues + intérêts
    ├── Favorites.jsx    ← grid de cards par catégorie
    └── Projects.jsx     ← cards projets avec badges statut
public/
└── images/              ← 📁 déposer avatar.jpg et images des favoris ici
```
