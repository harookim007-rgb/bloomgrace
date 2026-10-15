import type { Zone } from "@/lib/consultationData";

// Line drawing of a woman's face and hair. The areas being asked about or diagnosed glow softly,
// and little particles float over them: flakes for dry areas, sparkles for oily ones, a warm
// pulse for sensitive skin, dots for breakouts, and flakes over the scalp for hair questions.

export type FigureZone = Zone | "scalp" | "lengths";
type Highlight = {
  oily?: Zone[]; dry?: Zone[]; sensitive?: boolean; spots?: boolean; balanced?: boolean;
  focus?: FigureZone;
};

const C = { oily: "#e9a77c", dry: "#8cbbe3", sensitive: "#ef9aa7", balanced: "#a7d3a0", focus: "#e39bb0", line: "#5d6774" };

// Glow shapes for each area (viewBox 20 30 160 200).
const SHAPE: Record<Exclude<FigureZone, "spots" | "redness">, JSX.Element> = {
  full: <path d="M100,64 C79,64 70,82 70,104 C70,134 84,160 100,163 C116,160 130,134 130,104 C130,82 121,64 100,64 Z" />,
  tzone: <path d="M80,74 C80,68 120,68 120,74 L120,86 C120,90 107,90 105,94 L105,128 C105,133 95,133 95,128 L95,94 C93,90 80,90 80,86 Z" />,
  cheeks: <g><ellipse cx="84" cy="126" rx="10" ry="8" /><ellipse cx="116" cy="126" rx="10" ry="8" /></g>,
  scalp: <path d="M66,80 C68,52 132,52 134,80 C120,64 80,64 66,80 Z" />,
  lengths: <path d="M60,96 C60,140 54,170 46,204 L62,204 C68,170 72,140 72,104 Z M140,96 C140,140 146,170 154,204 L138,204 C132,170 128,140 128,104 Z" />,
};

// Where particles float for each area.
const POINTS: Record<FigureZone, [number, number][]> = {
  full: [[86, 84], [112, 82], [80, 110], [120, 108], [92, 140], [110, 146], [100, 100]],
  tzone: [[86, 78], [100, 76], [114, 78], [100, 100], [100, 116]],
  cheeks: [[80, 122], [88, 132], [112, 130], [120, 122]],
  scalp: [[78, 66], [92, 58], [108, 58], [122, 66], [100, 54]],
  lengths: [[60, 150], [56, 180], [140, 150], [144, 180]],
  spots: [[90, 80], [112, 82], [82, 134], [118, 130], [100, 154]],
  redness: [[84, 126], [116, 126], [100, 124]],
};

const Glow = ({ zone, color, delay = 0 }: { zone: FigureZone; color: string; delay?: number }) => {
  const style = { fill: color, animation: `fig-glow 2.6s ease-in-out ${delay}s infinite` };
  if (zone === "spots") return null;
  if (zone === "redness") return <g style={style}><ellipse cx="84" cy="126" rx="12" ry="9" /><ellipse cx="116" cy="126" rx="12" ry="9" /></g>;
  return <g style={style}>{SHAPE[zone]}</g>;
};

// Floating particles: small flakes (dry), four-point sparkles (oily), round dots (others).
const Particles = ({ zone, kind, color }: { zone: FigureZone; kind: "flake" | "sparkle" | "dot"; color: string }) => (
  <g>
    {POINTS[zone].map(([x, y], i) => {
      const style = { animation: `fig-float ${2.4 + (i % 3) * 0.5}s ease-in-out ${i * 0.35}s infinite`, transformBox: "fill-box" as const, transformOrigin: "center" };
      if (kind === "sparkle") return <path key={i} style={style} fill={color} d={`M${x},${y - 3.2} L${x + 0.9},${y - 0.9} L${x + 3.2},${y} L${x + 0.9},${y + 0.9} L${x},${y + 3.2} L${x - 0.9},${y + 0.9} L${x - 3.2},${y} L${x - 0.9},${y - 0.9} Z`} />;
      if (kind === "flake") return <rect key={i} style={style} fill="#fff" stroke={color} strokeWidth="0.8" x={x - 1.8} y={y - 1.8} width="3.6" height="3.6" rx="0.8" transform={`rotate(45 ${x} ${y})`} />;
      return <circle key={i} style={style} fill={color} cx={x} cy={y} r="2.4" />;
    })}
  </g>
);

