export type ReservationCategory =
  | "flight"
  | "hotel"
  | "tour"
  | "transport"
  | "spa"
  | "other";

export interface ChatReservation {
  title: string;
  category: ReservationCategory;
  date: string;
  confirmation?: string;
  location?: string;
}

export interface ChatContext {
  tripStartDate?: string | null;
  tripDay?: number | null;
  tripDayLabel?: string;
  weather?: { label: string; high: number; low: number; conditions: string }[];
  reservations?: ChatReservation[];
  budgetRemainingUsd?: number;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface ClaudeResult {
  text: string;
  usage: TokenUsage;
}

export const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
export const BUDGET_CAP_USD = 5;

/** Rough Haiku pricing for budget meter (USD per million tokens) */
export const PRICE_INPUT_PER_M = 1;
export const PRICE_OUTPUT_PER_M = 5;

export function estimateCostUsd(usage: TokenUsage): number {
  return (
    (usage.input_tokens / 1_000_000) * PRICE_INPUT_PER_M +
    (usage.output_tokens / 1_000_000) * PRICE_OUTPUT_PER_M
  );
}
