export type Member = {
  name: string;
  role: string;
  avatar: string;
  avatarAlt: string;
  bio?: string;
  skills?: string[];
  socialLinks?: { name: string; url: string }[];
  order: number;
};

export const TEAM_HERO = {
  heroTitle: '由二次元爱好者与技术成员组成的团队',
  heroDescription:
    '团队规模不大，分工明确。开发、运维和内容三个方向各有负责人，每一个还在运行的项目都能找到具体对接人。',
  heroImage:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20photograph%2C%20small%20team%20working%20around%20a%20long%20table%20seen%20from%20behind%2C%20anonymous%20silhouettes%2C%20soft%20window%20light%2C%20fine%20film%20grain%2C%20black%20and%20white%2C%20documentary%20style&image_size=landscape_16_9',
  heroImageAlt: '长桌旁协作的小型团队背影',
};

/**
 * 需求 §8 B/C + §10：团队职务、履历与个人简介均为待确认事实，
 * 旧站文案还存在错误公司名与职位命名冲突。确认前一律不渲染，不编造履历。
 */
export const LEADERSHIP: Member[] = [];
export const CORE_MEMBERS: Member[] = [];

/** 需求 §8 C：无公开简介时展示的空状态说明 */
export const MEMBER_EMPTY_NOTE =
  '成员名单与职务信息正在逐项核对，确认后在此公开。我们不展示未经本人确认的个人履历。';

/** 团队构成：不含个人身份信息的方向说明 */
export const COMPOSITION = [
  {
    title: '开发',
    description: '负责自有项目的功能开发与迭代，包括前端界面、后端服务和数据结构设计。',
    order: 1,
  },
  {
    title: '运维',
    description: '负责托管服务的环境部署、稳定性监控和故障响应，是对外服务承诺的执行方。',
    order: 2,
  },
  {
    title: '内容与社区',
    description: '负责社区运营、内容组织和对外合作沟通，把用户反馈整理成可执行的需求。',
    order: 3,
  },
];

export const CULTURE = [
  {
    icon: '01',
    title: '创新无界',
    description:
      '不限定想法的来源。提出问题的人和解决问题的人可以不是同一个方向，跨界讨论是常态。',
    order: 1,
  },
  {
    icon: '02',
    title: '协作共赢',
    description:
      '项目责任明确但不孤立。遇到超出个人范围的问题，优先拉人一起解决而不是各自硬扛。',
    order: 2,
  },
  {
    icon: '03',
    title: '持续成长',
    description:
      '团队规模小意味着每个人的能力边界会被反复拉开，我们把这当作机会而不是负担。',
    order: 3,
  },
];

/** 需求 §8 E：只使用真实、已授权的团队或工作环境图片，未授权前不展示 */
export const WORKSPACE_IMAGES: { src: string; alt: string; caption?: string }[] = [];

export const TEAM_CTA = {
  title: '加入我们',
  description: '如果你也在做类似的事，或者想把喜欢的东西做成产品，我们随时欢迎沟通。',
  buttonLabel: '查看团队机会',
  buttonUrl: '/join/',
};
