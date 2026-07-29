import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { Loader2 } from "lucide-react";
import { TabType, TaskItem, NoteItem, FocusCheckItem, InsightQuote, ProjectSummary, CollectionItem, TagItem } from "./types";
import {
  INITIAL_TASKS,
  INITIAL_NOTES,
  INITIAL_FOCUS_CHECKS,
  INITIAL_INSIGHT,
  MAO_QUOTES,
  INITIAL_PROJECT,
  INITIAL_COLLECTIONS,
  INITIAL_TAGS,
} from "./data/initialData";
import {
  fetchNotes, saveNote, deleteNote,
  fetchTasks, saveTask, deleteTask,
  fetchFocusChecks, saveFocusChecks,
  fetchProjectSummary, saveProjectSummary,
  fetchCollections, saveCollection,
  fetchTags, saveTag,
} from "./lib/api";
import { NavigationShell } from "./components/NavigationShell";
import { HomeView } from "./components/HomeView";
import { TraceView } from "./components/TraceView";
import { StructureView } from "./components/StructureView";
import { EditTaskModal } from "./components/EditTaskModal";
import { NewNoteModal } from "./components/NewNoteModal";
import { NoteDetailModal } from "./components/NoteDetailModal";
import { SearchModal } from "./components/SearchModal";
import { NoteTypeSelectorModal } from "./components/NoteTypeSelectorModal";
import { TodayFocusModal } from "./components/TodayFocusModal";
import { ProjectListModal } from "./components/ProjectListModal";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center max-w-md mx-auto">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#006d41]" />
        <p className="text-sm text-[#747878] font-medium">加载中...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  // ====== 状态：初始用本地数据，用户登录后从 Supabase 拉取 ======
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [focusChecks, setFocusChecks] = useState<FocusCheckItem[]>(INITIAL_FOCUS_CHECKS);
  const [projectSummary, setProjectSummary] = useState<ProjectSummary>(INITIAL_PROJECT);
  const [insightQuote, setInsightQuote] = useState<InsightQuote>(INITIAL_INSIGHT);
  const [collections, setCollections] = useState<CollectionItem[]>(INITIAL_COLLECTIONS);
  const [tags, setTags] = useState<TagItem[]>(INITIAL_TAGS);
  const [dataLoaded, setDataLoaded] = useState(false);

  // UI 状态
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [selectedNoteForView, setSelectedNoteForView] = useState<NoteItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [isTodayFocusOpen, setIsTodayFocusOpen] = useState(false);
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);

  // ====== 用户登录后从 Supabase 加载所有数据 ======
  useEffect(() => {
    if (!user) { setDataLoaded(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const [n, t, fc, ps, c, tg] = await Promise.all([
          fetchNotes(),
          fetchTasks(),
          fetchFocusChecks(),
          fetchProjectSummary(),
          fetchCollections(),
          fetchTags(),
        ]);
        if (cancelled) return;
        // 只有当云端有数据时才覆盖本地默认值
        if (n.length > 0) setNotes(n);
        if (t.length > 0) setTasks(t);
        if (fc.length > 0) setFocusChecks(fc);
        if (ps) setProjectSummary(ps);
        if (c.length > 0) setCollections(c);
        if (tg.length > 0) setTags(tg);
        setDataLoaded(true);
      } catch (e) {
        console.error("Supabase load error:", e);
        setDataLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // ====== 根据 auth 状态决定显示 ======
  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;
  if (!dataLoaded) return <LoadingScreen />;

  // ====== Handler：任务 ======
  const handleToggleTaskComplete = async (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      const target = updated.find(t => t.id === id);
      if (target) saveTask(target);
      return updated;
    });
  };

  const handleDelayTaskToTomorrow = async (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const newTask = {
            ...t, deadline: "明天, 17:00", badge: "> 24小时",
            badgeType: "upcoming" as const, accentColor: "green" as TaskItem["accentColor"],
          };
          saveTask(newTask);
          return newTask;
        }
        return t;
      });
      return updated;
    });
  };

  const handleSaveTask = async (updatedTask: TaskItem) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === updatedTask.id);
      const next = exists
        ? prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        : [updatedTask, ...prev];
      return next;
    });
    saveTask(updatedTask);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    deleteTask(id);
  };

  // ====== Handler：笔记 ======
  const handleSaveNote = async (newNote: NoteItem) => {
    setNotes((prev) => [newNote, ...prev]);
    saveNote(newNote);
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    deleteNote(id);
  };

  // ====== Handler：今日重点 ======
  const handleToggleFocus = (id: string) => {
    setFocusChecks((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      saveFocusChecks(updated);
      return updated;
    });
  };

  // ====== Handler：项目清单 ======
  const handleAddTasksFromProject = async (taskTitles: string[], projectTitle: string) => {
    const formattedTitle = projectTitle.startsWith("项目") ? projectTitle : `项目：${projectTitle}`;
    const newTask: TaskItem = {
      id: `task-proj-${Date.now()}`,
      title: formattedTitle,
      details: taskTitles.length > 0 ? taskTitles.join(" · ") : "包含项目清单",
      subItems: taskTitles,
      deadline: "剩余 3 天", badge: "剩余 3 天",
      badgeType: "upcoming", accentColor: "yellow",
      completed: false, tags: ["#项目清单"], createdAt: "刚刚",
    };
    setTasks((prev) => [newTask, ...prev]);
    saveTask(newTask);
  };

  // ====== Handler：合集 & 标签 ======
  const handleAddTag = async (tagName: string) => {
    const newTag: TagItem = {
      id: `tag-${Date.now()}`,
      name: tagName,
      colorDot: "bg-[#006d41]",
    };
    setTags((prev) => [...prev, newTag]);
    saveTag(newTag);
  };

  const handleAddCollection = async (colName: string) => {
    const newCol: CollectionItem = {
      id: `col-${Date.now()}`,
      name: colName, count: 0,
      iconName: "BookOpen",
      colorClass: "bg-[#e3e2df] text-[#1b1c1a]",
    };
    setCollections((prev) => [...prev, newCol]);
    saveCollection(newCol);
  };

  const handleGenerateAiSpark = async () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const nextQuotes = MAO_QUOTES.filter((q) => q.quote !== insightQuote.quote);
      const randomQuote = nextQuotes[Math.floor(Math.random() * nextQuotes.length)] || MAO_QUOTES[0];
      setInsightQuote(randomQuote);
      setIsAiGenerating(false);
    }, 400);
  };

  const getTabTitle = () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    switch (activeTab) {
      case "home": return "MindFlow";
      case "trace": return `追踪 · ${todayStr}`;
      case "structure": return "库";
      default: return "MindFlow";
    }
  };

  return (
    <NavigationShell
      activeTab={activeTab} setActiveTab={setActiveTab}
      onOpenNewNote={() => setIsNewNoteOpen(true)}
      onOpenNewTask={() => { setEditingTask(null); setIsEditTaskOpen(true); }}
      onOpenTypeSelector={() => setIsTypeSelectorOpen(true)}
      title={getTabTitle()}
      onOpenSearch={() => setIsSearchOpen(true)}
    >
      {activeTab === "home" && (
        <HomeView
          notes={notes} focusChecks={focusChecks} insightQuote={insightQuote}
          projectSummary={projectSummary} tasks={tasks} collections={collections}
          onToggleFocus={handleToggleFocus}
          onSelectNote={(note) => setSelectedNoteForView(note)}
          onGenerateAiSpark={handleGenerateAiSpark} isAiGenerating={isAiGenerating}
          onOpenTodayFocus={() => setIsTodayFocusOpen(true)}
          onOpenProjectList={() => setIsProjectListOpen(true)}
        />
      )}

      {activeTab === "trace" && (
        <TraceView
          tasks={tasks}
          onToggleTaskComplete={handleToggleTaskComplete}
          onDelayTaskToTomorrow={handleDelayTaskToTomorrow}
          onEditTask={(task) => { setEditingTask(task); setIsEditTaskOpen(true); }}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {activeTab === "structure" && (
        <StructureView
          collections={collections} tags={tags} notes={notes} tasks={tasks}
          onSelectNote={(noteOrId) => {
            if (typeof noteOrId === "string") {
              const found = notes.find((n) => n.id === noteOrId);
              if (found) setSelectedNoteForView(found);
            } else { setSelectedNoteForView(noteOrId); }
          }}
          onOpenNewNote={() => setIsNewNoteOpen(true)}
          onAddTag={handleAddTag} onAddCollection={handleAddCollection}
        />
      )}

      <NoteTypeSelectorModal isOpen={isTypeSelectorOpen} onClose={() => setIsTypeSelectorOpen(false)}
        onSelectContentNote={() => setIsNewNoteOpen(true)}
        onSelectTodayFocus={() => setIsTodayFocusOpen(true)}
        onSelectProjectList={() => setIsProjectListOpen(true)}
      />
      <TodayFocusModal isOpen={isTodayFocusOpen} onClose={() => setIsTodayFocusOpen(false)}
        focusChecks={focusChecks} onSaveFocusChecks={async (updated) => {
          setFocusChecks(updated);
          saveFocusChecks(updated);
        }}
      />
      <ProjectListModal isOpen={isProjectListOpen} onClose={() => setIsProjectListOpen(false)}
        projectSummary={projectSummary} tasks={tasks} collections={collections} onSaveProject={async (updated) => {
          setProjectSummary(updated);
          saveProjectSummary(updated);
        }}
        onAddTasksFromProject={handleAddTasksFromProject}
      />
      <EditTaskModal isOpen={isEditTaskOpen} onClose={() => { setIsEditTaskOpen(false); setEditingTask(null); }}
        task={editingTask} onSaveTask={handleSaveTask}
      />
      <NewNoteModal isOpen={isNewNoteOpen} onClose={() => setIsNewNoteOpen(false)}
        onSaveNote={handleSaveNote} onSaveTask={handleSaveTask} existingNotes={notes}
      />
      <NoteDetailModal note={selectedNoteForView} onClose={() => setSelectedNoteForView(null)}
        onDeleteNote={handleDeleteNote}
      />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)}
        notes={notes} tasks={tasks}
        onSelectNote={(note) => setSelectedNoteForView(note)}
        onSelectTask={(task) => { setActiveTab("trace"); setEditingTask(task); setIsEditTaskOpen(true); }}
      />
    </NavigationShell>
  );
}
