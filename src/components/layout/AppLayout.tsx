import { NavLink, Outlet } from 'react-router-dom';
import appIconUrl from '../../../app-icon.jpg';
import { routes } from '../../constants/routes';
import { Icon, type IconName } from '../ui/Icon';

const navItems: Array<{ to: string; label: string; icon: IconName; end?: boolean }> = [
  { to: routes.home, label: 'Accueil', icon: 'home', end: true },
  { to: routes.library, label: 'Bibliothèque', icon: 'library' },
  { to: routes.calendar, label: 'Calendrier', icon: 'calendar' },
  { to: routes.stats, label: 'Stats', icon: 'stats' },
  { to: routes.settings, label: 'Réglages', icon: 'settings' },
];

export function AppLayout() {
  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-20 border-b border-primary/10 bg-background/85 backdrop-blur-xl">
        <div className="app-header-inner mx-auto flex max-w-6xl items-center justify-between gap-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <img src={appIconUrl} alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-card" />
            <h1 className="truncate text-base font-black text-text sm:text-lg">Series Journal</h1>
          </div>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-soft' : 'text-text-soft hover:bg-primary/5'}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="app-main mx-auto max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:pb-12 lg:pt-8">
        <Outlet />
      </main>
      <nav className="app-tabbar fixed inset-x-0 bottom-0 z-20 flex border-t border-primary/10 bg-white/90 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold">
            {({ isActive }) => (
              <>
                <Icon name={item.icon} active={isActive} className={isActive ? 'text-primary' : 'text-text-soft'} />
                <span className={isActive ? 'text-primary' : 'text-text-soft'}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
