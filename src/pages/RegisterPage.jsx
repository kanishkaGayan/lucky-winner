import RegistrationForm from '../components/RegistrationForm';
import StudentAdminPanel from '../admin/StudentAdminPanel';

export default function RegisterPage() {
  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
        <section className="text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-300/75 sm:text-sm sm:tracking-[0.45em]">University Fundraising Competition</p>
          <h1 className="font-orbitron text-3xl font-extrabold tracking-wide text-gold-300 drop-shadow-[0_0_18px_rgba(245,197,24,0.28)] sm:text-5xl lg:text-6xl">
            Lucky Winner 🎰
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7 lg:text-lg">
            Register participants and set the draw time for the university fundraising competition.
          </p>
        </section>

        <RegistrationForm />

        <section className="space-y-4">
          <div className="text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gold-300/75 sm:text-sm">Admin Dashboard</p>
            <h2 className="font-orbitron text-2xl font-bold text-gold-300 sm:text-3xl">Student management</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              Use this panel to edit, update, and remove student registrations, grouped by department with income totals calculated at 50 LKR per ticket.
            </p>
          </div>

          <StudentAdminPanel />
        </section>
      </div>
    </main>
  );
}
