import { TaskItem, NoteItem, FocusCheckItem, InsightQuote, ProjectSummary, CollectionItem, TagItem } from '../types';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: '完成设计评审',
    details: '审核“凤凰”项目的最终高保真原型，并将修改意见发送给团队。',
    deadline: '今天, 17:00',
    badge: '已逾期 2 天',
    badgeType: 'overdue',
    accentColor: 'red',
    completed: false,
    createdAt: '2026-07-26',
  },
  {
    id: 'task-2',
    title: '周同步会议准备',
    details: '起草今天下午利益相关者会议的讨论要点。',
    deadline: '今天, 15:00',
    badge: '剩余 4 小时',
    badgeType: 'urgent',
    accentColor: 'yellow',
    tags: ['#工作', '#战略'],
    completed: false,
    createdAt: '2026-07-28',
  },
  {
    id: 'task-3',
    title: '系统审计草案',
    details: '开始梳理季度报告中的基础设施瓶颈。',
    deadline: '明天, 10:00',
    badge: '> 24小时',
    badgeType: 'upcoming',
    accentColor: 'green',
    completed: false,
    createdAt: '2026-07-28',
  },
  {
    id: 'task-4',
    title: '备份个人云盘',
    details: '对所有归档项目和媒体文件进行例行维护。',
    deadline: '下周一, 09:00',
    badge: '下周',
    badgeType: 'normal',
    accentColor: 'grey',
    completed: false,
    createdAt: '2026-07-28',
  },
  {
    id: 'task-5',
    title: '更新周报',
    details: '汇总本周迭代重点与进度。',
    deadline: '昨天',
    badge: '已完成',
    badgeType: 'normal',
    accentColor: 'green',
    completed: true,
    createdAt: '2026-07-27',
  }
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: '留白的建筑学',
    excerpt: '关于室内设计中的负空间如何降低认知负荷并提升思维清晰度的笔记。少即是多。',
    content: '在建筑与室内设计中，负空间并非空无一物，而是思想流动的通道。消除多余的视觉噪音，能显著降低人体的皮质醇水平，让人保持专注与从容。',
    tag: '灵感',
    timestamp: '2 小时前',
    collection: '创意',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    isPrivate: false,
  },
  {
    id: 'note-2',
    title: '极简数字生活准则',
    excerpt: '减少信息轰炸，将每日推送控制在3个核心渠道以内。',
    content: '数字断舍离的核心是建立“选择性接收”机制。每天固定时间集中处理通知，其余时间保持思维离线。',
    tag: '生活',
    timestamp: '昨天',
    collection: '生活',
    coverImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    isPrivate: false,
  },
  {
    id: 'note-3',
    title: '心流状态的触发条件',
    excerpt: '明确的目标 + 适度的高挑战度 + 实时反馈 = 极致的专注体验。',
    content: '心理学研究表明，心流往往发生在能力边界稍加伸展的时刻。把大任务拆解为15分钟的快节奏小块是进入心流最快的方法。',
    tag: '工作',
    timestamp: '3 天前',
    collection: '工作',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    isPrivate: false,
  },
  {
    id: 'note-4',
    title: '现代设计系统演进',
    excerpt: '色彩层级、网格对齐与排版规则的系统化整理。',
    content: '设计系统不仅仅是 UI 组件库，更是团队沟通的共同语言与逻辑准则。',
    tag: '学习',
    timestamp: '4 天前',
    collection: '学习',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    isPrivate: false,
  },
  {
    id: 'note-5',
    title: '自然光影与空间构图',
    excerpt: '摄影中的光影沉淀与氛围营造思考。',
    content: '自然光是最好的调色师。学会捕捉清晨和傍晚的柔和光线，能为画面带来静谧而深邃的气质。',
    tag: '美学',
    timestamp: '5 天前',
    collection: '创意',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    isPrivate: false,
  }
];

export const INITIAL_FOCUS_CHECKS: FocusCheckItem[] = [
  { id: 'focus-1', title: '回顾深度工作协议', completed: false },
  { id: 'focus-2', title: '起草“极简 UI”简报', completed: false },
  { id: 'focus-3', title: '晨间冥想', completed: true },
];

export const MAO_QUOTES: InsightQuote[] = [
  {
    quote: '“认知放松是一种一切进展顺利的感觉——没有威胁，没有重大消息，不需要转移注意力或动员精力。”',
    author: '— 丹尼尔·卡尼曼',
  },
  {
    quote: '“星星之火，可以燎原。”',
    author: '— 《毛泽东选集》',
  },
  {
    quote: '“世上无难事，只要肯登攀。”',
    author: '— 《毛泽东选集》',
  },
  {
    quote: '“消除多余的视觉噪音，能显著降低认知负荷，让人保持专注与从容。”',
    author: '— 《思考，快与慢》',
  },
  {
    quote: '“人类总得不断地总结经验，有所发现，有所发明，有所创造，有所前进。”',
    author: '— 《毛泽东选集》',
  },
];

export const INITIAL_INSIGHT: InsightQuote = MAO_QUOTES[0];

export const INITIAL_PROJECT: ProjectSummary = {
  id: 'proj-1',
  title: '项目：宁静之家',
  items: ['柔光灯具', '亚麻质地', '漫反射绿植'],
};

export const INITIAL_COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-work',
    name: '工作',
    count: 24,
    iconName: 'Briefcase',
    colorClass: 'bg-surface-container text-on-surface',
  },
  {
    id: 'col-creative',
    name: '创意',
    count: 12,
    iconName: 'Lightbulb',
    colorClass: 'bg-secondary-container text-on-secondary-container',
  },
  {
    id: 'col-life',
    name: '生活',
    count: 48,
    iconName: 'Heart',
    colorClass: 'bg-surface-container text-on-surface',
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
    ]
  },
  {
    id: 'col-study',
    name: '学习',
    count: 18,
    iconName: 'BookOpen',
    colorClass: 'bg-surface-container text-on-surface',
  }
];

export const INITIAL_TAGS: TagItem[] = [
  { id: 'tag-1', name: '#紧急', colorDot: 'bg-red-500' },
  { id: 'tag-2', name: '#灵感', colorDot: 'bg-emerald-500' },
  { id: 'tag-3', name: '#战略', colorDot: 'bg-amber-500' },
];

export const INITIAL_PRIVATE_NOTES: NoteItem[] = [
  {
    id: 'pnote-1',
    title: '2026 个人资产配置方案',
    excerpt: '保密级别：最高。包含长期基金组合与不动产规划。',
    content: '1. 应急储备金（6个月生活费）\n2. 稳健收益组合 60%\n3. 创新科技成长股 30%\n4. 实物黄金与硬资产 10%',
    tag: '私密',
    timestamp: '前天',
    collection: '私密保险箱',
    isPrivate: true,
  },
  {
    id: 'pnote-2',
    title: '个人成长反思复盘',
    excerpt: '关于情绪管理与精力分配的私密记录。',
    content: '记录每周情绪波动，分析能量耗散的根源，建立更加健康的生活节律。',
    tag: '私密',
    timestamp: '1周前',
    collection: '私密保险箱',
    isPrivate: true,
  }
];
