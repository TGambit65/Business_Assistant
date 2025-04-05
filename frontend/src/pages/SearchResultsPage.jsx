import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge'; // Added Badge
import { Loader2, Search } from 'lucide-react'; // Removed unused FileText

// Import the SearchService
import searchService from '../services/SearchService';

// Interface for search results (simplified)
// interface SearchResult {
//   id: string | number;
//   type: 'template'; // Only searching templates for now
//   title: string; // Template name
//   snippet: string; // e.g., subject or body snippet
//   category?: string;
//   path: string; // Link to view/use template
// }

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      console.log(`Searching templates for: ${query}`);

      try {
        // In a real implementation, we would use the SearchEngine:
        // const searchEngine = SearchEngine.getInstance();
        // const searchResults = await searchEngine.search({
        //   query,
        //   filters: []
        // }, { maxResults: 20 });
        // setResults(searchResults.results);
        
        // Use the SearchService
        const data = await searchService.search(query);
        
        // Process the results
        const mappedResults = data.map(template => ({
            id: template.id,
            type: 'template',
            title: template.name,
            snippet: template.subject,
            category: template.category,
            path: `/templates/edit/${template.id}`,
            // Store the original data for filtering
            originalData: template
        }));
        
        // Extract unique categories for filtering
        const uniqueCategories = [...new Set(mappedResults.map(result => result.category))];
        setCategories(uniqueCategories);
        
        // Store the full results
        setResults(mappedResults);
        // Initially show all results
        setFilteredResults(mappedResults);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
        setFilteredResults([]);
        setIsLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setResults([]);
      setFilteredResults([]);
      setIsLoading(false);
    }
  }, [query]);

  // Filter results by category
  const filterByCategory = async (category) => {
    if (!category || category === 'All') {
      // If "All" is selected, just show all current results
      setFilteredResults(results); 
    } else {
      // Use the search service to filter by category
      setIsLoading(true);
      try {
        const data = await searchService.search(query, { category });
        setFilteredResults(data);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle "Use Template" action
  const handleUseTemplate = (result) => {
    const template = result.originalData;
    if (template) {
      const timer = setTimeout(() => {
        navigate('/email/compose', {
          state: {
            subject: template.subject,
            body: template.body
          }
        });
      }, 100);
      return () => clearTimeout(timer);
    } else {
      console.error('Template data not found');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        Search Results {query ? <>for <span className="text-primary">"{query}"</span></> : ''}
      </h1>

      {/* Category filters - only show if we have results and categories */}
      {results.length > 0 && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => filterByCategory('All')}
            className="text-xs"
          >
            All
          </Button>
          {categories.map(category => (
            <Button key={category} variant="outline" size="sm" onClick={() => filterByCategory(category)} className="text-xs">
              {category}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Searching...</span>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Found {filteredResults.length} result(s).</p>
          {/* Render actual results */}
          {filteredResults.map(result => (
            <Card key={`${result.type}-${result.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base">
                        <Link to={result.path} className="hover:underline">{result.title}</Link>
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">{result.type}</Badge>
                </div>
                 {result.category && <Badge variant="secondary" className="text-xs w-fit">{result.category}</Badge>}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{result.snippet}</p>
                <Link to={result.path} className="text-xs text-primary hover:underline mt-2 inline-block">
                  View Template
                </Link>
                {result.type === 'template' && (
                  <Button variant="ghost" size="sm" className="ml-4 text-xs" onClick={() => handleUseTemplate(result)}>
                    Use Template
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {query ? <>No results found for <span className="font-medium text-foreground">"{query}"</span>.</> : 'Enter a search term in the header to begin.'}
          </p>
        </div>
      )}
    </div>
  );
}
