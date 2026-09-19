interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: 'amber' | 'green' | 'blue' | 'red' | 'slate' | 'zinc';
}

export function FilterChip({ label, active, onClick, color = 'amber' }: FilterChipProps) {
  const inactiveClass = 'bg-surface-card text-content-main border border-border-subtle hover:bg-surface-card-subtle shadow-sm';

  const colorClasses: Record<string, string> = {
    amber: active ? 'bg-theme-primary/20 text-theme-primary border-theme-primary/50' : inactiveClass,
    green: active ? 'bg-green-500/20 text-green-400 border-green-500/50' : inactiveClass,
    blue: active ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : inactiveClass,
    red: active ? 'bg-red-500/20 text-red-400 border-red-500/50' : inactiveClass,
    slate: active ? 'bg-zinc-600/50 text-white border-zinc-400/60' : inactiveClass,
    zinc: active ? 'bg-zinc-600/50 text-white border-zinc-400/60' : inactiveClass,
  };

  const resolvedClass = colorClasses[color] || (active ? 'bg-theme-primary/20 text-theme-primary border-theme-primary/50' : inactiveClass);

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${resolvedClass} hover:opacity-80`}
    >
      {label}
    </button>
  );
}

