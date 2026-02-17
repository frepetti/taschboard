import { AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';

interface Insight {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface InsightCardProps {
  insights: Insight[];
}

export function InsightCard({ insights }: InsightCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl h-full">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg text-white font-semibold">Key Insights</h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div key={i} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                insight.priority === 'high' ? 'bg-amber-400' :
                insight.priority === 'medium' ? 'bg-blue-400' :
                'bg-slate-400'
              }`} />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium mb-1 text-sm">{insight.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <button className="w-full text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium">
          View All Insights →
        </button>
      </div>
    </div>
  );
}
