export default function WinnerCard({ winnerId }) {
  return (
    <section className="card-shell mx-auto w-full max-w-xl p-5 text-center sm:max-w-2xl sm:p-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-green-300/80">🏆 We Have a Winner!</p>
      <div className="mx-auto mb-5 inline-flex min-w-0 items-center justify-center rounded-[2rem] border border-green-300/30 bg-green-400/10 px-4 py-4 shadow-neon sm:px-6">
        <span className="font-orbitron text-4xl font-extrabold tracking-[0.22em] text-green-300 sm:text-6xl sm:tracking-[0.35em]">
          {String(winnerId || '0000').padStart(4, '0')}
        </span>
      </div>
      <p className="text-base font-semibold text-white sm:text-xl">Congratulations to participant #{winnerId}</p>
      <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">
        Please contact the organizing committee to claim your prize.
      </p>
    </section>
  );
}
