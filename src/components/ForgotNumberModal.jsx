import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

export default function ForgotNumberModal({ isOpen, onClose }) {
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundUid, setFoundUid] = useState('');

  const isSuccess = Boolean(foundUid);
  const telephonePattern = useMemo(() => /^\+?[0-9\s()-]{7,20}$/, []);

  useEffect(() => {
    if (!isOpen) {
      setTelephone('');
      setLoading(false);
      setError('');
      setFoundUid('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = () => {
    onClose();
  };

  const handleModalClick = (event) => {
    event.stopPropagation();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedTelephone = telephone.trim();

    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Add the VITE_FIREBASE_* values to your .env file.');
      return;
    }

    if (!trimmedTelephone) {
      setError('Please enter your registered phone number.');
      return;
    }

    if (!telephonePattern.test(trimmedTelephone)) {
      setError('Please enter a valid telephone number.');
      return;
    }

    setLoading(true);
    try {
      const participantsQuery = query(
        collection(db, 'participants'),
        where('telephone', '==', trimmedTelephone)
      );
      const snapshot = await getDocs(participantsQuery);
      const match = snapshot.docs[0]?.data();

      if (!match?.uid) {
        setError('❌ No registration found for this phone number. Please check and try again.');
        setFoundUid('');
        return;
      }

      setFoundUid(String(match.uid).padStart(4, '0'));
    } catch {
      setError('❌ No registration found for this phone number. Please check and try again.');
      setFoundUid('');
    } finally {
      setLoading(false);
    }
  };

  const closeAndReset = () => {
    setTelephone('');
    setLoading(false);
    setError('');
    setFoundUid('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-950/80 px-0 py-0 backdrop-blur-md sm:items-center sm:px-4 sm:py-8"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="relative flex h-full w-full max-w-none flex-col justify-center rounded-none border-0 bg-slate-950/95 p-5 shadow-[0_0_60px_rgba(0,0,0,0.55)] sm:h-auto sm:max-w-sm sm:rounded-[2rem] sm:border sm:border-white/10 sm:p-8"
        onClick={handleModalClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-number-title"
      >
        <button
          type="button"
          onClick={closeAndReset}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-white/70 transition hover:border-gold-300/50 hover:text-white"
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="space-y-2 pr-10">
          <h2 id="forgot-number-title" className="font-orbitron text-2xl font-bold text-gold-300 sm:text-3xl">
            🔍 Find Your Lucky Number
          </h2>
          <p className="text-sm leading-6 text-white/70 sm:text-base">Enter the telephone number you registered with</p>
        </div>

        {!isSuccess ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="lucky-label" htmlFor="forgot-telephone">
                Telephone Number
              </label>
              <input
                id="forgot-telephone"
                className="lucky-input"
                type="tel"
                required
                disabled={loading}
                value={telephone}
                onChange={(event) => setTelephone(event.target.value)}
                placeholder="Enter your registered phone number"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button type="submit" className="lucky-button min-h-11 w-full" disabled={loading}>
              <span className="flex items-center justify-center gap-2">
                {loading ? <Spinner /> : null}
                {loading ? 'Finding...' : 'Find My Number'}
              </span>
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-green-300">✅ Your Lucky Number Is:</p>
            <div className="mx-auto inline-flex rounded-[2rem] border border-green-300/30 bg-green-400/10 px-6 py-4 shadow-neon">
              <span className="font-orbitron text-5xl font-extrabold tracking-[0.4em] text-green-300 sm:text-6xl">
                {foundUid}
              </span>
            </div>
            <p className="text-base font-semibold text-white sm:text-lg">Good luck! 🍀</p>
            <button type="button" className="lucky-button min-h-11 w-full" onClick={closeAndReset}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}