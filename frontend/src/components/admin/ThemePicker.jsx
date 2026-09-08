import { Check } from 'lucide-react';
import { useTheme, THEMES, THEME_ORDER } from '../../context/ThemeContext';

export default function ThemePicker({ value, onSelect, onPreview, size = 'md' }) {
  const { theme } = useTheme();
  const current = value || theme;

  const swatchSize = size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {THEME_ORDER.map((id) => {
        const t = THEMES[id];
        const active = current === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            onMouseEnter={() => onPreview && onPreview(id)}
            onMouseLeave={() => onPreview && onPreview(current)}
            className={`group rounded-xl border-2 p-3 text-left transition-all ${
              active ? 'border-primary shadow-card-hover' : 'border-border hover:border-primary/50'
            }`}
            aria-pressed={active}
          >
            <div className={`${swatchSize} rounded-lg mb-3 flex items-center justify-center shadow-inner`} style={{ backgroundColor: t.swatch }}>
              {active && <Check size={size === 'lg' ? 28 : 20} className="text-white" />}
            </div>
            <p className="text-sm font-semibold">{t.label}</p>
            <p className="text-xs text-text-light mt-0.5 leading-snug">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
