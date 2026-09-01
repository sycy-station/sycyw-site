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
  // 标题/副文案来源：旧站 team.html Hero
  heroTitle: '充满激情与创意的梦想团队',
  heroDescription:
    '我们的团队由一群热爱二次元文化和科技创新的年轻人组成，致力于将二次元文化与前沿科技完美融合，创造独特的产品体验。',
  heroImage:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20photograph%2C%20small%20team%20working%20around%20a%20long%20table%20seen%20from%20behind%2C%20anonymous%20silhouettes%2C%20soft%20window%20light%2C%20fine%20film%20grain%2C%20black%20and%20white%2C%20documentary%20style&image_size=landscape_16_9',
  heroImageAlt: '长桌旁协作的小型团队背影',
};

/**
 * 领导团队：文案来源为旧站 team.html「领导团队」，按 PRD §9.1 冲突规则修正：
 * - 「梦幻科技」统一替换为「森韵次元坞」
 * - 「10 年/6 年」等具体年限改为不含数字的能力描述
 * - 常驻运维取团队页的 PTYPJ（首页 vxtls 口径弃用，见 PRD §11-17）
 * - 「王小明」占位配图名替换为成员本名（永恒之蓝）
 * - 头像用 §4.4 生成式占位图，替换真实照片即可
 */
export const LEADERSHIP: Member[] = [
  {
    name: '冬月',
    role: '创始人 & CEO',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20portrait%20placeholder%2C%20geometric%20line%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: '冬月的占位头像',
    bio: '资深动漫爱好者，长期投身二次元相关项目的探索与实践，致力于将二次元文化与科技融合。2018 年创立森韵次元坞的前身项目，为公司带来独特的产品体验。',
    order: 1,
  },
  {
    name: '苏以北',
    role: '合伙人 & 线下总监',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20portrait%20placeholder%2C%20diagonal%20line%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: '苏以北的占位头像',
    bio: 'AI 与 AR 技术专家，热爱动漫游戏，负责森韵次元坞的技术研发和产品创新，带领团队攻克多项技术难关，推动公司产品不断升级迭代。',
    order: 2,
  },
  {
    name: 'PTYPJ',
    role: '常驻运维',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20portrait%20placeholder%2C%20concentric%20circle%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: 'PTYPJ 的占位头像',
    bio: '资深插画师和 UI 设计师，擅长将二次元元素融入产品设计。负责森韵次元坞的产品视觉设计和用户体验，为公司产品注入独特的二次元美学风格。',
    skills: ['插画设计', 'UI 设计', '运维支持'],
    order: 3,
  },
  {
    name: '永恒之蓝',
    role: '全栈统筹',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20portrait%20placeholder%2C%20grid%20dot%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: '永恒之蓝的占位头像',
    bio: '深度二次元文化研究者，擅长洞察用户需求，将创意转化为可行的产品方案。负责森韵次元坞的产品规划和市场策略，推动公司产品不断满足用户需求。',
    order: 4,
  },
];

/**
 * 核心成员：名单来源为旧站 team.html「核心团队」（排名不分先后）。
 * 旧站仅给出姓名与职务，个人简介未公开，不编造履历（PRD §9.1）。
 */
export const CORE_MEMBERS: Member[] = [
  {
    name: '小鱼儿',
    role: '高级UI设计师',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20avatar%20placeholder%2C%20thin%20line%20wave%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: '小鱼儿的占位头像',
    order: 1,
  },
  {
    name: '晓伟',
    role: '前端开发工程师',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20avatar%20placeholder%2C%20thin%20line%20grid%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: '晓伟的占位头像',
    order: 2,
  },
  {
    name: 'Allen',
    role: '前端开发工程师',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20avatar%20placeholder%2C%20diagonal%20hatch%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: 'Allen 的占位头像',
    order: 3,
  },
  {
    name: 'Moon',
    role: '后端开发工程师',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20avatar%20placeholder%2C%20dot%20matrix%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: 'Moon 的占位头像',
    order: 4,
  },
  {
    name: 'NyanCatda',
    role: '后端开发工程师',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20avatar%20placeholder%2C%20concentric%20arc%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: 'NyanCatda 的占位头像',
    order: 5,
  },
  {
    name: 'DK',
    role: '合作运维',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20avatar%20placeholder%2C%20intersecting%20line%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: 'DK 的占位头像',
    order: 6,
  },
  {
    name: 'kevin',
    role: 'Java后端开发工程师',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20avatar%20placeholder%2C%20vertical%20stripe%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: 'kevin 的占位头像',
    order: 7,
  },
  {
    name: 'KeiShi',
    role: '想法协助',
    avatar:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20avatar%20placeholder%2C%20sparse%20geometric%20pattern%2C%20soft%20grey%20gradient%2C%20editorial%20style%2C%20black%20and%20white&image_size=square',
    avatarAlt: 'KeiShi 的占位头像',
    order: 8,
  },
];

/** 需求 §8 C：无公开简介时展示的空状态说明（核心成员卡片 bio 为空时使用） */
export const MEMBER_EMPTY_NOTE =
  '每一位成员都是我们宝贵的财富（排名不分先后）。个人简介待成员本人确认后补充，暂不展示未经核实的履历。';

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

// 文案来源：旧站 team.html「我们的团队文化」
export const CULTURE = [
  {
    icon: '01',
    title: '创新无界',
    description:
      '我们鼓励每一位团队成员大胆提出自己的想法，勇于尝试新的技术和方法，不断突破自我，推动公司和产品的发展。',
    order: 1,
  },
  {
    icon: '02',
    title: '协作共赢',
    description:
      '我们相信团队的力量，鼓励跨部门协作，共同解决问题，分享成功的喜悦，一起成长进步。',
    order: 2,
  },
  {
    icon: '03',
    title: '持续成长',
    description:
      '我们重视每个人的个人发展，提供丰富的学习资源和培训机会，帮助团队成员不断提升自己的能力和价值。',
    order: 3,
  },
];

/**
 * 需求 §8 E：只使用真实、已授权的团队或工作环境图片。
 * 旧站自述「工作环境图为网图，公司尚未有实体工作室」，故不迁移网图，保留空态。
 */
export const WORKSPACE_IMAGES: { src: string; alt: string; caption?: string }[] = [];

export const TEAM_CTA = {
  // 文案来源：旧站 team.html「加入我们，一起创造未来」
  title: '加入我们，一起创造未来',
  description:
    '如果你热爱二次元文化和科技创新，渴望在充满活力的团队中施展才华，欢迎加入森韵次元！我们期待与你一起，将二次元文化与前沿科技完美融合，创造更多令人惊喜的产品。',
  buttonLabel: '查看职位',
  buttonUrl: '/join/',
};