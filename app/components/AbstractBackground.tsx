export function AbstractBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-32 -left-24 w-[36rem] h-[36rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(45,212,191,0.35), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[42rem] h-[42rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.3), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-[30rem] h-[30rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(94,234,212,0.25), transparent 70%)" }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.15]" aria-hidden="true">
        <defs>
          <pattern id="dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(148,163,184,0.6)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    </div>
  );
}
