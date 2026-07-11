export function ArchitecturalIllustration() {
  return (
    <svg
      viewBox="0 0 520 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-w-xl mx-auto"
      aria-hidden="true"
    >
      <g stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinejoin="round">
        {/* Roof plane */}
        <path d="M100 190 L260 110 L420 190 L260 270 Z" />
        {/* Left wall */}
        <path d="M100 190 L100 400 L260 480 L260 270 Z" />
        {/* Right wall */}
        <path d="M420 190 L420 400 L260 480 L260 270 Z" />
        {/* Roof ridge + cross braces */}
        <line x1="260" y1="110" x2="260" y2="270" />
        <line x1="100" y1="190" x2="260" y2="270" />
        <line x1="420" y1="190" x2="260" y2="270" />
        {/* Vertical corner supports */}
        <line x1="100" y1="190" x2="100" y2="400" opacity="0.5" />
        <line x1="420" y1="190" x2="420" y2="400" opacity="0.5" />
        {/* Facade grid lines, left */}
        <line x1="130" y1="235" x2="230" y2="285" opacity="0.4" />
        <line x1="130" y1="280" x2="230" y2="330" opacity="0.4" />
        <line x1="130" y1="325" x2="230" y2="375" opacity="0.4" />
        <line x1="130" y1="370" x2="230" y2="420" opacity="0.4" />
        {/* Facade grid lines, right */}
        <line x1="390" y1="235" x2="290" y2="285" opacity="0.4" />
        <line x1="390" y1="280" x2="290" y2="330" opacity="0.4" />
        <line x1="390" y1="325" x2="290" y2="375" opacity="0.4" />
        <line x1="390" y1="370" x2="290" y2="420" opacity="0.4" />
      </g>
      {/* Lit window accent */}
      <rect x="235" y="330" width="50" height="70" fill="rgba(45,212,191,0.18)" stroke="rgba(94,234,212,0.6)" strokeWidth="1.2" />
      <circle cx="260" cy="190" r="3" fill="rgba(94,234,212,0.9)" />
    </svg>
  );
}
