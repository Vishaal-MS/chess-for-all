import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTheme, useNotify } from 'react-admin';
import { useTheme as useMUITheme } from '@mui/material/styles';

interface FullscreenPortalProps {
    isActive: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    contentStyle?: React.CSSProperties;
}

export const FullscreenPortal = ({
    isActive,
    onClose,
    children,
    className = '',
    style = {},
    contentStyle = {},
}: FullscreenPortalProps) => {
    const [raTheme] = useTheme();
    const muiTheme = useMUITheme();
    const notify = useNotify();

    useEffect(() => {
        if (isActive) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            notify('ESC to exit Fullscreen', {
                anchorOrigin: { vertical: 'top', horizontal: 'center' },
                autoHideDuration: 2000,
            });
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isActive]);

    if (!isActive) return children;

     const defaultStyle: React.CSSProperties = {
        backgroundColor: muiTheme?.palette.background.paper || 'white',
        color: muiTheme?.palette.text.primary || 'black',
        backgroundImage: 'var(--Paper-overlay)',
        padding: '1rem',
        ...contentStyle
     };

    return ReactDOM.createPortal(
        <div
            className={className}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
                height: '100%',
                ...style,
            }}
        >
            <div style={defaultStyle}>
                {children}
            </div>
        </div>,
        document.body
    );
};
