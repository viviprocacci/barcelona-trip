import { useMemo, useState } from "react";
import { Clock, DollarSign, ExternalLink, Loader2, MapPin, Search, Sparkles, X } from "lucide-react";
import {
  EXCURSION_CATEGORIES,
  EXCURSION_REGIONS,
  EXCURSIONS,
  type Excursion,
  type ExcursionCategory,
} from "../data/excursions";
import { useChatContext } from "../hooks/useChatContext";
import { useAiEnabled } from "../hooks/useAiEnabled";
import { exploreSearch } from "../services/ai";
import { parseExploreResult } from "../../lib/ai/exploreResult";
import type { ExploreAiStructured } from "../../lib/ai/exploreResult";
import type { SearchType } from "../../lib/ai/search";
import { appleMapsUrl, googleMapsDirectionsUrl, openExternal } from "../utils/links";

const TIER_LABEL: Record<Excursion["priceTier"], string> = {
  budget: "Budget",
  moderate: "Mid-range",
  splurge: "Splurge",
};

const SEARCH_TYPES: { id: SearchType; label: string }[] = [
  { id: "general", label: "All" },
  { id: "activity", label: "Activities" },
  { id: "hotel", label: "Hotels" },
  { id: "deal", label: "Deals" },
];

const HOTEL_SUGGESTIONS = [
  "Antigua hostel under $25",
  "La Casa del Mundo",
  "Panajachel hotel",
  "Antigua boutique hotel",
];

function matchLocal(query: string, type: SearchType): Excursion[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return EXCURSIONS.filter((e) => {
    if (type === "hotel") return false;
    const hay = `${e.name} ${e.tagline} ${e.region} ${e.category} ${e.description}`.toLowerCase();
    return hay.includes(q) || q.split(/\s+/).every((w) => hay.includes(w));
  });
}

