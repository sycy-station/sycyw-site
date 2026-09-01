import Link from 'next/link';
import { BRAND, CONTACT, SOCIAL, LEGAL, confirmedEntries, confirmedValue } from '@/data/site';
import { PAGES } from '@/data/pages';

/**
 * 需求 §5.3 页脚字段：品牌信息（Logo/名称/简介）、快速链接、
 * 联系方式、社交渠道、法务信息（公司全称/版权/备案/隐私/条款）。
 * 联系方式与社交账号未确认前不渲染假链接（§10）。
 */
export default function SiteFooter() {
  const socials = confirmedEntries(SOCIAL);
  const email = confirmedValue(CONTACT.email);
  const phone = confirmedValue(CONTACT.phone);
  const address = confirmedValue(CONTACT.address);
  const icp = confirmedValue(LEGAL.icp);
  const privacyUrl = confirmedValue(LEGAL.privacyUrl);
  const termsUrl = confirmedValue(LEGAL.termsUrl);

  return (
    <footer className="site-footer">
      <div className="sf-grid">
        <div className="sf-brand">
          <Link href="/" className="sf-brand-link">
            {BRAND.name}
          </Link>
          <p className="sf-intro">{BRAND.intro}</p>
        </div>

        <nav className="sf-links" aria-label="快速链接">
          <span className="sf-links-title">快速链接</span>
          <ul role="list">
            <li>
              <Link href="/">首页</Link>
            </li>
            {PAGES.map((page) => (
              <li key={page.slug}>
                <Link href={page.canonicalPath}>{page.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sf-contact">
          <span className="sf-links-title">联系方式</span>
          <ul role="list">
            {phone && <li>{phone}</li>}
            {email && (
              <li>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            )}
            {address && <li>{address}</li>}
          </ul>
        </div>

        <div className="sf-social">
          <span className="sf-links-title">社交渠道</span>
          {socials.length > 0 ? (
            <ul role="list">
              {socials.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.url.value}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sf-pending">官方账号确认后在此公开</p>
          )}
        </div>
      </div>

      <div className="sf-meta">
        <span>
          © {LEGAL.copyrightYear} {BRAND.legalName}
        </span>
        {icp ? (
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            {icp}
          </a>
        ) : (
          <span className="sf-rev">REV&nbsp;2.31</span>
        )}
        <span className="sf-legal">
          {privacyUrl && <Link href={privacyUrl}>隐私政策</Link>}
          {termsUrl && <Link href={termsUrl}>服务条款</Link>}
        </span>
      </div>
    </footer>
  );
}