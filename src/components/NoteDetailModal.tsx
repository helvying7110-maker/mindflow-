import React, { useState } from 'react';
import { NoteItem } from '../types';
import { X, Calendar, Tag, Share2, Sparkles, Trash2, Copy, Check } from 'lucide-react';

interface NoteDetailModalProps {
  note: NoteItem | null;
  onClose: () => void;
  onDeleteNote?: (id: string) => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  note,
  onClose,
  onDeleteNote,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!note) return null;

  const handleCopyContent = async () => {
    const textToCopy = note.content || note.title;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#faf9f5] w-full max-w-md max-h-[85vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-scaleIn border border-[#efeeea]">
        {/* Cover image if available */}
        {note.coverImage && (
          <div className="w-full h-48 relative overflow-hidden bg-[#e3e2df]">
            <img src={note.coverImage} alt={note.title} className="w-full h-full object-cover" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Note Body Header */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {!note.coverImage && (
            <div className="flex justify-between items-center pb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f8ee] text-[#007346]">
                {note.tag}
              </span>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#efeeea] text-[#444748] flex items-center justify-center hover:bg-[#e9e8e4] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-[#1b1c1a] tracking-tight">{note.title}</h2>
            <div className="flex items-center gap-3 text-xs text-[#747878] mt-2 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {note.timestamp}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {note.collection}
              </span>
            </div>
          </div>

          <hr className="border-[#efeeea]" />

          <p className="text-base text-[#1b1c1a] leading-relaxed whitespace-pre-wrap font-normal">
            {note.content}
          </p>

          {/* Attached Images Grid */}
          {note.images && note.images.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-[#747878] uppercase tracking-wider">配图列表 ({note.images.length})</span>
              <div className="grid grid-cols-2 gap-2">
                {note.images.map((img, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden aspect-video border border-[#efeeea] shadow-sm">
                    <img src={img} alt={`配图 ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#efeeea] flex items-center justify-between border-t border-[#e3e2df]">
          {onDeleteNote ? (
            <button
              onClick={() => {
                onDeleteNote(note.id);
                onClose();
              }}
              className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-full transition-colors"
              title="删除笔记"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContent}
              className={`p-2.5 rounded-full transition-all border ${
                isCopied
                  ? 'bg-[#e8f8ee] text-[#006d41] border-[#006d41]/20'
                  : 'bg-white text-[#747878] border-[#efeeea] hover:bg-[#faf9f5] hover:text-[#1b1c1a] active:scale-90'
              }`}
              title="复制正文文本"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-[#006d41]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#1b1c1a] text-white rounded-full text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              关闭阅读
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
