import React, { useState } from 'react';
import { NoteItem } from '../types';
import { X, Images, Filter, ArrowUpRight, Folder, Eye } from 'lucide-react';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  onSelectNote?: (noteId: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [activeImage, setActiveImage] = useState<{
    imageUrl: string;
    note: NoteItem;
  } | null>(null);

  if (!isOpen) return null;

  // Extract all items with coverImage or images
  const galleryItems = notes
    .filter((n) => n.coverImage)
    .map((n) => ({
      id: n.id,
      imageUrl: n.coverImage!,
      title: n.title,
      collection: n.collection || '未分类',
      timestamp: n.timestamp,
      excerpt: n.excerpt,
      note: n,
    }));

  // Categories list
  const categories = ['全部', ...Array.from(new Set(galleryItems.map((i) => i.collection)))];

  // Filtered items
  const filteredItems =
    selectedCategory === '全部'
      ? galleryItems
      : galleryItems.filter((item) => item.collection === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#faf9f5] animate-fadeIn overflow-y-auto max-w-md mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#faf9f5]/90 backdrop-blur-md px-5 py-4 border-b border-[#efeeea] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#1b1c1a] text-white flex items-center justify-center shadow-sm">
            <Images className="w-5 h-5 text-[#95f7bb]" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#1b1c1a] leading-tight">心流图库</h2>
            <p className="text-[11px] text-[#747878]">收录来自笔记的视觉图片（共 {galleryItems.length} 张）</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-[#747878] hover:bg-[#efeeea] rounded-full transition-colors active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-5 pt-4 pb-28 space-y-5">
        {/* Category Filter Tabs */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#747878] uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>按集合分类</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const count =
                cat === '全部'
                  ? galleryItems.length
                  : galleryItems.filter((i) => i.collection === cat).length;

              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 ${
                    isSelected
                      ? 'bg-[#1b1c1a] text-white shadow-sm'
                      : 'bg-[#efeeea] text-[#444748] hover:bg-[#e9e8e4]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-[#747878]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Image Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveImage({ imageUrl: item.imageUrl, note: item.note })}
                className="group relative rounded-2xl overflow-hidden bg-[#e3e2df] border border-[#efeeea] shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-[#d9d8d4]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category Badge Overlay */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1">
                    <Folder className="w-2.5 h-2.5 text-[#95f7bb]" />
                    <span>{item.collection}</span>
                  </div>

                  {/* Zoom hint overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/90 text-[#1b1c1a] flex items-center justify-center shadow-lg">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-xs text-[#1b1c1a] line-clamp-1">{item.title}</h4>
                  <span className="text-[10px] text-[#747878] mt-1">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#efeeea] p-6">
            <div className="w-12 h-12 rounded-full bg-[#efeeea] text-[#747878] flex items-center justify-center mx-auto">
              <Images className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#1b1c1a]">未找到图片</p>
            <p className="text-xs text-[#747878]">该分类下暂无带有图片的单篇笔记。</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#faf9f5] w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl border border-[#efeeea] flex flex-col animate-scaleIn max-h-[85vh]">
            <div className="relative bg-black flex items-center justify-center max-h-[50vh] overflow-hidden">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.note.title}
                className="w-full object-contain max-h-[50vh]"
              />
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 text-white hover:bg-black rounded-full transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8f8ee] text-[#005230] text-xs font-semibold mb-2">
                  <Folder className="w-3 h-3 text-[#006d41]" />
                  <span>{activeImage.note.collection || '未分类'}</span>
                </div>
                <h3 className="font-bold text-lg text-[#1b1c1a]">{activeImage.note.title}</h3>
                <p className="text-xs text-[#747878] mt-1 leading-relaxed">
                  {activeImage.note.excerpt || activeImage.note.content}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveImage(null)}
                  className="flex-1 h-11 rounded-full font-semibold text-xs text-[#444748] bg-[#efeeea] hover:bg-[#e9e8e4] transition-all"
                >
                  关闭预览
                </button>
                {onSelectNote && (
                  <button
                    onClick={() => {
                      const noteId = activeImage.note.id;
                      setActiveImage(null);
                      onClose();
                      onSelectNote(noteId);
                    }}
                    className="flex-1 h-11 rounded-full font-semibold text-xs text-white bg-[#1b1c1a] hover:opacity-90 transition-all flex items-center justify-center gap-1 shadow-md shadow-black/10"
                  >
                    <span>查看对应笔记</span>
                    <ArrowUpRight className="w-4 h-4 text-[#95f7bb]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
