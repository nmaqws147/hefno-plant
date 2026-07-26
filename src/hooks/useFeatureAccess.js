import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGuestId } from '../services/guestId';
import { checkQuota } from '../services/quotaService';

export function useFeatureAccess(featureId) {
  const { user, isPremium } = useAuth();
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cacheKey = `${featureId}-${user?.uid || 'guest'}`;
  const prevKey = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const guestId = user ? null : getGuestId();
      const authToken = user ? await user.getIdToken() : null;
      const result = await checkQuota(featureId, { guestId, authToken });
      setQuota(result);
    } catch (err) {
      setQuota({ allowed: false, remaining: 0, limit: 0 });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [featureId, user]);

  useEffect(() => {
    if (prevKey.current !== cacheKey) {
      prevKey.current = cacheKey;
      setQuota(null);
      refresh();
    }
  }, [cacheKey, refresh]);

  return {
    allowed: isPremium || quota?.allowed,
    remaining: quota?.remaining ?? 0,
    limit: quota?.limit ?? 0,
    loading,
    error,
    refresh,
  };
}
