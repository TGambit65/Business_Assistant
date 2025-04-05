import React from 'react';
import GithubButton from '../../components/ui/github-button';

/**
 * A demo page showcasing the GitHub button component
 * This demonstrates what components from the 21st.dev Magic MCP would look like
 */
const MagicComponentDemo = () => {
  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">21st.dev Magic Component Demo</h1>
          <p className="text-lg text-gray-600">
            This page demonstrates components similar to what could be generated using the 21st.dev Magic MCP server
          </p>
        </div>

        <div className="bg-background p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">GitHub Button Variants</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="flex flex-col items-center space-y-2">
              <GithubButton variant="default">Connect with GitHub</GithubButton>
              <span className="text-sm text-gray-500">Default Variant</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <GithubButton variant="outline">Connect with GitHub</GithubButton>
              <span className="text-sm text-gray-500">Outline Variant</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <GithubButton variant="ghost">Connect with GitHub</GithubButton>
              <span className="text-sm text-gray-500">Ghost Variant</span>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-6 text-gray-800">GitHub Button Sizes</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-around space-y-4 md:space-y-0">
            <div className="flex flex-col items-center space-y-2">
              <GithubButton size="sm">Small</GithubButton>
              <span className="text-sm text-gray-500">Small Size</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <GithubButton size="md">Medium</GithubButton>
              <span className="text-sm text-gray-500">Medium Size</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <GithubButton size="lg">Large</GithubButton>
              <span className="text-sm text-gray-500">Large Size</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-600">
          <p>
            This is an example of what could be generated with the Magic MCP server from 21st.dev.
            <br />
            The component includes proper Tailwind styling, variants, sizes, and icon integration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MagicComponentDemo;
