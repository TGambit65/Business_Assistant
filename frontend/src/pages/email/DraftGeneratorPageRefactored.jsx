import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useToast } from '../../contexts/ToastContext';
import { DraftFormProvider } from '../../contexts/DraftFormContext';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

// Import components
import BasicInfoForm from '../../components/email/draft/BasicInfoForm';
import DetailsForm from '../../components/email/draft/DetailsForm';
import DraftPreview from '../../components/email/draft/DraftPreview';
import AIEmailAssistant from '../../components/email/AIEmailAssistant';

/**
 * DraftGeneratorPageRefactored Component
 *
 * A refactored version of the draft generator page that uses separate components
 * for each section of the form.
 */
export default function DraftGeneratorPageRefactored() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('basic-info');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Handle next button click
  const handleNext = () => {
    if (activeTab === 'basic-info') {
      setActiveTab('details');
    } else if (activeTab === 'details') {
      setActiveTab('preview');
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (activeTab === 'preview') {
      setActiveTab('details');
    } else if (activeTab === 'details') {
      setActiveTab('basic-info');
    }
  };

  // Handle save draft
  const handleSaveDraft = (draft) => {
    // In a real app, this would save to backend
    console.log('Saving draft:', draft);

    success({
      title: 'Draft Saved',
      description: 'Your email draft has been saved successfully.'
    });
  };

  // Handle send draft
  const handleSendDraft = (draft) => {
    // In a real app, this would send the email
    console.log('Sending draft:', draft);

    success({
      title: 'Email Sent',
      description: 'Your email has been sent successfully.'
    });

    // Navigate to inbox
    navigate('/inbox');
  };

  // Handle AI suggestions
  const handleAISuggestions = () => {
    setShowAIAssistant(true);
  };

  // Handle applying AI-generated text
  const handleApplyAIText = (text) => {
    setShowAIAssistant(false);
    success({
      title: 'AI Draft Generated',
      description: 'The AI-generated draft has been applied to your email.'
    });

    // In a real implementation, this would update the draft form
    // For now, we'll just show a success message
  };

  return (
    <DraftFormProvider>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Email Draft Generator</h1>
          <Button variant="outline" onClick={handleAISuggestions}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Suggestions
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="basic-info">
                <BasicInfoForm />
              </TabsContent>

              <TabsContent value="details">
                <DetailsForm />
              </TabsContent>

              <TabsContent value="preview">
                <DraftPreview
                  onSave={handleSaveDraft}
                  onSend={handleSendDraft}
                />
              </TabsContent>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={activeTab === 'basic-info'}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={activeTab === 'preview'}
                >
                  {activeTab === 'details' ? 'Preview' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6">
          <h2 className="text-lg font-medium mb-4">Tips for Effective Emails</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium">Be Clear and Concise</h3>
                <p className="text-sm text-muted-foreground">
                  Keep your emails brief and to the point. Use bullet points for key information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium">Use a Professional Tone</h3>
                <p className="text-sm text-muted-foreground">
                  Maintain a professional tone, especially in business communications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium">Include a Clear Call to Action</h3>
                <p className="text-sm text-muted-foreground">
                  Make it clear what you want the recipient to do after reading your email.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Email Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <AIEmailAssistant
            onApplyText={handleApplyAIText}
            onClose={() => setShowAIAssistant(false)}
            currentContent=""
            selectedText=""
            isReply={false}
            mode="draft"
          />
        </div>
      )}
    </DraftFormProvider>
  );
}
