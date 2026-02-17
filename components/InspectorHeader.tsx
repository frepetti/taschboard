import { ClipboardList, History } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';

interface InspectorHeaderProps {
  currentView: 'new' | 'history';
  onViewChange: (view: 'new' | 'history') => void;
}

export function InspectorHeader({ currentView, onViewChange }: InspectorHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewChange('new')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
            currentView === 'new'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span className="text-sm font-medium">{t('inspector.new_inspection')}</span>
        </button>
        <button
          onClick={() => onViewChange('history')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
            currentView === 'history'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-sm font-medium">{t('inspector.history')}</span>
        </button>
      </div>
    </div>
  );
}