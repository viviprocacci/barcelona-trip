export interface ExploreAiLink {
  label: string;
  url: string;
}

export interface ExploreAiPick {
  name: string;
  price: string;
  group?: string;
  links?: ExploreAiLink[];
  book?: string;
  why: string;
  highlight?: string;
}

export interface ExploreAiStructured {
  title: string;
  intro?: string;
  items: ExploreAiPick[];
  footer?: string;
}

function extractJsonPayload(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }

  const start = text.indexOf("{");
  if (start < 0) return trimmed;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return text.slice(start).trim();
}

function stripCodeFences(text: string): string {
  return extractJsonPayload(text);
}

function normalizePick(raw: Record<string, unknown>): ExploreAiPick | null {
  const name = String(raw.name ?? "").trim();
  const why = String(raw.why ?? "").trim();
  if (!name || !why) return null;

  const links = Array.isArray(raw.links)
    ? raw.links
        .map((l) => {
          const link = l as Record<string, unknown>;
          const label = String(link.label ?? "").trim();
          const url = String(link.url ?? "").trim();
          return label && url ? { label, url } : null;
        })
        .filter((l): l is ExploreAiLink => l !== null)
    : undefined;

  return {
    name,
    price: String(raw.price ?? "Price varies").trim(),
    group: raw.group ? String(raw.group).trim() : undefined,
    links: links?.length ? links : undefined,
    book: raw.book ? String(raw.book).trim() : undefined,
    why,
    highlight: raw.highlight ? String(raw.highlight).trim() : undefined,
  };
}

export function parseExploreJson(text: string): ExploreAiStructured | null {
  try {
    const parsed = JSON.parse(stripCodeFences(text)) as Record<string, unknown>;
    const items = Array.isArray(parsed.items)
      ? parsed.items
          .map((item) => normalizePick(item as Record<string, unknown>))
          .filter((item): item is ExploreAiPick => item !== null)
      : [];

    if (!items.length) return null;

    return {
      title: String(parsed.title ?? "AI picks").trim(),
      intro: parsed.intro ? String(parsed.intro).trim() : undefined,
      items,
      footer: parsed.footer ? String(parsed.footer).trim() : undefined,
    };
  } catch {
    return null;
  }
}

function parseMarkdownLinks(line: string): ExploreAiLink[] {
  const links: ExploreAiLink[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    links.push({ label: m[1].trim(), url: m[2].trim() });
  }
  return links;
}

/** Fallback when model returns markdown instead of JSON */
export function parseExploreMarkdown(text: string): ExploreAiStructured | null {
  const lines = text.split("\n");
  let title = "AI picks";
  const introLines: string[] = [];
  const items: ExploreAiPick[] = [];
  const footerLines: string[] = [];

  let currentGroup: string | undefined;
  let i = 0;

  if (lines[0]?.startsWith("#")) {
    title = lines[0].replace(/^#+\s*/, "").trim();
    i = 1;
  }

  while (i < lines.length && !lines[i].trim().startsWith("**") && !lines[i].startsWith("##")) {
    const line = lines[i].trim();
    if (line && line !== "---") introLines.push(line);
    i++;
  }

  let pending: Partial<ExploreAiPick> | null = null;

  const flush = () => {
    if (pending?.name && pending.why) {
      items.push({
        name: pending.name,
        price: pending.price ?? "Price varies",
        group: pending.group,
        links: pending.links,
        book: pending.book,
        why: pending.why,
        highlight: pending.highlight,
      });
    }
    pending = null;
  };

  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === "---") continue;

    if (/^##\s+/.test(line)) {
      const heading = line.replace(/^##\s+/, "").trim();
      if (/reality check|best time|summary|tip/i.test(heading)) {
        flush();
        footerLines.push(line.replace(/^##\s+/, ""));
        continue;
      }
      flush();
      currentGroup = heading;
      continue;
    }

    const itemMatch = line.match(/^\*\*([^*]+)\*\*\s*[—–-]\s*(.+)$/);
    const plainItemMatch = !itemMatch
      ? line.match(/^([^—–-]+?)\s*[—–-]\s*(\$.+)$/)
      : null;

    if (itemMatch || plainItemMatch) {
      flush();
      const name = (itemMatch ?? plainItemMatch)![1].trim();
      let price = (itemMatch ?? plainItemMatch)![2].trim();
      let highlight: string | undefined;
      const highlightMatch = price.match(/[✓✔]\s*\*?([^*]+)\*?/);
      if (highlightMatch) {
        highlight = highlightMatch[1].trim();
        price = price.replace(/[✓✔]\s*\*?[^*]*\*?/g, "").trim();
      }
      pending = { name, price, group: currentGroup, highlight };
      continue;
    }

    if (/^book:/i.test(line) && pending) {
      const bookLine = line.replace(/^book:\s*/i, "");
      pending.links = parseMarkdownLinks(bookLine);
      if (!pending.links.length) pending.book = bookLine.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      continue;
    }

    if (/^why:/i.test(line) && pending) {
      pending.why = line.replace(/^why:\s*/i, "").trim();
      continue;
    }

    if (/^typical booking:/i.test(line) && pending) {
      pending.book = line.replace(/^typical booking:\s*/i, "").trim();
      continue;
    }

    if (footerLines.length > 0 || (items.length > 0 && !pending && !line.startsWith("**"))) {
      footerLines.push(line);
    }
  }

  flush();

  if (!items.length) return null;

  return {
    title,
    intro: introLines.join(" ").trim() || undefined,
    items,
    footer: footerLines.join("\n").trim() || undefined,
  };
}

export function parseExploreResult(text: string): ExploreAiStructured | null {
  return parseExploreJson(text) ?? parseExploreMarkdown(text);
}
