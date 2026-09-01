export const SITE_URL = 'https://www.syciyuan.cn';

export const BRAND = {
  name: '森韵次元坞',
  legalName: '森韵次元坞',
  intro: '用创意和科技连接二次元与现实。',
  logo: '/assets/logo.png',
  logoAlt: '森韵次元坞',
};

/**
 * 需求 §5.3 / §10：联系方式、社交账号、备案号均为待确认事实。
 * confirmed 为 false 的条目不渲染，且不使用占位值兜底。
 */
type Fact<T> = { value: T; confirmed: boolean };

const fact = <T>(value: T, confirmed = false): Fact<T> => ({ value, confirmed });

export const CONTACT = {
  phone: fact('', false),
  email: fact('', false),
  address: fact('', false),
};

export const SOCIAL = [
  { id: 'bilibili', name: '哔哩哔哩', mark: 'B', url: fact('', false) },
  { id: 'weibo', name: '微博', mark: 'W', url: fact('', false) },
  { id: 'qq', name: 'QQ', mark: 'Q', url: fact('', false) },
];

export const LEGAL = {
  copyrightYear: '2026',
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
