/* Decorative SVG components for Ninja School Online theme */

// Shuriken (throwing star) SVG
export function Shuriken({ size = 40, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none">
      <g fill="currentColor">
        <path d="M50 5 L58 42 L95 50 L58 58 L50 95 L42 58 L5 50 L42 42 Z" opacity="0.9"/>
        <path d="M50 5 L58 42 L95 50 L58 58 L50 95 L42 58 L5 50 L42 42 Z"
          transform="rotate(45 50 50)" opacity="0.5"/>
        <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.8"/>
      </g>
    </svg>
  );
}

// Ninja Mask SVG illustration
export function NinjaMask({ size = 120, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} fill="none">
      {/* Head */}
      <ellipse cx="100" cy="95" rx="60" ry="65" fill="#1e293b" stroke="#f97316" strokeWidth="2"/>
      {/* Headband */}
      <rect x="42" y="72" width="116" height="22" rx="4" fill="#dc2626"/>
      {/* Headband symbol */}
      <text x="100" y="88" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="serif">忍</text>
      {/* Eyes */}
      <ellipse cx="78" cy="108" rx="14" ry="10" fill="#0f172a"/>
      <ellipse cx="122" cy="108" rx="14" ry="10" fill="#0f172a"/>
      <circle cx="80" cy="107" r="5" fill="#f97316"/>
      <circle cx="124" cy="107" r="5" fill="#f97316"/>
      <circle cx="82" cy="105" r="2" fill="white"/>
      <circle cx="126" cy="105" r="2" fill="white"/>
      {/* Mask bottom */}
      <path d="M50 125 Q100 145 150 125 L148 155 Q100 170 52 155 Z" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
      {/* Mask ties */}
      <path d="M42 95 L10 80 M158 95 L190 80" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

// Kunai (ninja knife) SVG
export function Kunai({ size = 80, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 200" className={className} fill="none">
      {/* Blade */}
      <path d="M40 10 L50 60 L44 180 L36 180 L30 60 Z" fill="#94a3b8"/>
      <path d="M40 10 L50 60 L40 65 Z" fill="#cbd5e1"/>
      {/* Guard */}
      <rect x="25" y="175" width="30" height="8" rx="2" fill="#64748b"/>
      {/* Ring */}
      <circle cx="40" cy="190" r="8" stroke="#f97316" strokeWidth="3" fill="none"/>
      {/* Shine */}
      <path d="M36 15 L38 55" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
    </svg>
  );
}

// Scroll / parchment
export function ScrollBanner({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M0 10 Q200 0 400 10 L400 70 Q200 80 0 70 Z" fill="#1e293b" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.4"/>
      </svg>
      <div className="relative z-10 px-8 py-4">{children}</div>
    </div>
  );
}

// Village gate / torii-style banner frame
export function NinjaVillageBadge({ label, className = '' }) {
  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary"/>
      <span className="text-xs font-bold tracking-widest uppercase text-primary">{label}</span>
      <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary"/>
    </div>
  );
}
