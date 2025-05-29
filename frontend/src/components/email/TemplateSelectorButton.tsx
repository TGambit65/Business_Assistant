import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Template } from '../../../../shared/types/template'; // Now importing from shared types
import { emailTemplateServiceAPI } from '../../services/EmailTemplateServiceAPI';

interface TemplateSelectorButtonProps {
  userId: string;
  onTemplateSelect: (templateData: { subject: string; content: string }) => void;
}

export const TemplateSelectorButton: React.FC<TemplateSelectorButtonProps> = ({ 
  userId,
  onTemplateSelect 
}) => {
  const { t } = useTranslation(['emails', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<Pick<Template, 'id' | 'name' | 'subject' | 'content'>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTemplatesForSelection = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTemplates = await emailTemplateServiceAPI.getTemplates(userId);
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error("Failed to fetch templates for selection:", error);
      setTemplates([]); // Set to empty on error
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      fetchTemplatesForSelection();
    }
  }, [isOpen, fetchTemplatesForSelection]);

  const handleSelect = (template: Pick<Template, 'subject' | 'content'>) => {
    onTemplateSelect({ subject: template.subject, content: template.content });
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userId) return null; // Or some other handling if userId is not available

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {t('emails:compose.templates.use_template')}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">{t('emails:templates.title')}</h3>
              <button onClick={() => { setIsOpen(false); setSearchTerm(''); }} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="p-4">
              <input 
                type="text"
                placeholder={t('emails:templates.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="overflow-y-auto p-4 pt-0 flex-grow">
              {isLoading ? (
                <p className="text-center text-gray-500">{t('common:loading')}</p>
              ) : filteredTemplates.length > 0 ? (
                <ul className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <li key={template.id}>
                      <button
                        onClick={() => handleSelect(template)}
                        className="w-full text-left p-3 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 group"
                      >
                        <h4 className="text-sm font-medium text-indigo-700 group-hover:text-indigo-800">{template.name}</h4>
                        <p className="text-xs text-gray-500 truncate group-hover:text-gray-600">{template.subject}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">{t('emails:templates.no_templates')}</p>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
                <button 
                    type="button"
                    onClick={() => { setIsOpen(false); setSearchTerm(''); }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {t('common:cancel')}
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateSelectorButton;

/*
Guidance for Email Composer Integration:

1. Import TemplateSelectorButton into your EmailComposer component:
   import TemplateSelectorButton from './TemplateSelectorButton'; // Adjust path as needed

2. Place the button in the composer's UI, for example, near the Send button:
   <TemplateSelectorButton userId={currentUser.id} onTemplateSelect={handleApplyTemplate} />

3. Implement the handleApplyTemplate function in your EmailComposer:
   const handleApplyTemplate = (templateData: { subject: string; content: string }) => {
     // Assuming your composer uses state for subject and content, e.g., with useState or react-hook-form
     setSubject(templateData.subject); // Or form.setValue('subject', templateData.subject);
     setContent(templateData.content); // Or form.setValue('content', templateData.content);
     // If using a rich text editor, you might need to use its specific API to set content.
   };

4. Ensure `currentUser.id` (or equivalent) is passed to `userId` prop.
*/ 