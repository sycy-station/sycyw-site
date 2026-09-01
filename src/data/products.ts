export type ProductAction = {
  label: string;
  /** 需求 §10：域名存在冲突时置为 null，不渲染按钮，不使用 href="#" 兜底 */
  url: string | null;
  external: boolean;
};

export type Product = {
  id: string;
  categoryId: string;
  categoryLabel: string;
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  features: { title: string; description: string; icon?: string }[];
  primaryAction: ProductAction;
  secondaryAction?: ProductAction;
  status?: string;
  specGroupTitle?: string;
  specGroupDescription?: string;
  specRows?: { name: string; value: string; note?: string }[];
};

export const PRODUCT_HERO = {
  heroTitle: '融合二次元文化与科技创新的产品与合作项目',
  heroDescription:
    '我们同时维护自有项目、托管服务和社区合作。下面按类别列出目前仍在运行的项目，包含它的定位、特点与当前状态。',
  heroImage:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20photograph%2C%20server%20rack%20detail%20with%20neat%20cable%20management%2C%20shallow%20depth%20of%20field%2C%20soft%20industrial%20light%2C%20fine%20film%20grain%2C%20black%20and%20white%2C%20high%20detail&image_size=landscape_16_9',
  heroImageAlt: '整理有序的服务器机柜与线缆细节',
};

export const PRODUCT_CATEGORIES = [
  { id: 'all', label: '全部产品', order: 1 },
  { id: 'hosting', label: '托管支持', order: 2 },
  { id: 'development', label: '开发项目', order: 3 },
  { id: 'partner', label: '友链推送', order: 4 },
  { id: 'forum', label: '初创论坛', order: 5 },
];

export const PRODUCTS: Product[] = [
  {
    id: 'linfengyun',
    categoryId: 'hosting',
    categoryLabel: '托管支持',
    name: '林枫云',
    description:
      '面向个人与小型团队的服务器托管服务，提供可按需选择的实例配置和基础运维支持。目标是让不具备专职运维能力的用户也能维持一个稳定的服务环境。',
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20composition%2C%20isometric%20line%20drawing%20of%20stacked%20server%20units%2C%20thin%20precise%20strokes%2C%20off-white%20background%2C%20editorial%20technical%20illustration%2C%20black%20and%20white&image_size=landscape_4_3',
    imageAlt: '服务器单元的等轴线条示意图',
    features: [
      {
        title: '按需配置',
        description: '实例规格可根据实际负载选择，不必为用不到的资源付费。',
        icon: '01',
      },
      {
        title: '基础运维支持',
        description: '环境部署和常见故障有人协助处理，不需要用户自行排查底层问题。',
        icon: '02',
      },
      {
        title: '长期维护承诺',
        description: '已开通的服务有明确负责人，变更和维护计划提前通知。',
        icon: '03',
      },
    ],
    primaryAction: { label: '访问官网', url: null, external: true },
    status: '运营中',
  },
  {
    id: 'sycyw',
    categoryId: 'development',
    categoryLabel: '开发项目',
    name: '森韵次元坞',
    description:
      '我们自己的开发项目，围绕二次元社区场景做内容组织和工具支持。项目仍在迭代，功能范围会随实际使用反馈调整。',
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20composition%2C%20thin%20line%20grid%20forming%20a%20layered%20interface%20structure%2C%20precise%20geometric%20strokes%2C%20off-white%20background%2C%20editorial%20technical%20illustration%2C%20black%20and%20white&image_size=landscape_4_3',
    imageAlt: '由细线网格构成的分层界面结构示意图',
    features: [
      {
        title: '社区内容组织',
        description: '围绕同好社区的内容结构设计，而不是套用通用模板。',
        icon: '01',
      },
      {
        title: '持续迭代',
        description: '功能按实际使用反馈推进，优先解决被反复提到的问题。',
        icon: '02',
      },
      {
        title: '自有技术栈',
        description: '完全由团队自行开发和维护，不依赖第三方闭源平台。',
        icon: '03',
      },
    ],
    primaryAction: { label: '查看项目', url: null, external: true },
    status: '开发中',
  },
  {
    id: 'minebbs',
    categoryId: 'partner',
    categoryLabel: '友链推送',
    name: 'MineBBS',
    description:
      '我们保持友链关系的社区站点。合作形式为相互推荐与内容互通，具体合作范围以双方当期约定为准。',
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20composition%2C%20two%20interlocking%20thin%20line%20circles%20suggesting%20partnership%2C%20precise%20geometric%20strokes%2C%20off-white%20background%2C%20editorial%20illustration%2C%20black%20and%20white&image_size=landscape_4_3',
    imageAlt: '两个相互交叠的细线圆形，象征合作关系',
    features: [
      {
        title: '社区互推',
        description: '双方在各自站点保留对方入口，面向重叠的用户群体。',
        icon: '01',
      },
      {
        title: '内容互通',
        description: '在双方认可的范围内共享技术讨论与资源信息。',
        icon: '02',
      },
      {
        title: '独立运营',
        description: '双方各自独立运营，不存在从属或代理关系。',
        icon: '03',
      },
    ],
    primaryAction: { label: '访问社区', url: null, external: true },
    status: '合作中',
  },
  {
    id: 'skymanor',
    categoryId: 'forum',
    categoryLabel: '初创论坛',
    name: '天空府邸论坛',
    description:
      '处于初创阶段的社区论坛项目，目前以基础板块搭建和早期用户积累为主，规模和功能都还在起步阶段。',
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20composition%2C%20sparse%20thin%20line%20structure%20suggesting%20an%20early-stage%20scaffold%2C%20precise%20geometric%20strokes%2C%20off-white%20background%2C%20editorial%20illustration%2C%20black%20and%20white&image_size=landscape_4_3',
    imageAlt: '稀疏的细线结构，象征起步阶段的框架',
    features: [
      {
        title: '基础板块',
        description: '按讨论主题划分基础板块，结构随用户增长再调整。',
        icon: '01',
      },
      {
        title: '早期社区',
        description: '目前规模较小，讨论集中在少数活跃主题上。',
        icon: '02',
      },
      {
        title: '开放建设中',
        description: '板块结构和运营规则仍在调整，欢迎早期用户提出意见。',
        icon: '03',
      },
    ],
    primaryAction: { label: '访问论坛', url: null, external: true },
    status: '初创阶段',
  },
];

/** 需求 §7 E：没有真实案例时整段隐藏，不展示空卡片 */
export const SHOWCASES: {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  url: string;
  status: string;
}[] = [];
