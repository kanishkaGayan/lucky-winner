import { useEffect, useMemo, useRef, useState } from 'react';

const REEL_COUNT = 4;
const TRACK_DIGITS = 120;
const MOBILE_DIGIT_HEIGHT = 80;
const DESKTOP_DIGIT_HEIGHT = 100;
const MOBILE_REEL_WIDTH = 56;
const DESKTOP_REEL_WIDTH = 72;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 4);
}

function linear(t) {
  return t;
}

function padUid(value) {
  return String(value || '0000').padStart(4, '0').slice(0, 4);
}

function randomDigit() {
  return String(Math.floor(Math.random() * 10));
}

function buildTrackDigits(seedDigits = []) {
  const digits = Array.from({ length: TRACK_DIGITS }, () => randomDigit());
  seedDigits.forEach((digit, index) => {
    digits[index] = String(digit);
  });
  return digits;
}

function getNextNumber(participants) {
  if (participants.length >= 20) {
    return participants[Math.floor(Math.random() * participants.length)] || '0000';
  }

  return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
}

function getDigitHeight() {
  if (typeof window === 'undefined') {
    return DESKTOP_DIGIT_HEIGHT;
  }

  return window.matchMedia('(max-width: 480px)').matches ? MOBILE_DIGIT_HEIGHT : DESKTOP_DIGIT_HEIGHT;
}

function getReelWidth() {
  if (typeof window === 'undefined') {
    return DESKTOP_REEL_WIDTH;
  }

  return window.matchMedia('(max-width: 480px)').matches ? MOBILE_REEL_WIDTH : DESKTOP_REEL_WIDTH;
}

