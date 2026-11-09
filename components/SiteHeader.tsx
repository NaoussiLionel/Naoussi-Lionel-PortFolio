'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

const links = [
  { id: 'work', href: '/#work', label: 'PROJECTS' },
  { id: 'expertise', href: '/#expertise', label: 'EXPERTISE' },
  { id: 'about', href: '/#about', label: 'ABOUT' },
  { id: 'contact', href: '/#contact', label: 'CONTACT' },
];

export default function SiteHeader({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  // Highlight the section the visitor is currently reading.
  useEffect(() => {
    const sections = links
      .map(link => document.getElementById(link.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    );
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu with Escape and lock background scrolling.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">SKIP TO CONTENT</a>
      <div className="shell nav-inner">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <span className="brand-mark">S<span>/</span>E</span>
          <span className="brand-copy">{settings.name}<small>{settings.role || 'STRUCTURAL ENGINEER'}</small></span>
        </Link>

        <button
          type="button"
          className="mobile-menu"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(value => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav
          id="primary-nav"
          className={open ? 'nav-links expanded' : 'nav-links'}
          aria-label="Primary"
        >
          {links.map(link => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setOpen(false)}
              className={active === link.id ? 'is-active' : undefined}
              aria-current={active === link.id ? 'location' : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link className="nav-cta" href="/#contact" onClick={() => setOpen(false)}>
            LET’S TALK <ArrowUpRight size={15} />
          </Link>
        </nav>
      </div>

      {open && (
        <button
          type="button"
          className="nav-scrim"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}
