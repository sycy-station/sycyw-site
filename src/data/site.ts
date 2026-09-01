export const SITE_URL = 'https://www.syciyuan.cn';

export const BRAND = {
  name: '森韵次元坞',
  // 公司全称，来源：旧站页脚版权「© 2024 唐山森韵次元科技有限公司 版权所有」
  legalName: '唐山森韵次元科技有限公司',
  intro: '用创意和科技连接二次元与现实。',
  // 页脚品牌简介，来源：旧站页脚
  footerIntro:
    '森韵次元致力于将二次元文化与前沿科技相结合，打造沉浸式的数字体验产品，为用户带来更多乐趣和便利。',
  logo: '/assets/logo.png',
  logoAlt: '森韵次元坞',
};

/**
 * 事实值统一收口：来自旧站（syciyuan.cn）公开信息。
 * confirmed 为 false 的条目不渲染（页脚社交等位置有兜底文案）。
 * TODO(confirm): 标记 true 的旧站值仍需负责人最终确认长期有效性（PRD §11 #4–6/#9）。
 */
type Fact<T> = { value: T; confirmed: boolean };

const fact = <T>(value: T, confirmed = false): Fact<T> => ({ value, confirmed });

export const CONTACT = {
  // TODO(confirm): 旧站公开值，上线前由负责人确认仍有效
  phone: fact('+86 166-9059-9967', true),
  email: fact('3896148508@qq.com', true),
  address: fact('中国（河北）自由贸易试验区曹妃甸片区金岛大厦B座3613室', true),
};

export const SOCIAL = [
  // TODO(confirm): 旧站哔哩哔哩/微博为占位 ID（1234567890），真实官方账号确认后填入
  { id: 'bilibili', name: '哔哩哔哩', mark: 'B', url: fact('', false) },
  { id: 'weibo', name: '微博', mark: 'W', url: fact('', false) },
  // QQ 咨询链接与官方邮箱同号，来源：旧站页脚
  {
    id: 'qq',
    name: 'QQ',
    mark: 'Q',
    url: fact('https://wpa.qq.com/msgrd?v=3&uin=3896148508&site=qq&menu=yes', true),
  },
];

export const LEGAL = {
  copyrightYear: '2026',
  // TODO(confirm): 备案号未提供，确认后填入（中国大陆站点上线前必须补充）
  icp: fact('', false),
  privacyUrl: fact('', false),
  termsUrl: fact('', false),
};

export function confirmedEntries<T extends { url: Fact<string> }>(items: T[]) {
  return items.filter((item) => item.url.confirmed && item.url.value);
}

export function confirmedValue(item: Fact<string>): string | null {
  return item.confirmed && item.value ? item.value : null;
}

export const SPLASH_CAPTION = '用创意和科技连接二次元与现实';
export const SPLASH_SIDES = ['products', 'team'];