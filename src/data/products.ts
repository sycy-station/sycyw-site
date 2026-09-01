export type ProductAction = {
  label: string;
  /** 需求 §10：域名存在冲突时置为 null，不渲染按钮，不使用 href="#" 兜底 */
  url: string | null;
  external: boolean;
};

export type ProductSpecRow = { name: string; value: string };
export type ProductSpecGroup = { title: string; rows: ProductSpecRow[] };

export type Product = {
  id: string;
  categoryId: string;
  categoryLabel: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  features: { title: string; description: string }[];
  primaryAction: ProductAction;
  secondaryAction?: ProductAction;
  status?: string;
  /** 分组规格：每组一小表，页面上并排呈现 */
  specGroups?: ProductSpecGroup[];
  specNote?: string;
};

export const PRODUCT_HERO = {
  // 标题/副文案来源：旧站 products.html Hero
  heroTitle: '融合二次元与科技创新的产品',
  heroDescription:
    '我们致力于将二次元文化与前沿科技完美融合，打造独特的产品体验，为用户带来更多乐趣和便利。',
  heroImage:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20photograph%2C%20server%20rack%20detail%20with%20neat%20cable%20management%2C%20shallow%20depth%20of%20field%2C%20soft%20industrial%20light%2C%20fine%20film%20grain%2C%20black%20and%20white%2C%20high%20detail&image_size=landscape_16_9',
  heroImageAlt: '整理有序的服务器机柜与线缆细节',
};

