import React, { useState } from 'react';
import { TaskItem } from '../types';
import { MoreVertical, Calendar, Clock, Zap, CheckCircle2, Circle } from 'lucide-react';

interface TraceViewProps {
  tasks: TaskItem[];
  onToggleTaskComplete: (id: string) => void;
  onDelayTaskToTomorrow: (id: string) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
}

type FilterType = 'all' | 'today' | 'overdue' | 'week' | 'month';

export const TraceView: React.FC<TraceViewProps> = ({
  tasks,
  onToggleTaskComplete,
  onDelayTaskToTomorrow,
  onEditTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getRemainingTimeString = (task: TaskItem): string => {
    if (task.completed) return '已完成';

    if (task.badgeType === 'overdue') {
      if (task.badge && task.badge.includes('逾期')) return task.badge;
      return '已逾期 1 天';
    }

    const dl = task.deadline || '';
    if (dl.includes('今天')) {
      const timeMatch = dl.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const targetHour = parseInt(timeMatch[1], 10);
        const now = new Date();
        const currentHour = now.getHours();
        const diff = targetHour - currentHour;
        if (diff > 0) {
          return `剩余 ${diff} 小时`;
        } else if (diff === 0) {
          return '剩余 30 分钟';
        } else {
          return '已逾期';
        }
      }
      return '剩余 4 小时';
    }

    if (dl.includes('明天')) {
      return '剩余 1 天';
    }

    if (dl.includes('后天')) {
      return '剩余 2 天';
    }

    if (dl.includes('三天后') || dl.includes('3天')) {
      return '剩余 3 天';
    }

    if (dl.includes('下周') || task.badge === '下周') {
      return '剩余 6 天';
    }

    if (dl.includes('昨天')) {
      return '已逾期 1 天';
    }

    if (task.badge && (task.badge.startsWith('剩余') || task.badge.includes('小时') || task.badge.includes('天'))) {
      return task.badge;
    }

    if (task.badge === '> 24小时') {
      return '剩余 1 天';
    }

    if (task.badge && task.badge !== '待处理' && task.badge !== '待办' && task.badge !== '今天') {
      return task.badge;
    }

    return '剩余 1 天';
  };

  const getTaskColorCategory = (task: TaskItem): 'red' | 'yellow' | 'green' | 'grey' => {
    if (task.completed) return 'grey';

    const rem = getRemainingTimeString(task);

    // 灰色：已逾期
    if (rem.includes('已逾期') || task.badgeType === 'overdue') {
      return 'grey';
    }

    // 红色：剩余 1 天（即当天）、剩余 x 小时 / 30 分钟
    if (
      rem.includes('小时') ||
      rem.includes('分钟') ||
      rem === '剩余 1 天' ||
      rem === '今天'
    ) {
      return 'red';
    }

    // 黄色：剩余 2 天 或 剩余 3 天
    if (
      rem === '剩余 2 天' ||
      rem === '剩余 3 天' ||
      rem.includes('2天') ||
      rem.includes('3天') ||
      rem.includes('2 天') ||
      rem.includes('3 天')
    ) {
      return 'yellow';
    }

    // 绿色：其他剩余 > 3 天
    return 'green';
  };

  const getAccentBorderClass = (colorCategory: 'red' | 'yellow' | 'green' | 'grey') => {
    switch (colorCategory) {
      case 'red':
        return 'border-l-4 border-l-[#ba1a1a]';
      case 'yellow':
        return 'border-l-4 border-l-[#cda72c]';
      case 'green':
        return 'border-l-4 border-l-[#006d41]';
      case 'grey':
      default:
        return 'border-l-4 border-l-[#747878]';
    }
  };

  const getBadgeStyle = (colorCategory: 'red' | 'yellow' | 'green' | 'grey') => {
    switch (colorCategory) {
      case 'red':
        return 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/20';
      case 'yellow':
        return 'bg-[#ffe08b] text-[#584400] border border-[#cda72c]/30';
      case 'green':
        return 'bg-[#95f7bb]/60 text-[#005230] border border-[#006d41]/20';
      case 'grey':
      default:
        return 'bg-[#e3e2df] text-[#444748]';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const rem = getRemainingTimeString(task);
    if (filter === 'overdue') return (task.badgeType === 'overdue' || rem.includes('已逾期')) && !task.completed;
    if (filter === 'today') return task.deadline.includes('今天') || rem.includes('小时') || rem.includes('分钟') || rem === '剩余 1 天';
    if (filter === 'week') return !task.deadline.includes('下月');
    if (filter === 'month') return true;
    return true;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-[#1b1c1a] text-white shadow-sm'
              : 'bg-[#efeeea] text-[#444748] hover:bg-[#e9e8e4]'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filter === 'today'
              ? 'bg-[#1b1c1a] text-white shadow-sm'
              : 'bg-[#efeeea] text-[#444748] hover:bg-[#e9e8e4]'
          }`}
        >
          今天
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filter === 'overdue'
              ? 'bg-[#1b1c1a] text-white shadow-sm'
              : 'bg-[#efeeea] text-[#444748] hover:bg-[#e9e8e4]'
          }`}
        >
          已逾期
        </button>
        <button
          onClick={() => setFilter('week')}
          className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filter === 'week'
              ? 'bg-[#1b1c1a] text-white shadow-sm'
              : 'bg-[#efeeea] text-[#444748] hover:bg-[#e9e8e4]'
          }`}
        >
          本周
        </button>
        <button
          onClick={() => setFilter('month')}
          className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filter === 'month'
              ? 'bg-[#1b1c1a] text-white shadow-sm'
              : 'bg-[#efeeea] text-[#444748] hover:bg-[#e9e8e4]'
          }`}
        >
          本月
        </button>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#efeeea]">
            <p className="text-sm text-[#747878]">当前分类下暂无任务</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const colorCat = getTaskColorCategory(task);
            return (
              <div
                key={task.id}
                className={`bg-white rounded-[24px] p-5 shadow-sm border border-[#efeeea] relative transition-all duration-300 hover:shadow-md ${getAccentBorderClass(
                  colorCat
                )} ${task.completed ? 'opacity-65' : ''}`}
              >
                {/* Header inside card: Remaining Time Badge + Deadline Date Div + More Menu */}
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {/* Remaining Time Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeStyle(
                        colorCat
                      )}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{getRemainingTimeString(task)}</span>
                    </div>

                  {/* Deadline Date and Time Badge */}
                  {task.deadline && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#f4f4f0] text-[#444748] border border-[#e3e2df]">
                      <Calendar className="w-3.5 h-3.5 text-[#747878]" />
                      <span>{task.deadline}</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === task.id ? null : task.id);
                    }}
                    className="p-1 hover:bg-[#f4f4f0] rounded-full text-[#747878] transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === task.id && (
                    <div className="absolute right-0 top-8 w-32 bg-white rounded-2xl shadow-xl border border-[#efeeea] py-1 z-20 animate-scaleIn">
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          onEditTask(task);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#1b1c1a] hover:bg-[#f4f4f0] font-medium"
                      >
                        编辑任务
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          onToggleTaskComplete(task.id);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#1b1c1a] hover:bg-[#f4f4f0] font-medium"
                      >
                        {task.completed ? '标记未完成' : '标记已完成'}
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          onDeleteTask(task.id);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/40 font-medium"
                      >
                        删除任务
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Checkbox */}
              <div className="flex items-start gap-3 mb-2">
                <button
                  onClick={() => onToggleTaskComplete(task.id)}
                  className="mt-0.5 text-[#747878] hover:text-[#006d41] transition-colors shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-[#006d41] fill-[#95f7bb]/30" />
                  ) : (
                    <Circle className="w-6 h-6 text-[#c4c7c7] hover:text-[#747878]" />
                  )}
                </button>

                <div className="flex-1">
                  <h3
                    onClick={() => onEditTask(task)}
                    className={`text-lg font-bold tracking-tight cursor-pointer transition-all ${
                      task.completed
                        ? 'line-through text-[#858383]'
                        : 'text-[#1b1c1a] hover:text-[#006d41]'
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.details && (!task.subItems || task.subItems.length === 0) && (
                    <p className="text-sm text-[#444748] leading-relaxed mt-1 line-clamp-2">
                      {task.details}
                    </p>
                  )}

                  {/* Sub-items list for Project Cards */}
                  {task.subItems && task.subItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#efeeea] space-y-2">
                      {task.subItems.map((sub, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2.5 text-xs text-[#1b1c1a] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#5c5800] shrink-0" />
                          <span className="flex-1">{sub}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags if present */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-2 mt-3 ml-9">
                  {task.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[#f4f4f0] text-[#444748]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Special Action Button for Overdue task (e.g. ⚡ 顺延至明天) */}
              {task.badgeType === 'overdue' && !task.completed && (
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => onDelayTaskToTomorrow(task.id)}
                    className="w-full h-12 bg-[#1b1c1a] text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#2f312e] active:scale-[0.98] transition-all shadow-sm"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>顺延至明天</span>
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};
