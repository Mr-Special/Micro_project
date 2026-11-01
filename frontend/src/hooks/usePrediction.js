import { useEffect, useState } from 'react';
import { fetchPrediction } from '../services/api';

export default function usePrediction(parameters, weatherContext) {
  const [prediction, setPrediction] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!weatherContext) {
      setPrediction(null);
      setIsCalculating(false);
      return undefined;
    }

    let isCurrentRequest = true;
    setIsCalculating(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await fetchPrediction(parameters, weatherContext);
        if (isCurrentRequest && result.data) setPrediction(result.data);
      } catch (error) {
        if (isCurrentRequest) console.error('Prediction request failed:', error);
      } finally {
        if (isCurrentRequest) setIsCalculating(false);
      }
    }, 100);

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timeoutId);
    };
  }, [parameters, weatherContext]);

  return { prediction, isCalculating };
}
