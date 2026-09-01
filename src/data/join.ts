export type Job = {
  id: string;
  categoryId: string;
  categoryLabel: string;
  title: string;
  location: string;
  description: string;
  requirements: string[];
  applyLabel: string;
  applyUrl: string;
  status: 'open' | 'closed';
};

export const JOIN_HERO = {
  // 标题/副文案来源：旧站 join.html Hero
  heroTitle: '加入森韵次元，一起创造未来',
  heroDescription:
    '我们正在寻找热爱二次元文化和科技创新的人才，一起打造独特的产品体验，为用户带来更多乐趣和便利。',
  heroImage:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20photograph%2C%20empty%20chair%20at%20a%20clean%20desk%20with%20notebook%20and%20pen%2C%20waiting%20to%20be%20filled%2C%20soft%20window%20light%2C%20fine%20film%20grain%2C%20black%20and%20white%2C%20editorial%20style&image_size=landscape_16_9',
  heroImageAlt: '整洁书桌前的空椅子与笔记本',
};

// 文化条目来源：旧站 join.html「我们的文化」（在森韵次元，我们崇尚开放、创新、协作的团队文化）
export const CULTURE = [
  {
    icon: '01',
    title: '创新无界',
    description:
      '我们鼓励突破常规思维，勇于尝试新的技术和创意，不断探索二次元文化与科技融合的可能性。',
    order: 1,
  },
  {
    icon: '02',
    title: '用户至上',
    description:
      '我们始终将用户需求放在首位，倾听用户声音，不断优化产品体验，为用户创造真正的价值。',
    order: 2,
  },
  {
    icon: '03',
    title: '热爱与激情',
    description:
      '我们热爱二次元文化和科技创新，这份热爱和激情驱动我们不断前行，创造更多精彩。',
    order: 3,
  },
  {
    icon: '04',
    title: '团队协作',
    description:
      '我们相信团队的力量，鼓励跨部门合作，共同解决问题，实现共同的目标和愿景。',
    order: 4,
  },
  {
    icon: '05',
    title: '持续成长',
    description:
      '我们重视每个人的成长和发展，提供丰富的学习资源和培训机会，帮助团队成员实现自我价值。',
    order: 5,
  },
  {
    icon: '06',
    title: '工作与生活平衡',
    description:
      '我们注重工作与生活的平衡，创造轻松愉快的工作环境，让每个人都能在工作中找到乐趣。',
    order: 6,
  },
];

/**
 * 员工福利：文案来源为旧站 join.html「员工福利」五项。
 * TODO(confirm): 福利细则（保险方案、学习基金额度、股权比例等）未经业务方确认，展示口径以条目描述为准。
 */
export const BENEFITS: { icon: string; title: string; description: string; order: number }[] = [
  {
    icon: '01',
    title: '弹性工作制',
    description: '灵活的工作时间和远程工作选项，让你更好地平衡工作与生活。',
    order: 1,
  },
  {
    icon: '02',
    title: '健康保障',
    description: '全面的医疗保险、年度体检和健身补贴，关注你的身心健康。',
    order: 2,
  },
  {
    icon: '03',
    title: '学习发展',
    description: '丰富的培训资源、技术分享会和学习基金，支持你的职业发展。',
    order: 3,
  },
  {
    icon: '04',
    title: '团队活动',
    description: '定期的团队建设活动、生日会和节日庆祝，增强团队凝聚力。',
    order: 4,
  },
  {
    icon: '05',
    title: '股权激励',
    description: '有竞争力的股权激励计划，让你与公司共同成长。',
    order: 5,
  },
];

export const BENEFITS_EMPTY_NOTE =
  '福利条目正在与负责人逐项确认，落实后在此公开。我们不展示尚未确定的待遇承诺。';

/**
 * 职位数据：旧站 join.html 明确注明「此处招聘不为真实信息，更新信息后此条信息消失」。
 * 按 PRD §10.1 以占位数据迁移（保持筛选交互可验收）：
 * - status 标记 closed（页面只展示 open 职位，确认开放时改为 open 即自动渲染）
 * - applyUrl 指向邮箱投递（mailto:），不使用 href="#" 兜底
 * - 职责与要求按旧站原文迁移，未给出的要求按占位补齐并标注
 */
