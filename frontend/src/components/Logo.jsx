export default function Logo({
  size = 40,
  name = 'Sparkpretty',
  sub = 'Closet',
  light = false,
  showWordmark = true,
  className = '',
  sparkle = true,
}) {
  const mark = light ? '#FFFFFF' : 'var(--primary)';
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
        {/* Main sparkle — four concave petals */}
        <path
          d="M32 8.5 Q21.5 21.5 8.5 32 Q21.5 42.5 32 55.5 Q42.5 42.5 55.5 32 Q42.5 21.5 32 8.5 Z"
          fill={mark}
        />
        {/* Inner facet — tone-on-tone gem cut */}
        <path
          d="M32 16.5 L44 32 L32 47.5 L20 32 Z"
          fill={mark}
          opacity="0.16"
        />
        {sparkle && (
          <>
            {/* Trailing sparkle */}
            <path
              d="M52 7.5 Q49 10 46.5 13 Q49 16 52 18.5 Q55 16 57.5 13 Q55 10 52 7.5 Z"
              fill={mark}
              opacity="0.55"
            />
            {/* Gem dot */}
            <circle cx="60.5" cy="20.5" r="1.7" fill={mark} opacity="0.4" />
          </>
        )}
      </svg>
      {showWordmark && (
        <span className="flex flex-col leading-none text-left">
          <span
            className={`font-heading font-semibold tracking-[-0.01em] ${
              size >= 40 ? 'text-xl md:text-[22px]' : 'text-base'
            } ${light ? 'text-white' : 'text-text'}`}
          >
            {name}
          </span>
          <span className={`mt-[5px] flex items-center gap-2 ${light ? 'text-white/70' : 'text-secondary'}`}>
            <span className={`w-5 h-px ${light ? 'bg-white/50' : 'bg-primary/50'}`} aria-hidden="true" />
            <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.3em]">
              {sub}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}