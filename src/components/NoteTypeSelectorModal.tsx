import React from 'react';
import { Edit3, Target, ListTodo, ChevronRight, X } from 'lucide-react';

interface NoteTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContentNote: () => void;
  onSelectTodayFocus: () => void;
  onSelectProjectList: () => void;
}

export const NoteTypeSelectorModal: React.FC<NoteTypeSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectContentNote,
  onSelectTodayFocus,
  onSelectProjectList,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-fadeIn">
      {/* Dimmer Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="relative z-10 w-full max-w-md bg-[#faf9f5] rounded-t-[32px] p-6 pb-10 shadow-[0_-8px_40px_0_rgba(0,0,0,0.12)] border-t border-[#efeeea] animate-slideUp">
        {/* Handle bar */}
        <div className="w-12 h-1 bg-[#e3e2df] rounded-full mx-auto mb-6" />

        {/* Modal Title */}
        <header className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-[#1b1c1a] tracking-tight">选择记录类型</h2>
          <p className="text-xs text-[#747878] mt-1 font-medium">开始捕捉你的灵感</p>
        </header>

        {/* Record Type Buttons */}
        <div className="space-y-3 mb-8">
          {/* 1. 内容记录 */}
          <button
            onClick={() => {
              onClose();
              onSelectContentNote();
            }}
            className="group w-full flex items-center p-4 bg-[#f4f4f0] hover:bg-[#e9e8e4] active:scale-[0.98] transition-all rounded-[24px] text-left border border-[#efeeea]"
          >
            <div className="w-12 h-12 rounded-full bg-[#95f7bb] flex items-center justify-center mr-4 shrink-0 shadow-sm">
              <Edit3 className="w-6 h-6 text-[#005230]" />
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-base text-[#1b1c1a]">内容记录</h4>
              <p className="text-xs text-[#747878] mt-0.5">随手记下想法、灵感或长篇文章</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#c4c7c7] group-hover:text-[#1b1c1a] transition-colors" />
          </button>

          {/* 2. 今日重点 */}
          <button
            onClick={() => {
              onClose();
              onSelectTodayFocus();
            }}
            className="group w-full flex items-center p-4 bg-[#f4f4f0] hover:bg-[#e9e8e4] active:scale-[0.98] transition-all rounded-[24px] text-left border border-[#efeeea]"
          >
            <div className="w-12 h-12 rounded-full bg-[#ffe08b] flex items-center justify-center mr-4 shrink-0 shadow-sm">
              <Target className="w-6 h-6 text-[#584400]" />
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-base text-[#1b1c1a]">今日重点</h4>
              <p className="text-xs text-[#747878] mt-0.5">标注今日最关键的任务与目标</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#c4c7c7] group-hover:text-[#1b1c1a] transition-colors" />
          </button>

          {/* 3. 项目列表 */}
          <button
            onClick={() => {
              onClose();
              onSelectProjectList();
            }}
            className="group w-full flex items-center p-4 bg-[#f4f4f0] hover:bg-[#e9e8e4] active:scale-[0.98] transition-all rounded-[24px] text-left border border-[#efeeea]"
          >
            <div className="w-12 h-12 rounded-full bg-[#e5e2e1] flex items-center justify-center mr-4 shrink-0 shadow-sm">
              <ListTodo className="w-6 h-6 text-[#474746]" />
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-base text-[#1b1c1a]">项目列表</h4>
              <p className="text-xs text-[#747878] mt-0.5">结构化整理项目进展与待办项</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#c4c7c7] group-hover:text-[#1b1c1a] transition-colors" />
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-[#444748] bg-[#faf9f5] hover:bg-[#efeeea] border border-[#c4c7c7]/40 transition-colors active:scale-95"
        >
          取消
        </button>
      </div>
    </div>
  );
};
