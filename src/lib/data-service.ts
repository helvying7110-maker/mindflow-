import { supabase } from "./supabase";
import type { NoteItem, TaskItem, FocusCheckItem, ProjectSummary, CollectionItem, TagItem } from "../types";

// ============================================================
// Notes
// ============================================================
async function fetchNotes(userId: string): Promise<NoteItem[]> {
  const { data, error } = await supabase
    .from("notes").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    title: r.title || "",
    excerpt: r.excerpt || "",
    content: r.content || "",
    tag: r.tag || "",
    timestamp: r.timestamp || "",
    collection: r.collection || "",
    coverImage: r.cover_image || "",
    images: r.images || [],
    isPrivate: r.is_private || false,
  }));
}

async function syncNotes(userId: string, items: NoteItem[]): Promise<void> {
  const { error: delErr } = await supabase.from("notes").delete().eq("user_id", userId);
  if (delErr) throw delErr;
  if (items.length === 0) return;
  const rows = items.map((i) => ({
    id: i.id, user_id: userId, title: i.title, excerpt: i.excerpt,
    content: i.content, tag: i.tag, timestamp: i.timestamp,
    collection: i.collection, cover_image: i.coverImage,
    images: i.images || [], is_private: i.isPrivate || false,
  }));
  const { error: insErr } = await supabase.from("notes").insert(rows);
  if (insErr) throw insErr;
}

function migrateNotes(userId: string): Promise<void> {
  const saved = localStorage.getItem("mindflow_notes");
  if (!saved) return Promise.resolve();
  return syncNotes(userId, JSON.parse(saved));
}

// ============================================================
// Tasks
// ============================================================
async function fetchTasks(userId: string): Promise<TaskItem[]> {
  const { data, error } = await supabase
    .from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id, title: r.title || "", details: r.details || "",
    subItems: r.sub_items || [], deadline: r.deadline || "",
    badge: r.badge || "", badgeType: r.badge_type || "normal",
    accentColor: r.accent_color || "grey", completed: r.completed || false,
    tags: r.tags || [], createdAt: r.created_at || "",
  }));
}

async function syncTasks(userId: string, items: TaskItem[]): Promise<void> {
  const { error: delErr } = await supabase.from("tasks").delete().eq("user_id", userId);
  if (delErr) throw delErr;
  if (items.length === 0) return;
  const rows = items.map((i) => ({
    id: i.id, user_id: userId, title: i.title, details: i.details,
    sub_items: i.subItems, deadline: i.deadline, badge: i.badge,
    badge_type: i.badgeType, accent_color: i.accentColor,
    completed: i.completed, tags: i.tags || [], created_at: i.createdAt,
  }));
  const { error: insErr } = await supabase.from("tasks").insert(rows);
  if (insErr) throw insErr;
}

function migrateTasks(userId: string): Promise<void> {
  const saved = localStorage.getItem("mindflow_tasks");
  if (!saved) return Promise.resolve();
  return syncTasks(userId, JSON.parse(saved));
}

// ============================================================
// Focus Checks
// ============================================================
async function fetchFocusChecks(userId: string): Promise<FocusCheckItem[]> {
  const { data, error } = await supabase
    .from("focus_checks").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({ id: r.id, title: r.title, completed: r.completed }));
}

async function syncFocusChecks(userId: string, items: FocusCheckItem[]): Promise<void> {
  const { error: delErr } = await supabase.from("focus_checks").delete().eq("user_id", userId);
  if (delErr) throw delErr;
  if (items.length === 0) return;
  const rows = items.map((i) => ({ id: i.id, user_id: userId, title: i.title, completed: i.completed }));
  const { error: insErr } = await supabase.from("focus_checks").insert(rows);
  if (insErr) throw insErr;
}

// ============================================================
// Project Summary
// ============================================================
async function fetchProjectSummary(userId: string): Promise<ProjectSummary | null> {
  const { data, error } = await supabase
    .from("project_summaries").select("*").eq("user_id", userId).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, title: data.title || "", items: data.items || [] };
}

async function syncProjectSummary(userId: string, item: ProjectSummary): Promise<void> {
  const { error: delErr } = await supabase.from("project_summaries").delete().eq("user_id", userId);
  if (delErr) throw delErr;
  const { error: insErr } = await supabase.from("project_summaries").insert({
    id: item.id, user_id: userId, title: item.title, items: item.items || [],
  });
  if (insErr) throw insErr;
}

// ============================================================
// Collections
// ============================================================
async function fetchCollections(userId: string): Promise<CollectionItem[]> {
  const { data, error } = await supabase
    .from("collections").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id, name: r.name, count: r.count || 0,
    iconName: r.icon_name || "BookOpen", colorClass: r.color_class || "",
    avatars: r.avatars || [],
  }));
}

async function syncCollections(userId: string, items: CollectionItem[]): Promise<void> {
  const { error: delErr } = await supabase.from("collections").delete().eq("user_id", userId);
  if (delErr) throw delErr;
  if (items.length === 0) return;
  const rows = items.map((i) => ({
    id: i.id, user_id: userId, name: i.name, count: i.count || 0,
    icon_name: i.iconName, color_class: i.colorClass, avatars: i.avatars || [],
  }));
  const { error: insErr } = await supabase.from("collections").insert(rows);
  if (insErr) throw insErr;
}

// ============================================================
// Tags
// ============================================================
async function fetchTags(userId: string): Promise<TagItem[]> {
  const { data, error } = await supabase
    .from("tags").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id, name: r.name, colorDot: r.color_dot || "",
  }));
}

async function syncTags(userId: string, items: TagItem[]): Promise<void> {
  const { error: delErr } = await supabase.from("tags").delete().eq("user_id", userId);
  if (delErr) throw delErr;
  if (items.length === 0) return;
  const rows = items.map((i) => ({
    id: i.id, user_id: userId, name: i.name, color_dot: i.colorDot,
  }));
  const { error: insErr } = await supabase.from("tags").insert(rows);
  if (insErr) throw insErr;
}

// ============================================================
// 统一暴露
// ============================================================
export const dataService = {
  notes: { fetch: fetchNotes, sync: syncNotes, migrate: migrateNotes },
  tasks: { fetch: fetchTasks, sync: syncTasks, migrate: migrateTasks },
  focusChecks: { fetch: fetchFocusChecks, sync: syncFocusChecks },
  projectSummary: { fetch: fetchProjectSummary, sync: syncProjectSummary },
  collections: { fetch: fetchCollections, sync: syncCollections },
  tags: { fetch: fetchTags, sync: syncTags },
};
