import { SearchResult, SearchParams, SearchOptions } from '../types/search';
import { FuzzySearch } from './FuzzySearch';

export const DB_NAME = 'searchDB';
export const DB_VERSION = 1;
export const STORE_NAME = 'searchIndex';
const CACHE_VERSION = 'v1';

interface IndexedResult extends SearchResult {
  searchableText: string;
  lastUpdated: number;
}

/**
 * Manages offline search functionality
 */
export class OfflineSearchManager {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private syncInProgress = false;

  constructor() {
    this.initDB();
  }

  /**
   * Initializes the IndexedDB database
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('searchableText', 'searchableText');
          store.createIndex('lastUpdated', 'lastUpdated');
        }
      };
    });
  }

  /**
   * Builds the search index with the given results
   */
  public async buildIndex(results: SearchResult[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initDB();
    }

    const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing index
    await this.clearIndex();

    // Add new results
    for (const result of results) {
      const indexedResult: IndexedResult = {
        ...result,
        searchableText: this.generateSearchableText(result),
        lastUpdated: Date.now()
      };
      await this.addToStore(store, indexedResult);
    }

    // Update cache version
    localStorage.setItem('searchCacheVersion', CACHE_VERSION);
  }

  /**
   * Performs an offline search
   */
  public async search(params: SearchParams, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initDB();
    }

    const transaction = this.db!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const results: SearchResult[] = [];

    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      request.onerror = () => reject(request.error);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const result = cursor.value as IndexedResult;
          if (this.matchesSearch(result, params)) {
            results.push(this.removeIndexedFields(result));
          }
          cursor.continue();
        } else {
          // Apply fuzzy search if needed
          const finalResults = options.semantic
            ? results
            : FuzzySearch.search(results, params);
          resolve(finalResults);
        }
      };
    });
  }

  /**
   * Syncs the offline index with online data
   */
  public async sync(onlineResults: SearchResult[]): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    try {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Get existing results
      const existingResults = await this.getAllResults(store);
      const existingIds = new Set(existingResults.map(r => r.id));

      // Update or add new results
      for (const result of onlineResults) {
        const indexedResult: IndexedResult = {
          ...result,
          searchableText: this.generateSearchableText(result),
          lastUpdated: Date.now()
        };

        if (existingIds.has(result.id)) {
          await this.updateInStore(store, indexedResult);
        } else {
          await this.addToStore(store, indexedResult);
        }
      }

      // Remove deleted results
      const onlineIds = new Set(onlineResults.map(r => r.id));
      for (const result of existingResults) {
        if (!onlineIds.has(result.id)) {
          await this.removeFromStore(store, result.id);
        }
      }

      // Update cache version
      localStorage.setItem('searchCacheVersion', CACHE_VERSION);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Clears the search index
   */
  public async clearIndex(): Promise<void> {
    if (!this.isInitialized) {
      await this.initDB();
    }

    const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.clear();
  }

  /**
   * Generates searchable text from a result
   */
  private generateSearchableText(result: SearchResult): string {
    return [
      result.content,
      result.metadata.title,
      result.metadata.description,
      result.metadata.author,
      result.metadata.category,
      ...result.metadata.tags
    ].join(' ').toLowerCase();
  }

  /**
   * Checks if a result matches the search parameters
   */
  private matchesSearch(result: IndexedResult, params: SearchParams): boolean {
    if (!params.query.trim()) {
      return true;
    }

    const query = params.query.toLowerCase();
    return result.searchableText.includes(query);
  }

  /**
   * Removes indexed fields from a result
   */
  private removeIndexedFields(result: IndexedResult): SearchResult {
    const { searchableText, lastUpdated, ...searchResult } = result;
    return searchResult;
  }

  /**
   * Adds a result to the store
   */
  private async addToStore(store: IDBObjectStore, result: IndexedResult): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.add(result);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Updates a result in the store
   */
  private async updateInStore(store: IDBObjectStore, result: IndexedResult): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.put(result);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Removes a result from the store
   */
  private async removeFromStore(store: IDBObjectStore, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Gets all results from the store
   */
  private async getAllResults(store: IDBObjectStore): Promise<IndexedResult[]> {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
} 