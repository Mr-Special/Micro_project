import { useEffect, useState } from 'react';
import { pingBackend } from '../services/api';

export default function useBackendHealth(intervalMs = 25000) {
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      const result = await pingBackend();
      if (!isMounted) return;
      setIsBackendOnline(result.online);
      setLatency(result.latency);
    };

    checkHealth();
    const intervalId = window.setInterval(checkHealth, intervalMs);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [intervalMs]);

  return { isBackendOnline, latency };
}
