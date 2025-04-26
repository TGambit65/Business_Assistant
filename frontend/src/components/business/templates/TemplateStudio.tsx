import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { 
  FileText, 
  Mail, 
  FileCheck, 
  Search, 
  BarChart, 
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Tag,
  Calendar,
  Clock,
  Star
} from 'lucide-react';

// Mock data for template categories
const templateCategories = [
  { id: 'email', name: 'Email Templates', count: 15, icon: Mail },
  { id: 'document', name: 'Document Templates', count: 8, icon: FileText },
  { id: 'contract', name: 'Contracts', count: 6, icon: FileCheck },
];

// Mock data for templates
const templates = [
  { 
    id: 'template1', 
    title: 'Welcome Email', 
    category: 'email', 
    description: 'Welcome email for new customers',
    createdDate: '2023-05-15', 
    lastModified: '2023-06-22',
    tags: ['welcome', 'onboarding', 'customer'],
    variables: ['customerName', 'productName', 'supportEmail'],
    usageCount: 245,
    rating: 4.8
  },
  { 
    id: 'template2', 
    title: 'Monthly Newsletter', 
    category: 'email', 
    description: 'Monthly newsletter template with product updates',
    createdDate: '2023-04-10', 
    lastModified: '2023-06-15',
    tags: ['newsletter', 'updates', 'monthly'],
    variables: ['month', 'year', 'featuredProduct', 'specialOffer'],
    usageCount: 187,
    rating: 4.5
  },
  { 
    id: 'template3', 
    title: 'Sales Proposal', 
    category: 'document', 
    description: 'Sales proposal template for enterprise clients',
    createdDate: '2023-03-22', 
    lastModified: '2023-05-18',
    tags: ['sales', 'proposal', 'enterprise'],
    variables: ['clientName', 'contactName', 'productTier', 'pricing', 'validUntil'],
    usageCount: 78,
    rating: 4.2
  },
  { 
    id: 'template4', 
    title: 'Service Agreement', 
    category: 'contract', 
    description: 'Standard service agreement for consulting services',
    createdDate: '2023-02-15', 
    lastModified: '2023-04-10',
    tags: ['agreement', 'legal', 'services'],
    variables: ['clientName', 'startDate', 'endDate', 'serviceFees', 'paymentTerms'],
    usageCount: 56,
    rating: 4.0
  },
];

// Mock data for analytics
const analyticsData = {
  totalTemplates: 29,
  totalCategories: 3,
  totalUsage: 2547,
  mostUsedTemplates: [
    { id: 'template1', title: 'Welcome Email', category: 'email', usageCount: 245 },
    { id: 'template2', title: 'Monthly Newsletter', category: 'email', usageCount: 187 },
    { id: 'template5', title: 'Order Confirmation', category: 'email', usageCount: 156 },
  ],
  usageByCategory: [
    { id: 'email', name: 'Email Templates', usageCount: 1423 },
    { id: 'document', name: 'Document Templates', usageCount: 782 },
    { id: 'contract', name: 'Contracts', usageCount: 342 },
  ],
  recentActivity: [
    { action: 'created', template: 'Refund Request Form', user: 'John Doe', timestamp: '2023-06-25 14:32' },
    { action: 'edited', template: 'Welcome Email', user: 'Jane Smith', timestamp: '2023-06-24 10:15' },
    { action: 'used', template: 'Sales Proposal', user: 'Mike Johnson', timestamp: '2023-06-23 16:45' },
  ]
};

/**
 * TemplateStudio Component
 * 
 * A template management system for creating and managing email and document templates.
 */
const TemplateStudio: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('templates');
  
  // State for template search
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for selected category filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Handle template search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement template search
    console.log('Searching for:', searchQuery);
  };
  
  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };
  
  // Handle template creation
  const handleCreateTemplate = () => {
    // Implement template creation
    console.log('Creating new template');
  };
  
  // Handle template preview
  const handlePreview = (template: any) => {
    console.log('Previewing template:', template);
  };
  
  // Handle template edit
  const handleEdit = (templateId: string) => {
    // Implement template edit
    console.log('Editing template:', templateId);
  };
  
  // Handle template delete
  const handleDelete = (templateId: string) => {
    // Implement template delete
    console.log('Deleting template:', templateId);
  };
  
  // Handle template duplicate
  const handleDuplicate = (templateId: string) => {
    // Implement template duplicate
    console.log('Duplicating template:', templateId);
  };
  
  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const category = templateCategories.find(cat => cat.id === categoryId);
    const Icon = category?.icon || FileText;
    return <Icon className="h-5 w-5" />;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Template Studio</h2>
          <p className="text-muted-foreground">
            Create and manage templates for emails, documents, and contracts
          </p>
        </div>
        
        <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>Template Library</CardTitle>
                <div className="w-full md:w-auto">
                  <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search templates..."
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
                {templateCategories.map(category => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => handleCategoryFilter(category.id)}
                  >
                    {React.createElement(category.icon, { className: "h-3 w-3" })}
                    {category.name} ({category.count})
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No templates found matching your criteria.</p>
                  </div>
                ) : (
                  filteredTemplates.map(template => (
                    <div key={template.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md ${template.category === 'email' ? 'bg-blue-100 text-blue-700' : 
                                                          template.category === 'document' ? 'bg-green-100 text-green-700' : 
                                                          'bg-purple-100 text-purple-700'}`}>
                          {getCategoryIcon(template.category)}
                        </div>
                        <div>
                          <h4 className="font-medium">{template.title}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Modified: {template.lastModified}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>Used: {template.usageCount} times</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              <span className="ml-1">{template.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm" onClick={() => handlePreview(template)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(template.id)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDuplicate(template.id)}>
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicate
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(template.id)}>
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
                Showing {filteredTemplates.length} of {templates.length} templates
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
              <CardTitle>Template Categories</CardTitle>
              <CardDescription>
                Organize your templates into categories for better management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templateCategories.map(category => (
                  <Card key={category.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {React.createElement(category.icon, { className: "h-5 w-5" })}
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">{category.count}</div>
                        <div className="text-sm text-muted-foreground">Templates</div>
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
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalTemplates}</div>
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
                <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalUsage}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Used Templates</CardTitle>
                <CardDescription>
                  Templates that are most frequently used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.mostUsedTemplates.map((template, index) => (
                    <div key={template.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-muted-foreground">{index + 1}.</div>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-md ${template.category === 'email' ? 'bg-blue-100 text-blue-700' : 
                                                            template.category === 'document' ? 'bg-green-100 text-green-700' : 
                                                            'bg-purple-100 text-purple-700'}`}>
                            {getCategoryIcon(template.category)}
                          </div>
                          <div>{template.title}</div>
                        </div>
                      </div>
                      <div className="font-medium">{template.usageCount} uses</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Usage by Category</CardTitle>
                <CardDescription>
                  Template usage broken down by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.usageByCategory.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-muted-foreground">{index + 1}.</div>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category.id)}
                          <div>{category.name}</div>
                        </div>
                      </div>
                      <div className="font-medium">{category.usageCount} uses</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Recent template creation, editing, and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      {activity.action === 'created' && <Plus className="h-4 w-4 text-green-500" />}
                      {activity.action === 'edited' && <Edit className="h-4 w-4 text-blue-500" />}
                      {activity.action === 'used' && <Eye className="h-4 w-4 text-amber-500" />}
                      <div>
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-muted-foreground"> {activity.action} </span>
                        <span className="font-medium">{activity.template}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Template Preview Modal would go here */}
    </div>
  );
};

export default TemplateStudio;
