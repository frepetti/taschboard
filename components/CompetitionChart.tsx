import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '../utils/LanguageContext';

export function CompetitionChart() {
  const { t, language } = useLanguage();
  
  const data = [
    { brand: "Hendrick's", shareOfMenu: 23.4, avgPrice: 14.5 },
    { brand: 'Tanqueray', shareOfMenu: 19.2, avgPrice: 12.0 },
    { brand: 'Bombay Sapphire', shareOfMenu: 16.8, avgPrice: 13.0 },
    { brand: 'Monkey 47', shareOfMenu: 12.5, avgPrice: 16.0 },
    { brand: 'Aviation', shareOfMenu: 10.3, avgPrice: 13.5 },
    { brand: 'Roku', shareOfMenu: 9.1, avgPrice: 15.0 },
    { brand: 'Others', shareOfMenu: 8.7, avgPrice: 11.0 },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
      <h3 className="text-lg text-white font-semibold mb-6">{t('charts.share_of_menu')}</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            type="number" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8' }}
            axisLine={{ stroke: '#475569' }}
          />
          <YAxis 
            type="category" 
            dataKey="brand" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8' }}
            axisLine={{ stroke: '#475569' }}
            width={120}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Bar 
            dataKey="shareOfMenu" 
            fill="#f59e0b" 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-slate-700/50 text-sm text-slate-400">
        <span className="text-amber-400 font-semibold">Hendrick's</span> {t('charts.leads_text')} 23.4% {t('charts.share_across')} 247 {language === 'es' ? 'puntos de venta' : 'venues'}
      </div>
    </div>
  );
}