import { useEffect, useMemo, useState } from 'react';
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, participantsCollection } from '../firebase/config';
import StudentEditModal from './StudentEditModal';
import {
  buildDepartmentSummary,
  DEFAULT_DEPARTMENTS,
  formatLkr,
  normalizeParticipant,
  sortParticipants,
  TICKET_PRICE_LKR
} from './studentAdminUtils';

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

function ActionButton({ children, onClick, tone = 'neutral', disabled = false }) {
  const colorClass = tone === 'danger'
    ? 'border-rose-300/30 text-rose-100 hover:border-rose-200 hover:bg-rose-400/10 hover:text-white'
    : 'border-white/10 text-white/80 hover:border-gold-300/40 hover:bg-white/5 hover:text-white';

  return (
    <button
      type="button"
      className={`inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition ${colorClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default function StudentAdminPanel() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [sortMode, setSortMode] = useState('department-asc');
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [savingParticipantId, setSavingParticipantId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      setError('Firebase is not configured. Add the VITE_FIREBASE_* values to your .env file.');
      return undefined;
    }

    const unsubscribe = onSnapshot(
      participantsCollection,
      (snapshot) => {
        const rows = snapshot.docs.map(normalizeParticipant);
        setParticipants(rows);
        setLoading(false);
        setError('');
      },
      () => {
        setLoading(false);
        setError('Unable to load participant records from Firestore.');
      }
    );

    return unsubscribe;
  }, []);

  const departmentOptions = useMemo(() => {
    const departments = new Set(DEFAULT_DEPARTMENTS);

    participants.forEach((participant) => {
      if (participant.department) {
        departments.add(participant.department);
      }
    });

    return Array.from(departments).sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }));
  }, [participants]);

  const filteredParticipants = useMemo(() => {
    const filtered = departmentFilter === 'All Departments'
      ? participants
      : participants.filter((participant) => participant.department === departmentFilter);

    return sortParticipants(filtered, sortMode);
  }, [departmentFilter, participants, sortMode]);

  const departmentSummary = useMemo(() => buildDepartmentSummary(participants), [participants]);

  const totalIncome = participants.length * TICKET_PRICE_LKR;
  const filteredIncome = filteredParticipants.length * TICKET_PRICE_LKR;

  const handleDelete = async (participant) => {
    const shouldDelete = window.confirm(`Delete ${participant.name || participant.uid}? This cannot be undone.`);

    if (!shouldDelete) {
      return;
    }

    setError('');
    setStatusMessage('');

    try {
      await deleteDoc(doc(db, 'participants', participant.uid));
      setStatusMessage(`Deleted ${participant.uid} successfully.`);

      if (editingParticipant?.uid === participant.uid) {
        setEditingParticipant(null);
      }
    } catch {
      setError('Unable to delete the selected participant.');
    }
  };

  const handleSave = async (participantUid, values) => {
    if (!values.name || !values.telephone || !values.department) {
      return;
    }

    setSavingParticipantId(participantUid);
    setError('');

    try {
      await updateDoc(doc(db, 'participants', participantUid), {
        name: values.name,
        telephone: values.telephone,
        department: values.department
      });

      setEditingParticipant(null);
      setStatusMessage(`Updated ${participantUid} successfully.`);
    } catch {
      setError('Unable to update the selected participant.');
    } finally {
      setSavingParticipantId('');
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl rounded-[2rem] border border-gold-300/15 bg-black/25 px-4 py-6 shadow-[0_0_48px_rgba(245,197,24,0.1)] backdrop-blur-xl sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-300/75 sm:text-sm">Admin Student Manager</p>
          <h2 className="font-orbitron text-2xl font-bold text-gold-300 sm:text-4xl">Manage registrations</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
            View student registrations, edit details, delete records, and track ticket income at {formatLkr(TICKET_PRICE_LKR)} per student.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[24rem]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Students</p>
            <p className="mt-2 font-orbitron text-2xl font-bold text-white">{participants.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Total income</p>
            <p className="mt-2 font-orbitron text-2xl font-bold text-gold-300">{formatLkr(totalIncome)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Filtered income</p>
            <p className="mt-2 font-orbitron text-2xl font-bold text-green-300">{formatLkr(filteredIncome)}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {departmentOptions.map((department) => {
          const summary = departmentSummary.get(department) || { count: 0, income: 0 };

          return (
            <div key={department} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">Department</p>
              <h3 className="mt-2 text-base font-semibold text-white">{department}</h3>
              <div className="mt-3 flex items-center justify-between text-sm text-white/70">
                <span>{summary.count} students</span>
                <span>{formatLkr(summary.income)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-3 md:grid-cols-2">
          <div>
            <label className="lucky-label" htmlFor="department-filter">Filter by department</label>
            <select
              id="department-filter"
              className="lucky-input bg-slate-950/90"
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
            >
              <option value="All Departments">All Departments</option>
              {departmentOptions.map((department) => (
                <option key={department} value={department} className="bg-slate-950 text-white">
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="lucky-label" htmlFor="sort-mode">Sort table</label>
            <select
              id="sort-mode"
              className="lucky-input bg-slate-950/90"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
            >
              <option value="department-asc" className="bg-slate-950 text-white">Department A-Z</option>
              <option value="department-desc" className="bg-slate-950 text-white">Department Z-A</option>
              <option value="name-asc" className="bg-slate-950 text-white">Name A-Z</option>
              <option value="uid-asc" className="bg-slate-950 text-white">UID A-Z</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-gold-300/20 bg-gold-300/5 px-4 py-3 text-sm text-white/80 lg:max-w-sm">
          The table uses the current department filter and sort order. Each student contributes {formatLkr(TICKET_PRICE_LKR)} to income.
        </div>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="mb-5 rounded-2xl border border-green-300/25 bg-green-400/10 px-4 py-3 text-sm text-green-100">
          {statusMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/75">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.22em] text-white/50">
              <tr>
                <th className="px-4 py-4 font-semibold">UID</th>
                <th className="px-4 py-4 font-semibold">Name</th>
                <th className="px-4 py-4 font-semibold">Telephone</th>
                <th className="px-4 py-4 font-semibold">Department</th>
                <th className="px-4 py-4 font-semibold">Income</th>
                <th className="px-4 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-10 text-center" colSpan={6}>
                    <span className="inline-flex items-center gap-2 text-white/70">
                      <Spinner /> Loading participant records...
                    </span>
                  </td>
                </tr>
              ) : null}

              {!loading && filteredParticipants.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-white/60" colSpan={6}>
                    No participant records match the current filter.
                  </td>
                </tr>
              ) : null}

              {!loading && filteredParticipants.map((participant) => (
                <tr key={participant.uid} className="hover:bg-white/5">
                  <td className="px-4 py-4 font-orbitron text-base font-bold tracking-[0.2em] text-gold-300">{participant.uid}</td>
                  <td className="px-4 py-4 text-white">{participant.name || '-'}</td>
                  <td className="px-4 py-4 text-white/80">{participant.telephone || '-'}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                      {participant.department || 'Other'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gold-300">{formatLkr(TICKET_PRICE_LKR)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <ActionButton onClick={() => setEditingParticipant(participant)}>Edit</ActionButton>
                      <ActionButton
                        tone="danger"
                        onClick={() => handleDelete(participant)}
                        disabled={savingParticipantId === participant.uid}
                      >
                        Delete
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StudentEditModal
        isOpen={Boolean(editingParticipant)}
        participant={editingParticipant}
        saving={savingParticipantId === editingParticipant?.uid}
        error={error}
        onClose={() => setEditingParticipant(null)}
        onSave={handleSave}
      />
    </section>
  );
}
