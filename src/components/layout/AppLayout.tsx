import * as React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, BookOpen, ChevronsLeft, CircleArrowUp, Download, FileChartColumn, LayoutDashboard, LibraryBig, LifeBuoy, LogOut, Menu,
  Moon, Palette, Plus, Presentation, Search, Settings, ShieldCheck, Sparkles, Sun, Target, User, Users, WandSparkles, X, CheckCheck,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import { cn, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo, PageSkeleton } from '@/components/shared/common';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/controls';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/misc';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tip } from '@/components/ui/tooltip';
import { CommandPalette } from './CommandPalette';
import { AssistantPanel } from './AssistantPanel';
import { useApi } from '@/lib/api';

export const NAV: { group: string; items: { to: string; label: string; icon: LucideIcon; match?: string }[] }[] = [
  { group: 'Workspace', items: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/courses/new', label: 'Create Course', icon: WandSparkles },
    { to: '/studio/java-oop', label: 'Course Studio', icon: Presentation, match: '/studio' },
  ] },
  { group: 'Intelligence', items: [
    { to: '/verification', label: 'Code Verification', icon: ShieldCheck },
    { to: '/reports', label: 'Verification Reports', icon: FileChartColumn },
    { to: '/upgrades', label: 'Version Upgrades', icon: CircleArrowUp },
    { to: '/coverage', label: 'Syllabus Coverage', icon: Target },
  ] },
  { group: 'Resources', items: [
    { to: '/resources', label: 'Resource Library', icon: LibraryBig },
    { to: '/brand-kit', label: 'Brand Kit', icon: Palette },
    { to: '/exports', label: 'Exports & Downloads', icon: Download },
  ] },
  { group: 'Account', items: [
    { to: '/settings', label: 'Profile & Settings', icon: Settings },
    { to: '/team', label: 'Team & Collaboration', icon: Users },
    { to: '/help', label: 'Help & Support', icon: LifeBuoy },
  ] },
];

function isActive(pathname: string, to: string, match?: string) {
  if (match) return pathname.startsWith(match);
  if (to === '/courses') return pathname === '/courses';
  return pathname === to || pathname.startsWith(to + '/');
}

