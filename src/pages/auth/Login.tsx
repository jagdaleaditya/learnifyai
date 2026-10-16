import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout, GoogleIcon } from '@/components/layout/AuthLayout';
import { GoogleSignInModal } from '@/components/auth/GoogleSignInModal';
import { loginWithGoogle } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/controls';
import { useStore } from '@/lib/store';
import { sleep } from '@/lib/utils';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function FieldError({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{children}</p>;
}

export function Divider({ children }: { children: React.ReactNode }) {
  return <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground"><span className="h-px flex-1 bg-border" />{children}<span className="h-px flex-1 bg-border" /></div>;
}

export default function Login() {
  const { login, user } = useStore();
  const navigate = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = React.useState('aarav.mehta@techsummit.edu');
  const [password, setPassword] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = React.useState<'form' | null>(null);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [googleModal, setGoogleModal] = React.useState(false);

  React.useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.ok) {
        login(res.user.email, true, { name: res.user.name, avatar: res.user.avatar });
        toast.success(`Welcome, ${res.user.name}`, { description: 'Signed in with Google' });
        navigate(loc.state?.from ?? '/dashboard', { replace: true });
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
    if (!validate()) return;
    setLoading('form');
    await sleep(700);
    login(email, remember);
    toast.success(`Welcome back, ${email.split('@')[0]}`);
    navigate(loc.state?.from ?? '/dashboard', { replace: true });
  };

  return (
    <AuthLayout>
      <h2 className="text-[28px] font-bold tracking-tight">Welcome back</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your trainer workspace.</p>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="mt-8 w-full text-sm"
        onClick={handleGoogleClick}
        loading={googleLoading}
        disabled={googleLoading || !!loading}
      >
        {!googleLoading && <GoogleIcon className="h-[18px] w-[18px]" />} Continue with Google
      </Button>
      <Divider>or with email</Divider>

      <GoogleSignInModal
        open={googleModal}
        onOpenChange={setGoogleModal}
        onSuccess={(gEmail, gName, gAvatar) => {
          login(gEmail, true, { name: gName, avatar: gAvatar });
          navigate(loc.state?.from ?? '/dashboard', { replace: true });
        }}
      />

      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" className="pl-9" placeholder="you@institute.edu" value={email}
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(x => ({ ...x, email: undefined })); }}
              aria-invalid={!!errors.email} aria-describedby="email-err" />
          </div>
          <FieldError id="email-err">{errors.email}</FieldError>
        </div>
        <div>
          <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link></div>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" className="px-9" placeholder="••••••••" value={password}
              onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(x => ({ ...x, password: undefined })); }}
              aria-invalid={!!errors.password} aria-describedby="password-err" />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError id="password-err">{errors.password}</FieldError>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"><Checkbox checked={remember} onCheckedChange={v => setRemember(!!v)} /> Remember me for 30 days</label>
        <Button type="submit" variant="gradient" size="lg" className="w-full" loading={loading === 'form'} disabled={!!loading}>{loading === 'form' ? 'Signing in…' : 'Sign in'}</Button>
      </form>

      <p className="mt-6 rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">Demo: any password with 6+ characters works.</p>
      <p className="mt-8 text-center text-sm text-muted-foreground">New to LearnifyAI? <Link to="/register" className="font-semibold text-primary hover:underline">Create an account</Link></p>
    </AuthLayout>
  );
}
