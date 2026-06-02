// Serialized shapes passed from server pages to client manager components.

export type BlockDTO = {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  config: string | null;
  visible: boolean;
  order: number;
};

export type ProjectDTO = {
  id: string;
  title: string;
  coverUrl: string | null;
  description: string | null;
  tags: string;
  githubUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  order: number;
};

export type TimelineDTO = {
  id: string;
  date: string; // ISO (yyyy-mm-dd usable in <input type=date>)
  title: string;
  description: string | null;
  tag: string;
  order: number;
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
};

export type FavoriteDTO = {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  details: string | null;
  rating: number | null;
  comment: string | null;
  order: number;
  categoryId: string;
};
