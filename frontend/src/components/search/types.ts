import { SearchParams, Filter } from '../../types/search';
import { SharedSearchResult } from '../../types/shared-search';

export interface SearchInterfaceProps {
  onSearch: (params: SearchParams) => void;
  onFilterChange: (filters: Filter[]) => void;
  onVoiceSearch: (query: string) => void;
  results: SharedSearchResult[];
  isLoading: boolean;
  error?: string;
}

export interface AdvancedFiltersProps {
  filters: Filter[];
  onAddFilter: (filter: Filter) => void;
  onRemoveFilter: (index: number) => void;
  onUpdateFilter: (index: number, filter: Filter) => void;
}

export interface VoiceSearchProps {
  onTranscript: (transcript: string) => void;
  onError: (error: Error | string) => void;
} 