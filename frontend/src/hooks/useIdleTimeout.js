/**
 * hooks/useIdleTimeout.js
 * Tracks user activity and fires callbacks for a warning + final idle timeout.
 */
import { useEffect, useRef, useCallback } from 'react';

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
const THROTTLE_MS = 1000; // don't reset timers more than once per second (mousemove fires constantly)

export default function useIdleTimeout({
  idleTime = 15 * 60 * 1000,  // total time before logout (default 15 min)
  warningTime = 60 * 1000,    // show warning this long before logout (default 60s)
  onWarning,
  onIdle,
  enabled = true,
}) {
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    const warnDelay = Math.max(idleTime - warningTime, 0);
    warningTimerRef.current = setTimeout(() => onWarning?.(), warnDelay);
    idleTimerRef.current = setTimeout(() => onIdle?.(), idleTime);
  }, [idleTime, warningTime, onWarning, onIdle, clearTimers]);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < THROTTLE_MS) return;
    lastActivityRef.current = now;
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }
    startTimers();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity));
    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [enabled, startTimers, handleActivity, clearTimers]);

  // Exposed so the "Stay Logged In" button can immediately reset the clock
  const resetNow = useCallback(() => {
    lastActivityRef.current = Date.now();
    startTimers();
  }, [startTimers]);

  return { resetNow };
}
