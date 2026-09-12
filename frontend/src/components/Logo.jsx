export default function Logo({ size = 40, name = 'Sparkpretty', sub = 'Closet', light = false, showWordmark = true, className = '', refined = true }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label={`${name} ${sub} logo`}
        className="shrink-0"
      >
        <rect x="1.5" y="1.5" width="61" height="61" rx="17" fill="var(--primary)" />
        <rect
          x="1.5" y="1.5" width="61" height="61" rx="17"
          fill="none"
          stroke="var(--primary-dark)"
          strokeOpacity="0.28"
          strokeWidth="1"
        />
        <path
          d="M32 11.5c2.5 9.1 7 13.6 16.2 15.8-9.2 2.2-13.7 6.7-16.2 15.8-2.5-9.1-7-13.6-16.2-15.8 9.2-2.2 13.7-6.7 16.2-15.8Z"
          fill="#FFFFFF"
        />
        <circle cx="47.5" cy="16" r="3.1" fill="#FFFFFF" opacity="0.5" />
        {refined && (
          <circle cx="14" cy="50" r="1.8" fill="#FFFFFF" opacity="0.4" />
        )}
      </svg>
      {showWordmark && (
        <span className="flex flex-col leading-none text-left">
          <span className={`font-heading font-bold ${size >= 40 ? 'text-lg md:text-xl' : 'text-base'} ${light ? 'text-white' : 'text-text'}`}>
            {name}
          </span>
          <span
            className={`mt-0.5 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.3em] ${
              light ? 'text-white/70' : 'text-secondary'
            }`}
          >
            {sub}
          </span>
        </span>
      )}
    </span>
  );
}