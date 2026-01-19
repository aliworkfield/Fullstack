import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';

const socialLinks = [
  { icon: FaGithub, href: "https://github.com/fastapi/fastapi", label: "GitHub" },
  { icon: FaXTwitter, href: "https://x.com/fastapi", label: "X" },
  { icon: FaLinkedinIn, href: "https://linkedin.com/company/fastapi", label: "LinkedIn" },
]

// Company specific links - update with your company's information
const companyLinks = [
  { href: "/about", key: "about", label: "About" },
  { href: "/contact", key: "contact", label: "Contact" },
  { href: "/privacy", key: "privacy", label: "Privacy" },
  { href: "/terms", key: "terms", label: "Terms" },
]

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start">
            <p className="text-lg font-semibold text-foreground">{t('footer.company_name', 'Your Company')}</p>
            <p className="text-muted-foreground text-sm text-center sm:text-left mt-1">
              {t('footer.tagline', 'Professional coupon management solution')}
            </p>
          </div>
          
          <div className="flex flex-col items-center sm:items-end">
            <div className="flex items-center gap-4 mb-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              © {currentYear} {t('footer.company_name', 'Your Company')}. {t('footer.all_rights_reserved', 'All rights reserved.')}
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center">
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            {companyLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(`footer.${link.key}`, link.label)}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}