import { useCallback, useEffect, useRef } from "react";

/**
 * Attach to a `<canvas>` inside a sized parent. Handles DPR scaling and
 * re-renders when the parent resizes. The draw function receives the
 * 2D context with units in CSS pixels.
 */
export function useCanvasChart(
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
): React.RefObject<HTMLCanvasElement | null> {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const render = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w === 0 || h === 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, w, h);
  }, [draw]);

  useEffect(() => {
    render();
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!parent) return;
    const obs = new ResizeObserver(() => render());
    obs.observe(parent);
    return () => obs.disconnect();
  }, [render]);

  return ref;
}
