import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function OpportunityBreakdown() {
  const data = [
    { name: 'Rotation Potential', value: 32, color: '#f59e0b' },
    { name: 'Profile Fit', value: 28, color: '#3b82f6' },
    { name: 'Brand Presence', value: 25, color: '#10b981' },
    { name: 'Previous Activations', value: 15, color: '#8b5cf6' },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg text-white font-semibold mb-2">Opportunity Score</h3>
        <div className="text-5xl text-amber-400 font-bold">8.2<span className="text-2xl text-slate-400">/10</span></div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300">{item.name}</span>
            </div>
            <span className="text-white font-semibold">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
