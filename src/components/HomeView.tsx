import React, { useState } from 'react';
import { NoteItem, FocusCheckItem, InsightQuote, ProjectSummary } from '../types';
import { ChevronDown, Zap, CheckCircle2, Circle, MoreHorizontal, Sparkles, RefreshCw, Plus, Pencil } from 'lucide-react';

interface HomeViewProps {
  notes: NoteItem[];
  focusChecks: FocusCheckItem[];
  insightQuote: InsightQuote;
  projectSummary: ProjectSummary;
  onToggleFocus: (id: string) => void;
  onSelectNote: (note: NoteItem) => void;
  onGenerateAiSpark: () => void;
  isAiGenerating: boolean;
  onOpenTodayFocus?: () => void;
  onOpenProjectList?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  notes,
  focusChecks,
  insightQuote,
  projectSummary,
  onToggleFocus,
  onSelectNote,
  onGenerateAiSpark,
  isAiGenerating,
  onOpenTodayFocus,
  onOpenProjectList,
}) => {
  const [completedProjectItemIndices, setCompletedProjectItemIndices] = useState<number[]>([]);

  const toggleProjectItemCompleted = (index: number) => {
    if (completedProjectItemIndices.includes(index)) {
      setCompletedProjectItemIndices(completedProjectItemIndices.filter((i) => i !== index));
    } else {
      setCompletedProjectItemIndices([...completedProjectItemIndices, index]);
    }
  };

  const mainNote = notes.find(n => n.title === '留白的建筑学') || notes[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Pull down / Capture Inspiration Prompt */}
      <div className="flex flex-col items-center justify-center pt-1 pb-3 text-[#747878] group cursor-pointer" onClick={onGenerateAiSpark}>
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#444748] tracking-wider mb-1 group-hover:text-[#000000] transition-colors">
          <ChevronDown className="w-4 h-4 animate-bounce text-[#747878]" />
          <span>{isAiGenerating ? "AI 正在捕捉灵感..." : "下拉捕捉灵感 / 点击生成 AI 灵感"}</span>
          <Sparkles className="w-3.5 h-3.5 text-[#006d41] ml-0.5" />
        </div>
      </div>

      {/* Today's Focus Card (今日重点) */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#efeeea]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={onOpenTodayFocus}>
            <h3 className="text-xs font-semibold tracking-wider text-[#747878] group-hover:text-[#006d41] uppercase transition-colors">今日重点</h3>
            <span className="text-xs text-[#007346] opacity-0 group-hover:opacity-100 transition-opacity font-medium">✏️ 编辑</span>
          </div>
          <span className="text-xs text-[#007346] font-medium">
            {focusChecks.filter(c => c.completed).length}/{focusChecks.length} 已完成
          </span>
        </div>

        <div className="space-y-3">
          {focusChecks.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleFocus(item.id)}
              className="flex items-center gap-3 cursor-pointer py-1 group"
            >
              <button className="text-[#747878] group-hover:text-[#006d41] transition-colors">
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-[#006d41] fill-[#95f7bb]/30" />
                ) : (
                  <Circle className="w-6 h-6 text-[#c4c7c7] group-hover:text-[#747878]" />
                )}
              </button>
              <span
                className={`text-base transition-all ${
                  item.completed
                    ? 'line-through text-[#858383]'
                    : 'text-[#1b1c1a] font-medium'
                }`}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Insight Quote Card (每日名言栏) */}
      <div className="bg-[#eaf8f0] rounded-[28px] p-6 border border-[#95f7bb]/30 shadow-sm relative transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center justify-center text-[#006d41]">
            <Zap className="w-5 h-5 fill-current stroke-[2]" />
          </div>
          <button
            type="button"
            onClick={onGenerateAiSpark}
            className="p-1 text-[#006d41]/60 hover:text-[#006d41] hover:bg-[#95f7bb]/40 rounded-full transition-all active:scale-90"
            title={isAiGenerating ? 'AI 生成中...' : '点击切换每日名言'}
          >
            <MoreHorizontal className={`w-5 h-5 ${isAiGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <p className="text-[#005230] text-lg font-bold italic leading-relaxed mb-4">
          {insightQuote?.quote || '“认知放松是一种一切进展顺利的感觉——没有威胁，没有重大消息，不需要转移注意力或动员精力。”'}
        </p>

        <p className="text-[#007346] text-sm font-medium">
          {insightQuote?.author || '— 丹尼尔·卡尼曼'}
        </p>
      </div>

      {/* Main Inspiration Note Card */}
      {mainNote && (
        <div
          onClick={() => onSelectNote(mainNote)}
          className="bg-white rounded-3xl p-5 shadow-sm border border-[#efeeea] hover:shadow-md transition-all cursor-pointer group"
        >
          {mainNote.coverImage && (
            <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-[#f4f4f0]">
              <img
                src={mainNote.coverImage}
                alt={mainNote.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          <div className="mb-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f8ee] text-[#007346]">
              {mainNote.tag}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#1b1c1a] tracking-tight mb-2 group-hover:text-[#006d41] transition-colors">
            {mainNote.title}
          </h2>

          <p className="text-[#444748] text-sm leading-relaxed mb-4 line-clamp-3">
            {mainNote.excerpt}
          </p>

          <div className="text-xs text-[#747878] font-medium flex items-center gap-1">
            <span>🕒</span>
            <span>{mainNote.timestamp}</span>
          </div>
        </div>
      )}

      {/* Project Card (项目：宁静之家) Matching User Screenshot */}
      <div
        onClick={onOpenProjectList}
        className="bg-white rounded-[28px] p-6 shadow-sm border border-[#efeeea] hover:shadow-md transition-all cursor-pointer relative group"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1b1c1a]">
            {projectSummary.title?.startsWith('项目')
              ? projectSummary.title
              : `项目：${projectSummary.title || '宁静之家'}`}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenProjectList) onOpenProjectList();
            }}
            className="p-1.5 rounded-full hover:bg-[#f4f4f0] text-[#747878] hover:text-[#1b1c1a] transition-all active:scale-90"
            title="编辑项目列表"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        <ul className="space-y-3.5 mb-2 px-1">
          {(projectSummary.items && projectSummary.items.length > 0
            ? projectSummary.items
            : ['柔光灯具', '亚麻质地', '漫反射绿植']
          ).map((item, idx) => {
            const isCompleted = completedProjectItemIndices.includes(idx);
            return (
              <li
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProjectItemCompleted(idx);
                }}
                className="flex items-center gap-3 text-base cursor-pointer select-none group/item hover:opacity-80 transition-all"
                title="点击划掉 / 标记完成"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                    isCompleted ? 'bg-[#c4c7c7]' : 'bg-[#5c5800]'
                  }`}
                />
                <span
                  className={`flex-1 transition-all ${
                    isCompleted
                      ? 'line-through text-[#a2a19e]'
                      : 'text-[#1b1c1a] font-medium'
                  }`}
                >
                  {item}
                </span>
              </li>
            );
          })}
        </ul>
      </div>




    </div>
  );
};
