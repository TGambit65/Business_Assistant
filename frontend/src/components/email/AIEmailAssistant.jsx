/**
 * AIEmailAssistant.jsx
 * 
 * A unified component for AI email assistance that combines functionality from:
 * - AIComposeAssistant
 * - DraftGeneratorPage
 * 
 * This component provides a consistent interface for all AI email features:
 * - Composing new content
 * - Rewriting existing content
 * - Generating replies
 * - Summarizing emails
 * - Improving drafts
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  MessageSquare, 
  Edit, 
  Reply, 
  FileText,
  Loader2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import aiEmailService from '../../services/AIEmailService';

/**
 * AIEmailAssistant Component
 * 
 * @param {Object} props Component props
 * @param {Function} props.onApplyText Callback when text is applied
 * @param {Function} props.onClose Callback when assistant is closed
 * @param {string} props.currentContent Current email content
 * @param {string} props.selectedText Currently selected text
 * @param {boolean} props.isReply Whether this is a reply to an email
 * @param {Object} props.originalEmail Original email object (for replies)
 * @param {string} props.mode Initial mode to open the assistant in
 */
const AIEmailAssistant = ({ 
  onApplyText, 
  onClose, 
  currentContent = '',
  selectedText = '',
  isReply = false,
  originalEmail = null,
  mode = 'compose'
}) => {
  // State
  const [activeTab, setActiveTab] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [formData, setFormData] = useState({
    // Compose tab
    prompt: '',
    style: 'professional',
    length: 'medium',
    
    // Rewrite tab
    text: selectedText || '',
    tone: 'professional',
    
    // Reply tab
    replyType: 'normal',
    points: '',
    
    // Draft tab
    recipientType: 'colleague',
    purpose: 'update',
    keyPoints: '',
    
    // Summarize tab
    content: currentContent || '',
    summaryLength: 'short'
  });
  
  const { success } = useToast();
  
  // Update text field when selectedText changes
  useEffect(() => {
    if (selectedText) {
      setFormData(prev => ({
        ...prev,
        text: selectedText
      }));
    }
  }, [selectedText]);
  
  // Update content field when currentContent changes
  useEffect(() => {
    if (currentContent) {
      setFormData(prev => ({
        ...prev,
        content: currentContent
      }));
    }
  }, [currentContent]);
  
  // Set active tab based on mode prop
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Copy generated text to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    success('Copied to clipboard');
  };
  
  // Generate text based on active tab
  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedText('');
    
    try {
      let result = '';
      
      switch (activeTab) {
        case 'compose':
          result = await aiEmailService.composeContent({
            prompt: formData.prompt,
            style: formData.style,
            length: formData.length
          });
          break;
          
        case 'rewrite':
          result = await aiEmailService.rewriteContent({
            text: formData.text,
            tone: formData.tone
          });
          break;
          
        case 'reply':
          result = await aiEmailService.generateReply({
            originalEmail: originalEmail || formData.text,
            replyType: formData.replyType,
            points: formData.points
          });
          break;
          
        case 'summarize':
          result = await aiEmailService.summarizeContent({
            content: formData.content,
            length: formData.summaryLength
          });
          break;
          
        case 'draft':
          // Create a draft context
          const draftContext = {
            recipient: {
              email: 'recipient@example.com', // Placeholder
              name: 'Recipient'
            },
            purpose: formData.purpose,
            tone: formData.style,
            keyPoints: formData.keyPoints.split('\n').filter(point => point.trim().length > 0)
          };
          
          // Generate draft
          const draft = await aiEmailService.generateDraft(draftContext);
          result = draft.content;
          break;
          
        default:
          result = 'Invalid request type.';
      }
      
      setGeneratedText(result);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating text:', error);
      setGeneratedText('Failed to generate text. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle apply button
  const handleApply = () => {
    onApplyText(generatedText);
    onClose();
  };
  
  // Handle refresh to generate new content
  const handleRefresh = () => {
    handleGenerate();
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto border shadow-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <CardHeader className="border-b pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
              AI Email Assistant
            </CardTitle>
            
            <TabsList className="grid grid-cols-5 w-auto">
              <TabsTrigger value="compose" className="text-xs px-2 py-1">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Compose</span>
              </TabsTrigger>
              
              <TabsTrigger value="rewrite" className="text-xs px-2 py-1">
                <Edit className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Rewrite</span>
              </TabsTrigger>
              
              <TabsTrigger value="reply" className="text-xs px-2 py-1">
                <Reply className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Reply</span>
              </TabsTrigger>
              
              <TabsTrigger value="summarize" className="text-xs px-2 py-1">
                <FileText className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Summarize</span>
              </TabsTrigger>
              
              <TabsTrigger value="draft" className="text-xs px-2 py-1">
                <Sparkles className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Draft</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {/* Compose Tab */}
          <TabsContent value="compose" className="mt-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt">What would you like to write about?</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleInputChange}
                  placeholder="Describe what you want to write about..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="style">Style</Label>
                  <Select 
                    value={formData.style} 
                    onValueChange={(value) => handleSelectChange('style', value)}
                  >
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="length">Length</Label>
                  <Select 
                    value={formData.length} 
                    onValueChange={(value) => handleSelectChange('length', value)}
                  >
                    <SelectTrigger id="length">
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={!formData.prompt || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Text
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Rewrite Tab */}
          <TabsContent value="rewrite" className="mt-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="text">Text to rewrite</Label>
                <Textarea
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Enter text to rewrite..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="tone">Desired tone</Label>
                <Select 
                  value={formData.tone} 
                  onValueChange={(value) => handleSelectChange('tone', value)}
                >
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={!formData.text || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Rewrite Text
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Reply Tab */}
          <TabsContent value="reply" className="mt-0">
            <div className="space-y-4">
              {!originalEmail && (
                <div>
                  <Label htmlFor="text">Original email</Label>
                  <Textarea
                    id="text"
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    placeholder="Paste the original email here..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="replyType">Reply type</Label>
                <Select 
                  value={formData.replyType} 
                  onValueChange={(value) => handleSelectChange('replyType', value)}
                >
                  <SelectTrigger id="replyType">
                    <SelectValue placeholder="Select reply type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal Reply</SelectItem>
                    <SelectItem value="positive">Positive Response</SelectItem>
                    <SelectItem value="negative">Negative Response</SelectItem>
                    <SelectItem value="request-info">Request Information</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="points">Key points to address (optional)</Label>
                <Textarea
                  id="points"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  placeholder="Enter key points to address in your reply..."
                  className="mt-1"
                  rows={2}
                />
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={((!originalEmail && !formData.text) || loading)}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating reply...
                  </>
                ) : (
                  <>
                    <Reply className="mr-2 h-4 w-4" />
                    Generate Reply
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Summarize Tab */}
          <TabsContent value="summarize" className="mt-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="content">Content to summarize</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter content to summarize..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="summaryLength">Summary length</Label>
                <Select 
                  value={formData.summaryLength} 
                  onValueChange={(value) => handleSelectChange('summaryLength', value)}
                >
                  <SelectTrigger id="summaryLength">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={!formData.content || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Summarize
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Draft Tab */}
          <TabsContent value="draft" className="mt-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="purpose">Email purpose</Label>
                <Select 
                  value={formData.purpose} 
                  onValueChange={(value) => handleSelectChange('purpose', value)}
                >
                  <SelectTrigger id="purpose">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="update">Status Update</SelectItem>
                    <SelectItem value="request">Request</SelectItem>
                    <SelectItem value="introduction">Introduction</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="thank-you">Thank You</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="recipientType">Recipient type</Label>
                <Select 
                  value={formData.recipientType} 
                  onValueChange={(value) => handleSelectChange('recipientType', value)}
                >
                  <SelectTrigger id="recipientType">
                    <SelectValue placeholder="Select recipient type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colleague">Colleague</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="keyPoints">Key points to include</Label>
                <Textarea
                  id="keyPoints"
                  name="keyPoints"
                  value={formData.keyPoints}
                  onChange={handleInputChange}
                  placeholder="Enter key points (one per line)..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating draft...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Draft
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Generated Text Section */}
          {hasGenerated && (
            <div className="mt-6">
              <div className="rounded-md border border-border dark:border-gray-700 p-3 bg-background dark:bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold flex items-center">
                    <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
                    AI Generated Text
                  </h3>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRefresh}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCopy}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted dark:bg-gray-900 rounded p-3 min-h-[100px] max-h-[200px] overflow-auto whitespace-pre-wrap">
                  {generatedText}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between p-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <Button 
            onClick={handleApply} 
            disabled={!generatedText || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-4 w-4" />
            Apply to Email
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  );
};

AIEmailAssistant.propTypes = {
  onApplyText: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  currentContent: PropTypes.string,
  selectedText: PropTypes.string,
  isReply: PropTypes.bool,
  originalEmail: PropTypes.object,
  mode: PropTypes.oneOf(['compose', 'rewrite', 'reply', 'summarize', 'draft'])
};

export default AIEmailAssistant;
