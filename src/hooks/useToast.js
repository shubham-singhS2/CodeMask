import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    clearTimeout(timerRef.current);
    setToast({ message, type, id: Date.now() });
    timerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, show, hide };
}
