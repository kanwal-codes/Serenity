"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 14;
const WAVE_COUNT = 10;

/** Many small sine ripples across the bar. */
function buildWavePath(width, height, waveCount) {
  const mid = height / 2;
  const amplitude = height * 0.34;
  const steps = Math.max(waveCount * 12, 80);
  let d = "";
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = t * width;
    const y = mid + amplitude * Math.sin(t * Math.PI * 2 * waveCount);
    d += `${i === 0 ? "M" : " L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d;
}

function fractionFromClientX(element, clientX) {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0) return 0;
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
}

function useSmoothProgress(progress, isPlaying, durationSec, seeking) {
  const targetRef = useRef(progress);
  const syncRef = useRef(progress);
  const syncAtRef = useRef(0);
  const displayRef = useRef(progress);
  const [display, setDisplay] = useState(progress);

  useEffect(() => {
    targetRef.current = progress;
    syncRef.current = progress;
    syncAtRef.current = performance.now();
    if (seeking) {
      displayRef.current = progress;
      setDisplay(progress);
    }
  }, [progress, seeking]);

  useEffect(() => {
    if (seeking) return undefined;

    let rafId = 0;

    const tick = (now) => {
      let target = targetRef.current;

      if (isPlaying && durationSec > 0) {
        const elapsed = (now - syncAtRef.current) / 1000;
        const estimated =
          syncRef.current + (elapsed / durationSec) * 100;
        target = Math.min(100, Math.max(target, estimated));
      }

      const current = displayRef.current;
      const diff = target - current;
      const next = Math.abs(diff) < 0.05 ? target : current + diff * 0.16;

      if (next !== current) {
        displayRef.current = next;
        setDisplay(next);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, durationSec, seeking]);

  return display;
}

export function WaveProgressBar({
  progress,
  onSeek,
  isPlaying,
  durationSec,
}) {
  const clipId = useId();
  const barRef = useRef(null);
  const draggingRef = useRef(false);
  const [seeking, setSeeking] = useState(false);

  const smoothProgress = useSmoothProgress(
    progress,
    isPlaying,
    durationSec,
    seeking
  );

  const shown = seeking ? progress : smoothProgress;
  const percent = Math.max(0, Math.min(100, shown));
  const clipWidth = (percent / 100) * VIEW_WIDTH;

  const wavePath = useMemo(
    () => buildWavePath(VIEW_WIDTH, VIEW_HEIGHT, WAVE_COUNT),
    []
  );

  const seekTo = useCallback(
    (clientX) => {
      onSeek(fractionFromClientX(barRef.current, clientX));
    },
    [onSeek]
  );

  const handlePointerDown = useCallback(
    (e) => {
      draggingRef.current = true;
      setSeeking(true);
      barRef.current?.setPointerCapture(e.pointerId);
      seekTo(e.clientX);
    },
    [seekTo]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      seekTo(e.clientX);
    },
    [seekTo]
  );

  const handlePointerUp = useCallback((e) => {
    draggingRef.current = false;
    barRef.current?.releasePointerCapture(e.pointerId);
    setSeeking(false);
  }, []);

  return (
    <div
      ref={barRef}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className={cn(
        "relative flex-1 cursor-pointer touch-none transition-[height] duration-200 ease-out",
        seeking ? "h-1" : "h-4"
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Wave — only the played portion, clipped from the left */}
      <div
        className={cn(
          "absolute inset-0 flex items-center transition-opacity duration-200",
          seeking ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        aria-hidden={seeking}
      >
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-hidden"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width={clipWidth} height={VIEW_HEIGHT} />
            </clipPath>
          </defs>
          {percent > 0 && (
            <path
              d={wavePath}
              fill="none"
              stroke="var(--m3-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="miter"
              vectorEffect="non-scaling-stroke"
              clipPath={`url(#${clipId})`}
            />
          )}
        </svg>
      </div>

      {/* Line — visible only while scrubbing */}
      {seeking && (
        <div className="absolute inset-0" aria-hidden={false}>
          <div className="relative h-full w-full rounded-sm bg-muted">
            <div
              className="pointer-events-none h-full rounded-sm bg-m3-primary"
              style={{ width: `${percent}%` }}
            />
            <div
              className="pointer-events-none absolute top-1/2 h-3 w-3 rounded-full bg-m3-primary"
              style={{
                left: `${percent}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
