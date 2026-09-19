interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  fullScreen = false,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-theme-primary border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Cargando"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface-app/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
        {spinner}
        {text && (
          <p className="mt-4 text-sm text-content-muted animate-pulse font-medium">
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {spinner}
      {text && (
        <p className="text-sm text-content-muted animate-pulse font-medium">
          {text}
        </p>
      )}
    </div>
  );
}
