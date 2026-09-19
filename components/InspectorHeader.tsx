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
              ? 'bg-theme-primary text-white shadow-lg shadow-theme-primary/20'
              : 'bg-surface-card text-content-muted hover:bg-surface-card-subtle border border-border-subtle'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span className="text-sm font-medium">{t('inspector.new_inspection')}</span>
        </button>
        <button
          onClick={() => onViewChange('history')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
            currentView === 'history'
              ? 'bg-theme-primary text-white shadow-lg shadow-theme-primary/20'
              : 'bg-surface-card text-content-muted hover:bg-surface-card-subtle border border-border-subtle'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-sm font-medium">{t('inspector.history')}</span>
        </button>
      </div>
    </div>
  );
}