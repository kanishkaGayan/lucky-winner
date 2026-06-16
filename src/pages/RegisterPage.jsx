import RegistrationForm from '../components/RegistrationForm';

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
            Register for your chance to win in the university fundraising competition.
          </p>
        </section>

        <RegistrationForm />
      </div>
    </main>
  );
}
