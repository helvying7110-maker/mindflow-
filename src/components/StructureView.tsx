import React, { useState } from 'react';
import { CollectionItem, TagItem, NoteItem } from '../types';
import {
  Search,
  LayoutGrid,
  List,
  Briefcase,
  Lightbulb,
  Heart,
  BookOpen,
  Plus,
  ChevronRight,
  Images,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Calendar,
  Folder,
  Tag,
} from 'lucide-react';
import { GalleryModal } from './GalleryModal';

interface StructureViewProps {
  collections: CollectionItem[];
  tags: TagItem[];
  notes?: NoteItem[];
  onSelectCollection?: (name: string) => void;
  onAddTag: (tagName: string) => void;
  onAddCollection: (name: string) => void;
  onSelectNote?: (note: NoteItem | string) => void;
  onOpenNewNote?: () => void;
}

export const StructureView: React.FC<StructureViewProps> = ({
  collections,
  tags,
  notes = [],
  onSelectCollection,
  onAddTag,
  onAddCollection,
  onSelectNote,
  onOpenNewNote,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [newColInput, setNewColInput] = useState('');
  const [showColInput, setShowColInput] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Active detail view state
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [subSearchQuery, setSubSearchQuery] = useState('');

  const getCollectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-[#1b1c1a]" />;
      case 'Lightbulb':
        return <Lightbulb className="w-5 h-5 text-[#005230]" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-[#745b00]" />;
      case 'BookOpen':
      default:
        return <BookOpen className="w-5 h-5 text-[#1b1c1a]" />;
    }
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    onAddTag(newTagInput.trim().startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`);
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColInput.trim()) return;
    onAddCollection(newColInput.trim());
    setNewColInput('');
    setShowColInput(false);
  };

  const handleCollectionClick = (name: string) => {
    setSelectedCollection(name);
    setSelectedTag(null);
    setSubSearchQuery('');
    if (onSelectCollection) {
      onSelectCollection(name);
    }
  };

  const handleTagClick = (tagName: string) => {
    setSelectedTag(tagName);
    setSelectedCollection(null);
    setSubSearchQuery('');
  };

  // Helper to count notes for a collection
  const getNoteCount = (colName: string) => {
    return notes.filter(
      (n) =>
        (n.collection && n.collection.toLowerCase() === colName.toLowerCase()) ||
        (n.tag && n.tag.toLowerCase() === colName.toLowerCase())
    ).length;
  };

  // Helper to count notes for a tag
  const getTagNoteCount = (tagName: string) => {
    const cleanTag = tagName.replace(/^#/, '').toLowerCase();
    return notes.filter(
      (n) =>
        (n.tag && n.tag.toLowerCase().includes(cleanTag)) ||
        (n.collection && n.collection.toLowerCase().includes(cleanTag))
    ).length;
  };

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render Collection Notes Detail Page
  if (selectedCollection) {
    const matchedCollection = collections.find((c) => c.name === selectedCollection);
    const collectionNotes = notes.filter((n) => {
      const matchCol =
        (n.collection && n.collection.toLowerCase() === selectedCollection.toLowerCase()) ||
        (n.tag && n.tag.toLowerCase() === selectedCollection.toLowerCase());
      if (!matchCol) return false;

      if (!subSearchQuery.trim()) return true;
      const q = subSearchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-5 animate-fadeIn pb-8">
        {/* Collection Detail Header */}
        <div className="bg-white rounded-3xl p-5 border border-[#efeeea] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedCollection(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f4f0] hover:bg-[#e9e8e4] text-[#1b1c1a] text-xs font-semibold transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-[#747878]" />
              <span>返回架构</span>
            </button>

            {onOpenNewNote && (
              <button
                onClick={onOpenNewNote}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#1b1c1a] text-white text-xs font-semibold hover:opacity-90 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-[#95f7bb]" />
                <span>新建笔记</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${
                  matchedCollection?.colorClass || 'bg-[#e3e2df] text-[#1b1c1a]'
                }`}
              >
                {getCollectionIcon(matchedCollection?.iconName || 'BookOpen')}
              </div>
              <div>
                <h1 className="font-bold text-xl text-[#1b1c1a]">{selectedCollection}</h1>
                <p className="text-xs text-[#747878] mt-0.5">
                  归类合集 · 共 {collectionNotes.length} 篇笔记
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#e8f8ee] text-[#006d41] text-xs font-bold">
              {collectionNotes.length} 篇
            </span>
          </div>

          {/* Sub Search Bar */}
          <div className="relative pt-1">
            <Search className="w-4 h-4 absolute left-3.5 top-5 text-[#747878]" />
            <input
              type="text"
              value={subSearchQuery}
              onChange={(e) => setSubSearchQuery(e.target.value)}
              placeholder={`搜索「${selectedCollection}」合集内的笔记...`}
              className="w-full h-10 pl-10 pr-4 bg-[#f4f4f0] border-none rounded-xl text-xs font-medium text-[#1b1c1a] focus:ring-1 focus:ring-[#1b1c1a]/20 placeholder:text-[#747878]"
            />
          </div>
        </div>

        {/* Collection Notes List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#747878]">
              合集内容 ({collectionNotes.length})
            </h2>
          </div>

          {collectionNotes.length > 0 ? (
            <div className="space-y-3">
              {collectionNotes.map((note) => {
                const hasImages = note.images && note.images.length > 0;
                const totalImgCount = (note.coverImage ? 1 : 0) + (note.images ? note.images.length : 0);

                return (
                  <div
                    key={note.id}
                    onClick={() => onSelectNote && onSelectNote(note)}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-[#efeeea] hover:shadow-md transition-all cursor-pointer group active:scale-[0.99] space-y-3"
                  >
                    {note.coverImage && (
                      <div className="relative h-32 rounded-2xl overflow-hidden bg-[#e3e2df]">
                        <img
                          src={note.coverImage}
                          alt={note.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1">
                          <Folder className="w-3 h-3 text-[#95f7bb]" />
                          <span>{selectedCollection}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#efeeea] text-[#444748] text-[10px] font-bold">
                          {note.tag || selectedCollection}
                        </span>
                        {note.isPrivate && (
                          <span className="px-2 py-0.5 rounded-full bg-[#fce8e6] text-[#c5221f] text-[10px] font-bold">
                            私密
                          </span>
                        )}
                        <span className="text-[11px] text-[#747878] ml-auto flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#747878]" />
                          {note.timestamp}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-[#1b1c1a] group-hover:text-[#006d41] transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-xs text-[#747878] mt-1 line-clamp-2 leading-relaxed">
                        {note.excerpt || note.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#efeeea]/60 flex items-center justify-between text-xs text-[#747878]">
                      <div className="flex items-center gap-3">
                        {totalImgCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-[#006d41]">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{totalImgCount} 张配图</span>
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-[#1b1c1a] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        查看详情
                        <ChevronRight className="w-4 h-4 text-[#747878]" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#efeeea] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#efeeea] text-[#747878] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-[#1b1c1a]">暂无归类到此合集的笔记</p>
              <p className="text-xs text-[#747878] max-w-xs mx-auto leading-relaxed">
                创建新记录时选择「{selectedCollection}」合集，笔记将会在此自动集中展示。
              </p>
              {onOpenNewNote && (
                <button
                  onClick={onOpenNewNote}
                  className="px-5 py-2.5 rounded-full bg-[#1b1c1a] text-white text-xs font-semibold hover:opacity-90 transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-[#95f7bb]" />
                  <span>添加合集笔记</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Tag Notes Detail Page
  if (selectedTag) {
    const tagNotes = notes.filter((n) => {
      const cleanTag = selectedTag.replace(/^#/, '').toLowerCase();
      const matchTag =
        (n.tag && n.tag.toLowerCase().includes(cleanTag)) ||
        (n.collection && n.collection.toLowerCase().includes(cleanTag));
      if (!matchTag) return false;

      if (!subSearchQuery.trim()) return true;
      const q = subSearchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-5 animate-fadeIn pb-8">
        <div className="bg-white rounded-3xl p-5 border border-[#efeeea] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTag(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f4f0] hover:bg-[#e9e8e4] text-[#1b1c1a] text-xs font-semibold transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-[#747878]" />
              <span>返回架构</span>
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-[#efeeea] text-[#1b1c1a] flex items-center justify-center">
              <Tag className="w-5 h-5 text-[#006d41]" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-[#1b1c1a]">{selectedTag}</h1>
              <p className="text-xs text-[#747878]">包含此标签的笔记 · 共 {tagNotes.length} 篇</p>
            </div>
          </div>
        </div>

        {/* Tag Notes List */}
        <div className="space-y-3">
          {tagNotes.length > 0 ? (
            tagNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote && onSelectNote(note)}
                className="bg-white rounded-3xl p-5 shadow-sm border border-[#efeeea] hover:shadow-md transition-all cursor-pointer group active:scale-[0.99] space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#e8f8ee] text-[#006d41] text-[10px] font-bold">
                    {note.tag || selectedTag}
                  </span>
                  <span className="text-[11px] text-[#747878] ml-auto">{note.timestamp}</span>
                </div>
                <h3 className="font-bold text-base text-[#1b1c1a] group-hover:text-[#006d41] transition-colors">
                  {note.title}
                </h3>
                <p className="text-xs text-[#747878] line-clamp-2 leading-relaxed">
                  {note.excerpt || note.content}
                </p>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border border-[#efeeea] p-8 text-center space-y-2">
              <p className="font-bold text-sm text-[#1b1c1a]">未找到包含该标签的笔记</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-6">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#747878]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索结构、文件夹、标签..."
          className="w-full h-12 pl-12 pr-4 bg-[#f4f4f0] border-none rounded-2xl text-sm font-medium text-[#1b1c1a] focus:ring-2 focus:ring-[#1b1c1a]/10 transition-all placeholder:text-[#747878]"
        />
      </div>

      {/* Collections Section Header with Layout Toggle & Add Collection */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#747878]">集合</h2>
        <div className="flex items-center gap-2">
          {!showColInput ? (
            <button
              onClick={() => setShowColInput(true)}
              className="px-3 py-1.5 rounded-full bg-[#efeeea] text-[#1b1c1a] text-xs font-semibold flex items-center gap-1 hover:bg-[#e9e8e4] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加合集</span>
            </button>
          ) : (
            <form onSubmit={handleCreateCollection} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newColInput}
                onChange={(e) => setNewColInput(e.target.value)}
                placeholder="合集名称..."
                className="h-8 px-3 text-xs bg-white border border-[#e3e2df] rounded-full focus:ring-1 focus:ring-[#1b1c1a]"
                autoFocus
              />
              <button
                type="submit"
                className="h-8 px-3 bg-[#1b1c1a] text-white text-xs rounded-full font-semibold"
              >
                确定
              </button>
              <button
                type="button"
                onClick={() => setShowColInput(false)}
                className="h-8 px-2 text-[#747878] text-xs"
              >
                取消
              </button>
            </form>
          )}

          <div className="flex items-center bg-[#efeeea] p-1 rounded-xl gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-[#1b1c1a]' : 'text-[#747878]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white shadow-sm text-[#1b1c1a]' : 'text-[#747878]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Collections Cards Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredCollections.map((col) => {
            const count = getNoteCount(col.name);
            const displayCount = count > 0 ? count : col.count;

            return (
              <div
                key={col.id}
                onClick={() => handleCollectionClick(col.name)}
                className="bg-white rounded-3xl p-5 shadow-sm border border-[#efeeea] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[120px] active:scale-[0.98] group"
              >
                <div className="flex justify-between items-start">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${col.colorClass}`}
                  >
                    {getCollectionIcon(col.iconName)}
                  </div>

                  {col.avatars && (
                    <div className="flex -space-x-2">
                      {col.avatars.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Member"
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-[#1b1c1a] group-hover:text-[#006d41] transition-colors">
                      {col.name}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-[#c4c7c7] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-[#747878] mt-0.5">{displayCount} 个项目</p>
                </div>
              </div>
            );
          })}

          {/* Add Collection Quick Card */}
          <div
            onClick={() => setShowColInput(true)}
            className="rounded-3xl p-5 border-2 border-dashed border-[#e3e2df] hover:border-[#1b1c1a] transition-all cursor-pointer flex flex-col items-center justify-center min-h-[120px] text-[#747878] hover:text-[#1b1c1a] active:scale-[0.98]"
          >
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">添加新合集</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCollections.map((col) => {
            const count = getNoteCount(col.name);
            const displayCount = count > 0 ? count : col.count;

            return (
              <div
                key={col.id}
                onClick={() => handleCollectionClick(col.name)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#efeeea] hover:shadow-md transition-all cursor-pointer flex items-center justify-between active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${col.colorClass}`}
                  >
                    {getCollectionIcon(col.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1b1c1a] group-hover:text-[#006d41] transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-xs text-[#747878]">{displayCount} 个项目</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#c4c7c7] group-hover:translate-x-0.5 transition-transform" />
              </div>
            );
          })}

          <div
            onClick={() => setShowColInput(true)}
            className="rounded-2xl p-4 border-2 border-dashed border-[#e3e2df] hover:border-[#1b1c1a] transition-all cursor-pointer flex items-center justify-center gap-2 text-[#747878] hover:text-[#1b1c1a] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-semibold">添加新合集</span>
          </div>
        </div>
      )}

      {/* Tags Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#747878]">标签</h2>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.name)}
              className="px-4 py-2 rounded-full bg-[#efeeea] text-[#1b1c1a] text-xs font-semibold flex items-center gap-2 hover:bg-[#e9e8e4] transition-all active:scale-95"
            >
              <span className={`w-2 h-2 rounded-full ${tag.colorDot}`}></span>
              <span>{tag.name}</span>
              <span className="text-[10px] text-[#747878] font-bold">
                {getTagNoteCount(tag.name)}
              </span>
            </button>
          ))}

          {!showTagInput ? (
            <button
              onClick={() => setShowTagInput(true)}
              className="px-4 py-2 rounded-full bg-[#efeeea] text-[#444748] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#e9e8e4] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建标签</span>
            </button>
          ) : (
            <form onSubmit={handleCreateTag} className="flex items-center gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="标签名称..."
                className="h-8 px-3 text-xs bg-white border border-[#e3e2df] rounded-full focus:ring-1 focus:ring-[#1b1c1a]"
                autoFocus
              />
              <button
                type="submit"
                className="h-8 px-3 bg-[#1b1c1a] text-white text-xs rounded-full font-semibold"
              >
                添加
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Featured Gallery Banner Card */}
      <div
        onClick={() => setIsGalleryOpen(true)}
        className="relative rounded-3xl overflow-hidden shadow-md h-44 bg-[#1b1c1a] text-white p-6 flex flex-col justify-end group cursor-pointer active:scale-[0.99] transition-all"
      >
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
          alt="Heart Flow Gallery"
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 text-white">
          <Images className="w-3.5 h-3.5 text-[#95f7bb]" />
          <span>点击浏览图库 ({notes.filter((n) => n.coverImage).length})</span>
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-1">心流图库</h3>
          <p className="text-xs text-white/80">按笔记所属集合分类收录所有图片</p>
        </div>
      </div>

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        notes={notes}
        onSelectNote={(noteId) => {
          const found = notes.find((n) => n.id === noteId);
          if (found && onSelectNote) {
            onSelectNote(found);
          }
        }}
      />
    </div>
  );
};

