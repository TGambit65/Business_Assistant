import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Plus, Edit2, Trash2, FileText, Star, Check, X, Sparkles, Loader2, Search } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { Label } from '../../components/ui/label';

export default function TemplatesPage() {
  const { success, error } = useToast();
  const navigate = useNavigate(); // Initialize useNavigate
  const [showAddTemplateForm, setShowAddTemplateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sample initial templates
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Meeting Follow-up', category: 'Business', subject: 'Follow-up: {{meeting_name}} - Next Steps', body: `Hi {{recipient_name}},\n\nThank you for your time...`, favorite: true },
    { id: 2, name: 'Thank You Note', category: 'Personal', subject: 'Thank You for {{event_or_gift}}', body: `Dear {{recipient_name}},\n\nI wanted to express my sincere thanks...`, favorite: false },
    { id: 3, name: 'Project Status Update', category: 'Business', subject: '{{project_name}} Status Update - {{date}}', body: `Hello Team,\n\nHere is the latest status update...`, favorite: true }
  ]);

  // New template form state
  const [newTemplate, setNewTemplate] = useState({ name: '', category: 'Business', subject: '', body: '', favorite: false });

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      error('Template name, subject, and body are required');
      return;
    }
    if (editingTemplateId !== null) {
      setTemplates(templates.map(template => template.id === editingTemplateId ? { ...newTemplate, id: editingTemplateId } : template));
      success('Template updated successfully');
    } else {
      const newId = Math.max(0, ...templates.map(t => t.id)) + 1;
      setTemplates([...templates, { ...newTemplate, id: newId }]);
      success('Template added successfully');
    }
    setNewTemplate({ name: '', category: 'Business', subject: '', body: '', favorite: false });
    setShowAddTemplateForm(false);
    setEditingTemplateId(null);
  };

  const handleEditTemplate = (template) => {
    setNewTemplate({ ...template });
    setEditingTemplateId(template.id);
    setShowAddTemplateForm(true);
  };

  const handleDeleteTemplate = (id) => {
    setTemplates(templates.filter(template => template.id !== id));
    success('Template deleted successfully');
  };

  const handleToggleFavorite = (id) => {
    setTemplates(templates.map(template => template.id === id ? { ...template, favorite: !template.favorite } : template));
  };

  const categoryOptions = ['All', 'Business', 'Personal', 'Project', 'Customer Support', 'Sales', 'Other'];

  // Filtered templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
                          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.body.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- AI Generation Logic (Keep existing) ---
  const generateTemplateWithAI = () => { /* ... existing implementation ... */ };
  // eslint-disable-next-line no-unused-vars
  const generateTemplateSample = (name, category) => { /* ... existing implementation ... */ };
  // --- End AI Generation Logic ---

  // --- Handle Use Template ---
  const handleUseTemplate = (template) => {
    console.log(`Using template: ${template.name}`);
    // Navigate to compose page, passing template data via state
    navigate('/email/compose', {
      state: {
        subject: template.subject,
        body: template.body
      }
    });
  };
  // --- End Handle Use Template ---


  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage reusable email templates to save time.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddTemplateForm(!showAddTemplateForm);
            setEditingTemplateId(null);
            if (!showAddTemplateForm) { setNewTemplate({ name: '', category: 'Business', subject: '', body: '', favorite: false }); }
          }}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          <span>{showAddTemplateForm ? 'Cancel' : 'Add Template'}</span>
        </Button>
      </div>

      {/* Add/Edit Template Form */}
      {showAddTemplateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingTemplateId !== null ? 'Edit Template' : 'Add New Template'}
              <Button
                variant="secondary" size="sm" onClick={generateTemplateWithAI}
                disabled={isGeneratingTemplate || !newTemplate.name || !newTemplate.category}
                className="flex items-center gap-2"
              >
                {isGeneratingTemplate ? (<><Loader2 size={14} className="animate-spin" /><span>Generating...</span></>) : (<><Sparkles size={14} /><span>Generate with AI</span></>)}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input id="template-name" type="text" placeholder="Enter template name" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}>
                  <SelectTrigger id="template-category" className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.filter(c => c !== 'All').map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label htmlFor="template-subject">Subject Line</Label>
                <Input id="template-subject" type="text" placeholder="Enter email subject" value={newTemplate.subject} onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })} className="mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">Use {'{{'}variable_name{'}}'} for placeholders.</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label htmlFor="template-body">Email Body</Label>
                <Textarea id="template-body" rows={12} placeholder="Enter email body" value={newTemplate.body} onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })} className="font-mono mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">Use {'{{'}variable_name{'}}'} for placeholders.</p>
              </div>
              <div className="col-span-1 sm:col-span-2 mt-2 flex items-center space-x-2">
                <Checkbox id="template-favorite" checked={newTemplate.favorite} onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, favorite: checked })} />
                <Label htmlFor="template-favorite" className="text-sm font-medium">Mark as favorite</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => { setShowAddTemplateForm(false); setEditingTemplateId(null); }} className="flex items-center gap-2">
              <X size={16} />
              <span>Cancel</span>
            </Button>
            <Button onClick={handleAddTemplate} className="flex items-center gap-2">
              <Check size={16} />
              <span>{editingTemplateId !== null ? 'Update Template' : 'Add Template'}</span>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full" />
        </div>
        <div className="w-full sm:w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{template.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1 text-xs">{template.category}</Badge>
                </div>
                 <Button variant="ghost" size="icon" className={`h-8 w-8 ${template.favorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-muted-foreground hover:text-yellow-400'}`} onClick={() => handleToggleFavorite(template.id)} title={template.favorite ? "Remove from favorites" : "Add to favorites"}>
                    <Star size={18} className={template.favorite ? "fill-current" : ""} />
                  </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                    <p className="text-sm text-foreground line-clamp-1">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preview:</p>
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap break-words">
                      {template.body}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex items-center justify-between">
                 <div className="flex space-x-1">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditTemplate(template)} title="Edit template">
                     <Edit2 size={16} />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTemplate(template.id)} title="Delete template">
                     <Trash2 size={16} />
                   </Button>
                 </div>
                 {/* Updated Use Template Button */}
                 <Button
                   variant="secondary"
                   size="sm"
                   onClick={() => handleUseTemplate(template)} // Call new handler
                 >
                   Use Template
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // No Templates Found state
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <FileText size={24} className="text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-medium text-foreground">No templates found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || selectedCategory !== 'All' ? 'No templates match your current filter.' : 'Create your first email template.'}
            </p>
            <div className="mt-6">
              <Button onClick={() => { setShowAddTemplateForm(true); setNewTemplate({ name: '', category: 'Business', subject: '', body: '', favorite: false }); }} className="flex items-center gap-2 mx-auto">
                <Plus size={16} />
                <span>Create Template</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}