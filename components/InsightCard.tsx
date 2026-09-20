import { Lightbulb } from 'lucide-react';

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
    <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-theme-primary" />
        <h3 className="text-lg text-content-main font-semibold">Key Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div key={i} className="p-4 bg-surface-card-subtle rounded-lg border border-border-subtle">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${insight.priority === 'high' ? 'bg-amber-400' :
                  insight.priority === 'medium' ? 'bg-blue-400' :
                    'bg-content-muted'
                }`} />
              <div className="flex-1 min-w-0">
                <h4 className="text-content-main font-medium mb-1 text-sm">{insight.title}</h4>
                <p className="text-content-muted text-xs leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border-subtle">
        <button className="w-full text-sm text-theme-primary hover:underline transition-colors font-medium">
          View All Insights →
        </button>
      </div>
    </div>
  );
}
