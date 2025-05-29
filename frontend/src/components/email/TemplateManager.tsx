import React, { useState, useEffect, useCallback } from 'react';
import { Template } from '../../../../shared/types/template';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Tag,
  Users,
  Star,
  Copy,
  Download,
  Upload
} from 'lucide-react';

// Mock EmailTemplateService - replace with actual service later
const mockEmailTemplateService = {
  getTemplates: async (userId: string): Promise<Template[]> => {
    console.log(`Fetching templates for user: ${userId}`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1', name: 'Welcome Email', subject: 'Welcome to Our Platform!', content: 'Hello {{name}}...',
        variables: [{id: 'v1', name: 'name', type: 'text', required: true}], aiSuggestions: false, category: 'Onboarding',
        permissions: [], createdAt: new Date(), updatedAt: new Date(), createdBy: 'user1',
        version: 1, isPublic: false, tags: ['welcome', 'onboarding'],
        metadata: { description: 'Standard welcome email for new users' }
      },
      {
        id: '2', name: 'Password Reset', subject: 'Reset Your Password', content: 'Click here to reset...',
        variables: [], aiSuggestions: true, category: 'Security',
        permissions: [], createdAt: new Date(), updatedAt: new Date(), createdBy: 'user1',
        version: 2, isPublic: true, tags: ['security', 'password'],
        metadata: { description: 'Password reset instructions' }
      },
    ];
  },
  deleteTemplate: async (templateId: string): Promise<void> => {
    console.log(`Deleting template: ${templateId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
};

interface TemplateManagerProps {
  userId: string;
  onEditTemplate: (templateId: string) => void;
  onCreateNewTemplate: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  userId,
  onEditTemplate,
  onCreateNewTemplate,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTemplates = await mockEmailTemplateService.getTemplates(userId);
      setTemplates(fetchedTemplates);
    } catch (err) {
      setError('Failed to fetch templates. Please try again.');
      console.error(err);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDeleteClick = (template: Template) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      try {
        await mockEmailTemplateService.deleteTemplate(templateToDelete.id);
        setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateToDelete.id));
        setIsDeleteDialogOpen(false);
        setTemplateToDelete(null);
      } catch (err) {
        setError('Failed to delete template. Please try again.');
        console.error(err);
        // Optionally keep dialog open or show error within dialog
      }
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Email Templates</h1>
          <button 
            onClick={onCreateNewTemplate}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {/* <PlusCircle className="h-5 w-5 mr-2" /> */}
            <span>+</span> Create New Template
          </button>
        </div>

        {isLoading && <p className="text-center text-gray-600 py-4">Loading templates...</p>}
        {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

        {!isLoading && !error && templates.length === 0 && (
          <p className="text-center text-gray-500 py-10">No templates found. Get started by creating one!</p>
        )}

        {!isLoading && !error && templates.length > 0 && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-xs" title={template.subject}>{template.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{template.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(template.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => onEditTemplate(template.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Template"
                      >
                        {/* <Edit2 className="h-5 w-5" /> */}
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(template)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Template"
                      >
                        {/* <Trash2 className="h-5 w-5" /> */}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog (basic structure, Radix UI would be better) */}
      {isDeleteDialogOpen && templateToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Template</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the template "{templateToDelete.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3 space-x-2">
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setTemplateToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager; 