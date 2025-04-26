import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { 
  Upload, 
  FolderOpen, 
  FileText, 
  Search, 
  BarChart, 
  Plus,
  Trash2,
  Edit,
  Eye,
  AlertCircle
} from 'lucide-react';

// Mock data for document categories
const documentCategories = [
  { id: 'products', name: 'Products', count: 12, color: 'bg-blue-500' },
  { id: 'policies', name: 'Policies', count: 8, color: 'bg-green-500' },
  { id: 'faqs', name: 'FAQs', count: 15, color: 'bg-amber-500' },
  { id: 'sops', name: 'SOPs', count: 6, color: 'bg-purple-500' },
];

// Mock data for documents
const documents = [
  { 
    id: 'doc1', 
    title: 'Product Catalog 2023', 
    category: 'products', 
    uploadDate: '2023-05-15', 
    size: '2.4 MB',
    format: 'PDF',
    tags: ['catalog', 'pricing', 'specifications'],
    status: 'processed',
    chunks: 24,
    usage: 87
  },
  { 
    id: 'doc2', 
    title: 'Employee Handbook', 
    category: 'policies', 
    uploadDate: '2023-03-10', 
    size: '1.8 MB',
    format: 'DOCX',
    tags: ['hr', 'policies', 'benefits'],
    status: 'processed',
    chunks: 18,
    usage: 45
  },
  { 
    id: 'doc3', 
    title: 'Customer Support FAQs', 
    category: 'faqs', 
    uploadDate: '2023-06-22', 
    size: '0.5 MB',
    format: 'XLSX',
    tags: ['support', 'customers', 'troubleshooting'],
    status: 'processing',
    chunks: 12,
    usage: 92
  },
  { 
    id: 'doc4', 
    title: 'Return Process SOP', 
    category: 'sops', 
    uploadDate: '2023-04-05', 
    size: '1.2 MB',
    format: 'PDF',
    tags: ['returns', 'process', 'logistics'],
    status: 'processed',
    chunks: 8,
    usage: 63
  },
];

// Mock data for analytics
const analyticsData = {
  totalDocuments: 41,
  totalCategories: 4,
  totalChunks: 352,
  averageChunksPerDocument: 8.6,
  mostReferencedDocuments: [
    { id: 'doc1', title: 'Product Catalog 2023', references: 245 },
    { id: 'doc3', title: 'Customer Support FAQs', references: 187 },
    { id: 'doc5', title: 'Warranty Policy', references: 156 },
  ],
  mostReferencedCategories: [
    { id: 'faqs', name: 'FAQs', references: 523 },
    { id: 'products', name: 'Products', references: 412 },
    { id: 'policies', name: 'Policies', references: 289 },
  ],
  knowledgeGaps: [
    { topic: 'International Shipping', confidence: 32 },
    { topic: 'Enterprise Pricing', confidence: 45 },
    { topic: 'Product Compatibility', confidence: 58 },
  ]
};

/**
 * KnowledgeManagementHub Component
 * 
 * A central knowledge repository interface for managing company documents.
 */
