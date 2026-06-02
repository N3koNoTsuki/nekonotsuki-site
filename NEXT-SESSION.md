# 🐾 Reprise de session — site NekoNoTsuki

> Fichier de passation pour continuer sur une autre machine / une nouvelle session Claude.
> (Tu peux le supprimer une fois la page Jeux finie.)

---

## ⚙️ 1. Setup sur la nouvelle machine

Le **code** et le **contenu** (`content/*.json`) sont dans git → arrivent via `git pull`.
**MAIS `.env.local` n'est PAS dans git** (gitignoré, secrets) → à **recréer à la main**.

```bash
npm install
# créer .env.local à la racine :
```

`.env.local` (4 lignes) :
```
YOUTUBE_API_KEY=…    # YouTube Data API v3 → console.cloud.google.com
STEAM_API_KEY=…      # steamcommunity.com/dev/apikey
STEAM_ID=76561199129691762   # (SteamID64, pas secret)
RAWG_API_KEY=…       # rawg.io/apidocs
```

```bash
npm run dev
```

Les clés API servent **uniquement en local** (sync au dev). Le site en prod (Vercel) est statique et n'en a pas besoin.

---

## 🎯 2. Tâche EN COURS : page Jeux — **ÉTAPE 2** (à faire)

### Déjà fait — étape 1 (validé `tsc` + `next lint`)
Sources + éditeur jeux :
- `lib/steam.ts` (`fetchOwnedGames`), `lib/rawg.ts` (`searchGames`)
- `content.ts` → type `Game` + `readGames`/`writeGames` ; `data.ts` → `getGames()` ; `types.ts` → `GameDTO` ; `validators.ts` → `rawgGameSchema`, `gameEditSchema`
- Routes : `app/api/games/sync-steam`, `app/api/games/search` (proxy RAWG), `app/api/games` (GET/POST), `app/api/games/[id]` (PATCH/DELETE)
- Éditeur : `components/admin/GamesManager.tsx` + `app/edit/jeux/page.dev.tsx` (+ lien AdminNav 🎮)
- `content/games.json` (vide tant que l'utilisateur n'a pas lancé le sync Steam)

