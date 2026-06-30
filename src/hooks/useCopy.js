import { useState, useCallback } from 'react';

export function useCopy(duration = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), duration);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }, [duration]);

  return { copied, copy };
}
