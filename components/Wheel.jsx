"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A spinning wheel that does not decide anything.
 *
 * The winner is already fixed by the seed before this component mounts: it is
 * handed the name and works backwards to the rotation that parks that slice under
 * the pointer. That is the opposite of every other wheel — theirs pick the winner
 * at the end of the animation, which is also where a wheel can be quietly nudged.
 * Here the animation is a reading of a result that was committed in advance and
 * can be recomputed by anyone afterwards.
 *
 * Slice widths follow the chances, so an entry with three chances gets three
 * times the arc. Labels come off once there are too many to read; the stub says
 * the name either way.
 */

/** Past this many slices the wheel is a barcode, so the caller offers something else. */
export const MAX_SLICES = 60;

/** Labels stop being legible well before the slices do. */
const LABEL_LIMIT = 24;

const SPIN_MS = 3400;
const TURNS = 4;

const CENTRE = 100;
const RADIUS = 96;

// Three tints off the ticket-print palette rather than a colour wheel: the sheet,
// the darker stock it is printed on, and one ink. The winning slice is filled in
// only once the wheel has stopped.
const TINTS = ["var(--color-paper)", "var(--color-stock)", "var(--color-rule)"];

function point(angle, radius = RADIUS) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [CENTRE + radius * Math.cos(radians), CENTRE + radius * Math.sin(radians)];
}

/** Slices laid out clockwise from the top, sized by chances. */
export function sliceGeometry(segments) {
  const total = segments.reduce((sum, segment) => sum + segment.chances, 0) || 1;
  let cursor = 0;

  return segments.map((segment) => {
    const start = (cursor / total) * 360;
    cursor += segment.chances;
    const end = (cursor / total) * 360;
    return { ...segment, start, end, middle: (start + end) / 2 };
  });
}

function slicePath(start, end) {
  // A single slice covering the whole wheel has no arc to draw: the start and end
  // points coincide, and the path collapses to nothing.
  if (end - start >= 360) {
    return `M ${CENTRE - RADIUS} ${CENTRE} a ${RADIUS} ${RADIUS} 0 1 0 ${RADIUS * 2} 0 a ${RADIUS} ${RADIUS} 0 1 0 ${-RADIUS * 2} 0 z`;
  }

  const [x1, y1] = point(start);
  const [x2, y2] = point(end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${CENTRE} ${CENTRE} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${x2} ${y2} Z`;
}

export default function Wheel({ segments, winner, animate = true, onDone }) {
  const slices = useMemo(() => sliceGeometry(segments), [segments]);
  const target = slices.find((slice) => slice.name === winner) ?? slices[0];
  const [spinning, setSpinning] = useState(false);
  const finished = useRef(false);
  // Held in a ref so an inline callback from the caller cannot restart the spin
  // on every render.
  const done = useRef(onDone);
  done.current = onDone;

  // The rotation that parks the winning slice under the pointer at the top,
  // after four full turns for the look of the thing.
  const rotation = animate ? TURNS * 360 - (target?.middle ?? 0) : 0;

  useEffect(() => {
    if (!animate) {
      done.current?.();
      return undefined;
    }

    // One frame at rotation 0 before the transition starts, or the browser has
    // nothing to animate from.
    const start = window.requestAnimationFrame(() => setSpinning(true));

    // The timer, rather than transitionend, decides when the result is shown:
    // a backgrounded tab never fires the event and the draw would hang on it.
    const timer = window.setTimeout(() => {
      if (finished.current) return;
      finished.current = true;
      done.current?.();
    }, SPIN_MS);

    return () => {
      window.cancelAnimationFrame(start);
      window.clearTimeout(timer);
    };
  }, [animate]);

  const labelled = slices.length <= LABEL_LIMIT;

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-72"
      aria-hidden="true"
      data-testid="wheel"
    >
      {/* The pointer stays put while the wheel turns under it. */}
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
        <div className="h-0 w-0 border-x-8 border-t-[14px] border-x-transparent border-t-marigold" />
      </div>

      <svg viewBox="0 0 200 200" className="h-full w-full">
        <g
          style={{
            transform: `rotate(${spinning ? rotation : 0}deg)`,
            transformOrigin: "100px 100px",
            transition: animate ? `transform ${SPIN_MS}ms cubic-bezier(0.16, 1, 0.3, 1)` : "none",
          }}
        >
          {slices.map((slice, index) => (
            <path
              key={slice.name}
              d={slicePath(slice.start, slice.end)}
              fill={TINTS[index % TINTS.length]}
              stroke="var(--color-ink)"
              strokeWidth="0.5"
              data-name={slice.name}
            />
          ))}

          {labelled &&
            slices.map((slice) => {
              const [x, y] = point(slice.middle, RADIUS * 0.62);
              return (
                <text
                  key={`${slice.name}-label`}
                  x={x}
                  y={y}
                  transform={`rotate(${slice.middle - 90} ${x} ${y})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--color-ink)"
                  fontSize="6"
                  className="font-sans"
                >
                  {slice.name.length > 18 ? `${slice.name.slice(0, 17)}…` : slice.name}
                </text>
              );
            })}
        </g>

        <circle cx={CENTRE} cy={CENTRE} r="10" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1" />
      </svg>
    </div>
  );
}
