import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout, GoogleIcon } from '@/components/layout/AuthLayout';
import { GoogleSignInModal } from '@/components/auth/GoogleSignInModal';
import { loginWithGoogle } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/controls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { cn, sleep } from '@/lib/utils';
import { Divider, EMAIL_RE, FieldError } from './Login';

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

export default function Register() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [f, setF] = React.useState({ name: '', email: '', institute: '', role: '', password: '', confirm: '' });
  const [terms, setTerms] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [googleModal, setGoogleModal] = React.useState(false);
  const s = strength(f.password);

  const set = (k: keyof typeof f) => (v: string) => { setF(x => ({ ...x, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })); };

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.ok) {
        login(res.user.email, true, { name: res.user.name, avatar: res.user.avatar });
        toast.success(`Welcome, ${res.user.name}`, { description: 'Signed in with Google' });
        navigate('/dashboard');
        return;
      }
      if (res.code === 'auth/popup-closed-by-user') {
        return;
      }
      toast.error(res.error || 'Google sign-in was not completed');
      setGoogleModal(true);
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in error');
      setGoogleModal(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = 'Enter your full name';
    if (!EMAIL_RE.test(f.email)) e.email = 'Enter a valid email address';
    if (!f.institute.trim()) e.institute = 'Institute name is required';
    if (!f.role) e.role = 'Choose your role';
    if (s < 2 || f.password.length < 8) e.password = 'Use 8+ characters with a mix of letters and numbers';
    if (f.confirm !== f.password || !f.confirm) e.confirm = 'Passwords do not match';
    if (!terms) e.terms = 'Please accept the terms to continue';
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    setLoading(true);
    await sleep(1100);
    login(f.email, true, { name: f.name, role: f.role, institute: f.institute });
    toast.success('Account created', { description: `Welcome to LearnifyAI, ${f.name.split(' ')[0]}!` });
    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <h2 className="text-[28px] font-bold tracking-tight">Create your account</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">Start building verified course material in minutes.</p>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="mt-7 w-full text-sm"
        onClick={handleGoogleClick}
        loading={googleLoading}
        disabled={googleLoading || loading}
      >
        {!googleLoading && <GoogleIcon className="h-[18px] w-[18px]" />} Sign up with Google
      </Button>
      <Divider>or</Divider>

      <GoogleSignInModal
        open={googleModal}
        onOpenChange={setGoogleModal}
        onSuccess={(gEmail, gName, gAvatar) => {
          login(gEmail, true, { name: gName, avatar: gAvatar });
          navigate('/dashboard');
        }}
      />
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" className="mt-1.5" placeholder="Aarav Mehta" value={f.name} onChange={e => set('name')(e.target.value)} aria-invalid={!!errors.name} />
          <FieldError id="name-err">{errors.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="remail">Work email</Label>
          <Input id="remail" type="email" className="mt-1.5" placeholder="you@institute.edu" value={f.email} onChange={e => set('email')(e.target.value)} aria-invalid={!!errors.email} />
          <FieldError id="email-err">{errors.email}</FieldError>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="inst">Institute</Label>
            <Input id="inst" className="mt-1.5" placeholder="TechSummit Institute" value={f.institute} onChange={e => set('institute')(e.target.value)} aria-invalid={!!errors.institute} />
            <FieldError id="inst-err">{errors.institute}</FieldError>
          </div>
          <div>
            <Label>Role</Label>
            <Select value={f.role} onValueChange={set('role')}>
              <SelectTrigger className={cn('mt-1.5', errors.role && 'border-destructive')} aria-label="Role"><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent><SelectItem value="trainer">Trainer</SelectItem><SelectItem value="admin">Institute Admin</SelectItem></SelectContent>
            </Select>
            <FieldError id="role-err">{errors.role}</FieldError>
          </div>
        </div>
        <div>
          <Label htmlFor="rpw">Password</Label>
          <div className="relative mt-1.5">
            <Input id="rpw" type={show ? 'text' : 'password'} className="pr-10" placeholder="At least 8 characters" value={f.password} onChange={e => set('password')(e.target.value)} aria-invalid={!!errors.password} />
            <button type="button" onClick={() => setShow(x => !x)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          {f.password && (
            <div className="mt-2">
              <div className="flex gap-1">{[0, 1, 2, 3].map(i => <span key={i} className={cn('h-1.5 flex-1 rounded-full bg-muted transition-colors', i < s && COLORS[s])} />)}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{LABELS[s]}</span>
                {[['8+ chars', f.password.length >= 8], ['Aa', /[A-Z]/.test(f.password) && /[a-z]/.test(f.password)], ['123', /\d/.test(f.password)], ['#?!', /[^A-Za-z0-9]/.test(f.password)]].map(([l, ok]) => (
                  <span key={l as string} className={cn('inline-flex items-center gap-0.5', ok && 'text-emerald-600 dark:text-emerald-400')}><Check className="h-3 w-3" />{l}</span>
                ))}
              </div>
            </div>
          )}
          <FieldError id="pw-err">{errors.password}</FieldError>
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type={show ? 'text' : 'password'} className="mt-1.5" value={f.confirm} onChange={e => set('confirm')(e.target.value)} aria-invalid={!!errors.confirm} />
          <FieldError id="confirm-err">{errors.confirm}</FieldError>
        </div>
        <div>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
            <Checkbox className="mt-0.5" checked={terms} onCheckedChange={v => { setTerms(!!v); setErrors(e => ({ ...e, terms: '' })); }} />
            <span>I agree to the <a href="#terms" onClick={e => e.preventDefault()} className="font-medium text-primary hover:underline">Terms of Service</a> and <a href="#privacy" onClick={e => e.preventDefault()} className="font-medium text-primary hover:underline">Privacy Policy</a></span>
          </label>
          <FieldError id="terms-err">{errors.terms}</FieldError>
        </div>
        <Button type="submit" variant="gradient" size="lg" className="w-full" loading={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
    </AuthLayout>
  );
}
