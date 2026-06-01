# 🐾 NekoNoTsuki — Portfolio personnel kawaii

Portfolio personnel au style **kawaii / anime** (rose poudré, lavande, glassmorphism léger, animations douces). Le contenu s'édite depuis une interface locale `/edit` — **sans toucher au code** — et le site publié est **100 % statique** : aucune base de données, aucune API, aucun serveur à faire tourner.

Stack : **Next.js 14 (App Router, export statique)** · **TypeScript** · **Tailwind CSS** · **framer-motion** · **react-markdown**. Contenu stocké en **fichiers JSON** versionnés dans le repo.

---

## 🧠 Comment ça marche

```
                 (en local, npm run dev)                 (git push → Vercel)
   /edit  ───────────────────────────────►  content/*.json  ───────────────────►  site statique
   éditeur sans login, écrit les fichiers     versionnés git      next build (output: export)
```

- **Tu édites en local** : `npm run dev`, puis `http://localhost:3000/edit`. Pas de mot de passe — l'éditeur n'existe **qu'en local**.
- **Enregistrer** écrit dans `content/*.json` (et `public/uploads/` pour les images). Ce sont de simples fichiers, suivis par git.
- **Publier** : `git push`. Vercel lance `next build` et republie le site statique. Pas de DB, pas de variables d'environnement.

L'éditeur (`/edit`) et son API d'écriture (`/api/*`) vivent dans des fichiers **`*.dev.tsx` / `*.dev.ts`**. Ils ne sont pris en compte que par `next dev`. Le build de production (`NODE_ENV=production`) les ignore (voir `pageExtensions` dans `next.config.mjs`), donc ils ne partent **jamais** sur le site en ligne.

---

## 🚀 Démarrage

```bash
npm install        # une seule fois
npm run dev        # éditer en local
```

- Site public : http://localhost:3000
- Éditeur (local uniquement) : http://localhost:3000/edit

Aucune configuration, aucun `.env`, aucune base à initialiser.

---

## ✍️ Workflow d'édition

1. `npm run dev`
2. Va sur `/edit`, modifie blocs d'accueil, projets, favoris, parcours, page À propos.
3. Les modifs sont enregistrées dans `content/*.json` (+ images dans `public/uploads/`).
4. Publie :
   ```bash
   git add content public/uploads
   git commit -m "maj du contenu"
   git push
   ```
5. Vercel rebuild et déploie automatiquement. ✨

> Astuce : `npm run build` génère le site statique dans `out/` pour le prévisualiser en local (l'éditeur est alors exclu, comme en prod).

---

## 📜 Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Serveur de dev **avec l'éditeur `/edit`** |
| `npm run build` | Build du **site statique** → `out/` (sans éditeur ni API) |
| `npm run start` | Sert le build (peu utile : le site est statique) |
| `npm run lint` | ESLint |

---

## 🗂 Structure

```
content/               ← LE CONTENU (JSON, versionné) : home, projects,
                         favorites, categories, timeline, pages
app/
  (public)/            ← pages publiques statiques (accueil, projets,
                         favoris, parcours, à propos)
  edit/   *.dev.tsx    ← éditeur local (exclu du build de prod)
  api/    *.dev.ts     ← API d'écriture locale (exclue du build de prod)
components/            ← Navbar, Footer, cards, Markdown, ProjectsFilter, ui…
  admin/               ← managers CRUD, éditeur Markdown, drag-and-drop, modale…
lib/
  content.ts           ← lecture/écriture des fichiers JSON
  data.ts              ← accès en lecture pour les pages publiques
  validators.ts        ← schémas zod (validation des écritures)
public/uploads/        ← images (versionnées avec le reste)
next.config.mjs        ← output: "export" + pageExtensions (.dev)
```

> `content/` et `public/uploads/` sont **commités exprès** : c'est le site. `out/` et `.next/` sont ignorés (régénérés au build).

---

## 🌍 Déploiement — Vercel

1. Importe le repo sur Vercel (framework détecté : Next.js).
2. C'est tout. Vercel lance `next build`, voit `output: "export"` et sert le dossier statique `out/`.

- **Aucune variable d'environnement.**
- **Aucune base de données.**
- Chaque `git push` redéploie.

> Le site étant un export statique, il s'héberge aussi tel quel sur Cloudflare Pages, Netlify, GitHub Pages, etc. (le dossier `out/`).

---

## 🎨 Personnalisation

- **Palette & thème** : `tailwind.config.ts` (couleurs `rose`, `lavender`, `cream`, `mint`, `sky`) et `app/globals.css`.
- **Polices** : *Quicksand* (texte) + *Fredoka* (titres), via Google Fonts dans `globals.css`.
- **Contenu** : tout depuis `/edit` (ou en éditant directement `content/*.json`).

---

## 🔧 Notes de maintenance

- **Ajouter un type de contenu** : ajoute un fichier `content/<truc>.json`, un accesseur dans `lib/content.ts`, une lecture dans `lib/data.ts`, et (optionnel) une route `app/api/<truc>/route.dev.ts` + un manager.
- **L'éditeur n'écrit qu'en local** : il faut lancer `npm run dev` et committer/pousser pour publier. Pas d'édition depuis un téléphone.
- **Sécurité** : aucun secret, aucun login à gérer — le site publié ne contient que du HTML/CSS/JS statique.
- À l'occasion, pense à monter la version de `next` (correctifs de sécurité) : `npm i next@latest` puis `npm run build`.

---

Fait avec amour 🌸
