import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import * as z from 'zod';
import { Template } from '../../../../shared/types/template';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import RichTextEditor from '../RichTextEditor';
import { generateId } from '../../utils/uuid';

// Type for RichTextEditor props to resolve TypeScript issues
const Editor = RichTextEditor as React.ComponentType<{
  initialContent?: string;
  onChange?: (htmlContent: string) => void;
  placeholder?: string;
  showButtons?: boolean;
  darkMode?: boolean;
}>;

// Define Zod schema for validation
const variableSchema = z.object({
  id: z.string().optional(), // Optional for new variables
  name: z.string().min(1, 'Variable name is required'),
  type: z.enum(['text', 'number', 'date', 'email', 'name', 'custom']),
  defaultValue: z.string().optional(),
  required: z.boolean().default(false),
  description: z.string().optional(),
});

const templateFormSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(), // Assuming tags are managed as an array of strings
  variables: z.array(variableSchema).optional(),
  aiSuggestions: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

// Helper function to generate form default values
const getFormDefaults = (template?: Template, safeGenerateId?: () => string): TemplateFormData => {
  const defaults: TemplateFormData = {
    name: '',
    subject: '',
    content: '',
    category: '',
    tags: [],
    variables: [],
    aiSuggestions: false,
    isPublic: false,
  };

  if (!template) {
    return defaults;
  }

  return {
    ...defaults,
    name: template.name,
    subject: template.subject,
    content: template.content,
    category: template.category,
    tags: template.tags || defaults.tags,
    variables: template.variables?.map(v => ({
      ...v, 
      id: v.id || (safeGenerateId ? safeGenerateId() : generateId())
    })) || defaults.variables,
    aiSuggestions: template.aiSuggestions || defaults.aiSuggestions,
    isPublic: template.isPublic || defaults.isPublic,
  };
};

interface TemplateEditorProps {
  template?: Template;
  onSave: (data: TemplateFormData, originalTemplateId?: string) => void;
  onCancel: () => void;
  userId: string; // For createdBy/updatedBy logic
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ 
  template,
  onSave,
  onCancel,
  userId 
}) => {
  // Safe UUID generation with explicit browser compatibility check
  const safeGenerateId = (): string => {
    // First check if crypto.randomUUID is available in the current environment
    if (typeof window !== 'undefined' && 
        typeof window.crypto !== 'undefined' && 
        typeof window.crypto.randomUUID === 'function') {
      try {
        return window.crypto.randomUUID();
      } catch (error) {
        console.warn('window.crypto.randomUUID failed, using fallback:', error);
      }
    }
    
    // Use the utility function which has multiple fallbacks
    return generateId();
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: getFormDefaults(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variables',
  });

  useEffect(() => {
    reset(getFormDefaults(template, safeGenerateId));
  }, [template, reset]);

  const onSubmit = (data: TemplateFormData) => {
    // Here, you would typically add/update createdBy, updatedBy, version, etc.
    // For now, just passing the raw form data and original template ID for edit scenarios.
    onSave(data, template?.id);
  };

  // Basic JSX structure, to be fleshed out with actual UI components
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 bg-white shadow-md rounded-lg">
      <div>
        <Label htmlFor="name" className="block text-sm font-medium text-gray-700">Template Name</Label>
        <Input 
          id="name" 
          {...register('name')}
          className="mt-1 block w-full"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</Label>
        <Input 
          id="subject" 
          {...register('subject')}
          className="mt-1 block w-full"
        />
        {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
      </div>

      <div>
        <Label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</Label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <Editor
              initialContent={field.value || ''}
              onChange={(htmlContent: string) => field.onChange(htmlContent)}
              placeholder="Template content..."
              showButtons={true}
              darkMode={false}
            />
          )}
        />
        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</Label>
        <Input 
          id="category" 
          {...register('category')}
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <Label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</Label>
        <Controller
            name="tags"
            control={control}
            render={({ field }) => (
                <Input
                    {...field}
                    value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                    onChange={(e) => field.onChange(e.target.value.split(',').map(tag => tag.trim()))}
                    className="mt-1 block w-full"
                />
            )}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">Variables</h3>
        {fields.map((item, index) => (
          <div key={item.id} className="p-3 border border-gray-200 rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Variable {index + 1}</h4>
              <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
            </div>
            <div>
              <Label htmlFor={`variables.${index}.name`} className="block text-xs font-medium text-gray-600">Name</Label>
              <Input 
                {...register(`variables.${index}.name` as const)}
                className="mt-1 block w-full text-sm"
              />
              {errors.variables?.[index]?.name && <p className="mt-1 text-xs text-red-500">{errors.variables?.[index]?.name?.message}</p>}
            </div>
            <div>
              <Label htmlFor={`variables.${index}.type`} className="block text-xs font-medium text-gray-600">Type</Label>
              <Controller
                name={`variables.${index}.type` as const}
                control={control}
                render={({ field }) => (
                  <select {...field} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm bg-white">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="name">Name</option>
                    <option value="custom">Custom</option>
                  </select>
                )}
              />
            </div>
            <div>
                <Label htmlFor={`variables.${index}.defaultValue`} className="block text-xs font-medium text-gray-600">Default Value (optional)</Label>
                <Input 
                    {...register(`variables.${index}.defaultValue` as const)}
                    className="mt-1 block w-full text-sm"
                />
            </div>
            <div>
                <Label htmlFor={`variables.${index}.description`} className="block text-xs font-medium text-gray-600">Description (optional)</Label>
                <Input 
                    {...register(`variables.${index}.description` as const)}
                    className="mt-1 block w-full text-sm"
                />
            </div>
            <div className="flex items-center">
                <Controller
                    name={`variables.${index}.required` as const}
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                {...field} 
                                checked={value} 
                                onChange={e => onChange(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2" 
                            />
                        </div>
                    )}
                />
                <Label htmlFor={`variables.${index}.required`} className="text-xs font-medium text-gray-600">Required</Label>
            </div>
          </div>
        ))}
        <Button 
          type="button" 
          onClick={() => append({ id: safeGenerateId(), name: '', type: 'text', defaultValue: '', required: false, description: '' })}
          className="mt-2 text-sm"
          variant="outline"
        >
          Add Variable
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
            <Controller
                name="aiSuggestions"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            {...field} 
                            checked={value} 
                            onChange={e => onChange(e.target.checked)}
                            id="aiSuggestions" 
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2" 
                        />
                    </div>
                )}
            />
            <Label htmlFor="aiSuggestions" className="text-sm font-medium text-gray-700">Enable AI Suggestions</Label>
        </div>
        <div className="flex items-center">
            <Controller
                name="isPublic"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            {...field} 
                            checked={value} 
                            onChange={e => onChange(e.target.checked)}
                            id="isPublic" 
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2" 
                        />
                    </div>
                )}
            />
            <Label htmlFor="isPublic" className="text-sm font-medium text-gray-700">Is Public Template</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          onClick={onCancel}
          variant="outline"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          variant="default"
        >
          Save Template
        </Button>
      </div>
    </form>
  );
};

export default TemplateEditor; 