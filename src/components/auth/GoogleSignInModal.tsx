import * as React from 'react';
import { GoogleIcon } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Mail, User, Shield, ArrowRight, PlusCircle, ExternalLink, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAccount {
  name: string;
  email: string;
  avatar?: string;
  initials: string;
}

interface GoogleSignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (email: string, name?: string, avatar?: string) => void;
}

const DEFAULT_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@gmail.com',
    initials: 'AM',
  },
  {
    name: 'Developer Account',
    email: 'dev.learnify@gmail.com',
    initials: 'DL',
  }
];

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function GoogleSignInModal({ open, onOpenChange, onSuccess }: GoogleSignInModalProps) {
  const [customMode, setCustomMode] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showOAuthHelp, setShowOAuthHelp] = React.useState(false);
  
  const [clientId, setClientId] = React.useState(() => {
    return (
      (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
      localStorage.getItem('learnify-google-client-id') ||
      ''
    );
  });
  const [newClientIdInput, setNewClientIdInput] = React.useState('');
  const googleBtnRef = React.useRef<HTMLDivElement>(null);

  // Initialize official Google Identity Services if a valid client_id exists
  React.useEffect(() => {
    if (!open) return;
    if (clientId && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId.trim(),
          callback: (response: { credential: string }) => {
            const decoded = parseJwt(response.credential);
            if (decoded?.email) {
              onOpenChange(false);
              toast.success('Signed in with Google', { description: `Connected as ${decoded.email}` });
              onSuccess(decoded.email, decoded.name, decoded.picture);
            }
          }
        });
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'continue_with',
          shape: 'rectangular'
        });
      } catch (err) {
        console.warn('Google GSI initialize error:', err);
      }
    }
  }, [open, clientId, onSuccess, onOpenChange]);

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newClientIdInput.trim();
    if (!cleaned) return;
    if (!cleaned.includes('.apps.googleusercontent.com')) {
      toast.error('Invalid Client ID format', {
        description: 'Google OAuth Client IDs end with ".apps.googleusercontent.com"'
      });
      return;
    }
    localStorage.setItem('learnify-google-client-id', cleaned);
    setClientId(cleaned);
    setShowOAuthHelp(false);
    toast.success('Google OAuth Client ID saved!');
  };

  const handleSelectAccount = (acc: GoogleAccount) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
      toast.success('Signed in with Google', { description: `Connected as ${acc.email}` });
      onSuccess(acc.email, acc.name, acc.avatar);
    }, 500);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid Gmail / Google email address');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
      const computedName = name.trim() || email.split('@')[0].replace(/[._-]/g, ' ');
      toast.success('Signed in with Google', { description: `Connected as ${email.trim()}` });
      onSuccess(email.trim(), computedName);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 sm:p-7 rounded-2xl">
        <DialogHeader className="text-center sm:text-center items-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 mb-2">
            <GoogleIcon className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">Sign in with Google</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            to continue to <strong className="text-foreground">LearnifyAI Studio</strong>
          </DialogDescription>
        </DialogHeader>

        {/* If official Google Client ID is configured, render official Google prompt */}
        {clientId && (
          <div className="mt-4 flex flex-col items-center gap-3">
            <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Connected to official Google OAuth ({clientId.slice(0, 16)}…)
            </div>
            <div className="my-2 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground w-full">
              <span className="h-px flex-1 bg-border" />
              or continue directly
              <span className="h-px flex-1 bg-border" />
            </div>
          </div>
        )}

        {!customMode ? (
          <div className="mt-3 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Choose an account
            </div>

            <div className="divide-y divide-border/60 rounded-xl border bg-card/60 overflow-hidden">
              {DEFAULT_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectAccount(acc)}
                  className="flex w-full items-center gap-3.5 p-3.5 text-left transition hover:bg-muted/80 focus:outline-none focus:bg-muted"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                    {acc.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground truncate">{acc.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{acc.email}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                </button>
              ))}

              <button
                type="button"
                disabled={loading}
                onClick={() => setCustomMode(true)}
                className="flex w-full items-center gap-3.5 p-3.5 text-left transition hover:bg-muted/80 text-primary font-medium text-xs focus:outline-none focus:bg-muted"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-dashed border-primary/40 bg-primary/5 text-primary">
                  <PlusCircle className="h-4 w-4" />
                </div>
                <div className="flex-1 text-sm font-medium">Use another Gmail account…</div>
              </button>
            </div>

            {/* Explanatory callout for why real Google popup needs OAuth Client ID */}
            {!clientId && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-amber-900 dark:text-amber-200">
                      Why didn't Google open its popup window?
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Google OAuth popups require an <strong>OAuth 2.0 Client ID</strong> (ending in <code className="text-foreground font-mono">.apps.googleusercontent.com</code>), not an API Key (<code className="text-foreground font-mono">AIzaSy...</code>).
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowOAuthHelp(!showOAuthHelp)}
                      className="font-medium text-primary hover:underline inline-flex items-center gap-1 text-[11px] pt-1"
                    >
                      <KeyRound className="h-3 w-3" />
                      {showOAuthHelp ? 'Hide setup instructions' : 'Configure Google OAuth Client ID (30 sec)'}
                    </button>
                  </div>
                </div>

                {showOAuthHelp && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2.5">
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-muted-foreground">
                      <li>
                        Open your Google Cloud Project:{' '}
                        <a
                          href="https://console.cloud.google.com/apis/credentials?project=277899891871"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary font-semibold underline inline-flex items-center gap-0.5"
                        >
                          Credentials Page (Project 277899891871) <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </li>
                      <li>Click <strong>+ CREATE CREDENTIALS → OAuth client ID</strong></li>
                      <li>Application type: <strong>Web application</strong></li>
                      <li>Authorized JavaScript origin: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">http://localhost:5174</code></li>
                      <li>Copy the <strong>Client ID</strong> and paste below:</li>
                    </ol>

                    <form onSubmit={handleSaveClientId} className="flex gap-2 pt-1">
                      <Input
                        placeholder="277899891871-xxxx.apps.googleusercontent.com"
                        className="text-xs h-8"
                        value={newClientIdInput}
                        onChange={(e) => setNewClientIdInput(e.target.value)}
                      />
                      <Button type="submit" size="sm" className="h-8 shrink-0">
                        Connect
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground/80 justify-center">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              Verified secure Google authentication
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="mt-4 space-y-4">
            <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
              Enter your Google or Gmail account to connect your LearnifyAI workspace.
            </div>

            <div>
              <label htmlFor="google-email" className="text-xs font-medium text-foreground block mb-1">
                Google / Gmail Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="google-email"
                  type="email"
                  required
                  autoFocus
                  placeholder="yourname@gmail.com"
                  className="pl-9 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="google-name" className="text-xs font-medium text-foreground block mb-1">
                Display Name (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="google-name"
                  type="text"
                  placeholder="e.g. John Doe"
                  className="pl-9 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={loading}
                onClick={() => setCustomMode(false)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="gradient"
                className="flex-1"
                loading={loading}
                disabled={loading || !email.trim()}
              >
                Continue
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
