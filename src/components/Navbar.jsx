import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

const adminSessionChangeEvent = 'lw-admin-session-change';

function readAuthenticationState() {
  return sessionStorage.getItem('lw_admin_authenticated') === 'true';
}

const linkClass = ({ isActive }) =>
  [
    'inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold transition duration-300',
    isActive ? 'bg-white/10 text-gold-300 shadow-[0_0_18px_rgba(245,197,24,0.22)]' : 'text-white/80 hover:text-white hover:bg-white/5'
  ].join(' ');

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(readAuthenticationState);
  const menuRef = useRef(null);
  const showRegisterLink = location.pathname !== '/winner';

  useEffect(() => {
    const syncSessionState = () => setIsAuthenticated(readAuthenticationState());

    window.addEventListener('storage', syncSessionState);
    window.addEventListener(adminSessionChangeEvent, syncSessionState);

    return () => {
      window.removeEventListener('storage', syncSessionState);
      window.removeEventListener(adminSessionChangeEvent, syncSessionState);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('lw_admin_authenticated');
    window.dispatchEvent(new Event(adminSessionChangeEvent));
    setIsMenuOpen(false);
    navigate('/winner', { replace: true });
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8" ref={menuRef}>
        <Link to="/register" className="flex items-center gap-3 font-orbitron text-lg font-bold tracking-wide text-gold-300">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gold-300/30 bg-gold-gradient text-slate-950 shadow-glow">
            🎰
          </span>
          <span className="hidden sm:inline">Lucky Winner</span>
        </Link>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-white transition hover:border-gold-300/40 hover:bg-white/10 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
        >
          ☰
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {showRegisterLink ? (
            <NavLink to="/register" className={linkClass}>
              Register
            </NavLink>
          ) : null}
          <NavLink to="/winner" className={linkClass}>
            Winner Draw
          </NavLink>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-rose-300/30 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/10 hover:text-white"
            >
              Logout
            </button>
          ) : null}
        </nav>

        {isMenuOpen ? (
          <div className="absolute left-0 right-0 top-full border-b border-white/10 bg-slate-950/95 px-4 py-4 shadow-2xl backdrop-blur-xl md:hidden">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
              {showRegisterLink ? (
                <NavLink to="/register" className={linkClass} onClick={closeMenu}>
                  Register
                </NavLink>
              ) : null}
              <NavLink to="/winner" className={linkClass} onClick={closeMenu}>
                Winner Draw
              </NavLink>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-rose-300/30 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/10 hover:text-white"
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
