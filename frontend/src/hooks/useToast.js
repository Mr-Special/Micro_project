import { useCallback, useEffect, useRef, useState } from 'react';

export default function useToast(durationMs = 3500) {
  const [message, setMessage] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((nextMessage) => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setMessage(nextMessage);
    timeoutRef.current = window.setTimeout(() => {
      setMessage(null);
      timeoutRef.current = null;
    }, durationMs);
  }, [durationMs]);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  return { message, showToast };
}
