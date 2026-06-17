import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Globe } from 'lucide-react';

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com', icon: Github },
  { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { label: 'Website', href: 'https://beetlex.io', icon: Globe },
];

const FOOTER_LINKS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Browse Events', to: '/events' },
      { label: 'Host a Hackathon', to: '/events' },
      { label: 'Leaderboards', to: '/events' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', to: '/events' },
      { label: 'Code of Conduct', to: '/events' },
      { label: 'FAQ', to: '/#faq' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container-page grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <img src="/beetle.svg" alt="" className="h-8 w-8" aria-hidden />
            <span className="text-lg">
              Hack<span className="text-brand">Forge</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">
            The developer-first hackathon platform by BeetleX. Discover events, build with your
            team, and ship real products.
          </p>
          <div className="mt-4 flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-fg"
              >
                <s.icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>
        {FOOTER_LINKS.map((col) => (
          <div key={col.heading}>
            <h3 className="text-sm font-semibold">{col.heading}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted transition-colors hover:text-fg">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} BeetleX. All rights reserved.</p>
          <p>
            Contact:{' '}
            <a href="mailto:team@beetlex.io" className="hover:text-fg">
              team@beetlex.io
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
