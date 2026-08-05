import type { InventoryItem } from '../types';

const normalizeText = (text: string): string => {
  return (text || '')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const STOP_WORDS = new Set([
  'y', 'e', 'o', 'u', 'de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'con', 'sin', 'para', 'por', 'en', 'al', 'a', 'su', 'sus', 'mi', 'mis'
]);

/**
 * Perform intelligent local keyword search across item attributes
 */
export const localIntelligentSearch = (query: string, inventory: InventoryItem[]): string[] => {
  const normalizedQuery = normalizeText(query).trim();
  if (!normalizedQuery) return inventory.map(item => item.id);

  const rawTerms = normalizedQuery.split(/\s+/).filter(Boolean);
  const terms = rawTerms.filter(term => !STOP_WORDS.has(term));
  const activeTerms = terms.length > 0 ? terms : rawTerms;

  if (activeTerms.length === 0) return inventory.map(item => item.id);

  const scored = inventory.map(item => {
    const fullText = normalizeText(
      `${item.name} ${item.description || ''} ${item.brand || ''} ${item.model || ''} ${item.id}`
    );

    let matchCount = 0;
    for (const term of activeTerms) {
      let matched = false;
      if (fullText.includes(term)) {
        matched = true;
      } else if (term.endsWith('es') && term.length > 3 && fullText.includes(term.slice(0, -2))) {
        matched = true;
      } else if (term.endsWith('s') && term.length > 3 && fullText.includes(term.slice(0, -1))) {
        matched = true;
      } else if (term.startsWith('robot') && fullText.includes('robot')) {
        matched = true;
      }

      if (matched) matchCount++;
    }

    return { id: item.id, matchCount };
  });

  const matchingItems = scored.filter(s => s.matchCount > 0);
  if (matchingItems.length === 0) return [];

  const maxMatches = Math.max(...matchingItems.map(s => s.matchCount));

  // If an item matches multiple terms (e.g. "Pen Drive" + "USB"), prioritize items matching the full term combination
  const isDisjunctiveCategory = activeTerms.some(t => t.includes('tester') || t.includes('multimetro') || t.includes('arduino') || t.includes('robot'));
  
  if (maxMatches >= 2 && !isDisjunctiveCategory) {
    return matchingItems.filter(s => s.matchCount === maxMatches).map(s => s.id);
  }

  return matchingItems.map(s => s.id);
};

export const queryInventory = async (query: string, inventory: InventoryItem[]): Promise<string[]> => {
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, inventory }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.matchingIds) && !data.fallback && data.matchingIds.length > 0) {
        return data.matchingIds;
      }
    }
  } catch (error) {
    console.warn("API proxy search failed, falling back to local search:", error);
  }

  // Seamless fallback to client-side intelligent local search
  return localIntelligentSearch(query, inventory);
};

