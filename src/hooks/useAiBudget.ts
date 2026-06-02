import { useCallback, useEffect, useState } from "react";
import { BUDGET_CAP_USD, estimateCostUsd, type TokenUsage } from "../../lib/ai/types";

const STORAGE_KEY = "guatemala-ai-spent-usd";

export function useAiBudget() {
  const [spentUsd, setSpentUsd] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSpentUsd(parseFloat(raw) || 0);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const recordUsage = useCallback((usage: TokenUsage, costUsd?: number) => {
    const cost = costUsd ?? estimateCostUsd(usage);
    setSpentUsd((prev) => {
      const next = prev + cost;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const remainingUsd = Math.max(0, BUDGET_CAP_USD - spentUsd);
  const canUse = remainingUsd > 0.01;
  const percentUsed = Math.min(100, (spentUsd / BUDGET_CAP_USD) * 100);

  const reset = useCallback(() => {
    setSpentUsd(0);
    localStorage.setItem(STORAGE_KEY, "0");
  }, []);

  return { spentUsd, remainingUsd, canUse, percentUsed, recordUsage, reset, loaded, capUsd: BUDGET_CAP_USD };
}
