interface FloatingSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

export default function FloatingSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}: FloatingSelectProps) {
  const hasValue = value !== '';

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`
          peer w-full px-4 py-3 pt-6 pb-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all appearance-none bg-white text-gray-900
          ${hasValue ? 'text-gray-900' : 'text-gray-400'}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* ラベル */}
      <label
        className={`
          absolute left-2 transition-all pointer-events-none font-medium
          ${
            hasValue
              ? 'top-1 text-xs text-blue-600'
              : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
          }
        `}
      >
        {label}
      </label>
    </div>
  );
}