export default function SlotMachine({ participants = [], winnerUID = null, isRevealing = false, onRevealComplete }) {
  const reelRefs = useRef([]);
  const positionRefs = useRef([0, 0, 0, 0]);
  const trackRefs = useRef(Array.from({ length: REEL_COUNT }, () => buildTrackDigits()));
  const frameRefs = useRef([null, null, null, null]);
  const idleIntervalRef = useRef(null);
  const revealRunRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [trackVersion, setTrackVersion] = useState(0);
  const digitHeight = useMemo(() => getDigitHeight(), []);
  const reelWidth = useMemo(() => getReelWidth(), []);

  const getVisibleIndex = (reelIndex) => {
    const currentPosition = positionRefs.current[reelIndex] || 0;
    return Math.max(0, Math.round(Math.abs(currentPosition) / digitHeight));
  };

  const applyTransform = (reelIndex, translateY) => {
    const reelTrack = reelRefs.current[reelIndex];
    if (reelTrack) {
      reelTrack.style.transform = `translateY(${translateY}px)`;
    }
  };

  const cancelAnimation = (reelIndex) => {
    const frameId = frameRefs.current[reelIndex];
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameRefs.current[reelIndex] = null;
    }
  };

  const animateReelToDigit = (reelIndex, targetDigit, duration, easingFn = easeInOut) => {
    cancelAnimation(reelIndex);

    const track = trackRefs.current[reelIndex] || buildTrackDigits();
    trackRefs.current[reelIndex] = track;

    const currentIndex = getVisibleIndex(reelIndex);
    const searchStart = currentIndex + 4;
    let targetIndex = track.findIndex((digit, index) => index >= searchStart && String(digit) === String(targetDigit));

    if (targetIndex === -1) {
      targetIndex = Math.min(track.length - 1, searchStart + 12 + Number(targetDigit));
      track[targetIndex] = String(targetDigit);
    }

    const currentPosition = positionRefs.current[reelIndex] || 0;
    const targetPosition = -(targetIndex * digitHeight);
    const distance = targetPosition - currentPosition;
    const startTime = performance.now();

    if (duration <= 0) {
      positionRefs.current[reelIndex] = targetPosition;
      applyTransform(reelIndex, targetPosition);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const animate = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = easingFn(progress);
        const nextPosition = currentPosition + distance * eased;

        positionRefs.current[reelIndex] = nextPosition;
        applyTransform(reelIndex, nextPosition);

        if (progress < 1) {
          frameRefs.current[reelIndex] = requestAnimationFrame(animate);
          return;
        }

        positionRefs.current[reelIndex] = targetPosition;
        applyTransform(reelIndex, targetPosition);
        resolve();
      };

      frameRefs.current[reelIndex] = requestAnimationFrame(animate);
    });
  };

  const jumpReelToDigit = (reelIndex, targetDigit) => {
    cancelAnimation(reelIndex);
    const track = trackRefs.current[reelIndex] || buildTrackDigits();
    const index = track.findIndex((digit) => String(digit) === String(targetDigit));
    const targetIndex = index >= 0 ? index : Number(targetDigit) + 8;
    const targetPosition = -(targetIndex * digitHeight);
    positionRefs.current[reelIndex] = targetPosition;
    applyTransform(reelIndex, targetPosition);
  };

  const spinFast = (reelIndex) => {
    cancelAnimation(reelIndex);
    const startTime = performance.now();
    const startPosition = positionRefs.current[reelIndex] || 0;

    const animate = (timestamp) => {
      const elapsed = timestamp - startTime;
      const nextPosition = startPosition - elapsed * 0.45;
      positionRefs.current[reelIndex] = nextPosition;
      applyTransform(reelIndex, nextPosition);
      frameRefs.current[reelIndex] = requestAnimationFrame(animate);
    };

    frameRefs.current[reelIndex] = requestAnimationFrame(animate);
  };

  const stopReelOnDigit = (reelIndex, targetDigit, duration, easingFn = easeOut) => animateReelToDigit(reelIndex, targetDigit, duration, easingFn);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const startReveal = async (winnerValue) => {
    const winner = padUid(winnerValue);

    for (let reelIndex = 0; reelIndex < REEL_COUNT; reelIndex += 1) {
      spinFast(reelIndex);
    }

    await wait(3000);

    for (let reelIndex = 0; reelIndex < REEL_COUNT; reelIndex += 1) {
      await wait(350);
      await stopReelOnDigit(reelIndex, winner[reelIndex], 900 + reelIndex * 200, easeOut);
    }

    await wait(250);
    setRevealed(true);
    onRevealComplete?.(winner);
  };

  useEffect(() => {
    trackRefs.current = Array.from({ length: REEL_COUNT }, () => buildTrackDigits());
    positionRefs.current = [0, 0, 0, 0];
    setTrackVersion((value) => value + 1);

    return () => {
      frameRefs.current.forEach((frameId) => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (idleIntervalRef.current) {
      clearInterval(idleIntervalRef.current);
      idleIntervalRef.current = null;
    }

    if (isRevealing || revealed) {
      return undefined;
    }

    idleIntervalRef.current = setInterval(() => {
      const nextNumber = getNextNumber(participants);
      nextNumber.split('').forEach((digit, reelIndex) => {
        animateReelToDigit(reelIndex, digit, 400, easeInOut);
      });
    }, 2000);

    return () => {
      if (idleIntervalRef.current) {
        clearInterval(idleIntervalRef.current);
      }
    };
  }, [participants, isRevealing, revealed]);

  useEffect(() => {
    if (!isRevealing || !winnerUID) {
      return undefined;
    }

    if (idleIntervalRef.current) {
      clearInterval(idleIntervalRef.current);
      idleIntervalRef.current = null;
    }

    revealRunRef.current = startReveal(winnerUID);

    return () => {
      revealRunRef.current = null;
    };
  }, [isRevealing, winnerUID]);

  useEffect(() => {
    if (winnerUID && !isRevealing) {
      const paddedWinner = padUid(winnerUID);
      paddedWinner.split('').forEach((digit, reelIndex) => {
        jumpReelToDigit(reelIndex, digit);
      });
      setRevealed(true);
    }
  }, [winnerUID, isRevealing]);

  return (
    <div className="slot-machine flex w-full max-w-full items-center justify-center gap-2 sm:gap-3" data-version={trackVersion}>
      {[0, 1, 2, 3].map((reelIndex) => (
        <div
          key={reelIndex}
          className="relative overflow-hidden rounded-[10px] border-2 border-gold-300/40 bg-black/40"
          style={{
            width: `${reelWidth}px`,
            height: `${digitHeight}px`
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[28px] bg-gradient-to-b from-[#0A0E27] to-transparent" />
          <div className="highlight-bar pointer-events-none absolute left-0 right-0 top-1/2 z-20 -translate-y-1/2 border-y-2 border-gold-300/60" style={{ height: `${digitHeight}px` }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[28px] bg-gradient-to-t from-[#0A0E27] to-transparent" />

          <div
            className="reel-track flex flex-col items-center will-change-transform"
            ref={(element) => {
              reelRefs.current[reelIndex] = element;
              if (element) {
                element.style.transform = `translateY(${positionRefs.current[reelIndex] || 0}px)`;
              }
            }}
            style={{ transform: `translateY(${positionRefs.current[reelIndex] || 0}px)` }}
          >
            {(trackRefs.current[reelIndex] || buildTrackDigits()).map((digit, digitIndex) => (
              <div
                key={`${reelIndex}-${digitIndex}-${digit}`}
                className="reel-digit flex flex-shrink-0 items-center justify-center font-orbitron font-bold text-gold-300"
                style={{
                  width: `${reelWidth}px`,
                  height: `${digitHeight}px`,
                  fontSize: digitHeight === MOBILE_DIGIT_HEIGHT ? '32px' : '42px',
                  fontFamily: 'Orbitron, monospace'
                }}
              >
                {digit}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
