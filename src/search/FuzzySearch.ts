import { SearchResult, SearchParams } from '../types/search';
import { levenshteinDistance } from '../utils/string';

export class FuzzySearch {
  // Lower threshold to allow more lenient fuzzy matches in search/suggest
  private static readonly FUZZY_THRESHOLD = 0.3; 
  private static readonly MAX_DISTANCE = 3;

  /**
   * Performs fuzzy search on the given results
   */
  public static search(results: SearchResult[], params: SearchParams): SearchResult[] {
    const { query, filters } = params;
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return results;
    }

    return results
      .map(result => ({
        ...result,
        fuzzyScore: this.calculateFuzzyScore(result, normalizedQuery)
      }))
      .filter(result => result.fuzzyScore >= this.FUZZY_THRESHOLD)
      .sort((a, b) => b.fuzzyScore - a.fuzzyScore);
  }

  /**
   * Calculates fuzzy score for a search result
   */
  private static calculateFuzzyScore(result: SearchResult, query: string): number {
    const searchableFields = [
      result.metadata.title,
      result.metadata.description,
      result.content,
      ...result.metadata.tags
    ];

    const scores = searchableFields.map(field => {
      const normalizedField = field.toLowerCase();
      const distance = levenshteinDistance(normalizedField, query);
      const maxLength = Math.max(normalizedField.length, query.length);
      return 1 - (distance / maxLength);
    });

    return Math.max(...scores);
  }

  /**
   * Suggests queries based on partial input
   */
  public static suggestQueries(
    partialQuery: string,
    searchHistory: Array<{ query: string; count: number }>
  ): string[] {
    if (!partialQuery.trim()) {
      return [];
    }

    const normalizedPartial = partialQuery.toLowerCase().trim();
    const suggestions = searchHistory
      .map(({ query, count }) => ({
        query,
        count,
        score: this.calculateFuzzyScore(
          {
            id: '',
            score: 0,
            content: query,
            metadata: {
              title: query,
              description: '',
              date: new Date(),
              author: '',
              category: '',
              tags: []
            },
            highlights: []
          },
          normalizedPartial
        )
      }))
      .filter(({ score }) => score >= this.FUZZY_THRESHOLD)
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.query.toLowerCase().startsWith(normalizedPartial);
        const bExact = b.query.toLowerCase().startsWith(normalizedPartial);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then sort by score and usage count
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.count - a.count;
      })
      .slice(0, 5)
      .map(({ query }) => query);

    return suggestions;
  }

  /**
   * Highlights fuzzy matches in text
   */
  public static highlightMatches(text: string, query: string): Array<{ start: number; end: number; text: string }> {
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const matches: Array<{ start: number; end: number; text: string }> = [];

    let currentIndex = 0;
    while (currentIndex < normalizedText.length) {
      const match = this.findNextMatch(normalizedText, normalizedQuery, currentIndex);
      if (!match) break;

      matches.push({
        start: match.start,
        end: match.end,
        text: text.slice(match.start, match.end)
      });

      currentIndex = match.end;
    }

    return matches;
  }

  /**
   * Finds the next fuzzy match in text
   */
  private static findNextMatch(
    text: string,
    query: string,
    startIndex: number
  ): { start: number; end: number } | null {
    let bestMatch: { start: number; end: number; distance: number } | null = null;
    const textSlice = text.slice(startIndex);

    // Simplified logic: Only find exact matches for highlighting for now
    // TODO: Implement proper fuzzy highlighting algorithm
    const nextIndex = textSlice.indexOf(query);
    if (nextIndex !== -1) {
        bestMatch = {
            start: startIndex + nextIndex,
            end: startIndex + nextIndex + query.length,
            distance: 0 // Exact match
        };
    }

    return bestMatch ? { start: bestMatch.start, end: bestMatch.end } : null;
  }
} 