export function ExploreView() {
  const [category, setCategory] = useState<ExcursionCategory | "all">("all");
  const [region, setRegion] = useState<string>("All regions");
  const [selected, setSelected] = useState<Excursion | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("general");
  const [aiStructured, setAiStructured] = useState<ExploreAiStructured | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedWeb, setSearchedWeb] = useState(false);
  const [activeSearch, setActiveSearch] = useState<string | null>(null);

  const { context, budget } = useChatContext();
  const { enabled: aiEnabled } = useAiEnabled();

  const filtered = useMemo(() => {
    if (activeSearch) {
      return matchLocal(activeSearch, searchType);
    }

    return EXCURSIONS.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (region === "On your route" && !e.onYourRoute) return false;
      if (region !== "All regions" && region !== "On your route" && e.region !== region)
        return false;
      return true;
    });
  }, [category, region, activeSearch, searchType]);

  const runSearch = async (query: string, type: SearchType = searchType) => {
    const q = query.trim();
    if (!q) return;

    setActiveSearch(q);
    setSearchQuery(q);
    setSearchType(type);
    setAiStructured(null);
    setAiMessage(null);

    if (!aiEnabled) {
      setAiMessage("Curated matches below. Add ANTHROPIC_API_KEY to .env (or Vercel) for AI deal & hotel search.");
      return;
    }
    if (!budget.canUse) {
      setAiMessage("~$5 AI budget used on this device.");
      return;
    }

    setSearchLoading(true);
    try {
      const local = matchLocal(q, type);
      const res = await exploreSearch(
        q,
        type,
        context,
        local.map((e) => `${e.name} (${e.priceLabel})`),
      );
      if (res.usage) budget.recordUsage(res.usage, res.costUsd);
      setSearchedWeb(Boolean(res.searchedWeb));
      const structured = res.structured ?? parseExploreResult(res.text);
      if (structured?.items.length) {
        setAiStructured(structured);
      } else {
        setAiMessage("Could not parse results — try searching again.");
      }
    } catch (e) {
      setAiMessage(`Error: ${e instanceof Error ? e.message : "Search failed"}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setActiveSearch(null);
    setSearchQuery("");
    setAiStructured(null);
    setAiMessage(null);
    setSearchedWeb(false);
  };

  const adrenalineCount = EXCURSIONS.filter((e) => e.category === "adrenaline").length;
  const fishingCount = EXCURSIONS.filter((e) => e.category === "fishing").length;

  return (
    <div className="explore-view">
      <div className="explore-search-box">
        <form
          className="explore-search-form"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(searchQuery);
          }}
        >
          <Search size={18} strokeWidth={1.5} className="explore-search-icon" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities, hotels, deals…"
            aria-label="Search explore"
          />
          <button type="submit" className="explore-search-btn" disabled={searchLoading || !searchQuery.trim()}>
            {searchLoading ? <Loader2 size={16} className="spin" /> : "Go"}
          </button>
        </form>

        <div className="explore-search-types">
          {SEARCH_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`phrase-tab ${searchType === t.id ? "active" : ""}`}
              onClick={() => setSearchType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {searchType === "hotel" && !activeSearch && (
          <div className="explore-suggestions">
            {HOTEL_SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="quick-btn" onClick={() => runSearch(s, "hotel")}>
                {s}
              </button>
            ))}
          </div>
        )}

        {activeSearch && (
          <button type="button" className="explore-clear-search" onClick={clearSearch}>
            Clear search · show all
          </button>
        )}
      </div>

      {searchLoading && (
        <p className="explore-ai-loading">Searching web + comparing prices…</p>
      )}

      {aiStructured && (
        <ExploreAiResults data={aiStructured} query={activeSearch ?? ""} searchedWeb={searchedWeb} />
      )}

      {aiMessage && !aiStructured && (
        <p className="explore-ai-message">{aiMessage}</p>
      )}

      {!activeSearch && (
        <>
          <p className="explore-intro">
            {EXCURSIONS.length} picks · {adrenalineCount} adrenaline · {fishingCount} fishing
          </p>
          <div className="explore-quick-vibes">
            <button
              type="button"
              className={`vibe-pill ${category === "adrenaline" ? "active" : ""}`}
              onClick={() => setCategory(category === "adrenaline" ? "all" : "adrenaline")}
            >
              Adrenaline
            </button>
            <button
              type="button"
              className={`vibe-pill ${category === "fishing" ? "active" : ""}`}
              onClick={() => setCategory(category === "fishing" ? "all" : "fishing")}
            >
              Fishing
            </button>
            <button
              type="button"
              className={`vibe-pill ${region === "On your route" ? "active" : ""}`}
              onClick={() => setRegion(region === "On your route" ? "All regions" : "On your route")}
            >
              On your trip
            </button>
          </div>
        </>
      )}

      <div className="explore-filters">
        {!activeSearch && (
          <>
            <div className="phrase-tabs">
              {EXCURSION_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`phrase-tab ${category === c.id ? "active" : ""}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <select
              className="explore-region-select"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              aria-label="Filter by region"
            >
              {EXCURSION_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {activeSearch && filtered.length > 0 && (
        <p className="explore-section-label">From our curated list</p>
      )}

      <div className="explore-list">
        {filtered.map((exc) => (
          <button key={exc.id} type="button" className="explore-card" onClick={() => setSelected(exc)}>
            <div className="explore-card-top">
              <span className={`price-tier price-tier--${exc.priceTier}`}>{TIER_LABEL[exc.priceTier]}</span>
              {exc.onYourRoute && (
                <span className="on-route-badge"><Sparkles size={10} /> On your trip</span>
              )}
            </div>
            <h3>{exc.name}</h3>
            <p className="explore-tagline">{exc.tagline}</p>
            <div className="explore-card-meta">
              <span><MapPin size={12} /> {exc.region}</span>
              <span><DollarSign size={12} /> {exc.priceLabel}</span>
              <span><Clock size={12} /> {exc.duration}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && !searchLoading && (
          <p className="explore-empty">
            {activeSearch ? "No curated matches — check AI results above." : "No matches — try a different filter."}
          </p>
        )}
      </div>

      {selected && (
        <ExploreModal
          exc={selected}
          onClose={() => setSelected(null)}
          onFindDeals={(name) => {
            setSelected(null);
            runSearch(name, "deal");
          }}
          aiEnabled={aiEnabled}
        />
      )}
    </div>
  );
}

function ExploreAiResults({
  data,
  query,
  searchedWeb,
}: {
  data: ExploreAiStructured;
  query: string;
  searchedWeb: boolean;
}) {
  let lastGroup: string | undefined;

  return (
    <section className="explore-ai-result">
      <div className="explore-ai-result-head">
        <strong>{data.title || `AI picks for "${query}"`}</strong>
        {searchedWeb && <span className="deals-web-badge">Live web results</span>}
      </div>

      {data.intro && <p className="explore-ai-intro">{data.intro}</p>}

      <div className="explore-ai-cards">
        {data.items.map((item, i) => {
          const showGroup = item.group && item.group !== lastGroup;
          if (showGroup) lastGroup = item.group;

          return (
            <div key={`${item.name}-${i}`} className="explore-ai-card-wrap">
              {showGroup && <p className="explore-ai-group-label">{item.group}</p>}
              <article className="explore-ai-card">
                <div className="explore-card-top">
                  <span className="price-tier price-tier--moderate">{item.price}</span>
                  {item.highlight && (
                    <span className="on-route-badge">
                      <Sparkles size={10} /> {item.highlight}
                    </span>
                  )}
                </div>
                <h3>{item.name}</h3>
                <p className="explore-ai-card-why">{item.why}</p>
                {(item.links?.length || item.book) && (
                  <div className="explore-ai-card-book">
                    <span className="explore-ai-book-label">Book</span>
                    {item.links?.length ? (
                      <div className="explore-ai-links">
                        {item.links.map((link) => (
                          <button
                            key={link.url}
                            type="button"
                            className="explore-ai-link-btn"
                            onClick={() => openExternal(link.url)}
                          >
                            {link.label}
                            <ExternalLink size={12} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="explore-ai-book-text">{item.book}</p>
                    )}
                  </div>
                )}
              </article>
            </div>
          );
        })}
      </div>

      {data.footer && <p className="explore-ai-footer">{data.footer}</p>}
    </section>
  );
}

function ExploreModal({
  exc,
  onClose,
  onFindDeals,
  aiEnabled,
}: {
  exc: Excursion;
  onClose: () => void;
  onFindDeals: (name: string) => void;
  aiEnabled: boolean;
}) {
  return (
    <div className="explore-modal" role="dialog" aria-modal="true">
      <div className="explore-modal-inner">
        <button type="button" className="wallet-modal-close" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>
        <div className="explore-modal-badges">
          <span className={`price-tier price-tier--${exc.priceTier}`}>
            {TIER_LABEL[exc.priceTier]} · {exc.priceLabel}
          </span>
          {exc.onYourRoute && (
            <span className="on-route-badge"><Sparkles size={10} /> On your trip</span>
          )}
        </div>
        <h2 className="explore-modal-title">{exc.name}</h2>
        <p className="explore-modal-tagline">{exc.tagline}</p>
        <p className="explore-modal-desc">{exc.description}</p>
        <div className="explore-why-cheap">
          <strong>Why it's worth it</strong>
          <p>{exc.whyCheap}</p>
        </div>
        <ul className="explore-tips">
          {exc.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="explore-modal-actions">
          {aiEnabled && (
            <button type="button" className="btn-primary" onClick={() => onFindDeals(exc.name)}>
              <Search size={14} /> Find best deals
            </button>
          )}
          {exc.lat != null && exc.lng != null && (
            <>
              <button type="button" className="ride-btn" onClick={() => openExternal(appleMapsUrl({ name: exc.name, lat: exc.lat!, lng: exc.lng! }))}>
                Maps
              </button>
              <button type="button" className="ride-btn ride-btn--alt" onClick={() => openExternal(googleMapsDirectionsUrl({ name: exc.name, lat: exc.lat!, lng: exc.lng! }))}>
                Directions
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