export const PRODUCTS: Product[] = [
  {
    id: 'linfengyun',
    categoryId: 'hosting',
    categoryLabel: '托管支持',
    name: '林枫云',
    // 文案来源：旧站 products.html 产品一
    tagline: '独立 IP 高频 VPS，极速、安全、稳定。',
    description:
      '还在为网络卡顿、延迟高而烦恼吗？还在为共享 IP 带来的安全隐患而担忧吗？选择林枫云，独立 IP 高频 VPS，为您开启极速、安全、稳定的网络新体验！',
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20composition%2C%20isometric%20line%20drawing%20of%20stacked%20server%20units%2C%20thin%20precise%20strokes%2C%20off-white%20background%2C%20editorial%20technical%20illustration%2C%20black%20and%20white&image_size=landscape_4_3',
    imageAlt: '服务器单元的等轴线条示意图',
    features: [
      {
        title: '全站独立 IP',
        description: '独立 IP，独享带宽，拒绝共享，安全无忧。',
      },
      {
        title: '高频 CPU',
        description: '采用 Intel 13/14 代高端芯片与 AMD 高频处理器，从容应对高负载场景。',
      },
      {
        title: '极速线路',
        description: '优质线路，极速连接，低延迟，畅享丝滑体验。',
      },
    ],
    // TODO(confirm): PRD §8.1 建议取 lfyvps.com，实测不可达；采用实测可达的 dkdun.cn（旧站首页口径）
    primaryAction: { label: '了解详情', url: 'https://www.dkdun.cn', external: true },
    status: '运营中',
    // 参数来源：旧站 products.html 林枫云产品规格（已修正原站笔误：INTER→Intel、缺失单位补齐）
    specGroups: [
      {
        title: '游戏云',
        rows: [
          { name: 'CPU 型号', value: 'Intel / AMD' },
          { name: 'Intel 参数', value: '13、14 代高端芯片' },
          { name: 'AMD 参数', value: '9950X / 7950X / 5950X' },
          { name: '内存容量', value: '8~32GB 超大内存' },
          { name: '带宽', value: '10~50Mbps 独享' },
        ],
      },
      {
        title: '业务云',
        rows: [
          { name: '处理器', value: 'Intel 铂金 / AMD EPYC 企业级' },
          { name: '内存', value: '2GB~64GB 超大内存' },
          { name: '存储', value: '50~200GB SSD 存储' },
          { name: '带宽', value: '10~300M 专享带宽' },
          { name: 'DDoS 防御', value: '100~200G 超大防御' },
        ],
      },
      {
        title: '金牌托管',
        rows: [
          { name: '服务器支持', value: '机架式 1U~2U' },
          { name: '托管地点', value: '成都 / 宁波 / 十堰多地' },
          { name: '售后服务', value: '7×24h 运维服务' },
          { name: '托管防御', value: '50~800GB 超高防御' },
          { name: '资质验证', value: '可查 IDC 资质，宁波直签机房' },
        ],
      },
    ],
    specNote: '实际可售配置以林枫云官网页面为准。',
  },
  {
    id: 'sycyw',
    categoryId: 'development',
    categoryLabel: '开发项目',
    name: '森韵次元坞',
    // 文案来源：旧站 products.html 产品二
    tagline: '专为二次元爱好者打造的综合性平台。',
    description:
      '森韵次元坞是专为二次元爱好者打造的综合性平台。我们聚焦 Vup 文化，汇聚众多虚拟主播，为您呈现精彩的直播内容和互动体验。同时，我们也深耕术圈领域，提供丰富的音乐、绘画、舞蹈等二次元艺术创作，满足您对多元文化的追求。',
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20composition%2C%20thin%20line%20grid%20forming%20a%20layered%20interface%20structure%2C%20precise%20geometric%20strokes%2C%20off-white%20background%2C%20editorial%20technical%20illustration%2C%20black%20and%20white&image_size=landscape_4_3',
    imageAlt: '由细线网格构成的分层界面结构示意图',
    features: [
      {
        title: '专向性平台',
        description: '重点侧重 Vup 与术圈小团体，让偏圈也有自己的一席之地。',
      },
      {
        title: '收纳与音乐',
        description: '对 Vup、术曲、二次元歌曲进行收纳，创作独一无二的专项曲库。',
      },
      {
        title: '专业团队开发',
        description: '超过 13 人的开发团队，助力二次元平台完美落地。',
      },
    ],
    // TODO(confirm): senyunwu.com 实测暂不可达，沿用旧站产品页 URL（PRD §11-13 待确认）
    primaryAction: { label: '了解详情', url: 'https://www.senyunwu.com', external: true },
    status: '开发中',
  },
  {
    id: 'minebbs',
    categoryId: 'partner',
    categoryLabel: '友链推送',
    name: 'MineBBS',
    // 文案来源：旧站 products.html 产品三
    tagline: '《我的世界》中文社区平台，腐竹的开服圣地。',
    description:
      'MineBBS 是一个专注于《我的世界》游戏的中文社区平台，致力于为玩家提供全方位的游戏体验和交流空间。平台汇聚了大量的游戏资源，包括插件、地图、皮肤、材质包等，满足玩家在游戏中的各种需求。同时，MineBBS 也是一个活跃的玩家社区，玩家可以在这里分享游戏心得、交流创作经验、参与社区活动，找到志同道合的伙伴。',
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20composition%2C%20two%20interlocking%20thin%20line%20circles%20suggesting%20partnership%2C%20precise%20geometric%20strokes%2C%20off-white%20background%2C%20editorial%20illustration%2C%20black%20and%20white&image_size=landscape_4_3',
    imageAlt: '两个相互交叠的细线圆形，象征合作关系',
    features: [
      {
        title: '公益性站点',
        description: '由 YYT 等管理层公益支持，40+ 版主为审核保驾护航。',
      },
      {
        title: '10w+ 用户',
        description: '在线用户量达 1000+，12w 用户大平台。',
      },
      {
        title: '腐竹圣地',
        description: '丰富的开服资源与插件，国内腐竹的开服圣地。',
      },
    ],
    // minebbs.com 两处口径一致且实测可达
    primaryAction: { label: '了解详情', url: 'https://www.minebbs.com', external: true },
    status: '合作中',
  },
  {
    id: 'skymanor',
    categoryId: 'forum',
    categoryLabel: '初创论坛',
    name: '天空府邸论坛',
    // 文案来源：旧站 products.html 产品四
    tagline: '成立前开创的小型 Minecraft 论坛，持续维护中。',
    description: '天空府邸论坛是森韵次元团队成立前开创的小型 Minecraft 论坛，目前持续维护中。',
    image:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20abstract%20composition%2C%20sparse%20thin%20line%20structure%20suggesting%20an%20early-stage%20scaffold%2C%20precise%20geometric%20strokes%2C%20off-white%20background%2C%20editorial%20illustration%2C%20black%20and%20white&image_size=landscape_4_3',
    imageAlt: '稀疏的细线结构，象征起步阶段的框架',
    features: [
      {
        title: '高自由度论坛',
        description: '板块与权限体系灵活配置，讨论氛围自由开放。',
      },
      {
        title: '更多设置',
        description: '个人信息随意定制，货币荣誉完善。',
      },
      {
        title: '多平台支持',
        description: '支持主流直播和社交平台，一键接入，便捷使用。',
      },
    ],
    // TODO(confirm): PRD §8.1 建议 sky-palace.cn，实测不可达；采用实测可达的论坛实际地址
    primaryAction: { label: '访问论坛', url: 'https://cn-cdn1.skymansion.net', external: true },
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