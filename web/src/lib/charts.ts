/**
 * Canvas chart drawing primitives. All drawing reads CSS custom properties
 * for theme colors so dark mode flips automatically when the OS preference
 * changes (after the next render).
 */

function cssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

interface PieSegment {
  label: string;
  value: number;
  color: string;
}

export function drawPieChart(
  ctx: CanvasRenderingContext2D,
  segments: PieSegment[],
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) {
    ctx.fillStyle = cssVar("--muted", "#6b7280");
    ctx.font = "14px Manrope, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No data yet", width / 2, height / 2);
    return;
  }

  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(cx, cy) - 8;
  const innerR = outerR * 0.55;

  let start = -Math.PI / 2;
  for (const seg of segments) {
    const sweep = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, start, start + sweep);
    ctx.arc(cx, cy, innerR, start + sweep, start, true);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    start += sweep;
  }
}

interface Bar {
  label: string;
  value: number;
  color: string;
}

export function drawBarChart(
  ctx: CanvasRenderingContext2D,
  bars: Bar[],
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  const ink = cssVar("--ink", "#1a1a1a");
  const line = cssVar("--line", "#e5e7eb");

  if (bars.length === 0) {
    ctx.fillStyle = cssVar("--muted", "#6b7280");
    ctx.font = "14px Manrope, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No data yet", width / 2, height / 2);
    return;
  }

  const padding = { top: 16, right: 12, bottom: 28, left: 12 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...bars.map((b) => b.value), 1);
  const slot = chartW / bars.length;
  const barW = Math.max(2, Math.min(slot * 0.7, 24));

  // baseline + 3 grid lines
  ctx.strokeStyle = line;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 3; i++) {
    const y = padding.top + (chartH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  bars.forEach((bar, i) => {
    const x = padding.left + slot * i + (slot - barW) / 2;
    const h = (bar.value / maxVal) * chartH;
    const y = padding.top + chartH - h;
    ctx.fillStyle = bar.color;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, h, [3, 3, 0, 0]);
    ctx.fill();
  });

  // Sparse labels: every ~5 bars + first + last.
  ctx.fillStyle = ink;
  ctx.font = "10px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const step = Math.max(1, Math.ceil(bars.length / 6));
  bars.forEach((bar, i) => {
    if (i % step === 0 || i === bars.length - 1) {
      const x = padding.left + slot * i + slot / 2;
      ctx.fillText(bar.label, x, height - padding.bottom + 6);
    }
  });
}

interface LinePoint {
  label: string;
  value: number;
}

export function drawLineChart(
  ctx: CanvasRenderingContext2D,
  points: LinePoint[],
  width: number,
  height: number,
  color: string,
): void {
  ctx.clearRect(0, 0, width, height);
  const ink = cssVar("--ink", "#1a1a1a");
  const line = cssVar("--line", "#e5e7eb");

  if (points.length === 0) {
    ctx.fillStyle = cssVar("--muted", "#6b7280");
    ctx.font = "14px Manrope, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No data yet", width / 2, height / 2);
    return;
  }

  const padding = { top: 16, right: 12, bottom: 28, left: 12 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...points.map((p) => p.value), 1);
  const stepX = points.length > 1 ? chartW / (points.length - 1) : chartW;

  // Grid.
  ctx.strokeStyle = line;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 3; i++) {
    const y = padding.top + (chartH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  // Filled area beneath the line.
  ctx.fillStyle = color + "22";
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + chartH - (p.value / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(padding.left + (points.length - 1) * stepX, padding.top + chartH);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.closePath();
  ctx.fill();

  // Line.
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + chartH - (p.value / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Labels.
  ctx.fillStyle = ink;
  ctx.font = "10px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const step = Math.max(1, Math.ceil(points.length / 6));
  points.forEach((p, i) => {
    if (i % step === 0 || i === points.length - 1) {
      const x = padding.left + i * stepX;
      ctx.fillText(p.label, x, height - padding.bottom + 6);
    }
  });
}

/**
 * Calendar heat map: month grid with cells colored by daily spend.
 * Gradient: green (low) -> yellow -> orange -> red (high relative to maxCents).
 */
export function drawHeatmap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cells: { day: number; cents: number }[],
  firstWeekday: number,
  maxCents: number,
): void {
  ctx.clearRect(0, 0, width, height);
  const muted = cssVar("--muted", "#6b7280");
  const ink = cssVar("--ink", "#1a1a1a");
  const panel = cssVar("--panel", "#f9fafb");

  const headerH = 18;
  const cols = 7;
  const totalDays = cells.length;
  const rows = Math.ceil((firstWeekday + totalDays) / cols);

  const cellW = width / cols;
  const cellH = (height - headerH) / rows;
  const cellSize = Math.min(cellW, cellH);
  const padX = (width - cellSize * cols) / 2;
  const padY = headerH + (height - headerH - cellSize * rows) / 2;

  // Weekday header.
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  ctx.fillStyle = muted;
  ctx.font = "10px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 7; i++) {
    ctx.fillText(weekdays[i]!, padX + cellSize * i + cellSize / 2, headerH / 2 + 2);
  }

  // Cells.
  for (let i = 0; i < totalDays; i++) {
    const cell = cells[i]!;
    const slot = firstWeekday + i;
    const r = Math.floor(slot / cols);
    const c = slot % cols;
    const x = padX + c * cellSize + 1;
    const y = padY + r * cellSize + 1;
    const size = cellSize - 2;

    const intensity = maxCents > 0 ? Math.min(1, cell.cents / maxCents) : 0;
    const color = heatColor(intensity, cell.cents === 0, panel);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 4);
    ctx.fill();

    // Day number, darker on light cells.
    ctx.fillStyle = intensity > 0.55 ? "#ffffff" : ink;
    ctx.font = `${Math.max(9, Math.floor(size * 0.32))}px Manrope, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(cell.day), x + size / 2, y + size / 2);
  }
}

function heatColor(t: number, empty: boolean, emptyBg: string): string {
  if (empty) return emptyBg;
  // green (#16a34a) -> yellow (#facc15) -> orange (#f97316) -> red (#dc2626)
  const stops = [
    { at: 0, c: [22, 163, 74] },
    { at: 0.33, c: [250, 204, 21] },
    { at: 0.66, c: [249, 115, 22] },
    { at: 1, c: [220, 38, 38] },
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]!;
    const b = stops[i + 1]!;
    if (t >= a.at && t <= b.at) {
      const k = (t - a.at) / (b.at - a.at);
      const r = Math.round(a.c[0]! + (b.c[0]! - a.c[0]!) * k);
      const g = Math.round(a.c[1]! + (b.c[1]! - a.c[1]!) * k);
      const bl = Math.round(a.c[2]! + (b.c[2]! - a.c[2]!) * k);
      return `rgb(${r}, ${g}, ${bl})`;
    }
  }
  return "rgb(220, 38, 38)";
}
