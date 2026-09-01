import type { Metadata, Viewport } from 'next';
import TransitionProvider from '@/motion/TransitionProvider';
import SiteChrome from '@/components/SiteChrome';
import { BRAND, SITE_URL } from '@/data/site';
import './globals.css';
import '@/styles/style.css';
import '@/styles/stage.css';
import '@/styles/wide.css';
import '@/styles/page.css';

const THEME_INIT = `(function(){try{var t=localStorage.getItem("ces-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

/**
 * legacy index.html head 内的 nav-signal-home 预检：
 * 子页返回首页时在首帧渲染前挂 html.nav-back + data-back-no，
 * 保证 splash 不闪现（React 挂载后再读就晚了）。
 */
const NAV_BACK_INIT = `(function(){try{var raw=sessionStorage.getItem("ces-nav");if(!raw)return;var sig=JSON.parse(raw);if(sig.from!=="sub")return;var age=Date.now()-(sig.ts||0);if(age<0||age>2500){sessionStorage.removeItem("ces-nav");return}sessionStorage.removeItem("ces-nav");document.documentElement.setAttribute("data-back-no",sig.no||"");document.documentElement.classList.add("nav-back")}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} — ${BRAND.intro}`,
    template: `%s — ${BRAND.name}`,
  },
  description: BRAND.intro,
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    locale: 'zh_CN',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f3ef' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0d0c' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-wide="on">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script dangerouslySetInnerHTML={{ __html: NAV_BACK_INIT }} />
      </head>
      <body>
        <TransitionProvider>
          <SiteChrome />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
