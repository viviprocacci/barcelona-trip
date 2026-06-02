import { BUDGET_CAP_USD } from "../../lib/ai/types";
import { formatBudgetUsd } from "../hooks/useAiBudget";

interface BudgetBarProps {
  spentUsd: number;
  remainingUsd: number;
  percentUsed: number;
  webSearch?: boolean;
}

export function BudgetBar({
  spentUsd,
  remainingUsd,
  percentUsed,
  webSearch,
}: BudgetBarProps) {
  return (
    <div className="budget-bar">
      <div className="budget-bar-top">
        <span className="budget-label">Search budget</span>
        <span className="budget-amount">
          ${formatBudgetUsd(remainingUsd)} left of ${BUDGET_CAP_USD}
        </span>
      </div>
      <div className="budget-track">
        <div className="budget-fill" style={{ width: `${percentUsed}%` }} />
      </div>
      <p className="budget-hint">
        ${formatBudgetUsd(spentUsd)} used this device
        {webSearch ? " · live web scan on" : " · add TAVILY_API_KEY for live web scan"}
      </p>
    </div>
  );
}
