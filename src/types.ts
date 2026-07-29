export type TabType = 'home' | 'trace' | 'structure';

export interface TaskItem {
  id: string;
  title: string;
  details: string;
  subItems?: string[];
  deadline: string;
  badge: string;
  badgeType: 'overdue' | 'urgent' | 'upcoming' | 'normal';
  accentColor: 'red' | 'yellow' | 'green' | 'grey';
  completed: boolean;
  tags?: string[];
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tag: string;
  timestamp: string;
  collection: string;
  coverImage?: string;
  images?: string[];
  isPrivate?: boolean;
}

export interface FocusCheckItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface InsightQuote {
  quote: string;
  author: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  items: string[];
}

export interface CollectionItem {
  id: string;
  name: string;
  count: number;
  iconName: string;
  colorClass: string;
  avatars?: string[];
}

export interface TagItem {
  id: string;
  name: string;
  colorDot: string;
}
