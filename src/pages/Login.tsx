import { useState, type FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import { Logo } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { DEMO_EMAIL, DEMO_PASSWORD, signIn } from '../lib/auth';

export function Login() {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!signIn(email, password)) setError('Wrong email or password. Use the demo account shown below.');
  };

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-sm">
          <div>
            <h1 className="text-xl font-bold">Sign in</h1>
            <p className="mt-1 text-sm text-ink-2">Manage orders, products and stock for the Zorvyn store.</p>
          </div>
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
          </Field>
          <Field label="Password" htmlFor="password" error={error}>
            <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} aria-describedby={error ? 'password-error' : undefined} />
          </Field>
          <Button type="submit" variant="primary" className="w-full">
            <LogIn className="size-4" aria-hidden /> Sign in
          </Button>
          <p className="rounded-lg bg-sunken p-3 text-xs leading-relaxed text-ink-2">
            <span className="font-semibold text-ink">Demo account</span> (already filled in): {DEMO_EMAIL} / {DEMO_PASSWORD}. This is a portfolio demo — there is no server and no real data.
          </p>
        </form>
      </div>
    </main>
  );
}