### À FAIRE — étape 2 : page publique + popup
1. **`app/(public)/jeux/page.tsx`** (statique, pas d'ISR) : `getGames()`, filtrer `visible`.
   - Section **🏆 Highlights** : jeux `highlight === true`, en grand.
   - Section **🎮 Collection** : tous les jeux visibles, en grille de jaquettes (paysage, comme `MusicGallery`).
2. **Composant `components/GamesShowcase.tsx`** (client) — **calquer sur `components/MusicGallery.tsx`** (galerie + lightbox portalé).
3. **Popup** (au clic sur un jeu) : grande jaquette, nom, **heures** (si `source==="steam"`) ou **année + plateformes** (rawg), **note** (★), **avis rendu en Markdown** (`<Markdown>{game.review}</Markdown>`), et **les 2-3 clips en lecteurs**.
   - Clip = une URL. Si YouTube (`watch?v=`/`youtu.be/`) → `<iframe src="https://www.youtube.com/embed/{id}">`. Si `/uploads/*.mp4` → `<video controls>`. (Écrire un petit helper `parseClip(url)` ; cf. regex vidéo dans `components/Markdown.tsx`.)
4. **Lien navbar** : ajouter `{ href: "/jeux", label: "Jeux" }` dans `components/Navbar.tsx` (PRIMARY ou MORE — la navbar a un menu « Plus ▾ »).

### Modèle `Game` (content/games.json)
```ts
{ id, source:"steam"|"rawg", steamAppId, rawgId, slug, name, cover,
  playtimeMinutes, released, platforms, highlight, rating(0-5),
  review (markdown), clips: string[], visible, order, createdAt }
```

### ⚠️ Test en attente (par l'utilisateur, machine perso)
L'étape 1 n'a **pas pu être testée** (pare-feu bloque Steam/RAWG depuis l'env Claude). À vérifier : `/edit/jeux` → « 🎮 Synchroniser Steam » remonte bien les jeux + heures ; recherche RAWG OK. Si « profil privé » → mettre **Détails du jeu = Public** côté Steam. SteamID64 utilisé : `76561199129691762`.

---

## 🏗️ 3. Architecture & conventions (à RESPECTER)

- **Déploiement** : app Next normale sur Vercel (PAS `output: export`). **ISR** (`export const revalidate = 3600`) sur `/projects`, `/competences`, `/collection` (données GitHub + MyAnimeList, refresh ~horaire). `next.config.mjs` a `outputFileTracingIncludes` pour bundler `content/` dans ces routes ISR.
- **Éditeur local** : tout ce qui est `*.dev.tsx` / `*.dev.ts` (`/edit/*`, `/api/*`) n'existe **qu'en `next dev`** (exclu du build prod via `pageExtensions`). Jamais sur le site public.
- **Contenu** : `content/*.json`, lu au build/ISR, écrit par `/edit`. Committé dans git.
- **Modèle « fetch au dev »** (YouTube playlists, Steam, RAWG) : clés en `.env.local`, le sync écrit dans `content/`, prod 100% statique sans clé. **Pas d'ISR** pour ces données (statiques jusqu'au prochain sync+push). À distinguer de GitHub/MAL (ISR).
- **Vérif code** : `npx tsc --noEmit` + `npx next lint`.
  - ❌ **NE PAS** lancer `next build` ni un `next dev` concurrent pendant que l'utilisateur a son serveur de dev → ça corrompt `.next` (CSS cassé en dev). C'est l'utilisateur qui teste le rendu.
  - Réseau de l'env Claude : GitHub/Jikan/Google OK ; **Steam + RAWG bloqués** (pare-feu) → tester côté utilisateur.
- **Lint** : apostrophes **courbes** (`’`) dans le texte JSX (règle `react/no-unescaped-entities`). `&` → `&amp;`.
- **Publier** : `git add -A && git commit -m "…" && git push` → Vercel redéploie.
- Fin des messages de commit : `Co-Authored-By: Claude …`.

---

## ✅ 4. Déjà livré (roadmap quasi complète)

1. **🐱 oneko** — chat qui suit le curseur (`components/Oneko.tsx`) + toggle navbar (`OnekoToggle` + `OnekoProvider`).
2. **🖥️ /setup** — page « uses » éditable (système de pages markdown).
3. **📊 GitHub** — étoiles + dernier commit sur cartes projet, bandeau de stats, **README en lightbox** (`components/ProjectCard.tsx`), page **/competences** (donut langages, `LanguageDonut`). `lib/github.ts`.
4. **🌸 Anime + 📚 Manga** — page **/collection**, curation manuelle via recherche **Jikan** (`components/admin/MediaPicker.tsx`), + **stats MyAnimeList** dynamiques (`lib/mal.ts`, ISR). Cartes : `CollectionCard`.
5. **🎵 Musique** — page **/musique** : sync playlists **YouTube** (`lib/youtube.ts`, 19 playlists / 2072 titres dans `content/music.json`), popup tracklist **façon Spotify** (`components/MusicGallery.tsx`). Éditeur `MusicManager` (sync + toggles).
6. **🎮 Jeux** — étape 1 faite (voir §2), **étape 2 à faire**.

Aussi : embed **vidéo en markdown** (`Markdown.tsx` + CSS), **favoris** en lightbox + champ `details` (`FavoriteCard.tsx`), navbar **« Plus ▾ »**, ISR, page mobile-friendly.

---

## 🧩 5. Patterns réutilisables

- **Lightbox** : portal vers `document.body` (échappe les `transform` de `HoverCard`/`Reveal` qui piégeraient un `position:fixed`), + Escape + clic-fond + scroll-lock + focus. Exemples : `FavoriteCard.tsx`, `ProjectCard.tsx`, `MusicGallery.tsx`. **→ Copier ce pattern pour `GamesShowcase`.**
- **Picker de recherche** : `MediaPicker.tsx` (Jikan), `GamesManager.tsx` (RAWG via proxy) — recherche debouncée + ajout.
- **Markdown** : `components/Markdown.tsx` (GFM + HTML brut + coloration + vidéo).
- **API client** : `lib/client.ts` (`api.post/patch/del`, `uploadImage`).
- **Modal admin** : `components/admin/Modal.tsx` ; éditeur markdown : `components/admin/MarkdownEditor.tsx` (avec upload image/vidéo).

---

## 📌 6. Pense-bête

- Tout le contenu ajouté via `/edit` (anime, manga, music, games…) est dans `content/*.json` → **committer + push** pour publier.
- Sécurité : les clés API ont été collées en clair dans le chat précédent → penser à **restreindre/régénérer** (surtout RAWG/YouTube) si besoin.
- Le `content/music.json` fait ~213 K (2072 titres) — la page /musique embarque ça côté client. Optimisation possible (chargement par playlist) si lourd.
