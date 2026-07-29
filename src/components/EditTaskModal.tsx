import React, { useState, useEffect } from 'react';
import { TaskItem } from '../types';
import { X, Calendar, ChevronRight, Loader2, Check, Trash2, Plus } from 'lucide-react';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onSaveTask: (updatedTask: TaskItem) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSaveTask,
}) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [datePickerValue, setDatePickerValue] = useState('');
  const [details, setDetails] = useState('');
  const [subItems, setSubItems] = useState<string[]>([]);
  const [newSubItemText, setNewSubItemText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isProjectTask = Boolean(
    task?.tags?.some((t) => t.includes('项目')) ||
      (task?.subItems && task.subItems.length > 0) ||
      task?.title.startsWith('项目')
  );

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDeadline(task.deadline || '今天, 17:00');
      setDetails(task.details || '');
      setSubItems(task.subItems || []);
    } else {
      setTitle('');
      setDeadline('今天, 17:00');
      setDetails('');
      setSubItems([]);
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setDatePickerValue(`${year}-${month}-${day}T17:00`);
    setNewSubItemText('');
    setIsSaving(false);
    setSavedSuccess(false);
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleAddSubItem = () => {
    if (!newSubItemText.trim()) return;
    setSubItems([...subItems, newSubItemText.trim()]);
    setNewSubItemText('');
  };

  const handleRemoveSubItem = (index: number) => {
    setSubItems(subItems.filter((_, i) => i !== index));
  };

  const handleUpdateSubItem = (index: number, val: string) => {
    const updated = [...subItems];
    updated[index] = val;
    setSubItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);

      const cleanedSubItems = subItems.filter((s) => s.trim().length > 0);

      const updated: TaskItem = {
        id: task ? task.id : `task-${Date.now()}`,
        title: title.trim(),
        details: isProjectTask
          ? cleanedSubItems.join(' • ')
          : details.trim(),
        subItems: isProjectTask ? cleanedSubItems : task?.subItems,
        deadline: deadline,
        badge: deadline,
        badgeType: task ? task.badgeType : 'upcoming',
        accentColor: task ? task.accentColor : 'yellow',
        completed: task ? task.completed : false,
        tags: task ? task.tags : (isProjectTask ? ['项目清单'] : ['#工作']),
        createdAt: task ? task.createdAt : new Date().toISOString().split('T')[0],
      };

      setTimeout(() => {
        onSaveTask(updated);
        onClose();
      }, 500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Drawer */}
      <div
        className="relative w-full max-w-md bg-[#faf9f5] rounded-t-[32px] px-6 pt-4 pb-10 flex flex-col max-h-[88vh] overflow-y-auto shadow-2xl z-10 bottom-sheet animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle Bar */}
        <div className="w-12 h-1.5 bg-[#e3e2df] rounded-full self-center mb-6" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1b1c1a] tracking-tight">
            {isProjectTask ? '编辑项目清单' : task ? '编辑任务' : '新建任务'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#efeeea] hover:bg-[#e9e8e4] flex items-center justify-center transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-[#444748]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title Input (主题) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#444748] ml-1 uppercase tracking-wider">
              {isProjectTask ? '项目主题' : '任务标题'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isProjectTask ? '项目主题，如：项目：宁静之家' : '任务标题...'}
              required
              className="w-full h-14 px-5 bg-[#f4f4f0] border-none rounded-2xl text-base font-bold text-[#1b1c1a] focus:ring-2 focus:ring-[#1b1c1a]/20 transition-all placeholder:text-[#747878]"
            />
          </div>

          {/* If Project Task: Render Editable Sub-Items List */}
          {isProjectTask ? (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-[#444748] uppercase tracking-wider">
                  任务列表
                </label>
                <span className="text-[11px] text-[#747878] font-semibold">
                  共 {subItems.length} 项
                </span>
              </div>

              {/* Sub items list */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {subItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 bg-[#f4f4f0] px-3.5 py-2.5 rounded-2xl border border-transparent focus-within:border-[#1b1c1a]/20 transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#5c5800] shrink-0" />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleUpdateSubItem(idx, e.target.value)}
                      placeholder="编辑任务项..."
                      className="flex-1 bg-transparent border-none text-sm font-medium text-[#1b1c1a] p-0 focus:outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubItem(idx)}
                      className="w-7 h-7 rounded-xl hover:bg-[#e3e2df] text-[#747878] hover:text-[#c5221f] flex items-center justify-center transition-colors"
                      title="删除任务"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Sub item Row */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newSubItemText}
                  onChange={(e) => setNewSubItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubItem();
                    }
                  }}
                  placeholder="添加新的任务项..."
                  className="flex-1 h-12 px-4 bg-[#f4f4f0] border-none rounded-xl text-xs font-medium text-[#1b1c1a] focus:ring-2 focus:ring-[#1b1c1a]/20 placeholder:text-[#747878]"
                />
                <button
                  type="button"
                  onClick={handleAddSubItem}
                  className="px-4 h-12 bg-[#1b1c1a] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#95f7bb]" />
                  <span>添加条目</span>
                </button>
              </div>
            </div>
          ) : (
            /* Normal Task Details */
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#444748] ml-1 uppercase tracking-wider">
                任务详情
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="添加备注、步骤或上下文信息..."
                rows={4}
                className="w-full p-5 bg-[#f4f4f0] border-none rounded-2xl text-sm text-[#1b1c1a] focus:ring-2 focus:ring-[#1b1c1a]/20 transition-all resize-none placeholder:text-[#747878] leading-relaxed"
              />
            </div>
          )}

          {/* Deadline Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#444748] ml-1 uppercase tracking-wider">
              截止时间
            </label>

            {/* Calendar Picker Control */}
            <div className="flex items-center gap-3 bg-[#f4f4f0] h-13 px-4 rounded-2xl relative border border-transparent focus-within:border-[#1b1c1a]/20 transition-all">
              <Calendar className="w-5 h-5 text-[#006d41] shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <input
                  type="datetime-local"
                  value={datePickerValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDatePickerValue(val);
                    if (val) {
                      const formatted = val.replace('T', ' ');
                      setDeadline(formatted);
                    }
                  }}
                  className="w-full bg-transparent border-none text-xs font-semibold text-[#1b1c1a] focus:outline-none focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 rounded-full font-semibold text-sm text-[#444748] bg-[#efeeea] hover:bg-[#e9e8e4] transition-colors active:scale-95"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-14 bg-[#1b1c1a] text-white rounded-full font-semibold text-sm shadow-lg shadow-black/10 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : savedSuccess ? (
                <>
                  <Check className="w-5 h-5 text-[#95f7bb]" />
                  <span>已保存</span>
                </>
              ) : (
                <span>保存</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

