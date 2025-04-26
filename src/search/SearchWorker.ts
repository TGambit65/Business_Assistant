import { SearchResult, SearchParams } from '../types/search';
import { FuzzySearch } from './FuzzySearch';
import { PerformanceOptimizer } from './PerformanceOptimizer';

interface WorkerMessage {
  results: SearchResult[];
  params: SearchParams;
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { results, params } = event.data;

  try {
    // Apply filters
    let filteredResults = PerformanceOptimizer.optimizeFilters(results, params.filters);

    // Apply fuzzy search if needed
    if (!params.semantic && params.query.trim()) {
      filteredResults = FuzzySearch.search(filteredResults, params);
    }

    // Optimize memory usage
    filteredResults = PerformanceOptimizer.optimizeMemory(filteredResults);

    // Send results back to main thread
    self.postMessage(filteredResults);
  } catch (error) {
    // Send error back to main thread
    self.postMessage({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}; 