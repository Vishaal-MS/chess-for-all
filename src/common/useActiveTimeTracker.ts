import { useState, useEffect, useRef, useCallback } from "react";

interface UseActiveTimeTrackerOptions {
    roundToSeconds?: boolean; // Default to true, rounds to the nearest second
    initialActiveTime?: number; // Starting active time in milliseconds
    enabled?: boolean;
    onActive?: (currentActiveTime: number) => void; // Called when active time updates
    onInactive?: (finalActiveTime: number) => Promise<void> | void; // Called when component unmount and finalized
}


// TODO: For more nasty studends we need to handle this more effectively 
//       eg: Track for tab size 80%, mousemove, keydown, etc...

/**
* Custom React hook to track the time a user actively views a component or browser tab.
* 
* It tracks tab visibility and accumulates active time every second. When the user becomes inactive 
* (e.g., on tab switch or component unmount), the `onInactive` callback is triggered with the final 
* active time in seconds.
* 
* @param options - Configuration for enabling tracking, rounding, initial time, and callback hooks.
* @returns The total active time in seconds.
* 
* @example
* 
* // Basic Example
* function MyComponent() {
*     const totalActiveTime = useActiveTimeTracker({
*         enabled: isActive, // based on logic ennable of disable tracker
*         onInactive: (time) => {
*             console.log("User was active for:", time, "seconds");
*             // Send data to an API or perform other actions
*         },
*     });
*     return (
*         <div>
*             <h1>My Component</h1>
*             <p>Active Time: {totalActiveTime} seconds</p>
*         </div>
*     );
* }
* 
* // Example with active time render in every Sec.
* function MyComponent() {
*     const [activeTime, setActiveTime] = useState(0);
* 
*     useActiveTimeTracker({
*         onActive: (current) => setActiveTime(current),
*         onInactive: (final) => {
*             console.log("Final time:", final);
*         },
*     });
* 
*     return (
*         <div>
*             <h1>My Component</h1>
*             <p>Active Time: {activeTime} seconds</p>
*         </div>
*     );
* }
*/

function useActiveTimeTracker(options?: UseActiveTimeTrackerOptions): number {
    const {
        roundToSeconds = true,
        initialActiveTime = 0,
        enabled = true,
        onActive,
        onInactive,
    } = options || {};

    const [isTabActive, setIsTabActive] = useState<boolean>(!document.hidden);
    const activeTimeRef = useRef<number>(initialActiveTime);
    const lastActiveTimestampRef = useRef<number>(Date.now());

    const handleActivityChange = useCallback(() => {
        // If the hook is disabled, return immediately and don't run any effects.
        if (!enabled) return;
        setIsTabActive(!document.hidden);
    }, [enabled]);

    // Effect to track tab visibility changes
    useEffect(() => {
        const removeEventListeners = () => {
            document.removeEventListener("visibilitychange", handleActivityChange);
            window.removeEventListener("beforeunload", handleActivityChange);
        }
        if (!enabled) {
            removeEventListeners()
            return;
        }
        document.addEventListener("visibilitychange", handleActivityChange);
        window.addEventListener("beforeunload", handleActivityChange);
        return () => {
            removeEventListeners();
        };
    }, [enabled]);

    // Effect to continuously update active time when the tab is active
    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;
        if (!enabled) {
            clearInterval(intervalId);
            return;
        };

        if (isTabActive) {
            lastActiveTimestampRef.current = Date.now();
            intervalId = setInterval(() => {
                const now = Date.now();
                const delta = now - lastActiveTimestampRef.current;
                activeTimeRef.current += delta;
                lastActiveTimestampRef.current = now;
                if (onActive) {
                    onActive(getActiveTimeInSec());
                }
            }, 1000);
        } else {
            if (lastActiveTimestampRef.current) {
                activeTimeRef.current += Date.now() - lastActiveTimestampRef.current;
                lastActiveTimestampRef.current = null as any;
            }
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [enabled, isTabActive]);

    // Effect for component unmount to finalize and potentially send data
    useEffect(() => {
        return () => {
            handleInactive();
        };
    }, [enabled, isTabActive, roundToSeconds]);

    const handleInactive = useCallback(async () => {
        if (!enabled) return;

        let finalActiveTime = getActiveTimeInSec();
        console.log("Component unmounted. Final active time:", finalActiveTime, "Seconds");
        if (onInactive) {
            await onInactive(finalActiveTime);
        }
    }, [enabled, isTabActive, roundToSeconds, onInactive])

    const getActiveTimeInSec = useCallback(() => {
        if (!enabled) return 0;

        if (isTabActive && lastActiveTimestampRef.current) {
            activeTimeRef.current += Date.now() - lastActiveTimestampRef.current;
        }
        let finalActiveTime = activeTimeRef.current;

        if (roundToSeconds) {
            finalActiveTime = Math.round(finalActiveTime / 1000) * 1000;
        }
        return Math.round(finalActiveTime / 1000);
    }, [enabled, isTabActive, roundToSeconds]);

    // Also availabel in Return the current active time, applying rounding if specified.
    return getActiveTimeInSec();
}

export default useActiveTimeTracker;
