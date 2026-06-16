export default function CountdownTimer({ remainingMs }) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return (
    <div className="w-full rounded-3xl border border-gold-300/20 bg-black/35 px-4 py-4 text-center shadow-[0_0_30px_rgba(245,197,24,0.12)] backdrop-blur-md sm:px-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-gold-200/75">Draw begins in</p>
      <p className="font-orbitron text-2xl font-bold tracking-[0.15em] text-white sm:text-4xl lg:text-5xl">
        {hours}:{minutes}:{seconds}
      </p>
    </div>
  );
}
