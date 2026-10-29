import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ExternalLink, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { signOut } from '../../lib/auth';
import { toggleTheme, useTheme } from '../../lib/theme';
import { Sidebar } from './Sidebar';

const STORE_URL = 'https://mojumder01.github.io/Zorvyn/';

export function Shell({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    document.title = `${title} · Zorvyn Admin`;
  }, [title]);

  useEffect(() => {
    const d = drawer.current;
    if (!d) return;
    if (menuOpen && !d.open) d.showModal();
    if (!menuOpen && d.open) d.close();
  }, [menuOpen]);

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 border-r border-line lg:block">
        <Sidebar />
      </aside>
      <dialog ref={drawer} className="drawer no-print w-72 lg:hidden" aria-label="Menu" onClose={() => setMenuOpen(false)} onClick={(e) => e.target === drawer.current && setMenuOpen(false)}>
        {menuOpen && <Sidebar onNavigate={() => setMenuOpen(false)} />}
      </dialog>

      <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-panel/90 px-4 backdrop-blur sm:px-6">
        <button type="button" onClick={() => setMenuOpen(true)} className="grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-sunken lg:hidden" aria-label="Open menu">
          <Menu className="size-5" aria-hidden />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
        <a href={STORE_URL} target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-sunken hover:text-ink sm:inline-flex">
          View store <ExternalLink className="size-3.5" aria-hidden />
        </a>
        <button type="button" onClick={toggleTheme} className="grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-sunken" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
        </button>
        <button type="button" onClick={signOut} className="grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-sunken" aria-label="Sign out" title="Sign out">
          <LogOut className="size-5" aria-hidden />
        </button>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
        {children}
      </main>
    </div>
  );
}
