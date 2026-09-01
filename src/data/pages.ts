export type PageMeta = {
  slug: string;
  no: string;
  title: string;
  sub: string;
  desc: string;
  year: string;
  freq: string;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  /** 轨道坐标位。取 legacy pos-1/3/4/6 四位，构成左右各二的对称布局 */
  pos: 1 | 3 | 4 | 6;
};

export const PAGES: PageMeta[] = [
  {
    slug: 'about',
    no: '01',
    title: '关于我们',
    sub: 'ABOUT US',
    desc: '用创意和科技连接二次元与现实',
    year: '2024',
    freq: '88.1',
    seoTitle: '关于我们 — 森韵次元坞',
    seoDescription:
      '森韵次元坞以创意和科技连接二次元与现实，从个人开发项目起步，逐步组建团队。这里说明我们是谁、为何成立、坚持什么，以及一路走到今天的关键节点。',
    canonicalPath: '/about/',
    pos: 1,
  },
  {
    slug: 'products',
    no: '02',
    title: '产品服务',
    sub: 'PRODUCTS & SERVICES',
    desc: '融合二次元文化与科技创新的产品与合作项目',
    year: '2024',
    freq: '94.7',
    seoTitle: '产品服务 — 森韵次元坞',
    seoDescription:
      '森韵次元坞的自有项目、托管支持与合作服务一览。按托管支持、开发项目、友链推送、初创论坛分类，逐项说明项目定位、特点与正式入口。',
    canonicalPath: '/products/',
    pos: 3,
  },
  {
    slug: 'team',
    no: '03',
    title: '团队介绍',
    sub: 'OUR TEAM',
    desc: '由二次元爱好者与技术成员组成的团队',
    year: '2024',
    freq: '101.9',
    seoTitle: '团队介绍 — 森韵次元坞',
    seoDescription:
      '森韵次元坞由一群二次元爱好者与技术成员组成。这里介绍团队构成、分工方向与协作方式，也说明我们看重的工作文化。',
    canonicalPath: '/team/',
    pos: 4,
  },
  {
    slug: 'join',
    no: '04',
    title: '加入我们',
    sub: 'JOIN US',
    desc: '与热爱二次元文化和科技创新的人一起创造未来',
    year: '2024',
    freq: '104.6',
    seoTitle: '加入我们 — 森韵次元坞',
    seoDescription:
      '森韵次元坞的团队文化、协作方式与招聘流程说明。开放职位以负责人确认为准，未确认的职位不对外展示，你也可以随时投递自荐。',
    canonicalPath: '/join/',
    pos: 6,
  },
];

export const PAGE_MAP = new Map(PAGES.map((page) => [page.slug, page]));

export function getPage(slug: string): PageMeta {
  const page = PAGE_MAP.get(slug);
  if (!page) throw new Error(`未定义的页面 slug: ${slug}`);
  return page;
}

/**
 * 首页轨道占位项：仅展示标题，暂无对应页面，点击不跳转。
 * 不进入 PAGES（IndexBar / 遮罩菜单 / 打字文案均按真实页面消费 PAGES），
 * 只由 Stage 渲染在空出的 pos-2 / pos-5 中位上。
 */
export const ORBIT_PLACEHOLDERS: {
  slug: string;
  no: string;
  title: string;
  sub: string;
  pos: 2 | 5;
}[] = [
  { slug: 'sycy', no: '05', title: '森韵次元', sub: 'COMING SOON', pos: 2 },
  { slug: 'lyric-db', no: '06', title: '曲词识库', sub: 'COMING SOON', pos: 5 },
];
