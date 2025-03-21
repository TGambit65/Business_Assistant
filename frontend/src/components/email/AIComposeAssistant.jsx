import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sparkles, Loader2, RefreshCw, ThumbsUp, Copy, Send } from 'lucide-react';

export default function AIComposeAssistant({ onApplyContent, onClose }) {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [formData, setFormData] = useState({
    emailPurpose: '',
    recipient: '',
    context: '',
    tone: 'professional',
    length: 'medium'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateEmail = async () => {
    setLoading(true);
    setGeneratedContent('');

    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate a response after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample generated content based on form data
      const sampleResponses = {
        professional: {
          short: `Dear ${formData.recipient},\n\nI'm writing regarding ${formData.emailPurpose}. ${formData.context}\n\nLooking forward to your response.\n\nBest regards,\n[Your Name]`,
          medium: `Dear ${formData.recipient},\n\nI hope this email finds you well. I'm reaching out regarding ${formData.emailPurpose}.\n\n${formData.context}\n\nI would appreciate your feedback on this matter at your earliest convenience.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]`,
          long: `Dear ${formData.recipient},\n\nI hope this email finds you well. I trust you're having a productive week.\n\nI'm writing to you regarding ${formData.emailPurpose}. To provide some context, ${formData.context}\n\nI believe this matter requires your attention and would greatly appreciate your insights. If you need any additional information or clarification, please don't hesitate to ask.\n\nI'm looking forward to your response and thank you in advance for your time and consideration on this matter.\n\nWarm regards,\n[Your Name]`
        },
        friendly: {
          short: `Hi ${formData.recipient}!\n\nJust reaching out about ${formData.emailPurpose}. ${formData.context}\n\nLet me know what you think!\n\nCheers,\n[Your Name]`,
          medium: `Hi ${formData.recipient},\n\nHope you're doing great! I wanted to touch base with you about ${formData.emailPurpose}.\n\n${formData.context}\n\nI'd love to hear your thoughts on this when you get a chance.\n\nThanks!\n[Your Name]`,
          long: `Hi ${formData.recipient},\n\nHope you're having an awesome day! It's been a while since we connected, and I thought I'd reach out.\n\nI wanted to discuss ${formData.emailPurpose} with you. Just to give you some background, ${formData.context}\n\nI'm really interested in your perspective on this, and I think your input would be super valuable. Feel free to share your thoughts whenever you have some time.\n\nLooking forward to catching up!\n\nAll the best,\n[Your Name]`
        },
        formal: {
          short: `Dear ${formData.recipient},\n\nI am writing in reference to ${formData.emailPurpose}. ${formData.context}\n\nYour prompt attention to this matter would be greatly appreciated.\n\nSincerely,\n[Your Name]`,
          medium: `Dear ${formData.recipient},\n\nI am writing to you in regard to ${formData.emailPurpose}.\n\n${formData.context}\n\nI would be most grateful for your consideration of this matter and look forward to your response at your earliest convenience.\n\nYours sincerely,\n[Your Name]`,
          long: `Dear ${formData.recipient},\n\nI hope this correspondence finds you well. I am writing to address the matter of ${formData.emailPurpose}.\n\nTo provide comprehensive context, ${formData.context}\n\nThis matter requires your esteemed attention and consideration. Should you require any additional information or clarification, please do not hesitate to contact me.\n\nI await your response and thank you in advance for your attention to this important matter.\n\nYours faithfully,\n[Your Name]`
        }
      };
      
      setGeneratedContent(sampleResponses[formData.tone][formData.length]);
    } catch (error) {
      console.error('Error generating email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateEmail();
  };

  const handleApply = () => {
    if (generatedContent) {
      onApplyContent(generatedContent);
    }
  };

  const handleRegenerateContent = () => {
    generateEmail();
  };

  return (
    <Card className="w-full max-w-xl shadow-lg border dark:border-gray-700">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center text-xl font-bold">
          <Sparkles className="mr-2 h-5 w-5" />
          Business Composer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Email Purpose</label>
            <Input 
              name="emailPurpose"
              placeholder="e.g., Project proposal, Follow-up, Introduction"
              value={formData.emailPurpose}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Recipient Name</label>
            <Input 
              name="recipient"
              placeholder="e.g., John, Dr. Smith, Team"
              value={formData.recipient}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Context/Details</label>
            <Textarea 
              name="context"
              placeholder="Provide relevant details for your email"
              value={formData.context}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <Select 
                name="tone" 
                value={formData.tone} 
                onValueChange={(value) => handleSelectChange('tone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Length</label>
              <Select 
                name="length" 
                value={formData.length} 
                onValueChange={(value) => handleSelectChange('length', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Email
              </>
            )}
          </Button>
        </form>
        
        {generatedContent && (
          <div className="mt-4 space-y-3">
            <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800 max-h-56 overflow-y-auto whitespace-pre-wrap">
              {generatedContent}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRegenerateContent}
                disabled={loading}
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigator.clipboard.writeText(generatedContent)}
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-800 rounded-b-lg p-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          disabled={!generatedContent}
          onClick={handleApply}
        >
          <Send className="mr-2 h-4 w-4" />
          Use This Draft
        </Button>
      </CardFooter>
    </Card>
  );
} 