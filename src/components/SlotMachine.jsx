const sourceKeyframes = 'slot-keyframes';

function getSourceDigits(value) {
  return String(value || '0000').padStart(4, '0').slice(0, 4).split('');
}

export default function SlotMachine({ value, rolling = false, reveal = false }) {
  const digits = getSourceDigits(value);

  return (
    <div className="flex w-full max-w-full items-center justify-center gap-1 sm:gap-3">
      {digits.map((digit, index) => (
        <div
          key={`${sourceKeyframes}-${index}-${digit}`}
          className={`slot-reel ${rolling || reveal ? 'slot-reel-rolling' : ''} ${reveal ? 'animate-revealPulse text-green-300' : ''}`}
          style={{ animationDelay: `${index * 90}ms` }}
        >
          {digit}
        </div>
      ))}
    </div>
  );
}
