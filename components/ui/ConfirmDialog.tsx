import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${variant === 'danger'
                ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
              }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg transition-all hover:scale-105 ${variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
