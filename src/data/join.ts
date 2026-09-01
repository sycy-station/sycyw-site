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
  heroTitle: '与热爱二次元文化和科技创新的人一起创造未来',
  heroDescription:
    '我们看重实际动手能力和长期投入的意愿。团队小，责任清晰，你做的东西会直接被用户用到。',
  heroImage:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20photograph%2C%20empty%20chair%20at%20a%20clean%20desk%20with%20notebook%20and%20pen%2C%20waiting%20to%20be%20filled%2C%20soft%20window%20light%2C%20fine%20film%20grain%2C%20black%20and%20white%2C%20editorial%20style&image_size=landscape_16_9',
  heroImageAlt: '整洁书桌前的空椅子与笔记本',
};

export const CULTURE = [
  {
    icon: '01',
    title: '创新无界',
    description: '想法不分方向和职级，能落地的方案优先于资历。',
    order: 1,
  },
  {
    icon: '02',
    title: '用户至上',
    description: '用户反馈是排优先级的主要依据，不是上线之后才考虑的事。',
    order: 2,
  },
  {
    icon: '03',
    title: '热爱与激情',
    description: '我们希望你本身就是这个文化的参与者，而不只是把它当项目。',
    order: 3,
  },
  {
    icon: '04',
    title: '团队协作',
    description: '责任明确但不孤立，遇到跨方向的问题一起解决。',
    order: 4,
  },
  {
    icon: '05',
    title: '持续成长',
    description: '团队小意味着能力边界会被反复拉开，成长速度取决于你自己。',
    order: 5,
  },
  {
    icon: '06',
    title: '工作与生活平衡',
    description: '我们不把加班时长当作投入度的衡量标准。',
    order: 6,
  },
];

/**
 * 需求 §9 C + §10：员工福利属于待确认事实，未落实的福利不得展示。
 * 确认后将条目写入本数组即可自动渲染。
 */
export const BENEFITS: { icon: string; title: string; description: string; order: number }[] = [];

export const BENEFITS_EMPTY_NOTE =
  '福利条目正在与负责人逐项确认，落实后在此公开。我们不展示尚未确定的待遇承诺。';

/**
 * 需求 §9 E + §10：原官网明确注明现有招聘为非真实信息，
 * 因此 UI/UX 设计师、内容营销专员、产品运营经理均不迁移。
 * 确认后按 Job 结构写入本数组，筛选分类会自动从数据派生。
 */
export const JOBS: Job[] = [];

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

export const PROCESS = [
  {
    step: '01',
    title: '简历投递',
    description: '通过公开的投递入口发送简历与作品，说明你希望参与的方向。',
    order: 1,
  },
  {
    step: '02',
    title: '初步沟通',
    description: '双方先确认方向和期望是否匹配，也是你了解团队实际情况的机会。',
    order: 2,
  },
  {
    step: '03',
    title: '专业面试',
    description: '围绕你的实际项目经验展开，讨论具体做过什么、怎么做的、遇到什么问题。',
    order: 3,
  },
  {
    step: '04',
    title: '终面',
    description: '与负责人沟通协作方式、职责范围和长期规划。',
    order: 4,
  },
  {
    step: '05',
    title: 'Offer 发放',
    description: '确认岗位职责与待遇细节，双方达成一致后发出正式邀约。',
    order: 5,
  },
];

export const JOIN_CTA = {
  title: '还没有合适的职位',
  description:
    '岗位是按实际需要开放的。你可以先看看我们在做什么，如果方向对得上，随时可以主动联系。',
  primaryAction: { label: '了解团队', url: '/team/' },
  secondaryAction: { label: '查看产品', url: '/products/' },
};
