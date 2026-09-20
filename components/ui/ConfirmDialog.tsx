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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-subtle shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${variant === 'danger'
                ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
              }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-content-main mb-2">{title}</h3>
              <p className="text-content-muted text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-card-subtle p-4 border-t border-border-subtle flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-content-muted hover:text-content-main hover:bg-surface-card border border-transparent hover:border-border-subtle transition-colors text-sm font-medium"
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
