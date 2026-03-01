import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export function Tooltip({ text, children, position = 'top', className = '' }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const wrapperRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (!wrapperRef.current || !tooltipRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        const tip = tooltipRef.current.getBoundingClientRect();
        const GAP = 8;

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = rect.top - tip.height - GAP + window.scrollY;
                left = rect.left + rect.width / 2 - tip.width / 2 + window.scrollX;
                break;
            case 'bottom':
                top = rect.bottom + GAP + window.scrollY;
                left = rect.left + rect.width / 2 - tip.width / 2 + window.scrollX;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - tip.height / 2 + window.scrollY;
                left = rect.left - tip.width - GAP + window.scrollX;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - tip.height / 2 + window.scrollY;
                left = rect.right + GAP + window.scrollX;
                break;
        }

        // Clamp to viewport
        left = Math.max(8, Math.min(left, window.innerWidth - tip.width - 8));

        setCoords({ top, left });
    };

    useEffect(() => {
        if (visible) {
            // Small delay so the tooltip is rendered before measuring
            requestAnimationFrame(updatePosition);
        }
    }, [visible]);

    return (
        <div
            ref={wrapperRef}
            className={`relative inline-flex ${className}`}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}

            {visible && (
                <div
                    ref={tooltipRef}
                    style={{ top: coords.top, left: coords.left }}
                    className={`
            fixed z-[9999] pointer-events-none
            px-3 py-1.5 rounded-lg
            bg-slate-800/95 backdrop-blur-sm
            border border-slate-600/60
            text-slate-100 text-xs font-medium whitespace-nowrap
            shadow-xl shadow-black/40
            animate-in fade-in zoom-in-95 duration-150
          `}
                >
                    {text}
                    {/* Arrow */}
                    {position === 'top' && (
                        <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0
              border-x-4 border-x-transparent border-t-4 border-t-slate-700/90" />
                    )}
                    {position === 'bottom' && (
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0
              border-x-4 border-x-transparent border-b-4 border-b-slate-700/90" />
                    )}
                    {position === 'left' && (
                        <span className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0
              border-y-4 border-y-transparent border-l-4 border-l-slate-700/90" />
                    )}
                    {position === 'right' && (
                        <span className="absolute top-1/2 -translate-y-1/2 right-full w-0 h-0
              border-y-4 border-y-transparent border-r-4 border-r-slate-700/90" />
                    )}
                </div>
            )}
        </div>
    );
}
