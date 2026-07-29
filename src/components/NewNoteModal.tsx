import React, { useState } from 'react';
import { NoteItem, TaskItem } from '../types';
import { X, Search, Sparkles, Check, Plus, Loader2, Calendar, Clock, Image as ImageIcon, Upload, Star, Copy } from 'lucide-react';

interface NewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (note: NoteItem) => void;
  onSaveTask?: (task: TaskItem) => void;
  existingNotes: NoteItem[];
}

export const NewNoteModal: React.FC<NewNoteModalProps> = ({
  isOpen,
  onClose,
  onSaveNote,
  onSaveTask,
  existingNotes,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('工作');
  const [searchHistory, setSearchHistory] = useState('');
  const [collections, setCollections] = useState(['工作', '创意', '生活', '学习']);
  const [showAddColInput, setShowAddColInput] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Images state for "配图存放区域"
  const [images, setImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  // Deadline Modal State for "添加为任务"
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState('今天, 18:00');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleCopyContent = async () => {
    const textToCopy = content || title;
    if (!textToCopy.trim()) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Image Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesList = Array.from(e.target.files);
    filesList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (coverIndex >= index && coverIndex > 0) {
      setCoverIndex((prev) => prev - 1);
    }
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    const cover = images.length > 0 ? images[coverIndex] || images[0] : undefined;

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: title.trim() || '无标题记录',
      excerpt: content.trim().slice(0, 80) + (content.length > 80 ? '...' : ''),
      content: content.trim(),
      tag: selectedCollection,
      timestamp: '刚刚',
      collection: selectedCollection,
      coverImage: cover,
      images: images,
      isPrivate: false,
    };

    onSaveNote(newNote);
    setTitle('');
    setContent('');
    setImages([]);
    onClose();
  };

  const handleOpenTaskDeadlineModal = () => {
    if (!title.trim() && !content.trim()) {
      setValidationError('请先填写标题或记录内容');
      return;
    }
    setValidationError('');
    setShowDeadlineModal(true);
  };

  const handleConfirmAddTask = () => {
    if (!onSaveTask) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: title.trim() || '新任务',
      details: content.trim() || '来源于新记录',
      deadline: deadlineInput.trim() || '今天, 18:00',
      badge: '待处理',
      badgeType: 'upcoming',
      accentColor: 'green',
      completed: false,
      tags: [selectedCollection],
      createdAt: '刚刚',
    };

    onSaveTask(newTask);

    // Also save as a note
    const cover = images.length > 0 ? images[coverIndex] || images[0] : undefined;
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: title.trim() || '无标题记录',
      excerpt: content.trim().slice(0, 80) + (content.length > 80 ? '...' : ''),
      content: content.trim(),
      tag: selectedCollection,
      timestamp: '刚刚',
      collection: selectedCollection,
      coverImage: cover,
      images: images,
      isPrivate: false,
    };
    onSaveNote(newNote);

    // Reset and close
    setTitle('');
    setContent('');
    setImages([]);
    setShowDeadlineModal(false);
    onClose();
  };

  const handleAiRefine = async () => {
    if (!content.trim() && !title.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/inspire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: title || content,
          mode: 'inspire',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.title && !title) setTitle(data.data.title);
        if (data.data.content) {
          setContent((prev) => (prev ? `${prev}\n\n【AI 灵感拓展】\n${data.data.content}` : data.data.content));
        }
      }
    } catch (e) {
      console.error('AI refinement error:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    setCollections([...collections, newColName.trim()]);
    setSelectedCollection(newColName.trim());
    setNewColName('');
    setShowAddColInput(false);
  };

  const quickDeadlines = ['今天, 18:00', '明天, 12:00', '三天后, 18:00', '下周一, 09:00'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#faf9f5] animate-fadeIn overflow-y-auto max-w-md mx-auto">
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-[#faf9f5]/90 backdrop-blur-md h-16 px-5 flex items-center justify-between border-b border-[#efeeea]">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-[#444748] hover:bg-[#efeeea] rounded-full transition-colors active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-[#1b1c1a]">新记录</h1>
        <div className="w-10 flex justify-end">
          <button
            onClick={handleAiRefine}
            disabled={isGeneratingAi}
            className="p-2 text-[#006d41] hover:bg-[#95f7bb]/30 rounded-full transition-colors"
            title="AI 续写与润色"
          >
            {isGeneratingAi ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-5 pt-4 pb-36 space-y-6">
        {validationError && (
          <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-2xl text-xs font-semibold text-center animate-shake">
            {validationError}
          </div>
        )}

        {/* Search Historical Notes to Continue Writing */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#747878]" />
          <input
            type="text"
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
            placeholder="搜索历史笔记并续写..."
            className="w-full h-12 pl-12 pr-4 bg-[#f4f4f0] border-none rounded-xl text-sm text-[#1b1c1a] focus:ring-2 focus:ring-[#006d41]/20 transition-all placeholder:text-[#747878]"
          />
        </div>

        {/* Filtered History Notes Popup if searching */}
        {searchHistory && (
          <div className="bg-white rounded-2xl p-3 border border-[#efeeea] shadow-md space-y-2 max-h-40 overflow-y-auto">
            {existingNotes
              .filter((n) => n.title.includes(searchHistory) || n.excerpt.includes(searchHistory))
              .map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setTitle(`续写: ${note.title}`);
                    setContent(`引用历史记录：\n> ${note.excerpt}\n\n`);
                    setSearchHistory('');
                  }}
                  className="p-2 hover:bg-[#f4f4f0] rounded-xl cursor-pointer text-xs"
                >
                  <p className="font-bold text-[#1b1c1a]">{note.title}</p>
                  <p className="text-[#747878] truncate">{note.excerpt}</p>
                </div>
              ))}
          </div>
        )}

        {/* Main Note Editor Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#efeeea] min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="标题"
              className="flex-1 bg-transparent border-none p-0 text-2xl font-bold text-[#1b1c1a] focus:ring-0 placeholder:text-[#c4c7c7]"
            />
            <button
              type="button"
              onClick={handleCopyContent}
              className={`p-2 rounded-full transition-all shrink-0 ${
                isCopied
                  ? 'bg-[#e8f8ee] text-[#006d41]'
                  : 'text-[#747878] hover:text-[#1b1c1a] hover:bg-[#f4f4f0] active:scale-90'
              }`}
              title="复制正文文本"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-[#006d41]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="在这里记录您的想法..."
            rows={8}
            className="w-full flex-grow bg-transparent border-none p-0 text-base text-[#1b1c1a] focus:ring-0 resize-none placeholder:text-[#c4c7c7] leading-relaxed"
          />

          <div className="mt-auto pt-4 flex justify-between items-center text-xs text-[#747878]">
            <span>{content.length} 字</span>
            <button
              onClick={handleAiRefine}
              className="flex items-center gap-1 text-[#007346] font-medium hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 灵感生成</span>
            </button>
          </div>
        </div>

        {/* 配图存放区域 (Image Storage Area) */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#efeeea] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#e8f8ee] text-[#006d41] flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[#1b1c1a]">配图存放区域</h2>
            </div>
            <span className="text-xs text-[#747878]">
              {images.length > 0 ? `已选择 ${images.length} 张` : '暂无配图'}
            </span>
          </div>

          {/* Uploaded Images Gallery Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5">
              {images.map((imgUrl, idx) => {
                const isCover = coverIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-2xl overflow-hidden aspect-square group border-2 transition-all ${
                      isCover ? 'border-[#006d41] shadow-md' : 'border-transparent'
                    }`}
                  >
                    <img src={imgUrl} alt={`配图 ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Delete overlay button */}
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#ba1a1a] transition-colors"
                      title="删除图片"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Set Cover Badge */}
                    <button
                      onClick={() => setCoverIndex(idx)}
                      className={`absolute bottom-1.5 left-1.5 right-1.5 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                        isCover
                          ? 'bg-[#006d41] text-white shadow-sm'
                          : 'bg-black/50 backdrop-blur-sm text-white/90 hover:bg-black/70'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isCover ? 'fill-current' : ''}`} />
                      <span>{isCover ? '封面图' : '设为封面'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload Action */}
          <div>
            <label className="w-full h-12 rounded-2xl bg-[#f4f4f0] hover:bg-[#e9e8e4] border border-dashed border-[#c4c7c7] text-[#1b1c1a] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]">
              <Upload className="w-4 h-4 text-[#006d41]" />
              <span>上传本地配图</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Collection Selector */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-[#747878] uppercase tracking-wider">
            选择集合
          </h2>
          <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-2">
            {collections.map((col) => {
              const isSelected = selectedCollection === col;
              return (
                <button
                  key={col}
                  onClick={() => setSelectedCollection(col)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold transition-all active:scale-95 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#95f7bb] text-[#005230] shadow-sm'
                      : 'bg-[#efeeea] text-[#444748] hover:bg-[#e9e8e4]'
                  }`}
                >
                  <span>{col}</span>
                </button>
              );
            })}

            {!showAddColInput ? (
              <button
                onClick={() => setShowAddColInput(true)}
                className="shrink-0 px-4 py-2.5 rounded-full border border-dashed border-[#c4c7c7] text-[#444748] text-xs font-semibold hover:border-[#006d41] hover:text-[#006d41] transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增集合</span>
              </button>
            ) : (
              <form onSubmit={handleAddCollection} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="集合名..."
                  className="h-9 px-3 text-xs bg-white border border-[#c4c7c7] rounded-full focus:ring-1 focus:ring-[#006d41]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="h-9 px-3 bg-[#1b1c1a] text-white text-xs rounded-full font-semibold"
                >
                  确定
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Thumb-Zone Action Buttons Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#faf9f5]/95 backdrop-blur-md px-4 pt-3 pb-8 flex items-center justify-between gap-2 border-t border-[#efeeea]">
        <button
          onClick={onClose}
          className="px-4 h-13 rounded-full text-xs font-semibold text-[#444748] bg-[#e9e8e4] hover:bg-[#e3e2df] transition-all active:scale-95"
        >
          取消
        </button>
        <button
          onClick={handleOpenTaskDeadlineModal}
          className="flex-1 h-13 rounded-full text-xs font-semibold bg-[#e8f8ee] text-[#005230] border border-[#95f7bb] hover:bg-[#d6f5e2] transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Calendar className="w-4 h-4 text-[#006d41]" />
          <span>添加为任务</span>
        </button>
        <button
          onClick={handleSave}
          className="flex-1 h-13 rounded-full text-xs font-semibold bg-[#1b1c1a] text-white hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-black/10"
        >
          <Check className="w-4 h-4 text-[#95f7bb]" />
          <span>保存记录</span>
        </button>
      </nav>

      {/* Deadline Picker Popup Modal */}
      {showDeadlineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#faf9f5] w-full max-w-sm rounded-[28px] p-6 shadow-2xl border border-[#efeeea] space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-[#efeeea] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#95f7bb]/40 text-[#005230] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-[#1b1c1a]">填写截止时间</h3>
              </div>
              <button
                onClick={() => setShowDeadlineModal(false)}
                className="p-1.5 text-[#747878] hover:bg-[#efeeea] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#747878]">
              为任务「<span className="font-semibold text-[#1b1c1a]">{title || '新任务'}</span>」设置完成截止时间：
            </p>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">
                快捷选项
              </label>
              <div className="grid grid-cols-2 gap-2">
                {quickDeadlines.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDeadlineInput(item)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left flex items-center justify-between ${
                      deadlineInput === item
                        ? 'bg-[#1b1c1a] text-white font-semibold shadow-sm'
                        : 'bg-white border border-[#e3e2df] text-[#1b1c1a] hover:bg-[#f4f4f0]'
                    }`}
                  >
                    <span>{item}</span>
                    {deadlineInput === item && <Check className="w-3.5 h-3.5 text-[#95f7bb]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#747878] uppercase tracking-wider">
                自定义截止时间
              </label>
              <input
                type="text"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                placeholder="例如：明天, 17:00 或 2026-08-01 18:00"
                className="w-full h-11 px-4 bg-white border border-[#e3e2df] rounded-xl text-sm font-medium text-[#1b1c1a] focus:ring-2 focus:ring-[#006d41]/20 transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeadlineModal(false)}
                className="flex-1 h-12 rounded-full font-semibold text-xs text-[#444748] bg-[#efeeea] hover:bg-[#e9e8e4] transition-all"
              >
                取消
              </button>
              <button
                onClick={handleConfirmAddTask}
                className="flex-1 h-12 rounded-full font-semibold text-xs text-white bg-[#006d41] hover:bg-[#005230] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-black/10"
              >
                <Check className="w-4 h-4 text-[#95f7bb]" />
                <span>确认添加为任务</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

