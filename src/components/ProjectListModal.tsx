import React, { useState } from 'react';
import { ProjectSummary } from '../types';
import { ArrowLeft, GripVertical, Trash2, Plus, Check, MoreVertical, ListPlus } from 'lucide-react';

interface ProjectListModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectSummary: ProjectSummary;
  onSaveProject: (updatedProject: ProjectSummary) => void;
  onAddTasksFromProject?: (taskTitles: string[], projectTitle: string) => void;
}

export const ProjectListModal: React.FC<ProjectListModalProps> = ({
  isOpen,
  onClose,
  projectSummary,
  onSaveProject,
  onAddTasksFromProject,
}) => {
  const [title, setTitle] = useState(projectSummary.title || 'MindFlow 系统设计');
  const [items, setItems] = useState<string[]>(
    projectSummary.items && projectSummary.items.length > 0
      ? projectSummary.items
      : ['完善 UI 设计系统文档', '优化移动端交互触点', '准备项目路演幻灯片', '集成 API 文档自动化']
  );
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleItemChange = (index: number, val: string) => {
    const updated = [...items];
    updated[index] = val;
    setItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setItems([...items, '']);
  };

  const getValidProject = (): ProjectSummary => {
    const validItems = items.filter((item) => item.trim() !== '');
    return {
      id: projectSummary.id || `proj-${Date.now()}`,
      title: title.trim() || '新项目',
      items: validItems,
    };
  };

  const handleSave = () => {
    const updatedProject = getValidProject();
    onSaveProject(updatedProject);
    onClose();
  };

  const handleAddToTasks = () => {
    const updatedProject = getValidProject();
    onSaveProject(updatedProject);

    if (onAddTasksFromProject && updatedProject.items.length > 0) {
      onAddTasksFromProject(updatedProject.items, updatedProject.title);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 1000);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#faf9f5] animate-fadeIn overflow-y-auto max-w-md mx-auto">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 bg-[#faf9f5]/90 backdrop-blur-md px-5 h-16 border-b border-[#efeeea] flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#efeeea] text-[#1b1c1a] transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-[#1b1c1a] tracking-tight">编辑项目</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#efeeea] text-[#1b1c1a] transition-colors active:scale-95">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-4 pb-36 space-y-6">
        {/* Project Title Input Section */}
        <div>
          <label className="block text-xs font-semibold text-[#747878] uppercase tracking-wider mb-2 ml-1">
            项目名称
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入项目名称..."
            className="w-full bg-[#f4f4f0] border-none rounded-2xl px-4 py-3 font-bold text-lg text-[#1b1c1a] focus:ring-2 focus:ring-[#006d41]/20 transition-all outline-none"
          />
        </div>

        {/* Task List Header */}
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-semibold text-[#747878] uppercase tracking-widest">
            任务列表
          </h2>
          <span className="text-xs font-medium text-[#747878] opacity-70">
            {items.length} 个任务
          </span>
        </div>

        {/* Draggable Task Items */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm border border-[#efeeea] group transition-all ${
                idx === 2 ? 'border-l-4 border-l-[#006d41]' : ''
              }`}
            >
              <div className="text-[#c4c7c7] cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(idx, e.target.value)}
                placeholder="输入任务内容..."
                className="flex-1 bg-transparent border-none p-0 text-base text-[#1b1c1a] focus:ring-0 placeholder:text-[#c4c7c7]"
              />
              <button
                onClick={() => handleDeleteItem(idx)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors active:scale-90"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Task Button */}
        <button
          onClick={handleAddItem}
          className="w-full py-4 border-2 border-dashed border-[#c4c7c7] hover:border-[#006d41] rounded-2xl flex items-center justify-center gap-1.5 text-sm font-semibold text-[#444748] hover:text-[#006d41] hover:bg-[#efeeea] transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>添加任务</span>
        </button>
      </main>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1b1c1a] text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <Check className="w-4 h-4 text-[#95f7bb]" />
          <span>已成功添加至追踪任务列表！</span>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#faf9f5]/90 backdrop-blur-md px-5 pt-3 pb-8 z-40 border-t border-[#efeeea] flex gap-3">
        <button
          onClick={handleAddToTasks}
          className="flex-1 h-14 bg-[#95f7bb] text-[#005230] rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-[#7adaa1] active:scale-95 transition-all border border-[#006d41]/20"
        >
          <ListPlus className="w-5 h-5" />
          <span>添加为任务</span>
        </button>
        <button
          onClick={handleSave}
          className="flex-1 h-14 bg-[#1b1c1a] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all"
        >
          <Check className="w-5 h-5 text-[#95f7bb]" />
          <span>完成</span>
        </button>
      </div>
    </div>
  );
};