export const JOBS: Job[] = [
  {
    id: 'ui-ux-designer',
    categoryId: 'design',
    categoryLabel: '设计创意',
    title: 'UI/UX 设计师',
    location: '线上（远程）',
    description:
      '负责公司产品的用户界面和交互设计，创造符合二次元文化特点的视觉风格，提升用户体验。',
    requirements: [
      '2 年以上 UI/UX 设计经验，熟悉 Figma、Sketch 等设计工具',
      '对二次元风格有独特理解，能创造符合用户喜好的界面',
      '良好的沟通能力，能与开发团队有效协作',
    ],
    applyLabel: '邮件申请职位',
    // TODO(confirm): 旧站职位为占位信息，投递邮箱沿用旧站公示联系方式
    applyUrl: 'mailto:3896148508@qq.com?subject=应聘%20UI%2FUX%20设计师',
    status: 'closed',
  },
  {
    id: 'content-marketing',
    categoryId: 'marketing',
    categoryLabel: '市场营销',
    title: '内容营销专员',
    location: '线上（远程）',
    description:
      '负责公司产品的内容营销策略，包括社交媒体运营、内容创作和用户互动，提升品牌影响力。',
    requirements: [
      '对二次元文化有深入了解，熟悉相关平台和社区',
      'TODO(confirm): 其余任职要求待业务方补充',
    ],
    applyLabel: '邮件申请职位',
    applyUrl: 'mailto:3896148508@qq.com?subject=应聘%20内容营销专员',
    status: 'closed',
  },
  {
    id: 'product-operations',
    categoryId: 'operations',
    categoryLabel: '运营管理',
    title: '产品运营经理',
    location: '线上（远程）',
    description:
      '负责公司产品的运营策略和执行，包括用户增长、活动策划和数据分析，提升产品活跃度和留存率。',
    requirements: [
      'TODO(confirm): 任职要求待业务方补充',
    ],
    applyLabel: '邮件申请职位',
    applyUrl: 'mailto:3896148508@qq.com?subject=应聘%20产品运营经理',
    status: 'closed',
  },
];

export const JOBS_EMPTY_TITLE = '暂无开放职位';
export const JOBS_EMPTY_NOTE =
  '当前没有已确认的开放职位。如果你认可我们做的事，欢迎先了解团队与产品，后续有岗位开放时会在这里发布。';

/** 需求 §9 D：筛选项只能来自当前职位数据，避免出现没有职位的空分类 */
export function deriveJobCategories(jobs: Job[]) {
  const seen = new Map<string, string>();
  jobs.forEach((job) => {
    if (!seen.has(job.categoryId)) seen.set(job.categoryId, job.categoryLabel);
  });
  return [
    { id: 'all', label: '全部职位' },
    ...Array.from(seen, ([id, label]) => ({ id, label })),
  ];
}

/**
 * 招聘流程：步骤框架来源为旧站 join.html。
 * 按 PRD §10 去掉「冬月会在 3 个工作日内完成筛选」「冬月会主动添加联系方式」等
 * 写死负责人与时限的表述，改为流程本身的中性描述。
 */
export const PROCESS = [
  {
    step: '01',
    title: '简历投递',
    description: '通过官网公示的邮箱投递简历，附上作品或项目经历，说明你希望参与的方向。',
    order: 1,
  },
  {
    step: '02',
    title: '初步面试',
    description: '我们会主动与你联系，了解你的基本情况、大致规划和对公司的了解。',
    order: 2,
  },
  {
    step: '03',
    title: '技术/专业面试',
    description:
      '与团队负责人和同事进行专业能力面试，可能包含技术测试或案例分析（流媒体运营成员无需此项面试）。',
    order: 3,
  },
  {
    step: '04',
    title: '终面',
    description: '与公司高管面谈，深入了解你的职业发展和与公司文化的契合度。',
    order: 4,
  },
  {
    step: '05',
    title: 'Offer 发放',
    description: '通过所有面试环节后，我们会发出录用通知，并与你沟通入职事宜。',
    order: 5,
  },
];

export const JOIN_CTA = {
  // 文案来源：旧站 join.html「准备好加入我们了吗？」
  title: '准备好加入我们了吗？',
  description:
    '如果你热爱二次元文化和科技创新，渴望在充满创意的环境中发挥才能，森韵次元期待你的加入！',
  primaryAction: { label: '邮件投递简历', url: 'mailto:3896148508@qq.com?subject=简历投递' },
  secondaryAction: { label: '了解更多公司信息', url: '/about/' },
};