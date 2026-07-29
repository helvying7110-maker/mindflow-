import React, { useState } from 'react';
import { FocusCheckItem } from '../types';
import { ArrowLeft, GripVertical, Trash2, Plus, Check } from 'lucide-react';

interface TodayFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusChecks: FocusCheckItem[];
  onSaveFocusChecks: (items: FocusCheckItem[]) => void;
}

export const TodayFocusModal: React.FC<TodayFocusModalProps> = ({
  isOpen,
  onClose,
  focusChecks,
  onSaveFocusChecks,
}) => {
  const [items, setItems] = useState<FocusCheckItem[]>(focusChecks);

  if (!isOpen) return null;

  const handleTextChange = (id: string, text: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: text } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    const newItem: FocusCheckItem = {
      id: `focus-${Date.now()}`,
      title: '',
      completed: false,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleSave = () => {
    // Filter out completely empty items
    const validItems = items.filter((item) => item.title.trim() !== '');
    onSaveFocusChecks(validItems.length > 0 ? validItems : items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#faf9f5] animate-fadeIn overflow-y-auto max-w-md mx-auto">
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-[#faf9f5]/90 backdrop-blur-md px-5 h-16 border-b border-[#efeeea] flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#efeeea] text-[#1b1c1a] transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-[#1b1c1a] tracking-tight">今日重点</h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-4 pb-32 space-y-6">
        {/* Instruction Subtitle */}
        <p className="text-sm text-[#747878] font-medium opacity-80">
          定义你今天的三个核心目标，保持专注。
        </p>

        {/* Task List */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-[#efeeea] group transition-all"
            >
              <div className="text-[#c4c7c7] cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleTextChange(item.id, e.target.value)}
                placeholder="输入任务名称..."
                className="flex-1 bg-transparent border-none p-0 text-base font-medium text-[#1b1c1a] focus:ring-0 placeholder:text-[#c4c7c7]"
              />
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors active:scale-90"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Task Button */}
        <button
          onClick={handleAddItem}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#e3e2df] hover:border-[#006d41] rounded-2xl text-sm font-semibold text-[#444748] hover:text-[#006d41] hover:bg-[#efeeea] transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>添加任务</span>
        </button>


      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#faf9f5]/90 backdrop-blur-md px-5 pt-3 pb-8 z-40 border-t border-[#efeeea]">
        <button
          onClick={handleSave}
          className="w-full h-14 bg-[#1b1c1a] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all"
        >
          <Check className="w-5 h-5 text-[#95f7bb]" />
          <span>完成</span>
        </button>
      </div>
    </div>
  );
};
