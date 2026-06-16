import { useEffect, useMemo, useRef, useState } from 'react';
import { onSnapshot, runTransaction } from 'firebase/firestore';
import CountdownTimer from '../components/CountdownTimer';
import ForgotNumberModal from '../components/ForgotNumberModal';
import SlotMachine from '../components/SlotMachine';
import { announcementDocRef, db, isFirebaseConfigured, participantsCollection } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

function pickRandomFromList(items) {
  if (!items.length) {
    return '0000';
  }

  return items[Math.floor(Math.random() * items.length)];
}

export default function WinnerPage() {
  const [participants, setParticipants] = useState([]);
  const [announcement, setAnnouncement] = useState({ announcementDate: null, winnerId: '' });
  const [now, setNow] = useState(Date.now());
  const [winnerId, setWinnerId] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isWinnerRevealed, setIsWinnerRevealed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading draw details...');
  const [error, setError] = useState('');
  const revealLock = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Add the VITE_FIREBASE_* values to your .env file.');
      return undefined;
    }

    const unsubscribe = onSnapshot(announcementDocRef, (snapshot) => {
      const data = snapshot.data() || {};
      setAnnouncement({
        announcementDate: data.announcementDate || null,
        winnerId: data.winnerId || ''
      });
    }, () => {
      setError('Unable to read the announcement configuration from Firestore.');
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined;
    }

    const loadParticipants = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'participants'));
        const ids = snapshot.docs.map((document) => document.data().uid).filter(Boolean);
        setParticipants(ids);
      } catch (participantError) {
        setError('Unable to load participants from Firestore.');
      }
    };

    loadParticipants();

    const unsubscribe = onSnapshot(participantsCollection, (snapshot) => {
      const ids = snapshot.docs.map((document) => document.data().uid).filter(Boolean);
      setParticipants(ids);
    }, () => {
      setError('Unable to keep participant data in sync.');
    });

    return unsubscribe;
  }, []);

  const announcementTime = announcement.announcementDate?.toDate ? announcement.announcementDate.toDate().getTime() : null;
  const remainingMs = announcementTime ? Math.max(0, announcementTime - now) : null;
  const activeWinnerId = announcement.winnerId || winnerId;
  const shouldShowBanner = isWinnerRevealed || (activeWinnerId && !isRevealing);

  useEffect(() => {
    if (activeWinnerId) {
      setIsRevealing(false);
      setIsWinnerRevealed(true);
      setStatusMessage('The winner has been revealed.');
      revealLock.current = false;
      return undefined;
    }

    if (!announcementTime) {
      setStatusMessage('Waiting for the announcement time to be configured.');
      return undefined;
    }

    if (remainingMs === null) {
      return undefined;
    }

    if (remainingMs > 0) {
      setStatusMessage('The draw is counting down to the scheduled announcement time.');
      setIsRevealing(false);
      revealLock.current = false;
      setIsWinnerRevealed(false);
      return undefined;
    }

    if (!revealLock.current && participants.length > 0) {
      revealLock.current = true;
      setIsRevealing(true);
      setIsWinnerRevealed(false);
      setStatusMessage('The draw has started. Jackpot reels are spinning...');

      const revealWinner = async () => {
        try {
          const chosenWinner = await runTransaction(db, async (transaction) => {
            const configSnapshot = await transaction.get(announcementDocRef);
            const configData = configSnapshot.data() || {};

            if (configData.winnerId) {
              return configData.winnerId;
            }

            if (!participants.length) {
              throw new Error('No participants are registered yet.');
            }

            const candidate = pickRandomFromList(participants);
            transaction.update(announcementDocRef, { winnerId: candidate });
            return candidate;
          });

          if (!chosenWinner) {
            throw new Error('A winner could not be selected.');
          }

          setWinnerId(chosenWinner);
        } catch (drawError) {
          revealLock.current = false;
          setError(drawError instanceof Error ? drawError.message : 'Unable to complete the automatic draw.');
        }
      };

      revealWinner();
    }

    if (remainingMs === 0 && participants.length === 0) {
      setError('The draw has started, but no participants are currently registered.');
    }

    return undefined;
  }, [activeWinnerId, announcementTime, participants, remainingMs]);

  const content = useMemo(() => {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-center sm:gap-8">
        {remainingMs !== null && remainingMs > 0 && !shouldShowBanner ? <CountdownTimer remainingMs={remainingMs} /> : null}
        <div className="w-full rounded-[2rem] border border-gold-300/20 bg-black/30 px-3 py-6 shadow-[0_0_48px_rgba(245,197,24,0.16)] backdrop-blur-xl sm:px-6 sm:py-10">
          <SlotMachine
            participants={participants}
            winnerUID={winnerId || activeWinnerId}
            isRevealing={isRevealing}
            onRevealComplete={(winnerUID) => {
              setWinnerId(winnerUID);
              setIsWinnerRevealed(true);
              setIsRevealing(false);
              setStatusMessage('The winner has been confirmed.');
            }}
          />
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-gold-300/50 px-5 py-3 text-sm font-medium text-white/90 transition duration-300 hover:border-gold-300 hover:bg-gold-300/10 hover:text-white sm:w-auto"
          onClick={() => setIsForgotModalOpen(true)}
        >
          Forgot My Number?
        </button>
        {shouldShowBanner ? (
          <div className="card-shell w-full max-w-2xl px-5 py-6 text-center sm:px-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-green-300/80">🏆 We Have a Winner!</p>
            <div className="mx-auto mb-5 inline-flex min-w-0 items-center justify-center rounded-[2rem] border border-green-300/30 bg-green-400/10 px-4 py-4 shadow-neon sm:px-6">
              <span className="font-orbitron text-4xl font-extrabold tracking-[0.22em] text-green-300 sm:text-6xl sm:tracking-[0.35em]">
                {String(winnerId || activeWinnerId || '0000').padStart(4, '0')}
              </span>
            </div>
            <p className="text-base font-semibold text-white sm:text-xl">Participant #{String(winnerId || activeWinnerId || '0000').padStart(4, '0')}</p>
            <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">Please contact the organizing committee to claim your prize.</p>
          </div>
        ) : (
          <p className="max-w-2xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">{statusMessage}</p>
        )}
      </section>
    );
  }, [activeWinnerId, isRevealing, participants, remainingMs, shouldShowBanner, statusMessage, winnerId]);

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="star-layer" />
      <div className="star-layer secondary" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-300/80 sm:text-sm sm:tracking-[0.45em]">Las Vegas Jackpot Aesthetic</p>
          <h1 className="font-orbitron text-3xl font-extrabold tracking-wide text-gold-300 drop-shadow-[0_0_20px_rgba(245,197,24,0.35)] sm:text-5xl lg:text-6xl">
            Lucky Winner 🎰 — Live Draw
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7 lg:text-lg">
            The winner will be revealed at the scheduled time.
          </p>
        </section>

        {error ? (
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {content}

        <div className="notice-box mx-auto w-full max-w-4xl text-left">
          📢 Important: Once the announcement date and time arrive, the winner will be selected automatically by the system. No manual intervention is involved.
        </div>
      </div>

      <ForgotNumberModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </main>
  );
}
