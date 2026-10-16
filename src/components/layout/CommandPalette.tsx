import { useNavigate } from 'react-router-dom';
import { Moon, Plus, ShieldCheck, Download, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { StatusBadge } from '@/components/shared/status';
import { useStore } from '@/lib/store';
import { NAV } from './AppLayout';

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const { courses, toggleTheme, logout } = useStore();
  const go = (to: string) => { onOpenChange(false); navigate(to); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="top-[18%] max-w-xl translate-y-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command loop>
          <CommandInput placeholder="Type a command or search…" autoFocus />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick actions">
              <CommandItem onSelect={() => go('/courses/new')}><Plus /> Create new course</CommandItem>
              <CommandItem onSelect={() => go('/verification')}><ShieldCheck /> Run code verification</CommandItem>
              <CommandItem onSelect={() => go('/exports')}><Download /> Export course package</CommandItem>
              <CommandItem onSelect={() => { toggleTheme(); onOpenChange(false); }}><Moon /> Toggle dark mode</CommandItem>
            </CommandGroup>
            <CommandGroup heading="Courses">
              {courses.slice(0, 8).map(c => (
                <CommandItem key={c.id} value={`course ${c.title} ${c.language}`} onSelect={() => go(`/studio/${c.id}`)}>
                  <span className="h-4 w-4 shrink-0 rounded" style={{ background: `linear-gradient(135deg, ${c.accent[0]}, ${c.accent[1]})` }} />
                  <span className="flex-1 truncate">{c.title}</span>
                  <StatusBadge status={c.status} />
                </CommandItem>
              ))}
            </CommandGroup>
            {NAV.map(g => (
              <CommandGroup key={g.group} heading={g.group}>
                {g.items.map(i => <CommandItem key={i.to} value={`${g.group} ${i.label}`} onSelect={() => go(i.to)}><i.icon /> {i.label}</CommandItem>)}
              </CommandGroup>
            ))}
            <CommandGroup heading="Account">
              <CommandItem value="logout sign out" onSelect={() => { logout(); go('/login'); }}><LogOut /> Log out</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