const KnowledgeManagementHub: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('documents');
  
  // State for document search
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for selected category filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // State for test query
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<any | null>(null);
  
  // Handle document search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement document search
    console.log('Searching for:', searchQuery);
  };
  
  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };
  
  // Handle document upload
  const handleUpload = () => {
    // Implement document upload
  };

  // Handle document delete
  const handleDelete = (documentId: string) => {
    // Implement document delete
    console.log('Deleting document:', documentId);
  };
  
  // Handle test query
  const handleTestQuery = () => {
    // Implement test query
    console.log('Testing query:', testQuery);
    setTestResults({
      answer: "The return process takes 3-5 business days to complete once the item is received at our warehouse. Customers should include the original order number with their return.",
      sources: [
        { id: 'doc4', title: 'Return Process SOP', relevance: 0.92 },
        { id: 'doc2', title: 'Employee Handbook', relevance: 0.45 }
      ]
    });
  };
  
  // Filter documents based on search and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Management Hub</h2>
          <p className="text-muted-foreground">
            Upload, organize, and manage your company's knowledge base
          </p>
        </div>
        
        <Button onClick={handleUpload} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Test Queries
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>Document Library</CardTitle>
                <div className="w-full md:w-auto">
                  <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search documents..."
                        className="pl-9 w-full md:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button type="submit" variant="outline" className="ml-2">
                      Search
                    </Button>
                  </form>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {documentCategories.map(category => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCategoryFilter(category.id)}
                  >
                    {category.name} ({category.count})
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No documents found matching your criteria.</p>
                  </div>
                ) : (
                  filteredDocuments.map(doc => (
                    <div key={doc.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md ${doc.category === 'products' ? 'bg-blue-100 text-blue-700' : 
                                                          doc.category === 'policies' ? 'bg-green-100 text-green-700' : 
                                                          doc.category === 'faqs' ? 'bg-amber-100 text-amber-700' : 
                                                          'bg-purple-100 text-purple-700'}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doc.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>Uploaded: {doc.uploadDate}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.format}</span>
                            <span>•</span>
                            <span>{doc.chunks} chunks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredDocuments.length} of {documents.length} documents
              </div>
              <Button variant="outline" size="sm">
                Load More
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Categories</CardTitle>
              <CardDescription>
                Organize your documents into categories for better management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {documentCategories.map(category => (
                  <Card key={category.id} className="overflow-hidden">
                    <div className={`h-2 ${category.color}`}></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">{category.count}</div>
                        <div className="text-sm text-muted-foreground">Documents</div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {/* Add new category card */}
                <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground font-medium">Add New Category</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Test Queries Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Knowledge Base</CardTitle>
              <CardDescription>
                Test how your knowledge base responds to sample queries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-query">Enter a test query</Label>
                <div className="flex gap-2">
                  <Input
                    id="test-query"
                    placeholder="e.g., What is our return policy?"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleTestQuery} disabled={!testQuery.trim()}>
                    Test
                  </Button>
                </div>
              </div>
              
              {testResults && (
                <div className="space-y-4 mt-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Answer:</h4>
                    <p>{testResults.answer}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Sources:</h4>
                    <div className="space-y-2">
                      {testResults.sources.map((source: any) => (
                        <div key={source.id} className="flex justify-between items-center p-2 border rounded-lg">
                          <div className="font-medium">{source.title}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant={source.relevance > 0.7 ? "default" : "secondary"}>
                              {Math.round(source.relevance * 100)}% relevant
                            </Badge>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Common Test Queries</CardTitle>
              <CardDescription>
                Try these sample queries to test your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setTestQuery("What is our return policy?")}>
                  What is our return policy?
                </Button>
                <Button variant="outline" onClick={() => setTestQuery("How do I reset my password?")}>
                  How do I reset my password?
                </Button>
                <Button variant="outline" onClick={() => setTestQuery("What are the product specifications for Model X?")}>
                  What are the product specifications for Model X?
                </Button>
                <Button variant="outline" onClick={() => setTestQuery("What is the employee vacation policy?")}>
                  What is the employee vacation policy?
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalDocuments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalCategories}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Chunks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalChunks}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Referenced Documents</CardTitle>
                <CardDescription>
                  Documents that are most frequently used to answer queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.mostReferencedDocuments.map((doc, index) => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-muted-foreground">{index + 1}.</div>
                        <div>{doc.title}</div>
                      </div>
                      <div className="font-medium">{doc.references} refs</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Referenced Categories</CardTitle>
                <CardDescription>
                  Categories that are most frequently used to answer queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.mostReferencedCategories.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-muted-foreground">{index + 1}.</div>
                        <div>{category.name}</div>
                      </div>
                      <div className="font-medium">{category.references} refs</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Gaps</CardTitle>
              <CardDescription>
                Topics where the knowledge base has low confidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.knowledgeGaps.map(gap => (
                  <div key={gap.topic} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <div className="font-medium">{gap.topic}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{gap.confidence}% confidence</div>
                    </div>
                    <Progress value={gap.confidence} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Generate Content Recommendations
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Document Preview Modal would go here */}
      {/* Upload Document Modal would go here */}
    </div>
  );
};

export default KnowledgeManagementHub;
