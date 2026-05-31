import { prisma } from "@/lib/prisma";

// Public pages read straight from the DB (server components) so they render
// fully on the server with no client JS required.

export function getHomeBlocks() {
  return prisma.homeBlock.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
}

export function getLatestProjects(count = 3) {
  return prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    take: count,
  });
}

export function getLatestFavorites(count = 4) {
  return prisma.favorite.findMany({
    orderBy: { createdAt: "desc" },
    take: count,
    include: { category: true },
  });
}

export function getLatestTimeline(count = 1) {
  return prisma.timelineEntry.findMany({
    orderBy: [{ date: "desc" }],
    take: count,
  });
}

export function getAllProjects() {
  return prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });
}

export function getCategoriesWithFavorites() {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      items: { orderBy: [{ order: "asc" }, { createdAt: "desc" }] },
    },
  });
}

export function getTimeline() {
  return prisma.timelineEntry.findMany({
    orderBy: [{ date: "desc" }, { order: "asc" }],
  });
}

export function getPage(slug: string) {
  return prisma.page.findUnique({ where: { slug } });
}
