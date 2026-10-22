// A four-layer flight-controller board, drawn as its stack-up and pulled
// apart into its layers. The separation comes from the CSS variable
// --explode (0 closed, 1 fully apart) on any ancestor, so a scroll position
// can drive it without re-rendering. The stack-up is the standard one for a
// four-layer board: signal, ground plane, power plane, signal.
const LAYERS = [
  { key: "l1", label: "L1", name: "Signal, components", kind: "signal", seed: 7, parts: true },
  { key: "l2", label: "L2", name: "Ground plane", kind: "ground" },
  { key: "l3", label: "L3", name: "Power plane", kind: "power" },
  { key: "l4", label: "L4", name: "Signal", kind: "signal", seed: 19 },
];

// Deterministic pseudo-random numbers, so the artwork is the same on the
// server and in the browser.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Routed traces: runs that turn through 45 degrees, as a router draws them.
function traces(seed) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < 16; i++) {
    let x = 8 + r() * 84;
    let y = 8 + r() * 84;
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    let dir = Math.floor(r() * 8);
    for (let j = 0; j < 4; j++) {
      const len = 6 + r() * 16;
      const a = (dir * Math.PI) / 4;
      x = Math.min(94, Math.max(6, x + Math.cos(a) * len));
      y = Math.min(94, Math.max(6, y + Math.sin(a) * len));
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      dir = (dir + (r() < 0.5 ? 1 : 7)) % 8;
    }
    out.push(d);
  }
  return out;
}

const VIAS = [
  [14, 18], [30, 12], [52, 20], [78, 14], [88, 34], [70, 44], [22, 46], [40, 62],
  [86, 64], [62, 76], [28, 84], [12, 70], [50, 88], [80, 86],
];

function Layer({ layer }) {
  const id = `pcb-${layer.key}`;
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={`${id}-hatch`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="rgba(214,217,221,0.32)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0.5" y="0.5" width="99" height="99" fill="rgba(22,24,27,0.9)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" />
      {layer.kind === "ground" && <rect x="4" y="4" width="92" height="92" fill={`url(#${id}-hatch)`} />}
      {layer.kind === "power" && (
        <>
          <path d="M4 4 H62 V40 H96 V96 H4 Z" fill={`url(#${id}-hatch)`} />
          <path d="M66 4 H96 V36 H66 Z" fill="rgba(214,217,221,0.14)" />
        </>
      )}
      {layer.kind === "signal" &&
        traces(layer.seed).map((d, i) => (
          <path key={i} d={d} fill="none" stroke="rgba(226,229,233,0.78)" strokeWidth="0.7" strokeLinejoin="round" />
        ))}
      {VIAS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="#0b0b0b" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      ))}
      {layer.parts && (
        <>
          {/* The processor, as an LQFP footprint with its pins. */}
          <rect x="38" y="38" width="24" height="24" fill="#0d0e10" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />
          {Array.from({ length: 9 }, (_, i) => 40 + i * 2.5).map((p) => (
            <g key={p} stroke="rgba(226,229,233,0.85)" strokeWidth="0.5">
              <line x1={p} y1="35" x2={p} y2="38" />
              <line x1={p} y1="62" x2={p} y2="65" />
              <line x1="35" y1={p} x2="38" y2={p} />
              <line x1="62" y1={p} x2="65" y2={p} />
            </g>
          ))}
          <rect x="12" y="74" width="10" height="7" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
          <rect x="74" y="20" width="8" height="10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
          <rect x="70" y="72" width="14" height="8" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        </>
      )}
    </svg>
  );
}

export default function PcbStack({ caption }) {
  return (
    <div className="relative h-full w-full overflow-hidden [perspective:1100px]">
      <div
        className="absolute left-[40%] top-[47%] aspect-square w-[50%] [transform-style:preserve-3d]"
        style={{ transform: "translate(-50%, -50%) rotateX(56deg) rotateZ(-38deg)" }}
      >
        {LAYERS.map((layer, i) => (
          <div
            key={layer.key}
            className="absolute inset-0"
            style={{ transform: `translateZ(calc(${1.5 - i} * (5px + 38px * var(--explode, 0))))` }}
          >
            <Layer layer={layer} />
          </div>
        ))}
      </div>

      {/* The layer names, fanned out as the layers separate. */}
      <ol className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 flex-col sm:right-6" style={{ gap: "calc(4px + 22px * var(--explode, 0))" }}>
        {LAYERS.map((layer) => (
          <li key={layer.key} className="flex items-baseline gap-2 text-[10px] uppercase tracking-[0.16em] text-[var(--sw-gray)]">
            <span className="tabular-nums text-white">{layer.label}</span>
            <span className="max-sm:hidden" style={{ opacity: "calc(0.25 + 0.75 * var(--explode, 0))" }}>{layer.name}</span>
          </li>
        ))}
      </ol>

      {caption && <p className="absolute inset-x-5 bottom-4 text-[11px] leading-relaxed text-[var(--sw-gray)] sm:inset-x-6">{caption}</p>}
    </div>
  );
}
