import { useState } from 'react';

const adminSessionChangeEvent = 'lw-admin-session-change';

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

export default function LoginModal({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const expectedUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'luckywinner2025';
    const submittedUsername = username.trim();
    const submittedPassword = password.trim();

    if (submittedUsername === expectedUsername && submittedPassword === expectedPassword) {
      sessionStorage.setItem('lw_admin_authenticated', 'true');
      window.dispatchEvent(new Event(adminSessionChangeEvent));
      onSuccess?.();
      setLoading(false);
      return;
    }

    setError('❌ Incorrect username or password. Please try again.');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex min-h-dvh items-stretch justify-center bg-slate-950/90 px-0 py-0 backdrop-blur-md sm:items-center sm:px-4 sm:py-6">
      <div className="flex min-h-full w-full items-center justify-center sm:min-h-0">
        <div className="flex h-full w-full max-w-none flex-col justify-center rounded-none border-0 bg-slate-950/98 px-5 py-8 shadow-[0_0_70px_rgba(0,0,0,0.55)] sm:h-auto sm:max-w-sm sm:rounded-[2rem] sm:border sm:border-white/10 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-300/30 bg-gold-gradient text-slate-950 shadow-glow">
              🎰
            </div>
            <h2 className="font-orbitron text-3xl font-extrabold tracking-wide text-gold-300">Lucky Winner</h2>
            <p className="mt-2 text-sm text-white/70">Admin Access Only</p>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-lg font-semibold text-white">Admin Access Only</p>
            <p className="text-sm leading-6 text-white/70">This portal is restricted to authorized administrators.</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="lucky-label" htmlFor="admin-username">
                Username
              </label>
              <input
                id="admin-username"
                className="lucky-input text-base"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
                disabled={loading}
              />
            </div>

            <div>
              <label className="lucky-label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                className="lucky-input text-base"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                disabled={loading}
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button type="submit" className="lucky-button w-full min-h-11" disabled={loading}>
              <span className="flex items-center justify-center gap-2">
                {loading ? <Spinner /> : null}
                {loading ? 'Logging in...' : 'Login'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}