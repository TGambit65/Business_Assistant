import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, FileText, Star, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function TemplatesPage() {
  const { success, error, info, warning } = useToast();
  const [showAddTemplateForm, setShowAddTemplateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  
  // Sample initial templates
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Meeting Follow-up',
      category: 'Business',
      subject: 'Follow-up: {{meeting_name}} - Next Steps',
      body: `Hi {{recipient_name}},

Thank you for your time during our discussion about {{meeting_topic}}. I wanted to follow up with a quick summary of what we covered and the next steps.

Key points discussed:
- {{point_1}}
- {{point_2}}
- {{point_3}}

Next steps:
- {{next_step_1}}
- {{next_step_2}}

Please let me know if you have any questions or if I missed anything important.

Best regards,
{{sender_name}}`,
      favorite: true
    },
    {
      id: 2,
      name: 'Thank You Note',
      category: 'Personal',
      subject: 'Thank You for {{event_or_gift}}',
      body: `Dear {{recipient_name}},

I wanted to express my sincere thanks for {{event_or_gift}}. It was very thoughtful of you and I appreciate it.

{{personal_message}}

Thank you again.

Best wishes,
{{sender_name}}`,
      favorite: false
    },
    {
      id: 3,
      name: 'Project Status Update',
      category: 'Business',
      subject: '{{project_name}} Status Update - {{date}}',
      body: `Hello Team,

Here is the latest status update for the {{project_name}} project:

Progress:
- {{accomplishment_1}}
- {{accomplishment_2}}

Challenges:
- {{challenge_1}}
- {{challenge_2}}

Next Milestones:
- {{milestone_1}} - Due: {{date_1}}
- {{milestone_2}} - Due: {{date_2}}

Please let me know if you have any questions or concerns.

Regards,
{{sender_name}}`,
      favorite: true
    }
  ]);
  
  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'Business',
    subject: '',
    body: '',
    favorite: false
  });
  
  const handleAddTemplate = () => {
    if (!newTemplate.name) {
      error('Template name is required');
      return;
    }
    
    if (!newTemplate.subject) {
      error('Subject is required');
      return;
    }
    
    if (!newTemplate.body) {
      error('Template body is required');
      return;
    }
    
    if (editingTemplateId !== null) {
      // Update existing template
      setTemplates(templates.map(template => 
        template.id === editingTemplateId ? { ...newTemplate, id: editingTemplateId } : template
      ));
      success('Template updated successfully');
    } else {
      // Add new template
      const newId = Math.max(0, ...templates.map(t => t.id)) + 1;
      setTemplates([...templates, { ...newTemplate, id: newId }]);
      success('Template added successfully');
    }
    
    // Reset form
    setNewTemplate({
      name: '',
      category: 'Business',
      subject: '',
      body: '',
      favorite: false
    });
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
    setTemplates(templates.map(template => 
      template.id === id ? { ...template, favorite: !template.favorite } : template
    ));
  };
  
  const categoryOptions = [
    'Business',
    'Personal',
    'Project',
    'Customer Support',
    'Sales',
    'Other'
  ];
  
  // Generate template with AI
  const generateTemplateWithAI = () => {
    if (!newTemplate.name || !newTemplate.category) {
      error('Please provide a template name and category before generating');
      return;
    }

    setIsGeneratingTemplate(true);

    // Simulate AI processing delay
    setTimeout(() => {
      // This would be replaced with a real API call to an AI service
      const generatedTemplate = generateTemplateSample(newTemplate.name, newTemplate.category);
      
      setNewTemplate({
        ...newTemplate,
        subject: generatedTemplate.subject,
        body: generatedTemplate.body
      });

      setIsGeneratingTemplate(false);
      success('Template generated successfully');
    }, 2000);
  };

  // Sample template generator - would be replaced with actual AI API call
  const generateTemplateSample = (name, category) => {
    // Basic logic to generate different templates based on name and category
    const templateData = {
      subject: '',
      body: ''
    };

    // Extract likely purpose from the template name
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('introduction') || nameLower.includes('intro')) {
      templateData.subject = 'Introduction: {{your_name}} from {{company_name}}';
      templateData.body = `Dear {{recipient_name}},

I hope this email finds you well. My name is {{your_name}} and I am {{your_position}} at {{company_name}}.

I wanted to reach out to introduce myself and {{purpose_of_introduction}}. 

{{additional_details}}

I would welcome the opportunity to {{call_to_action}}. Please let me know if you would be available for a brief call at your convenience.

Thank you for your time.

Best regards,
{{your_name}}
{{your_position}}
{{company_name}}
{{contact_information}}`;
    } 
    else if (nameLower.includes('follow') || nameLower.includes('follow-up')) {
      templateData.subject = 'Follow-up: {{topic}} - Next Steps';
      templateData.body = `Hi {{recipient_name}},

I hope you're doing well. I wanted to follow up on our discussion about {{topic}} on {{previous_date}}.

As discussed, here are the key points:
- {{point_1}}
- {{point_2}}
- {{point_3}}

The next steps we agreed on are:
- {{action_item_1}} (Due: {{due_date_1}})
- {{action_item_2}} (Due: {{due_date_2}})

Please let me know if you have any questions or if you need any additional information.

Best regards,
{{your_name}}
{{your_position}}`;
    }
    else if (nameLower.includes('thank') || nameLower.includes('appreciation')) {
      templateData.subject = 'Thank You for {{event_or_action}}';
      templateData.body = `Dear {{recipient_name}},

I wanted to express my sincere appreciation for {{event_or_action}}. {{specific_detail_about_what_you_appreciate}}.

{{additional_personal_message}}

Thank you again for {{restate_appreciation_briefly}}. It means a lot to me/us.

Warm regards,
{{your_name}}`;
    }
    else if (nameLower.includes('invite') || nameLower.includes('invitation')) {
      templateData.subject = 'Invitation: {{event_name}} - {{event_date}}';
      templateData.body = `Dear {{recipient_name}},

I am pleased to invite you to {{event_name}} on {{event_date}} at {{event_time}} located at {{event_location}}.

{{event_description}}

Event Details:
- Date: {{event_date}}
- Time: {{event_time}}
- Location: {{event_location}}
- Dress Code: {{dress_code}}
- RSVP: {{rsvp_details}}

{{additional_information}}

We hope you can join us for this special occasion.

Best regards,
{{your_name}}
{{contact_information}}`;
    }
    else if (nameLower.includes('proposal') || nameLower.includes('quote')) {
      templateData.subject = 'Proposal for {{project_name}} - {{company_name}}';
      templateData.body = `Dear {{recipient_name}},

Thank you for the opportunity to submit a proposal for {{project_name}}.

Based on our discussions, we are pleased to present our proposal for {{brief_project_description}}:

Project Scope:
- {{scope_item_1}}
- {{scope_item_2}}
- {{scope_item_3}}

Timeline:
- Start Date: {{start_date}}
- Completion Date: {{completion_date}}

Investment:
{{pricing_details}}

Why Choose Us:
{{unique_selling_points}}

We look forward to the possibility of working with you on this project. Please review the details and let me know if you have any questions.

Best regards,
{{your_name}}
{{your_position}}
{{company_name}}
{{contact_information}}`;
    }
    else {
      // Default template based on category
      switch (category) {
        case 'Business':
          templateData.subject = '{{subject_topic}} - {{company_name}}';
          templateData.body = `Dear {{recipient_name}},

I hope this email finds you well. I'm writing regarding {{subject_topic}}.

{{main_content_paragraph_1}}

{{main_content_paragraph_2}}

Please let me know if you have any questions or require additional information.

Best regards,
{{your_name}}
{{your_position}}
{{company_name}}`;
          break;
          
        case 'Personal':
          templateData.subject = 'About {{subject_topic}}';
          templateData.body = `Hi {{recipient_name}},

Hope you're doing well! I wanted to reach out about {{subject_topic}}.

{{personal_message}}

{{closing_thoughts}}

Take care,
{{your_name}}`;
          break;
          
        case 'Project':
          templateData.subject = '{{project_name}} Update - {{date}}';
          templateData.body = `Hello {{recipient_name}},

Here's an update on the {{project_name}} project:

Progress:
- {{progress_item_1}}
- {{progress_item_2}}

Challenges:
- {{challenge_1}}
- {{challenge_2}}

Next Steps:
- {{next_step_1}}
- {{next_step_2}}

Let me know if you have any questions.

Regards,
{{your_name}}`;
          break;
          
        case 'Customer Support':
          templateData.subject = 'RE: {{issue_reference}} - {{status}}';
          templateData.body = `Dear {{customer_name}},

Thank you for contacting our support team about {{issue_reference}}.

{{response_to_issue}}

{{next_steps_or_resolution}}

If you have any other questions, please don't hesitate to contact us.

Best regards,
{{your_name}}
Customer Support Representative
{{company_name}}`;
          break;
          
        case 'Sales':
          templateData.subject = '{{product_name}} - Special Offer for {{customer_name}}';
          templateData.body = `Dear {{customer_name}},

I hope this email finds you well. I wanted to share some information about {{product_name}} that I believe would be valuable for {{customer_company}}.

{{product_description}}

{{unique_selling_points}}

{{special_offer}}

I would be happy to schedule a call to discuss how {{product_name}} can benefit your business.

Best regards,
{{your_name}}
{{your_position}}
{{company_name}}
{{contact_information}}`;
          break;
          
        default:
          templateData.subject = '{{subject_line}}';
          templateData.body = `Dear {{recipient_name}},

{{email_body}}

Best regards,
{{your_name}}`;
      }
    }

    return templateData;
  };
  
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Templates</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create and manage reusable email templates to save time.
        </p>
      </div>
      
      <div className="flex justify-end mb-6">
        <Button 
          onClick={() => {
            setShowAddTemplateForm(!showAddTemplateForm);
            setEditingTemplateId(null);
            if (!showAddTemplateForm) {
              setNewTemplate({
                name: '',
                category: 'Business',
                subject: '',
                body: '',
                favorite: false
              });
            }
          }}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Template</span>
        </Button>
      </div>
      
      {/* Add/Edit Template Form */}
      {showAddTemplateForm && (
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingTemplateId !== null ? 'Edit Template' : 'Add New Template'}
              <Button
                variant="outline"
                size="sm"
                onClick={generateTemplateWithAI}
                disabled={isGeneratingTemplate || !newTemplate.name || !newTemplate.category}
                className="flex items-center gap-2"
              >
                {isGeneratingTemplate ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate with AI</span>
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                  placeholder="Enter template name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Subject Line</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                  placeholder="Enter email subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {/* Escape the curly braces to avoid ESLint errors */}
                  Use {'{{'}<span>variable_name</span>{'}}'} for variables that will be replaced when using the template.
                </p>
              </div>
              
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Email Body</label>
                <textarea
                  rows={12}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 font-mono"
                  placeholder="Enter email body"
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {/* Escape the curly braces to avoid ESLint errors */}
                  Use {'{{'}<span>variable_name</span>{'}}'} for variables that will be replaced when using the template.
                </p>
              </div>
              
              <div className="col-span-1 sm:col-span-2 mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={newTemplate.favorite}
                    onChange={(e) => setNewTemplate({ ...newTemplate, favorite: e.target.checked })}
                  />
                  <span className="text-sm">Mark as favorite</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddTemplateForm(false);
                  setEditingTemplateId(null);
                }}
                className="flex items-center gap-2"
              >
                <X size={16} />
                <span>Cancel</span>
              </Button>
              <Button
                onClick={handleAddTemplate}
                className="flex items-center gap-2"
              >
                <Check size={16} />
                <span>{editingTemplateId !== null ? 'Update Template' : 'Add Template'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {templates.map(template => (
            <Card key={template.id} className="border-0 shadow-sm hover:shadow transition-shadow duration-200">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center text-base">
                    {template.name}
                    {template.favorite && (
                      <Star size={16} className="ml-2 text-yellow-500 fill-yellow-500" />
                    )}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    Category: {template.category}
                  </p>
                </div>
                <div className="flex">
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => handleToggleFavorite(template.id)}
                    title={template.favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star size={16} className={template.favorite ? "text-yellow-500 fill-yellow-500" : ""} />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => handleEditTemplate(template)}
                    title="Edit template"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    onClick={() => handleDeleteTemplate(template.id)}
                    title="Delete template"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{template.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</p>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-4 whitespace-pre-line">
                    {template.body}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 text-sm"
                  onClick={() => {
                    // Functionality to use template would go here
                    success(`Template "${template.name}" selected`);
                  }}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <FileText size={24} className="text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="mt-4 text-base font-medium text-gray-900 dark:text-white">No templates yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create your first email template to speed up your email workflow.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setShowAddTemplateForm(true)}
                className="flex items-center gap-2 mx-auto"
              >
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