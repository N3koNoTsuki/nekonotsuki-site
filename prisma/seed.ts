import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Owner account ---
  const email = process.env.OWNER_EMAIL ?? "owner@nekonotsuki.dev";
  const password = process.env.OWNER_PASSWORD ?? "changeme123";
  const name = process.env.OWNER_NAME ?? "Neko";
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password: hash, name },
    create: { email, password: hash, name },
  });
  console.log(`✓ Owner account ready: ${email}`);

  // --- About page ---
  await prisma.page.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      slug: "about",
      title: "À propos",
      content: `# Konnichiwa~ ✿

Je suis **Neko**, et bienvenue sur mon petit coin du web.

Ici je partage mes projets, mes coups de cœur et mon parcours.

## Ce que j'aime

- 🎵 La musique Vocaloid & la J-pop
- 🌸 Les anime cozy et les visual novels
- 💻 Coder des choses mignonnes

> Tout ce texte est éditable depuis l'admin en Markdown !

| Catégorie | Préférence |
| --------- | ---------- |
| Langage   | TypeScript |
| Boisson   | Matcha latte |
`,
    },
  });
  console.log("✓ About page ready");

  // --- Home blocks ---
  const existingBlocks = await prisma.homeBlock.count();
  if (existingBlocks === 0) {
    await prisma.homeBlock.createMany({
      data: [
        {
          type: "intro",
          title: "Yōkoso~ ♡",
          content:
            "Bienvenue sur mon portfolio !\n\nDéveloppeuse passionnée par les interfaces **mignonnes** et les expériences douces. Fais le tour de mes projets, de mes favoris et de mon parcours.",
          order: 0,
          visible: true,
        },
        { type: "latest-projects", title: "Derniers projets", config: JSON.stringify({ count: 3 }), order: 1, visible: true },
        { type: "latest-favorites", title: "Derniers favoris", config: JSON.stringify({ count: 4 }), order: 2, visible: true },
        { type: "latest-timeline", title: "Dernière étape", config: JSON.stringify({ count: 1 }), order: 3, visible: true },
      ],
    });
    console.log("✓ Home blocks seeded");
  }

  // --- Categories + favorites ---
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    const music = await prisma.category.create({
      data: { name: "Musique / Vocaloid", slug: "musique", icon: "🎵", order: 0 },
    });
    const anime = await prisma.category.create({
      data: { name: "Anime / Manga", slug: "anime", icon: "🌸", order: 1 },
    });
    const games = await prisma.category.create({
      data: { name: "Jeux", slug: "jeux", icon: "🎮", order: 2 },
    });
    const software = await prisma.category.create({
      data: { name: "Logiciels", slug: "logiciels", icon: "💻", order: 3 },
    });

    await prisma.favorite.createMany({
      data: [
        { title: "Hatsune Miku", categoryId: music.id, rating: 5, comment: "L'icône ultime ♡", description: "La diva virtuelle qui a tout changé.\n\n- Voix synthétique iconique\n- Concerts holographiques", order: 0 },
        { title: "Sailor Moon", categoryId: anime.id, rating: 5, comment: "Madoka magique nostalgie", description: "Un classique magical girl intemporel.", order: 0 },
        { title: "Stardew Valley", categoryId: games.id, rating: 5, comment: "Le cozy game parfait", description: "Cultiver, pêcher, se détendre.", order: 0 },
        { title: "VS Code", categoryId: software.id, rating: 4, comment: "Mon éditeur du quotidien", description: "Avec un thème pastel, évidemment.", order: 0 },
      ],
    });
    console.log("✓ Categories & favorites seeded");
  }

  // --- Timeline ---
  const tlCount = await prisma.timelineEntry.count();
  if (tlCount === 0) {
    await prisma.timelineEntry.createMany({
      data: [
        { date: new Date("2019-09-01"), title: "Début des études en informatique", tag: "etudes", description: "Première ligne de code, premières nuits blanches.", order: 0 },
        { date: new Date("2022-06-15"), title: "Premier stage en développement web", tag: "pro", description: "Découverte de **React** et du travail en équipe.", order: 1 },
        { date: new Date("2024-01-10"), title: "Lancement de mon portfolio kawaii", tag: "projet", description: "Ce site même ! Construit avec Next.js & amour.", order: 2 },
      ],
    });
    console.log("✓ Timeline seeded");
  }

  // --- Projects ---
  const projCount = await prisma.project.count();
  if (projCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          title: "NekoNoTsuki",
          description: "Mon portfolio personnel, **kawaii** et entièrement éditable depuis l'admin.",
          tags: "Next.js,TypeScript,Tailwind,Prisma",
          githubUrl: "https://github.com/",
          demoUrl: "https://example.com",
          featured: true,
          order: 0,
        },
        {
          title: "Pastel Notes",
          description: "Une app de prise de notes en Markdown au design tout doux.",
          tags: "React,Markdown,PWA",
          githubUrl: "https://github.com/",
          order: 1,
        },
      ],
    });
    console.log("✓ Projects seeded");
  }

  console.log("\n🌸 Seed terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
