import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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

    // Estimate width so we can center/avoid clipping before mount
    const APPROX_WIDTH = Math.max(text.length * 7.5, 120);
    const APPROX_HEIGHT = 32;
    const GAP = 8;

    const calcCoords = () => {
        if (!wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = rect.top - APPROX_HEIGHT - GAP;
                left = rect.left + rect.width / 2 - APPROX_WIDTH / 2;
                break;
            case 'bottom':
                top = rect.bottom + GAP;
                left = rect.left + rect.width / 2 - APPROX_WIDTH / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - APPROX_HEIGHT / 2;
                left = rect.left - APPROX_WIDTH - GAP;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - APPROX_HEIGHT / 2;
                left = rect.right + GAP;
                break;
        }

        // Clamp to viewport edges
        left = Math.max(8, Math.min(left, window.innerWidth - APPROX_WIDTH - 8));
        top = Math.max(8, Math.min(top, window.innerHeight - APPROX_HEIGHT - 8));

        setCoords({ top, left });
    };

    const handleMouseEnter = () => {
        calcCoords();
        setVisible(true);
    };

    const handleMouseLeave = () => {
        setVisible(false);
    };

    // Recalculate on scroll/resize while visible
    useEffect(() => {
        if (!visible) return;
        const handleScroll = () => calcCoords();
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [visible]);

    const arrowBase = 'absolute w-0 h-0 border-transparent';

    const tooltipContent = visible
        ? createPortal(
            <div
                style={{
                    position: 'fixed',
                    top: coords.top,
                    left: coords.left,
                    zIndex: 99999,
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        background: 'rgba(15, 23, 42, 0.97)',
                        border: '1px solid rgba(100, 116, 139, 0.4)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#e2e8f0',
                        fontSize: '12px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(8px)',
                        position: 'relative',
                    }}
                >
                    {text}
                    {/* Arrow */}
                    {position === 'top' && (
                        <span
                            className={arrowBase}
                            style={{
                                left: '50%',
                                transform: 'translateX(-50%)',
                                top: '100%',
                                borderWidth: '5px 5px 0',
                                borderTopColor: 'rgba(100,116,139,0.4)',
                            }}
                        />
                    )}
                    {position === 'bottom' && (
                        <span
                            className={arrowBase}
                            style={{
                                left: '50%',
                                transform: 'translateX(-50%)',
                                bottom: '100%',
                                borderWidth: '0 5px 5px',
                                borderBottomColor: 'rgba(100,116,139,0.4)',
                            }}
                        />
                    )}
                    {position === 'left' && (
                        <span
                            className={arrowBase}
                            style={{
                                top: '50%',
                                transform: 'translateY(-50%)',
                                left: '100%',
                                borderWidth: '5px 0 5px 5px',
                                borderLeftColor: 'rgba(100,116,139,0.4)',
                            }}
                        />
                    )}
                    {position === 'right' && (
                        <span
                            className={arrowBase}
                            style={{
                                top: '50%',
                                transform: 'translateY(-50%)',
                                right: '100%',
                                borderWidth: '5px 5px 5px 0',
                                borderRightColor: 'rgba(100,116,139,0.4)',
                            }}
                        />
                    )}
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <div
            ref={wrapperRef}
            className={`relative inline-flex ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {tooltipContent}
        </div>
    );
}
