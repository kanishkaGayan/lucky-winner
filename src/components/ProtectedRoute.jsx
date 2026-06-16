import { useEffect, useState } from 'react';
import LoginModal from './LoginModal';

const adminSessionChangeEvent = 'lw-admin-session-change';

function readAuthenticationState() {
  return sessionStorage.getItem('lw_admin_authenticated') === 'true';
}

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readAuthenticationState);

  useEffect(() => {
    const syncSessionState = () => setIsAuthenticated(readAuthenticationState());

    window.addEventListener('storage', syncSessionState);
    window.addEventListener(adminSessionChangeEvent, syncSessionState);

    return () => {
      window.removeEventListener('storage', syncSessionState);
      window.removeEventListener(adminSessionChangeEvent, syncSessionState);
    };
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    window.dispatchEvent(new Event(adminSessionChangeEvent));
  };

  return (
    <div className="relative">
      <div className={isAuthenticated ? '' : 'pointer-events-none select-none blur-sm brightness-50'} aria-hidden={!isAuthenticated}>
        {children}
      </div>
      {!isAuthenticated ? <LoginModal onSuccess={handleAuthenticated} /> : null}
    </div>
  );
}