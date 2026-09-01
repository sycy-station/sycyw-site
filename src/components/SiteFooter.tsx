import { BRAND, CONTACT, SOCIAL, LEGAL, confirmedEntries, confirmedValue } from '@/data/site';

/**
 * 与 legacy page.css 的 .site-footer 体系对齐：
 * .sf-contact（大号邮箱 + 社交）+ .sf-meta（版权 + 版本号）。
 * 联系方式未确认前不渲染假链接，邮箱位回退为品牌名。
 */
export default function SiteFooter() {
  const socials = confirmedEntries(SOCIAL);
  const email = confirmedValue(CONTACT.email);
  const icp = confirmedValue(LEGAL.icp);

  return (
    <footer className="site-footer">
      <div className="sf-contact">
        {email ? (
          <a className="footer-mail" href={`mailto:${email}`}>
            {email}
          </a>
        ) : (
          <span className="footer-mail footer-mail--pending" aria-disabled="true">
            {BRAND.name}
          </span>
        )}
        {socials.length > 0 && (
          <div className="footer-social">
            {socials.map((item) => (
              <a
                key={item.id}
                href={item.url.value}
                aria-label={item.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="sf-meta">
        <span>
          © {LEGAL.copyrightYear} {BRAND.name}
        </span>
        {icp ? (
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            {icp}
          </a>
        ) : (
          <span className="sf-rev">REV&nbsp;2.31</span>
        )}
      </div>
    </footer>
  );
}