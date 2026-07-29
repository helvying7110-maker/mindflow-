import React, { useState } from 'react';
import { NoteItem, TaskItem } from '../types';
import { Search, X, Calendar, FileText } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  tasks: TaskItem[];
  onSelectNote: (note: NoteItem) => void;
  onSelectTask: (task: TaskItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  notes,
  tasks,
  onSelectNote,
  onSelectTask,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredNotes = query
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.excerpt.toLowerCase().includes(query.toLowerCase())
      )
    : notes.slice(0, 3);

  const filteredTasks = query
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.details.toLowerCase().includes(query.toLowerCase())
      )
    : tasks.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12 animate-fadeIn">
      <div className="bg-[#faf9f5] w-full max-w-md rounded-3xl shadow-2xl p-5 space-y-4 animate-slideDown border border-[#efeeea]">
        {/* Search Header */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-[#747878]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="全局搜索笔记、任务、灵感..."
              className="w-full h-11 pl-11 pr-4 bg-white border border-[#e3e2df] rounded-2xl text-sm font-medium text-[#1b1c1a] focus:ring-2 focus:ring-[#1b1c1a]"
              autoFocus
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#444748] hover:bg-[#efeeea] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
          {/* Notes Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-[#747878] tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>笔记与闪记 ({filteredNotes.length})</span>
            </h3>

            {filteredNotes.length === 0 ? (
              <p className="text-xs text-[#747878] italic py-1">无匹配笔记</p>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    onSelectNote(note);
                    onClose();
                  }}
                  className="bg-white p-3 rounded-2xl border border-[#efeeea] hover:shadow-sm cursor-pointer transition-all"
                >
                  <p className="font-bold text-sm text-[#1b1c1a]">{note.title}</p>
                  <p className="text-xs text-[#747878] line-clamp-1 mt-0.5">{note.excerpt}</p>
                </div>
              ))
            )}
          </div>

          {/* Tasks Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-[#747878] tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>任务与待办 ({filteredTasks.length})</span>
            </h3>

            {filteredTasks.length === 0 ? (
              <p className="text-xs text-[#747878] italic py-1">无匹配任务</p>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    onSelectTask(task);
                    onClose();
                  }}
                  className="bg-white p-3 rounded-2xl border border-[#efeeea] hover:shadow-sm cursor-pointer transition-all"
                >
                  <p className="font-bold text-sm text-[#1b1c1a]">{task.title}</p>
                  <p className="text-xs text-[#747878] line-clamp-1 mt-0.5">{task.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
