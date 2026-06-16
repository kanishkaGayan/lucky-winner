import { useEffect, useMemo, useRef, useState } from 'react';
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { announcementDocRef, db, isFirebaseConfigured } from '../firebase/config';

const departments = [
  'Project management',
  'Accountacy',
  'English',
  'IT',
  'Other'
];

function CustomSelect({ id, value, onChange, options, placeholder, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedLabel = value || placeholder;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        id={id}
        className="lucky-input flex min-h-11 items-center justify-between gap-3 text-left text-base"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? 'text-white' : 'text-white/40'}>{selectedLabel}</span>
        <span className={`text-sm transition ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/98 shadow-2xl">
          <div role="listbox" aria-label={placeholder} className="max-h-64 overflow-auto p-2">
            {options.map((item) => {
              const isSelected = value === item;

              return (
                <button
                  key={item}
                  type="button"
                  className={`flex min-h-11 w-full items-center rounded-xl px-4 py-3 text-left text-base transition ${
                    isSelected ? 'bg-gold-300/15 text-gold-300' : 'text-white/85 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => {
                    onChange(item);
                    setIsOpen(false);
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildRandomUid() {
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
}

async function createParticipantRecord({ name, telephone, department }) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const candidate = buildRandomUid();
    const participantRef = doc(db, 'participants', candidate);

    try {
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(participantRef);
        if (snapshot.exists()) {
          const collisionError = new Error('UID_COLLISION');
          collisionError.code = 'UID_COLLISION';
          throw collisionError;
        }

        transaction.set(participantRef, {
          uid: candidate,
          name,
          telephone,
          department,
          registeredAt: serverTimestamp()
        });
      });

      return candidate;
    } catch (transactionError) {
      if (transactionError && transactionError.code === 'UID_COLLISION') {
        continue;
      }

      throw transactionError;
    }
  }

  throw new Error('Unable to generate a unique participant ID. Please try again.');
}

export default function RegistrationForm() {
  const [fullName, setFullName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredParticipant, setRegisteredParticipant] = useState(null);
  const [announcementDateTime, setAnnouncementDateTime] = useState('');
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined;
    }

    return onSnapshot(announcementDocRef, (snapshot) => {
      const data = snapshot.data() || {};
      if (data.announcementDate?.toDate) {
        const date = data.announcementDate.toDate();
        const pad = (value) => String(value).padStart(2, '0');
        const localValue = [
          date.getFullYear(),
          pad(date.getMonth() + 1),
          pad(date.getDate())
        ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        setAnnouncementDateTime(localValue);
      }
    });
  }, []);

  const telephonePattern = useMemo(() => /^\+?[0-9\s()-]{7,20}$/, []);

  const handleAnnouncementSave = async (event) => {
    event.preventDefault();
    setAnnouncementMessage('');

    if (!isFirebaseConfigured) {
      setAnnouncementMessage('Firebase is not configured. Add the VITE_FIREBASE_* values to your .env file.');
      return;
    }

    if (!announcementDateTime) {
      setAnnouncementMessage('Please choose an announcement date and time.');
      return;
    }

    setAnnouncementSaving(true);
    try {
      const { Timestamp, setDoc } = await import('firebase/firestore');
      await setDoc(announcementDocRef, {
        announcementDate: Timestamp.fromDate(new Date(announcementDateTime)),
        winnerId: ''
      }, { merge: true });
      setAnnouncementMessage('Announcement time saved successfully.');
    } catch {
      setAnnouncementMessage('Unable to save the announcement time. Please try again.');
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedName = fullName.trim();
    const trimmedTelephone = telephone.trim();

    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Add the VITE_FIREBASE_* values to your .env file.');
      return;
    }

    if (!trimmedName || !trimmedTelephone || !department) {
      setError('Please complete all required fields.');
      return;
    }

    if (!telephonePattern.test(trimmedTelephone)) {
      setError('Please enter a valid telephone number.');
      return;
    }

    setLoading(true);
    try {
      const uid = await createParticipantRecord({
        name: trimmedName,
        telephone: trimmedTelephone,
        department
      });

      setRegisteredParticipant({ uid, name: trimmedName });
      setFullName('');
      setTelephone('');
      setDepartment('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (registeredParticipant) {
    return (
      <section className="card-shell mx-auto w-full max-w-md p-4 text-center sm:p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-green-300">🎉 You're Registered!</p>
        <h2 className="font-orbitron text-2xl font-bold text-white sm:text-4xl">{registeredParticipant.name}</h2>
        <div className="mt-6 rounded-[2rem] border border-gold-300/25 bg-white/5 px-4 py-5 shadow-[0_0_30px_rgba(245,197,24,0.1)] sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Your unique ID</p>
          <p className="font-orbitron text-4xl font-extrabold tracking-[0.2em] text-gold-300 sm:text-6xl sm:tracking-[0.4em]">
            {registeredParticipant.uid}
          </p>
        </div>
        <p className="mt-5 text-sm leading-6 text-white/75 sm:text-base">
          Keep your ID safe — it may be your winning number!
        </p>
        <div className="notice-box mt-6 text-left">
          📢 Important: Once the announcement date and time arrive, the winner will be selected automatically by the system. No manual intervention is involved.
        </div>
      </section>
    );
  }

  return (
    <section className="card-shell mx-auto w-full max-w-md p-4 sm:p-8">
      <form className="space-y-5" onSubmit={handleAnnouncementSave}>
        <div>
          <label className="lucky-label" htmlFor="announcementDateTime">Announcement Date & Time</label>
          <input
            id="announcementDateTime"
            className="lucky-input text-base"
            type="datetime-local"
            value={announcementDateTime}
            onChange={(event) => setAnnouncementDateTime(event.target.value)}
          />
          <button type="submit" className="lucky-button mt-3 w-full" disabled={announcementSaving}>
            {announcementSaving ? 'Saving...' : 'Save Announcement Time'}
          </button>
        </div>
      </form>

      <div className="my-6 h-px w-full bg-white/10" />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="lucky-label" htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            className="lucky-input text-base"
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="lucky-label" htmlFor="telephone">Telephone Number</label>
          <input
            id="telephone"
            className="lucky-input text-base"
            type="tel"
            required
            value={telephone}
            onChange={(event) => setTelephone(event.target.value)}
            placeholder="e.g. +1 555 123 4567"
          />
        </div>

        <div>
          <label className="lucky-label" htmlFor="department">Department</label>
          <CustomSelect
            id="department"
            placeholder="Select a department"
            value={department}
            onChange={setDepartment}
            options={departments}
            disabled={loading}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {announcementMessage ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
            {announcementMessage}
          </div>
        ) : null}

        <button type="submit" className="lucky-button w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register Now'}
        </button>
      </form>

      <div className="notice-box mt-6">
        📢 Important: Once the announcement date and time arrive, the winner will be selected automatically by the system. No manual intervention is involved.
      </div>
    </section>
  );
}
