import { supabase } from './supabase';
import type { TaskItem, NoteItem, FocusCheckItem, ProjectSummary, CollectionItem, TagItem } from '../types';

// ====== 笔记 ======
export async function fetchNotes(): Promise<NoteItem[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchNotes error:', error); return []; }
  return (data || []).map(rowToNote);
}

export async function saveNote(note: NoteItem): Promise<NoteItem | null> {
  const { data, error } = await supabase
    .from('notes')
    .upsert(noteToRow(note), { onConflict: 'id' })
    .select()
    .single();
  if (error) { console.error('saveNote error:', error); return null; }
  return rowToNote(data);
}

export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) { console.error('deleteNote error:', error); return false; }
  return true;
}

// ====== 任务 ======
export async function fetchTasks(): Promise<TaskItem[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchTasks error:', error); return []; }
  return (data || []).map(rowToTask);
}

export async function saveTask(task: TaskItem): Promise<TaskItem | null> {
  const { data, error } = await supabase
    .from('tasks')
    .upsert(taskToRow(task), { onConflict: 'id' })
    .select()
    .single();
  if (error) { console.error('saveTask error:', error); return null; }
  return rowToTask(data);
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) { console.error('deleteTask error:', error); return false; }
  return true;
}

// ====== 今日重点 ======
export async function fetchFocusChecks(): Promise<FocusCheckItem[]> {
  const { data, error } = await supabase
    .from('focus_checks')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('fetchFocusChecks error:', error); return []; }
  return (data || []).map(rowToFocusCheck);
}

export async function saveFocusCheck(item: FocusCheckItem): Promise<FocusCheckItem | null> {
  const { data, error } = await supabase
    .from('focus_checks')
    .upsert(focusCheckToRow(item), { onConflict: 'id' })
    .select()
    .single();
  if (error) { console.error('saveFocusCheck error:', error); return null; }
  return rowToFocusCheck(data);
}

export async function saveFocusChecks(items: FocusCheckItem[]): Promise<void> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return;
  // 删掉旧数据再批量插入
  await supabase.from('focus_checks').delete().eq('user_id', userId);
  const rows = items.map(f => ({ ...focusCheckToRow(f), user_id: userId }));
  await supabase.from('focus_checks').insert(rows);
}

// ====== 项目清单 ======
export async function fetchProjectSummary(): Promise<ProjectSummary | null> {
  const { data, error } = await supabase
    .from('project_summaries')
    .select('*')
    .limit(1)
    .single();
  if (error || !data) return null;
  return rowToProject(data);
}

export async function saveProjectSummary(item: ProjectSummary): Promise<ProjectSummary | null> {
  const { data, error } = await supabase
    .from('project_summaries')
    .upsert(projectToRow(item), { onConflict: 'id' })
    .select()
    .single();
  if (error) { console.error('saveProjectSummary error:', error); return null; }
  return rowToProject(data);
}

// ====== 合集 ======
export async function fetchCollections(): Promise<CollectionItem[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('fetchCollections error:', error); return []; }
  return (data || []).map(rowToCollection);
}

export async function saveCollection(item: CollectionItem): Promise<CollectionItem | null> {
  const { data, error } = await supabase
    .from('collections')
    .upsert(collectionToRow(item), { onConflict: 'id' })
    .select()
    .single();
  if (error) { console.error('saveCollection error:', error); return null; }
  return rowToCollection(data);
}

// ====== 标签 ======
export async function fetchTags(): Promise<TagItem[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('fetchTags error:', error); return []; }
  return (data || []).map(rowToTag);
}

export async function saveTag(item: TagItem): Promise<TagItem | null> {
  const { data, error } = await supabase
    .from('tags')
    .upsert(tagToRow(item), { onConflict: 'id' })
    .select()
    .single();
  if (error) { console.error('saveTag error:', error); return null; }
  return rowToTag(data);
}

// ====== 行映射 ======

function rowToNote(row: any): NoteItem {
  return {
    id: row.id,
    title: row.title || '',
    excerpt: row.excerpt || '',
    content: row.content || '',
    tag: row.tag || '',
    timestamp: row.timestamp || '',
    collection: row.collection || '',
    coverImage: row.cover_image || undefined,
    images: Array.isArray(row.images) ? row.images : [],
    isPrivate: row.is_private || false,
  };
}

function noteToRow(note: NoteItem): any {
  const userId = supabase.auth.getUser() ? null : null;
  return {
    id: note.id,
    title: note.title,
    excerpt: note.excerpt,
    content: note.content,
    tag: note.tag,
    timestamp: note.timestamp,
    collection: note.collection,
    cover_image: note.coverImage || null,
    images: note.images || [],
    is_private: note.isPrivate || false,
  };
}

function rowToTask(row: any): TaskItem {
  return {
    id: row.id,
    title: row.title || '',
    details: row.details || '',
    subItems: Array.isArray(row.sub_items) ? row.sub_items : [],
    deadline: row.deadline || '',
    badge: row.badge || '',
    badgeType: row.badge_type || 'normal',
    accentColor: row.accent_color || 'grey',
    priority: row.priority || 'normal',
    completed: row.completed || false,
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at?.slice(0, 10) || '',
  };
}

function taskToRow(task: TaskItem): any {
  return {
    id: task.id,
    title: task.title,
    details: task.details,
    sub_items: task.subItems || [],
    deadline: task.deadline,
    badge: task.badge,
    badge_type: task.badgeType,
    accent_color: task.accentColor,
    priority: task.priority || 'normal',
    completed: task.completed,
    tags: task.tags || [],
  };
}

function rowToFocusCheck(row: any): FocusCheckItem {
  return {
    id: row.id,
    title: row.title || '',
    completed: row.completed || false,
  };
}

function focusCheckToRow(item: FocusCheckItem): any {
  return {
    id: item.id,
    title: item.title,
    completed: item.completed,
  };
}

function rowToProject(row: any): ProjectSummary {
  return {
    id: row.id,
    title: row.title || '',
    items: Array.isArray(row.items) ? row.items : [],
  };
}

function projectToRow(item: ProjectSummary): any {
  return {
    id: item.id,
    title: item.title,
    items: item.items || [],
  };
}

function rowToCollection(row: any): CollectionItem {
  return {
    id: row.id,
    name: row.name || '',
    count: row.count || 0,
    iconName: row.icon_name || 'BookOpen',
    colorClass: row.color_class || '',
    avatars: Array.isArray(row.avatars) ? row.avatars : undefined,
  };
}

function collectionToRow(item: CollectionItem): any {
  return {
    id: item.id,
    name: item.name,
    count: item.count,
    icon_name: item.iconName,
    color_class: item.colorClass,
    avatars: item.avatars || [],
  };
}

function rowToTag(row: any): TagItem {
  return {
    id: row.id,
    name: row.name || '',
    colorDot: row.color_dot || 'bg-emerald-500',
  };
}

function tagToRow(item: TagItem): any {
  return {
    id: item.id,
    name: item.name,
    color_dot: item.colorDot,
  };
}
