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
import { dataService } from "./lib/data-service";

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

  // ====== 所有 hooks 必须在条件 return 之前声明（React 规则） ======
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem("mindflow_tasks");
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem("mindflow_notes");
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });
  const [focusChecks, setFocusChecks] = useState<FocusCheckItem[]>(INITIAL_FOCUS_CHECKS);
  const [projectSummary, setProjectSummary] = useState<ProjectSummary>(() => {
    const saved = localStorage.getItem("mindflow_project");
    return saved ? JSON.parse(saved) : INITIAL_PROJECT;
  });
  const [insightQuote, setInsightQuote] = useState<InsightQuote>(INITIAL_INSIGHT);
  const [collections, setCollections] = useState<CollectionItem[]>(INITIAL_COLLECTIONS);
  const [tags, setTags] = useState<TagItem[]>(INITIAL_TAGS);

  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [selectedNoteForView, setSelectedNoteForView] = useState<NoteItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [isTodayFocusOpen, setIsTodayFocusOpen] = useState(false);
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("mindflow_tasks", JSON.stringify(tasks));
    if (user) dataService.tasks.sync(user.id, tasks).catch(() => {});
  }, [tasks, user]);
  useEffect(() => {
    localStorage.setItem("mindflow_notes", JSON.stringify(notes));
    if (user) dataService.notes.sync(user.id, notes).catch(() => {});
  }, [notes, user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const uid = user.id;
        const [sn, st, sc, stg] = await Promise.all([
          dataService.notes.fetch(uid),
          dataService.tasks.fetch(uid),
          dataService.collections.fetch(uid),
          dataService.tags.fetch(uid),
        ]);
        if (cancelled) return;
        if (sn.length > 0) setNotes(sn);
        else await dataService.notes.migrate(uid);
        if (st.length > 0) setTasks(st);
        else await dataService.tasks.migrate(uid);
        if (sc.length > 0) setCollections(sc);
        if (stg.length > 0) setTags(stg);
        const sp = await dataService.projectSummary.fetch(uid);
        if (!cancelled && sp) setProjectSummary(sp);
      } catch (e) {
        console.error("Supabase initial sync error, staying with localStorage", e);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);
  // ====== 根据 auth 状态决定显示什么 ======
  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  // ====== 以下是已登录用户的 handlers 和 UI ======
  const handleToggleFocus = (id: string) => {
    setFocusChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleToggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDelayTaskToTomorrow = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            deadline: "明天, 17:00",
            badge: "> 24小时",
            badgeType: "upcoming",
            accentColor: "green",
          };
        }
        return t;
      })
    );
  };

  const handleSaveTask = (updatedTask: TaskItem) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === updatedTask.id);
      if (exists) {
        return prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      }
      return [updatedTask, ...prev];
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTasksFromProject = (taskTitles: string[], projectTitle: string) => {
    const formattedTitle = projectTitle.startsWith("项目")
      ? projectTitle
      : `项目：${projectTitle}`;

    const singleProjectTask: TaskItem = {
      id: `task-proj-${Date.now()}`,
      title: formattedTitle,
      details: taskTitles.length > 0 ? taskTitles.join(" · ") : "包含项目清单",
      subItems: taskTitles,
      deadline: "剩余 3 天",
      badge: "剩余 3 天",
      badgeType: "upcoming",
      accentColor: "yellow",
      completed: false,
      tags: ["项目清单"],
      createdAt: "刚刚",
    };

    setTasks((prev) => [singleProjectTask, ...prev]);
  };

  const handleSaveNote = (newNote: NoteItem) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAddTag = (tagName: string) => {
    const newTag: TagItem = {
      id: "tag-",
      name: tagName,
      colorDot: "bg-[#006d41]",
    };
    setTags((prev) => [...prev, newTag]);
  };

  const handleAddCollection = (colName: string) => {
    const newCol: CollectionItem = {
      id: "col-",
      name: colName,
      count: 0,
      iconName: "BookOpen",
      colorClass: "bg-[#e3e2df] text-[#1b1c1a]",
    };
    setCollections((prev) => [...prev, newCol]);
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
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenNewNote={() => setIsNewNoteOpen(true)}
      onOpenNewTask={() => { setEditingTask(null); setIsEditTaskOpen(true); }}
      onOpenTypeSelector={() => setIsTypeSelectorOpen(true)}
      title={getTabTitle()}
      onOpenSearch={() => setIsSearchOpen(true)}
    >
      {activeTab === "home" && (
        <HomeView
          notes={notes} focusChecks={focusChecks} insightQuote={insightQuote}
          projectSummary={projectSummary}
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
        focusChecks={focusChecks} onSaveFocusChecks={(updated) => setFocusChecks(updated)}
      />
      <ProjectListModal isOpen={isProjectListOpen} onClose={() => setIsProjectListOpen(false)}
        projectSummary={projectSummary} onSaveProject={(updated) => setProjectSummary(updated)}
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
