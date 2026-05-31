# 🐾 NekoNoTsuki — Portfolio personnel kawaii

Portfolio personnel au style **kawaii / anime** (rose poudré, lavande, glassmorphism léger, animations douces), entièrement éditable depuis une interface d'administration — **sans toucher au code**.

Stack : **Next.js 14 (App Router)** · **TypeScript** · **Tailwind CSS** · **SQLite (Prisma)** · **NextAuth v5** · **framer-motion** · **react-markdown**.

---

## ✨ Fonctionnalités

### Pages publiques (rendu serveur, utilisables sans JavaScript)
- **Accueil `/`** — hub à blocs configurables depuis l'admin (présentation, derniers projets, derniers favoris, dernière étape du parcours, blocs libres en Markdown).
- **Projets `/projects`** — grille de cards avec couverture, tags **filtrables** (via l'URL `?tag=…`, fonctionne sans JS), liens GitHub/démo.
- **Favoris `/favorites`** — sections par catégories (Musique/Vocaloid, Anime, Jeux, Logiciels, *custom*…), chaque item ayant titre, image, description Markdown, note ♥ et commentaire perso.
- **Parcours `/timeline`** — frise chronologique (date, titre, description Markdown, tag études/pro/perso/projet).
- **À propos `/about`** — page libre entièrement en Markdown.

### Interface admin `/admin` (protégée par NextAuth)
- **Éditeur Markdown split-pane** (édition à gauche, aperçu en temps réel à droite) avec barre d'outils.
- **CRUD complet** : blocs d'accueil, projets (upload d'image), favoris + gestion des catégories, parcours, page À propos.
- **Réordonnancement drag-and-drop** des blocs d'accueil et des étapes du parcours.
- **Toggle thème clair/sombre**.

### Technique
- **Markdown** : titres, listes, code inline/blocs (coloration syntaxique), images, liens, **tableaux** (GFM).
- **Images** : upload local dans `/public/uploads` **ou** URL externe en fallback.
- **API** : Route Handlers Next.js (aucune API externe).
- **Auth** : NextAuth v5, session JWT, middleware de protection sur `/admin/*` (compte owner unique en base).
- **Responsive** mobile-first.

---

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
#   puis éditez .env :
#   - AUTH_SECRET : générez-en un avec  openssl rand -base64 32
#   - OWNER_EMAIL / OWNER_PASSWORD : vos identifiants admin

# 3. Créer la base SQLite + le client Prisma
npm run db:push

# 4. Remplir la base (compte owner + contenu de démo)
npm run db:seed

# 5. Lancer en développement
npm run dev
```

- Site public : http://localhost:3000
- Admin : http://localhost:3000/admin → redirige vers `/login`
- Identifiants : ceux définis dans `.env` (`OWNER_EMAIL` / `OWNER_PASSWORD`)

> Le seed est **idempotent** : il met à jour le compte owner et n'ajoute le contenu de démo que si la base est vide.

---

## 📜 Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Serveur de développement |
| `npm run build` | `prisma generate` + build de production |
| `npm run start` | Serveur de production (après `build`) |
| `npm run db:push` | Synchronise le schéma Prisma → SQLite (sans migration) |
| `npm run db:migrate` | Crée/applique une migration de développement |
| `npm run db:seed` | Compte owner + contenu de démo |
| `npm run db:studio` | Ouvre Prisma Studio (explorateur de DB) |
| `npm run lint` | ESLint |

---

## 🗂 Structure

```
app/
  (public)/            ← pages publiques (layout commun navbar/footer)
    page.tsx           ← accueil (blocs configurables)
    favorites/ timeline/ projects/ about/
  admin/               ← interface d'administration protégée
    home/ projects/ favorites/ timeline/ about/
  api/                 ← Route Handlers (blocks, categories, favorites,
                         timeline, projects, pages, upload, auth)
  login/               ← page de connexion
components/            ← Navbar, Footer, cards, Markdown, ui…
  admin/               ← managers CRUD, éditeur Markdown, DnD, modale…
lib/                   ← prisma, auth helpers, data fetchers, validators, utils
prisma/                ← schema.prisma + seed.ts
public/uploads/        ← images uploadées
auth.ts / auth.config.ts / middleware.ts   ← NextAuth v5
```

---

## 🎨 Personnalisation

- **Palette & thème** : `tailwind.config.ts` (couleurs `rose`, `lavender`, `cream`, `mint`, `sky`) et `app/globals.css`.
- **Polices** : *Quicksand* (texte) + *Fredoka* (titres), chargées via Google Fonts dans `globals.css`.
- **Tout le contenu** (textes, blocs, projets, favoris, parcours, page À propos) se modifie depuis `/admin`.

---

## 🌍 Déploiement (hébergement-agnostique)

### Vercel
1. Importez le repo.
2. Variables d'environnement : `DATABASE_URL`, `AUTH_SECRET` (et `OWNER_EMAIL`/`OWNER_PASSWORD` pour le seed).
3. Build command : `npm run build`.
> ⚠️ Le système de fichiers Vercel est **éphémère** : les uploads dans `/public/uploads` ne survivent pas aux redéploiements, et SQLite n'est pas persistant. Pour Vercel, préférez **PostgreSQL** (voir ci-dessous) + un stockage externe (S3, Vercel Blob, etc.). Pour un site mono-utilisateur sur **VPS**, SQLite + uploads locaux conviennent parfaitement.

### VPS (recommandé pour SQLite + uploads locaux)
```bash
npm ci
npm run build
npm run db:push   # première fois
npm run db:seed   # première fois
npm run start     # ou via pm2 / systemd, derrière un reverse-proxy (nginx/caddy)
```
Pensez à `AUTH_TRUST_HOST=true` derrière un proxy.

### Passer à PostgreSQL
1. Dans `prisma/schema.prisma` : `provider = "postgresql"`.
2. `DATABASE_URL="postgresql://user:pass@host:5432/db"`.
3. `npm run db:migrate` (ou `db:push`) puis `npm run db:seed`.
Aucune autre modification de code n'est nécessaire.

---

## 🔒 Sécurité
- Mot de passe owner **hashé** (bcrypt) en base.
- Toutes les routes de mutation vérifient la session (`requireAuth`) ; `/admin/*` est en plus protégé par le middleware.
- Pensez à changer `AUTH_SECRET` et le mot de passe owner avant toute mise en ligne.

---

Fait avec amour 🌸
