import { Users, ClipboardList, AlertCircle, MapPin } from 'lucide-react';

interface AdminStatsProps {
  stats: any;
  session: any;
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      label: 'Total Usuarios',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'blue',
      detail: `${stats?.usersByRole?.inspector || 0} Inspectores, ${stats?.usersByRole?.client || 0} Clientes, ${stats?.usersByRole?.admin || 0} Admins`
    },
    {
      label: 'Total Venues',
      value: stats?.totalVenues || 0,
      icon: MapPin,
      color: 'purple',
      detail: 'Puntos de venta registrados'
    },
    {
      label: 'Total Inspecciones',
      value: stats?.totalInspections || 0,
      icon: ClipboardList,
      color: 'green',
      detail: 'Registradas en el sistema'
    },
    {
      label: 'Tickets Abiertos',
      value: stats?.openTickets || 0,
      icon: AlertCircle,
      color: 'red',
      detail: `${stats?.totalTickets || 0} totales`
    },
  ];

  const colorMap: any = {
    blue: {
      bg: 'bg-blue-600/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30'
    },
    green: {
      bg: 'bg-green-600/20',
      text: 'text-green-400',
      border: 'border-green-500/30'
    },
    amber: {
      bg: 'bg-amber-600/20',
      text: 'text-amber-400',
      border: 'border-amber-500/30'
    },
    red: {
      bg: 'bg-red-600/20',
      text: 'text-red-400',
      border: 'border-red-500/30'
    },
    purple: {
      bg: 'bg-purple-600/20',
      text: 'text-purple-400',
      border: 'border-purple-500/30'
    }
  };

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const colors = colorMap[stat.color];
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
              </div>
              <div className="text-3xl text-white font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400 mb-2">{stat.label}</div>
              <div className={`text-xs ${colors.text}`}>{stat.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Breakdown by Role */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg text-white font-semibold mb-6">Distribución de Usuarios por Rol</h3>
        <div className="space-y-4">
          {[
            { role: 'inspector', label: 'Inspectores', count: stats?.usersByRole?.inspector || 0, color: 'blue' },
            { role: 'client', label: 'Clientes', count: stats?.usersByRole?.client || 0, color: 'amber' },
            { role: 'admin', label: 'Administradores', count: stats?.usersByRole?.admin || 0, color: 'purple' },
          ].map((item) => {
            const percentage = stats?.totalUsers > 0 ? Math.round((item.count / stats.totalUsers) * 100) : 0;
            const colors = colorMap[item.color];

            return (
              <div key={item.role}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">{item.label}</span>
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {item.count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`${colors.bg} h-2 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Status */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg text-white font-semibold mb-6">Estado de Tickets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { status: 'open', label: 'Abiertos', count: stats?.ticketsByStatus?.open || 0, color: 'red' },
            { status: 'in-progress', label: 'En Progreso', count: stats?.ticketsByStatus?.['in-progress'] || 0, color: 'amber' },
            { status: 'resolved', label: 'Resueltos', count: stats?.ticketsByStatus?.resolved || 0, color: 'green' },
          ].map((item) => {
            const colors = colorMap[item.color];

            return (
              <div key={item.status} className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
                <div className="text-sm text-slate-400 mb-1">{item.label}</div>
                <div className={`text-2xl font-bold ${colors.text}`}>{item.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg text-white font-semibold mb-4">Información del Sistema</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Versión:</span>
            <span className="ml-2 text-white">1.0.0</span>
          </div>
          <div>
            <span className="text-slate-400">Última actualización:</span>
            <span className="ml-2 text-white">Enero 2026</span>
          </div>
          <div>
            <span className="text-slate-400">Base de datos:</span>
            <span className="ml-2 text-white">Supabase PostgreSQL</span>
          </div>
          <div>
            <span className="text-slate-400">Estado:</span>
            <span className="ml-2 text-green-400">● Operativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}