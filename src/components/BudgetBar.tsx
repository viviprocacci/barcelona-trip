import { Droplets } from "lucide-react";
import { BUDGET_CAP_USD } from "../../lib/ai/types";
import { formatBudgetUsd } from "../hooks/useAiBudget";
import { MateoEngineCredit } from "./MateoEngineCredit";

interface BudgetBarProps {
  spentUsd: number;
  remainingUsd: number;
  percentUsed: number;
  webSearch?: boolean;
  compact?: boolean;
}

export function BudgetBar({
  spentUsd,
  remainingUsd,
  percentUsed,
  webSearch,
  compact,
}: BudgetBarProps) {
  const juicePercent = Math.max(0, Math.min(100, 100 - percentUsed));
  const low = juicePercent <= 20;
  const showUsed = spentUsd > 0.01;

  return (
    <div
      className={[
        "mateo-juice",
        compact && "mateo-juice--compact",
        low && "mateo-juice--low",
      ]
        .filter(Boolean)
        .join(" ")}
      role="meter"
      aria-valuenow={Math.round(juicePercent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Mateo juice: $${formatBudgetUsd(remainingUsd)} left of $${BUDGET_CAP_USD} limit`}
    >
      <div className="mateo-juice-top">
        <span className="mateo-juice-label">
          <Droplets size={13} strokeWidth={2} className="mateo-juice-icon" />
          Mateo juice
          <span className="mateo-juice-limit">${BUDGET_CAP_USD} limit</span>
        </span>
        <span className="mateo-juice-amount">${formatBudgetUsd(remainingUsd)} left</span>
      </div>
      <div className="mateo-juice-track">
        <div className="mateo-juice-fill" style={{ width: `${juicePercent}%` }} />
      </div>
      {!compact && (
        <p className="mateo-juice-hint">
          {showUsed && <>${formatBudgetUsd(spentUsd)} used</>}
          {showUsed && webSearch && " · "}
          {webSearch && "live web scan on"}
          {(showUsed || webSearch) && " · "}
          <MateoEngineCredit inline />
        </p>
      )}
    </div>
  );
}
