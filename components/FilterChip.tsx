interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: 'amber' | 'green' | 'blue' | 'red';
}

export function FilterChip({ label, active, onClick, color = 'amber' }: FilterChipProps) {
  const colorClasses = {
    amber: active ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700',
    green: active ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700',
    blue: active ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700',
    red: active ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${colorClasses[color]} hover:opacity-80`}
    >
      {label}
    </button>
  );
}
