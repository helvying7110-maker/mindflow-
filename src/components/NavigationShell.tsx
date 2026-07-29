import React from 'react';
import { TabType } from '../types';
import { Edit3, History, Box, Plus, Menu, Search } from 'lucide-react';
interface NavigationShellProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewNote: () => void;
  onOpenNewTask: () => void;
  onOpenTypeSelector?: () => void;
  title: string;
  children: React.ReactNode;
  onOpenSearch?: () => void;
}
export const NavigationShell: React.FC<NavigationShellProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewNote,
  onOpenNewTask,
  onOpenTypeSelector,
  title,
  children,
  onOpenSearch,
}) => {
  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#1b1c1a] flex flex-col justify-between max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-[#e3e2df]/40">
      {/* Top Header Bar */}
      <header className="w-full sticky top-0 z-30 bg-[#faf9f5]/90 backdrop-blur-md flex justify-between items-center px-5 h-16 border-b border-[#efeeea]">
        <div className="flex items-center gap-3">
          <button className="p-2 -ml-2 text-[#1b1c1a] hover:bg-[#efeeea] rounded-full transition-colors active:scale-95">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-[#1b1c1a] tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenSearch} className="p-2 text-[#1b1c1a] hover:bg-[#efeeea] rounded-full transition-colors active:scale-95" title="搜索">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>
      {/* Main Content Area */}
      <main className="flex-1 px-5 pt-4 pb-28 overflow-y-auto custom-scrollbar">
        {children}
      </main>
      {/* Floating Action Button (+) */}
      <div className="fixed bottom-24 right-1/2 translate-x-[180px] max-md:right-6 max-md:translate-x-0 z-40">
        <button onClick={onOpenTypeSelector || (activeTab === 'trace' ? onOpenNewTask : onOpenNewNote)} className="w-14 h-14 bg-[#95f7bb] text-[#005230] rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-[#007346]/20" title="选择记录类型">
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>
      {/* Bottom Navigation Shell */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[80px] pb-2 flex justify-around items-center px-4 bg-[#efeeea] shadow-[0_-4px_20px_0_rgba(0,0,0,0.04)] rounded-t-2xl z-30 border-t border-[#e3e2df]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all duration-200 active:scale-90 ${activeTab === 'home' ? 'bg-[#95f7bb] text-[#005230] font-semibold' : 'text-[#444748] hover:opacity-80'}`}>
          <Edit3 className="w-5 h-5" />
          <span className="text-[12px] mt-0.5 font-medium">闪记</span>
        </button>
        <button onClick={() => setActiveTab('trace')} className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all duration-200 active:scale-90 ${activeTab === 'trace' ? 'bg-[#95f7bb] text-[#005230] font-semibold' : 'text-[#444748] hover:opacity-80'}`}>
          <History className="w-5 h-5" />
          <span className="text-[12px] mt-0.5 font-medium">追踪</span>
        </button>
        <button onClick={() => setActiveTab('structure')} className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all duration-200 active:scale-90 ${activeTab === 'structure' ? 'bg-[#95f7bb] text-[#005230] font-semibold' : 'text-[#444748] hover:opacity-80'}`}>
          <Box className="w-5 h-5" />
          <span className="text-[12px] mt-0.5 font-medium">架构</span>
        </button>
      </nav>
    </div>
  );
};
