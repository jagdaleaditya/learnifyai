import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, Bell, Camera, KeyRound, Laptop, LogOut, Monitor, Moon, Palette, Shield, Smartphone, Sun, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, Separator, Switch } from '@/components/ui/controls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog, PageHeader } from '@/components/shared/common';
import { currentUser, techOptions } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { AITab } from './AITab';
import { cn, sleep } from '@/lib/utils';

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-6 py-4"><div><div className="text-sm font-medium">{title}</div>{desc && <div className="text-xs text-muted-foreground">{desc}</div>}</div><div className="shrink-0">{children}</div></div>;
}

export default function Settings() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'profile';
  const { user, theme, toggleTheme } = useStore();
  const [profile, setProfile] = React.useState({ name: user?.name ?? currentUser.name, email: user?.email ?? currentUser.email, phone: currentUser.phone, institute: currentUser.institute, bio: currentUser.bio });
  const [saving, setSaving] = React.useState(false);
  const [prefs, setPrefs] = React.useState({ language: 'Java', version: 'Java 21', level: 'Beginner', duration: '90', autofix: true, naive: true, notesDefault: true });
  const [notif, setNotif] = React.useState({ verifyEmail: true, verifyApp: true, exportEmail: false, exportApp: true, commentsEmail: true, commentsApp: true, weekly: true });
  const [pw, setPw] = React.useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = React.useState('');
  const [twoFA, setTwoFA] = React.useState(false);
  const [twoFAOpen, setTwoFAOpen] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [sessions, setSessions] = React.useState([
    { id: 's1', device: 'Chrome on macOS', where: 'Bengaluru, IN', current: true, icon: Laptop, last: 'Active now' },
    { id: 's2', device: 'Safari on iPhone', where: 'Bengaluru, IN', current: false, icon: Smartphone, last: '2 h ago' },
    { id: 's3', device: 'Edge on Windows', where: 'Pune, IN', current: false, icon: Monitor, last: '5 days ago' },
  ]);
  const [revokeAll, setRevokeAll] = React.useState(false);

  const save = async (what: string) => { setSaving(true); await sleep(700); setSaving(false); toast.success(`${what} saved`); };

  return (
    <div>
      <PageHeader eyebrow="Account" title="Profile & Settings" description="Manage your profile, defaults, notifications and security." />
      <Tabs value={tab} onValueChange={t => setParams({ tab: t })}>
        <div className="overflow-x-auto scrollbar-thin"><TabsList>
          <TabsTrigger value="profile"><User /> Profile</TabsTrigger>
          <TabsTrigger value="preferences"><Palette /> Preferences</TabsTrigger>
          <TabsTrigger value="notifications"><Bell /> Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield /> Security</TabsTrigger>
          <TabsTrigger value="ai"><Bot /> AI & Training</TabsTrigger>
        </TabsList></div>

        <TabsContent value="profile">
          <Card className="max-w-3xl">
            <CardHeader><CardTitle>Public profile</CardTitle><CardDescription>Shown to your team and on exported trainer notes.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative"><Avatar className="h-20 w-20"><AvatarFallback className="text-xl">{user?.initials ?? 'AM'}</AvatarFallback></Avatar><button onClick={() => toast('Photo upload opened')} className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-card bg-primary text-white shadow" aria-label="Change photo"><Camera className="h-3.5 w-3.5" /></button></div>
                <div><div className="font-semibold">{profile.name}</div><div className="text-sm text-muted-foreground">{currentUser.role} · {profile.institute}</div></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {([['name', 'Full name'], ['email', 'Email'], ['phone', 'Phone'], ['institute', 'Institute']] as const).map(([k, l]) => (
                  <div key={k}><Label htmlFor={k}>{l}</Label><Input id={k} className="mt-1.5" value={profile[k]} onChange={e => setProfile(p => ({ ...p, [k]: e.target.value }))} /></div>
                ))}
              </div>
              <div><Label htmlFor="bio">Bio</Label><Textarea id="bio" className="mt-1.5" rows={3} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} /></div>
            </CardContent>
            <CardFooter className="justify-end gap-2 border-t pt-5"><Button variant="outline" onClick={() => setProfile({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone, institute: currentUser.institute, bio: currentUser.bio })}>Cancel</Button><Button variant="gradient" onClick={() => save('Profile')} loading={saving}>Save changes</Button></CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid max-w-3xl gap-4">
            <Card>
              <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {(['light', 'dark'] as const).map(t => (
                  <button key={t} onClick={() => theme !== t && toggleTheme()} className={cn('rounded-xl border p-3 text-left transition', theme === t ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40')}>
                    <div className={cn('flex h-20 gap-1.5 rounded-lg p-2', t === 'dark' ? 'bg-slate-900' : 'bg-slate-100')}><div className="w-1/4 rounded bg-slate-800" /><div className={cn('flex-1 rounded', t === 'dark' ? 'bg-slate-800' : 'bg-white')} /></div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-medium">{t === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}{t === 'dark' ? 'Dark' : 'Light'}</div>
                  </button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Course defaults</CardTitle><CardDescription>Pre-filled in Create Course.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div><Label>Default language</Label><Select value={prefs.language} onValueChange={v => setPrefs(p => ({ ...p, language: v, version: techOptions.find(t => t.language === v)!.versions[0] }))}><SelectTrigger className="mt-1.5" aria-label="Default language"><SelectValue /></SelectTrigger><SelectContent>{techOptions.map(t => <SelectItem key={t.language} value={t.language}>{t.language}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Pinned version</Label><Select value={prefs.version} onValueChange={v => setPrefs(p => ({ ...p, version: v }))}><SelectTrigger className="mt-1.5" aria-label="Default version"><SelectValue /></SelectTrigger><SelectContent>{techOptions.find(t => t.language === prefs.language)!.versions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Default level</Label><Select value={prefs.level} onValueChange={v => setPrefs(p => ({ ...p, level: v }))}><SelectTrigger className="mt-1.5" aria-label="Default level"><SelectValue /></SelectTrigger><SelectContent>{['Beginner', 'Intermediate', 'Advanced'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Default duration</Label><Select value={prefs.duration} onValueChange={v => setPrefs(p => ({ ...p, duration: v }))}><SelectTrigger className="mt-1.5" aria-label="Default duration"><SelectValue /></SelectTrigger><SelectContent>{['45', '60', '90', '120', '180'].map(v => <SelectItem key={v} value={v}>{v} minutes</SelectItem>)}</SelectContent></Select></div>
              </CardContent>
              <CardContent className="divide-y pt-0">
                <Row title="Auto-fix failing snippets" desc="Up to 3 attempts using the failure log"><Switch checked={prefs.autofix} onCheckedChange={v => setPrefs(p => ({ ...p, autofix: v }))} /></Row>
                <Row title="Require a failing naive solution" desc="Exercises must have tests that catch the common mistake"><Switch checked={prefs.naive} onCheckedChange={v => setPrefs(p => ({ ...p, naive: v }))} /></Row>
                <Row title="Include trainer notes by default"><Switch checked={prefs.notesDefault} onCheckedChange={v => setPrefs(p => ({ ...p, notesDefault: v }))} /></Row>
              </CardContent>
              <CardFooter className="justify-end border-t pt-5"><Button variant="gradient" onClick={() => save('Preferences')} loading={saving}>Save preferences</Button></CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="max-w-3xl">
            <CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Choose how we reach you.</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-[1fr_64px_64px] items-center border-b pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><span>Event</span><span className="text-center">Email</span><span className="text-center">In-app</span></div>
              {([['Verification results', 'verifyEmail', 'verifyApp'], ['Exports ready', 'exportEmail', 'exportApp'], ['Comments & reviews', 'commentsEmail', 'commentsApp']] as const).map(([l, e, a]) => (
                <div key={l} className="grid grid-cols-[1fr_64px_64px] items-center border-b py-4 text-sm">
                  <span className="font-medium">{l}</span>
                  <span className="flex justify-center"><Switch checked={notif[e]} onCheckedChange={v => setNotif(n => ({ ...n, [e]: v }))} aria-label={`${l} email`} /></span>
                  <span className="flex justify-center"><Switch checked={notif[a]} onCheckedChange={v => setNotif(n => ({ ...n, [a]: v }))} aria-label={`${l} in-app`} /></span>
                </div>
              ))}
              <Row title="Weekly summary" desc="Courses created, pass rate and exports, every Monday"><Switch checked={notif.weekly} onCheckedChange={v => setNotif(n => ({ ...n, weekly: v }))} /></Row>
            </CardContent>
            <CardFooter className="justify-end border-t pt-5"><Button variant="gradient" onClick={() => save('Notification settings')} loading={saving}>Save</Button></CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ai"><AITab /></TabsContent>

        <TabsContent value="security">
          <div className="grid max-w-3xl gap-4">
            <Card>
              <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {([['current', 'Current password'], ['next', 'New password'], ['confirm', 'Confirm new']] as const).map(([k, l]) => (
                  <div key={k}><Label htmlFor={`pw-${k}`}>{l}</Label><Input id={`pw-${k}`} type="password" className="mt-1.5" value={pw[k]} onChange={e => { setPw(p => ({ ...p, [k]: e.target.value })); setPwErr(''); }} /></div>
                ))}
                {pwErr && <p className="text-xs font-medium text-red-600 sm:col-span-3">{pwErr}</p>}
              </CardContent>
              <CardFooter className="justify-end border-t pt-5">
                <Button variant="gradient" loading={saving} onClick={async () => {
                  if (!pw.current) return setPwErr('Enter your current password');
                  if (pw.next.length < 8) return setPwErr('New password must be at least 8 characters');
                  if (pw.next !== pw.confirm) return setPwErr('Passwords do not match');
                  await save('Password'); setPw({ current: '', next: '', confirm: '' });
                }}><KeyRound /> Update password</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <Row title="Two-factor authentication" desc={twoFA ? 'Enabled with an authenticator app' : 'Add a second step when signing in'}>
                  <div className="flex items-center gap-2">{twoFA && <Badge variant="success">On</Badge>}<Switch checked={twoFA} onCheckedChange={v => { if (v) { setCode(''); setTwoFAOpen(true); } else { setTwoFA(false); toast('Two-factor authentication disabled'); } }} aria-label="Two-factor authentication" /></div>
                </Row>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Active sessions</CardTitle><CardDescription>Devices signed in to your account</CardDescription></div><Button variant="outline" size="sm" onClick={() => setRevokeAll(true)} disabled={sessions.length < 2}><LogOut /> Sign out others</Button></CardHeader>
              <CardContent className="divide-y">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center gap-3 py-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted"><s.icon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-sm font-medium">{s.device}{s.current && <Badge variant="success">This device</Badge>}</div><div className="text-xs text-muted-foreground">{s.where} · {s.last}</div></div>
                    {!s.current && <Button variant="ghost" size="sm" onClick={() => { setSessions(x => x.filter(y => y.id !== s.id)); toast.success('Session revoked', { description: s.device }); }}>Revoke</Button>}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Separator />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={twoFAOpen} onOpenChange={setTwoFAOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set up two-factor authentication</DialogTitle><DialogDescription>Scan the code with your authenticator app, then enter the 6-digit code.</DialogDescription></DialogHeader>
          <div className="mx-auto grid h-40 w-40 grid-cols-8 gap-0.5 rounded-xl border bg-white p-3">{Array.from({ length: 64 }, (_, i) => <span key={i} className={cn('rounded-[1px]', (i * 37 + (i >> 3) * 11) % 5 < 2 ? 'bg-slate-900' : 'bg-white')} />)}</div>
          <Input inputMode="numeric" maxLength={6} placeholder="123456" className="text-center font-mono text-lg tracking-[0.5em]" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} aria-label="Verification code" />
          <DialogFooter><Button variant="outline" onClick={() => setTwoFAOpen(false)}>Cancel</Button><Button variant="gradient" disabled={code.length !== 6} onClick={() => { setTwoFA(true); setTwoFAOpen(false); toast.success('Two-factor authentication enabled'); }}>Verify & enable</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={revokeAll} onOpenChange={setRevokeAll} title="Sign out all other sessions?" description="Every device except this one will be signed out immediately." confirmLabel="Sign out others" destructive
        onConfirm={() => { setSessions(s => s.filter(x => x.current)); toast.success('Other sessions signed out'); }} />
    </div>
  );
}
