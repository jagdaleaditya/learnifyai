import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sleep } from '@/lib/utils';
import { EMAIL_RE, FieldError } from './Login';

export default function ForgotPassword() {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) { setError(email ? 'Enter a valid email address' : 'Email is required'); return; }
    setLoading(true);
    await sleep(1000);
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthLayout>
      {sent ? (
        <div className="text-center">
          <div className="relative mx-auto grid h-20 w-20 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/20" />
            <span className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-50 to-violet-100 text-primary dark:from-indigo-500/15 dark:to-violet-500/20"><MailCheck className="h-9 w-9" /></span>
          </div>
          <h2 className="mt-6 text-[26px] font-bold tracking-tight">Check your inbox</h2>
          <p className="mt-2 text-sm text-muted-foreground">We sent a reset link to <span className="font-semibold text-foreground">{email}</span>. It expires in 30 minutes.</p>
          <Button variant="gradient" size="lg" className="mt-8 w-full" asChild><a href="mailto:">Open email app</a></Button>
          <p className="mt-6 text-sm text-muted-foreground">Didn’t get it? <button className="font-semibold text-primary hover:underline" onClick={() => toast.success('Reset link sent again')}>Resend email</button></p>
          <Link to="/login" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        </div>
      ) : (
        <>
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><Mail className="h-5 w-5" /></div>
          <h2 className="mt-6 text-[28px] font-bold tracking-tight">Forgot password?</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Enter the email you use for LearnifyAI and we’ll send you a reset link.</p>
          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            <div>
              <Label htmlFor="femail">Email</Label>
              <Input id="femail" type="email" className="mt-1.5" placeholder="you@institute.edu" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} aria-invalid={!!error} autoFocus />
              <FieldError id="femail-err">{error}</FieldError>
            </div>
            <Button type="submit" variant="gradient" size="lg" className="w-full" loading={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button>
          </form>
          <Link to="/login" className="mt-8 inline-flex items-center gap-1.5 self-center text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        </>
      )}
    </AuthLayout>
  );
}