const FaceDiagram = ({ highlight, labels, className = "", size = "w-48 md:w-64" }: {
  highlight: Highlight;
  labels?: { oily: string; dry: string; sensitive: string; breakouts: string; balanced: string };
  className?: string;
  size?: string;
}) => {
  const legend = labels ? [
    highlight.oily?.length ? { color: C.oily, text: labels.oily } : null,
    highlight.dry?.length ? { color: C.dry, text: labels.dry } : null,
    highlight.sensitive ? { color: C.sensitive, text: labels.sensitive } : null,
    highlight.spots ? { color: "#c25a68", text: labels.breakouts } : null,
    highlight.balanced ? { color: C.balanced, text: labels.balanced } : null,
  ].filter(Boolean) as { color: string; text: string }[] : [];
  const focus = highlight.focus;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <style>{`
        @keyframes fig-glow { 0%, 100% { opacity: .28 } 50% { opacity: .7 } }
        @keyframes fig-float { 0% { transform: translateY(2px); opacity: 0 } 25% { opacity: 1 } 70% { opacity: .9 } 100% { transform: translateY(-9px); opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { [style*="fig-"] { animation: none !important; opacity: .7 } }
      `}</style>
      <svg viewBox="20 30 160 200" className={`${size} h-auto`} role="img" aria-hidden="true">
        {/* hair behind the face */}
        <path d="M100,40 C64,40 52,66 56,104 C59,140 52,172 42,212 L76,212 C70,186 70,150 72,112 L128,112 C130,150 130,186 124,212 L158,212 C148,172 141,140 144,104 C148,66 136,40 100,40 Z" fill="#f4e9e3" />

        {highlight.balanced && <Glow zone="full" color={C.balanced} />}
        {highlight.dry?.map((z, i) => <Glow key={`d${z}`} zone={z} color={C.dry} delay={i * 0.4} />)}
        {highlight.oily?.map((z, i) => <Glow key={`o${z}`} zone={z} color={C.oily} delay={0.7 + i * 0.4} />)}
        {highlight.sensitive && <Glow zone="redness" color={C.sensitive} />}
        {focus && focus !== "spots" && <Glow zone={focus} color={C.focus} />}

        <g fill="none" stroke={C.line} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* long hair outline */}
          <path d="M100,40 C64,40 52,66 56,104 C59,140 52,172 42,212" />
          <path d="M100,40 C136,40 148,66 144,104 C141,140 148,172 158,212" />
          {/* face */}
          <path d="M100,64 C79,64 70,82 70,104 C70,134 84,160 100,163 C116,160 130,134 130,104 C130,82 121,64 100,64 Z" fill="#fffaf6" />
          {/* side-swept fringe */}
          <path d="M70,98 C70,70 86,58 104,58 C96,66 92,74 90,84" />
          <path d="M104,58 C120,60 130,72 130,96" />
          {/* brows, lashes, eyes */}
          <path d="M80,94 Q87,90 94,93" /><path d="M106,93 Q113,90 120,94" />
          <path d="M81,104 Q87,100 93,104" /><path d="M107,104 Q113,100 119,104" />
          <path d="M81,104 l-2,-2" /><path d="M119,104 l2,-2" />
          {/* nose and lips */}
          <path d="M100,108 C98,118 97,124 101,126" />
          <path d="M91,141 C95,138 99,140 100,140 C101,140 105,138 109,141 C105,146 95,146 91,141 Z" fill="#efb3b8" stroke="#c98a91" />
          {/* neck and shoulders */}
          <path d="M92,160 L91,178 C72,182 56,190 48,212" /><path d="M108,160 L109,178 C128,182 144,190 152,212" />
        </g>

        {highlight.dry?.map(z => <Particles key={`pd${z}`} zone={z} kind="flake" color={C.dry} />)}
        {highlight.oily?.map(z => <Particles key={`po${z}`} zone={z} kind="sparkle" color="#f0b37f" />)}
        {highlight.sensitive && <Particles zone="redness" kind="dot" color={C.sensitive} />}
        {highlight.spots && <Particles zone="spots" kind="dot" color="#c25a68" />}
        {highlight.balanced && <Particles zone="full" kind="sparkle" color="#8cc583" />}
        {focus && <Particles zone={focus} kind={focus === "spots" ? "dot" : focus === "scalp" ? "flake" : "sparkle"} color={focus === "spots" ? "#c25a68" : C.focus} />}
      </svg>
      {legend.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {legend.map(l => (
            <span key={l.text} className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />{l.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaceDiagram;