function Sidebar({ collapsed, onToggle, onNavigate, mobile }: { collapsed: boolean; onToggle?: () => void; onNavigate?: () => void; mobile?: boolean }) {
  const { pathname } = useLocation();
  return (
    <aside className={cn('flex h-full flex-col border-r bg-sidebar text-sidebar-fg', collapsed ? 'w-[76px]' : 'w-[264px]', 'transition-[width] duration-300')}>
      <div className={cn('flex h-16 shrink-0 items-center gap-2 border-b', collapsed ? 'justify-center px-2' : 'px-5')}>
        <Logo compact={collapsed} className="min-w-0" />
        {mobile && <button onClick={onNavigate} aria-label="Close menu" className="ml-auto rounded-md p-1.5 text-slate-500 hover:bg-sidebar-hover hover:text-slate-900"><X className="h-5 w-5" /></button>}
      </div>
      {!collapsed && (
        <div className="px-5 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
            <span className="ping-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> Trainer Portal
          </span>
        </div>
      )}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {NAV.map(g => (
          <div key={g.group} className="mb-5">
            {collapsed ? <div className="mx-auto mb-2 h-px w-6 bg-border" /> : <div className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">{g.group}</div>}
            <ul className="space-y-0.5">
              {g.items.map(item => {
                const active = isActive(pathname, item.to, item.match);
                const link = (
                  <NavLink to={item.to} onClick={onNavigate}
                    className={cn('group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-all',
                      collapsed && 'justify-center px-0',
                      active ? 'bg-primary text-white shadow-md shadow-indigo-500/30' : 'text-sidebar-fg hover:bg-sidebar-hover hover:text-slate-900')}>
                    <item.icon className={cn('h-[18px] w-[18px] shrink-0 transition-transform duration-300 group-hover:scale-110', active ? 'text-white' : 'text-slate-400 group-hover:text-slate-900')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
                return <li key={item.to}>{collapsed ? <Tip label={item.label} side="right">{link}</Tip> : link}</li>;
              })}
            </ul>
          </div>
        ))}
      </nav>
      {!mobile && onToggle && (
        <div className="shrink-0 border-t p-3">
          <button onClick={onToggle} className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-slate-500 transition hover:bg-sidebar-hover hover:text-slate-900', collapsed && 'justify-center px-0')} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <ChevronsLeft className={cn('h-[18px] w-[18px] transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && 'Collapse'}
          </button>
        </div>
      )}
    </aside>
  );
}

function Notifications() {
  const { notifications, markAllRead } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const unread = notifications.filter(n => n.unread).length;
  const tone: Record<string, string> = { success: 'bg-emerald-500', warning: 'bg-amber-500', info: 'bg-blue-500', default: 'bg-slate-400' };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell />
          {unread > 0 && <span key={unread} className="animate-in zoom-in-50 duration-300 absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-card">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-semibold">Notifications</div>
          <button onClick={() => { markAllRead(); toast.success('All notifications marked as read'); }} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50" disabled={!unread}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        </div>
        <ul className="max-h-[360px] overflow-auto py-1">
          {notifications.map(n => (
            <li key={n.id}>
              <button onClick={() => { setOpen(false); navigate(n.href); }} className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-muted">
                <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', tone[n.tone], !n.unread && 'opacity-30')} />
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-sm', n.unread ? 'font-semibold' : 'font-medium text-muted-foreground')}>{n.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{n.body}</span>
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(n.at)}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t p-2"><Button variant="ghost" size="sm" className="w-full" onClick={() => { setOpen(false); navigate('/settings?tab=notifications'); }}>Notification settings</Button></div>
      </PopoverContent>
    </Popover>
  );
}

export function AppLayout() {
  const { user, logout, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = React.useState(() => { try { return localStorage.getItem('learnify-sidebar') === '1'; } catch { return false; } });
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [assistantOpen, setAssistantOpen] = React.useState(false);
  const { online } = useApi();
  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => { try { localStorage.setItem('learnify-sidebar', collapsed ? '1' : '0'); } catch { /* ignore */ } }, [collapsed]);
  React.useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); setMobileOpen(false); }, [pathname]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(o => !o); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  const fullBleed = pathname.startsWith('/studio');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden shrink-0 lg:block"><Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} /></div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in-0" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 shadow-2xl animate-in slide-in-from-left duration-300"><Sidebar collapsed={false} mobile onNavigate={() => setMobileOpen(false)} /></div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-card/80 px-3 backdrop-blur-xl sm:gap-3 sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></Button>
          <button onClick={() => setPaletteOpen(true)} className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-lg border bg-background px-3 text-sm text-muted-foreground shadow-sm transition hover:border-primary/40 sm:max-w-md" aria-label="Search (Ctrl+K)">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Search courses, pages, actions…</span>
            <kbd className="ml-auto hidden items-center gap-0.5 rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium sm:inline-flex">{isMac ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button onClick={() => navigate('/settings?tab=ai')} className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition hover:bg-muted md:inline-flex ${online ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`} aria-label="AI status">
              <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-500' : online === false ? 'bg-slate-400' : 'bg-amber-400'}`} />{online ? 'AI live' : online === false ? 'Sample mode' : 'Checking…'}
            </button>
            <Tip label="AI assistant"><Button variant="ghost" size="icon" onClick={() => setAssistantOpen(true)} aria-label="AI assistant"><Sparkles /></Button></Tip>
            <Tip label={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? <Sun /> : <Moon />}</Button>
            </Tip>
            <Notifications />
            <Button variant="gradient" className="hidden sm:inline-flex" onClick={() => navigate('/courses/new')}><Plus /> New Course</Button>
            <Button variant="gradient" size="icon" className="sm:hidden" onClick={() => navigate('/courses/new')} aria-label="New course"><Plus /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu">
                <Avatar>
                  {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback>{user?.initials ?? 'AM'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex items-center gap-3 py-2 font-normal">
                  <Avatar className="h-9 w-9">
                    {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback>{user?.initials ?? 'AM'}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-foreground">{user?.name}</span><span className="block truncate text-xs">{user?.email}</span></span>
                </DropdownMenuLabel>
                <div className="px-2 pb-1.5"><Badge variant="default">{user?.role} · {user?.institute}</Badge></div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/settings')}><User /> Profile</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/settings?tab=preferences')}><Settings /> Settings</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/help')}><LifeBuoy /> Help & Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={() => { logout(); toast('Signed out', { description: 'See you next session.' }); navigate('/login'); }}><LogOut /> Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main ref={mainRef} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
          <div className={cn('mx-auto w-full animate-fade-up', !fullBleed && 'page-enter', fullBleed ? 'max-w-[1600px] p-3 sm:p-5' : 'max-w-[1400px] p-4 sm:p-6 lg:p-8')} key={pathname}>
            <React.Suspense fallback={<PageSkeleton />}><Outlet /></React.Suspense>
          </div>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <AssistantPanel open={assistantOpen} onOpenChange={setAssistantOpen} />
    </div>
  );
}
