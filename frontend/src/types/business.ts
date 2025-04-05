/**
 * Interface defining the structure for a customizable widget
 * in the Business Center.
 */
export interface BusinessWidget {
  id: string; // Unique identifier (e.g., generated UUID)
  title: string; // User-defined title for the widget
  query: string; // The Perplexity query associated with the widget
  type?: 'summary' | 'list' | 'chart'; // Optional: Type of display (default could be summary)
  // Add other potential config later, e.g., refresh interval
}