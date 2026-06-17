import { useEffect, useState } from 'react';
import { DEFAULT_DEPARTMENTS } from './studentAdminUtils';

export default function StudentEditModal({ isOpen, participant, onClose, onSave, saving = false, error = '' }) {
  const [formValues, setFormValues] = useState({
    name: '',
    telephone: '',
    department: ''
  });

  useEffect(() => {
    if (!participant) {
      return;
    }

    setFormValues({
      name: participant.name || '',
      telephone: participant.telephone || '',
      department: participant.department || DEFAULT_DEPARTMENTS[0]
    });
  }, [participant]);

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

  if (!isOpen || !participant) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(participant.uid, {
      name: formValues.name.trim(),
      telephone: formValues.telephone.trim(),
      department: formValues.department
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-stretch justify-center bg-slate-950/80 px-0 py-0 backdrop-blur-md sm:items-center sm:px-4 sm:py-8" role="presentation" onClick={onClose}>
      <div
        className="relative flex h-full w-full max-w-none flex-col justify-center rounded-none border-0 bg-slate-950/98 p-5 shadow-[0_0_60px_rgba(0,0,0,0.55)] sm:h-auto sm:max-w-lg sm:rounded-[2rem] sm:border sm:border-white/10 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-white/70 transition hover:border-gold-300/50 hover:text-white"
          aria-label="Close edit dialog"
        >
          ×
        </button>

        <div className="space-y-2 pr-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-300/80">Edit Student</p>
          <h2 id="student-edit-title" className="font-orbitron text-2xl font-bold text-gold-300 sm:text-3xl">
            Update participant record
          </h2>
          <p className="text-sm leading-6 text-white/70 sm:text-base">
            Modify the student details and save the changes back to Firestore.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="lucky-label" htmlFor="student-name">Name</label>
            <input
              id="student-name"
              className="lucky-input"
              value={formValues.name}
              onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
              placeholder="Student name"
              required
            />
          </div>

          <div>
            <label className="lucky-label" htmlFor="student-telephone">Telephone</label>
            <input
              id="student-telephone"
              className="lucky-input"
              value={formValues.telephone}
              onChange={(event) => setFormValues((current) => ({ ...current, telephone: event.target.value }))}
              placeholder="Student telephone"
              required
            />
          </div>

          <div>
            <label className="lucky-label" htmlFor="student-department">Department</label>
            <select
              id="student-department"
              className="lucky-input bg-slate-950/90"
              value={formValues.department}
              onChange={(event) => setFormValues((current) => ({ ...current, department: event.target.value }))}
            >
              {DEFAULT_DEPARTMENTS.map((department) => (
                <option key={department} value={department} className="bg-slate-950 text-white">
                  {department}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="lucky-button min-h-11 sm:w-32" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="lucky-button min-h-11 sm:w-36" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
