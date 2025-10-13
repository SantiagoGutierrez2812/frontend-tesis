import { useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export const useIdleTimer = (onIdle: () => void) => {
    const timeoutRef = useRef<number | null>(null);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            onIdle(); 
        }, IDLE_TIMEOUT_MS);
    }, [onIdle]);

    const handleActivity = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    useEffect(() => {
        resetTimer();

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [handleActivity, resetTimer]);
};