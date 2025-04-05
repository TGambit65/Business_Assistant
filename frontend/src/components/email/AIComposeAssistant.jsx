import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
// import { Input } from '../ui/input'; // Removed unused import
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  // MessageSquare, // Removed unused import
  Pencil,
  Sparkles,
  Check,
  RefreshCw,
  Copy,
  Wand,
  Scissors,
  // ArrowRight, // Removed unused import
  // Trash2, // Removed unused import
  PenLine,
  CornerUpRight,
} from 'lucide-react';

/**
 * AI Compose Assistant component for helping users compose emails
 */
const AIComposeAssistant = ({ 
  onApplyText, 
  onClose, 
  currentContent = '',
  selectedText = '',
  isReply = false
}) => {
  // State
  const [activeTab, setActiveTab] = useState('compose');
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
  });
  
  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle radio button changes
  const handleRadioChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Generate text based on the active tab
  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedText('');
    
    try {
      // In a real app, this would call your AI service API
      // For demo purposes, we'll just simulate a delay and response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let result = '';
      
      switch (activeTab) {
        case 'compose':
          result = generateComposeResponse();
          break;
        case 'rewrite':
          result = generateRewriteResponse();
          break;
        case 'reply':
          result = generateReplyResponse();
          break;
        case 'summarize':
          result = generateSummaryResponse();
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
  
  // Mock response generators (in a real app, these would be API calls)
  const generateComposeResponse = () => {
    const { prompt, style, length } = formData;
    
    const lengthMap = {
      short: 'a brief',
      medium: 'a moderate-length',
      long: 'a detailed'
    };
    
    const lengthMultiplier = { short: 1, medium: 2, long: 3 }[length];
    const sentences = [
      `Thank you for your interest in our services.`,
      `I'm writing to provide you with ${lengthMap[length]} overview regarding your request about "${prompt}".`,
      `We specialize in delivering high-quality solutions tailored to our clients' specific needs.`,
      `Our team has extensive experience handling projects similar to what you've described.`,
      `We would be delighted to schedule a call to discuss this further and answer any questions you might have.`,
      `Please let me know when would be a convenient time for you to connect.`,
      `I look forward to potentially working together on this initiative.`,
      `Thank you for considering our services, and I hope to hear from you soon.`
    ];
    
    // Select number of sentences based on length
    const selectedSentences = sentences.slice(0, 3 + lengthMultiplier * 2);
    let response = selectedSentences.join(' ');
    
    // Adjust style
    if (style === 'friendly') {
      response = response.replace('Thank you for your interest', 'Thanks so much for reaching out')
        .replace('I\'m writing to provide', 'I wanted to share')
        .replace('We would be delighted', 'We\'d love')
        .replace('Please let me know', 'Just let me know');
    } else if (style === 'formal') {
      response = response.replace('I\'m writing', 'I am writing')
        .replace('We\'d', 'We would')
        .replace('We specialize', 'Our organization specializes')
        .replace('tailored to', 'customized according to');
    } else if (style === 'persuasive') {
      response = response.replace('Thank you for your interest', 'Your interest comes at the perfect time')
        .replace('We specialize', 'We excel')
        .replace('extensive experience', 'proven track record of success')
        .replace('would be delighted', 'are eager');
    }
    
    return response;
  };
  
  const generateRewriteResponse = () => {
    const { text, tone } = formData;
    
    if (!text.trim()) {
      return 'Please provide text to rewrite.';
    }
    
    let result = text;
    
    switch (tone) {
      case 'professional':
        // Make more professional
        result = result
          .replace(/(?:^|\. )(.)/g, (match, p1) => match.toUpperCase()) // Capitalize first letters
          .replace(/thanks/gi, 'thank you')
          .replace(/sorry/gi, 'I apologize')
          .replace(/you guys/gi, 'your team')
          .replace(/\bi think\b/gi, 'I believe')
          .replace(/\bget\b/gi, 'obtain')
          .replace(/\bwant\b/gi, 'would like');
        break;
      case 'friendly':
        // Make more friendly
        result = result
          .replace(/Dear ([^,]+),/gi, 'Hi $1,')
          .replace(/Thank you/gi, 'Thanks')
          .replace(/I am/gi, "I'm")
          .replace(/We are/gi, "We're")
          .replace(/\bprovide\b/gi, 'share')
          .replace(/\brequire\b/gi, 'need')
          .replace(/\binform\b/gi, 'let you know');
        break;
      case 'direct':
        // Make more direct
        result = result
          .replace(/I (?:would like|want) to/gi, 'I will')
          .replace(/We (?:would like|want) to/gi, 'We will')
          .replace(/(?:In my opinion|I think|I believe)/gi, '')
          .replace(/(?:perhaps|maybe|possibly)/gi, '')
          .replace(/I was wondering if/gi, 'Can')
          .replace(/Would it be possible to/gi, 'Please');
        break;
      case 'formal':
        // Make more formal
        result = result
          .replace(/Hi/gi, 'Dear')
          .replace(/Hey/gi, 'Dear')
          .replace(/Thanks/gi, 'Thank you')
          .replace(/(?:^|\. )(.)/g, (match, p1) => match.toUpperCase()) // Capitalize first letters
          .replace(/\bi'm\b/gi, 'I am')
          .replace(/\byou're\b/gi, 'you are')
          .replace(/\bwe're\b/gi, 'we are')
          .replace(/\bdon't\b/gi, 'do not')
          .replace(/\bcan't\b/gi, 'cannot');
        break;
      default:
        break;
    }
    
    return result;
  };
  
  const generateReplyResponse = () => {
    const { replyType, points } = formData;
    
    let reply = '';
    
    switch (replyType) {
      case 'thanks':
        reply = 'Thank you for your email. I appreciate you taking the time to share this information with me. ';
        if (points) {
          reply += `I'm particularly grateful for your insights regarding ${points}. `;
        }
        reply += 'Your assistance is highly valued, and I look forward to our continued collaboration.';
        break;
      case 'acknowledge':
        reply = 'I confirm receipt of your email and will review the information provided. ';
        if (points) {
          reply += `I'll pay particular attention to ${points} as requested. `;
        }
        reply += 'I\'ll get back to you with a comprehensive response as soon as possible.';
        break;
      case 'followup':
        reply = 'I\'m following up on our previous communication about this matter. ';
        if (points) {
          reply += `As discussed, we need to address ${points}. `;
        }
        reply += 'Could you please provide an update on your progress? I\'m available to discuss any challenges you might be facing.';
        break;
      case 'decline':
        reply = 'Thank you for your email and for considering me for this opportunity. ';
        if (points) {
          reply += `While I appreciate the offer regarding ${points}, `;
        } else {
          reply += 'After careful consideration, ';
        }
        reply += 'I regret to inform you that I must decline at this time due to prior commitments. I wish you success with your endeavors and hope we can collaborate in the future.';
        break;
      default: // normal reply
        reply = 'Thank you for your email. ';
        if (points) {
          const pointsList = points.split(',').map(point => point.trim());
          if (pointsList.length > 1) {
            reply += 'In response to your questions:\n\n';
            pointsList.forEach((point, index) => {
              reply += `${index + 1}. Regarding ${point}: Yes, we can address this matter by implementing the necessary solutions.\n\n`;
            });
          } else {
            reply += `Regarding ${points}, I believe we can move forward with the proposed plan. `;
          }
        }
        reply += 'Please let me know if you need any additional information. I look forward to your response.';
    }
    
    return reply;
  };
  
  const generateSummaryResponse = () => {
    // In a real app, this would analyze the current email content
    // For demo purposes, we'll just return a generic summary
    
    const content = currentContent || 'No content to summarize';
    
    // Count words and create fake summary
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    
    if (wordCount < 10) {
      return 'The email is too short to summarize.';
    }
    
    // const summaryLength = Math.min(wordCount / 5, 50); // Removed unused variable
    let summary = 'This email discusses ';
    
    if (content.toLowerCase().includes('meeting')) {
      summary += 'scheduling a meeting ';
    } else if (content.toLowerCase().includes('project')) {
      summary += 'project updates ';
    } else if (content.toLowerCase().includes('report')) {
      summary += 'report findings ';
    } else {
      summary += 'business matters ';
    }
    
    summary += 'and requires ';
    
    if (content.toLowerCase().includes('please') || content.toLowerCase().includes('could you')) {
      summary += 'actions to be taken. The sender is requesting assistance or information.';
    } else if (content.toLowerCase().includes('thank')) {
      summary += 'no immediate action. The sender is expressing gratitude.';
    } else if (content.toLowerCase().includes('attached') || content.toLowerCase().includes('attachment')) {
      summary += 'review of attached documents.';
    } else {
      summary += 'acknowledgment or response.';
    }
    
    return summary;
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
  
  // Handle copying generated text
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    // In a real app, show a toast notification
  };
  
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-lg">
        <CardTitle className="flex items-center text-xl font-bold">
          <Sparkles className="mr-2 h-5 w-5" />
          AI Compose Assistant
        </CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 mx-4 mt-4 rounded-md">
          <TabsTrigger value="compose" className="flex items-center">
            <Pencil className="mr-2 h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="rewrite" className="flex items-center">
            <PenLine className="mr-2 h-4 w-4" />
            Rewrite
          </TabsTrigger>
          <TabsTrigger value="reply" className="flex items-center">
            <CornerUpRight className="mr-2 h-4 w-4" />
            Reply
          </TabsTrigger>
          <TabsTrigger value="summarize" className="flex items-center">
            <Scissors className="mr-2 h-4 w-4" />
            Summarize
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="p-4 pb-2">
          {/* Compose Tab Content */}
          <TabsContent value="compose" className="mt-0">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">What would you like to write about?</Label>
                <Textarea
                  name="prompt"
                  placeholder="E.g., Request for a meeting to discuss the new project proposal"
                  value={formData.prompt}
                  onChange={handleChange}
                  className="mt-1 h-24"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Style</Label>
                  <RadioGroup
                    name="style"
                    value={formData.style}
                    onValueChange={(value) => handleRadioChange('style', value)}
                    className="mt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional">Professional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friendly" id="friendly" />
                      <Label htmlFor="friendly">Friendly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="formal" id="formal" />
                      <Label htmlFor="formal">Formal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="persuasive" id="persuasive" />
                      <Label htmlFor="persuasive">Persuasive</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Length</Label>
                  <RadioGroup
                    name="length"
                    value={formData.length}
                    onValueChange={(value) => handleRadioChange('length', value)}
                    className="mt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="short" />
                      <Label htmlFor="short">Short</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="long" id="long" />
                      <Label htmlFor="long">Long</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Rewrite Tab Content */}
          <TabsContent value="rewrite" className="mt-0">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Text to rewrite</Label>
                <Textarea
                  name="text"
                  placeholder="Paste the text you want to rewrite..."
                  value={formData.text}
                  onChange={handleChange}
                  className="mt-1 h-24"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Tone</Label>
                <RadioGroup
                  name="tone"
                  value={formData.tone}
                  onValueChange={(value) => handleRadioChange('tone', value)}
                  className="mt-1 flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="tone-professional" />
                    <Label htmlFor="tone-professional">Professional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friendly" id="tone-friendly" />
                    <Label htmlFor="tone-friendly">Friendly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="tone-direct" />
                    <Label htmlFor="tone-direct">Direct</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="formal" id="tone-formal" />
                    <Label htmlFor="tone-formal">Formal</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
          
          {/* Reply Tab Content */}
          <TabsContent value="reply" className="mt-0">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Reply Type</Label>
                <RadioGroup
                  name="replyType"
                  value={formData.replyType}
                  onValueChange={(value) => handleRadioChange('replyType', value)}
                  className="mt-1 grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal-reply" />
                    <Label htmlFor="normal-reply">Normal Reply</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="thanks" id="thanks-reply" />
                    <Label htmlFor="thanks-reply">Thank You</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="acknowledge" id="acknowledge-reply" />
                    <Label htmlFor="acknowledge-reply">Acknowledge</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="followup" id="followup-reply" />
                    <Label htmlFor="followup-reply">Follow Up</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="decline" id="decline-reply" />
                    <Label htmlFor="decline-reply">Decline</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Key points to address (optional)</Label>
                <Textarea
                  name="points"
                  placeholder="E.g., project timeline, budget concerns, next meeting"
                  value={formData.points}
                  onChange={handleChange}
                  className="mt-1 h-16"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Summarize Tab Content */}
          <TabsContent value="summarize" className="mt-0">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This tool will analyze the current email content and generate a summary highlighting key points and any action items.
              </p>
              
              {currentContent ? (
                <div className="border border-border dark:border-gray-700 rounded-md p-3 bg-muted dark:bg-gray-800 max-h-40 overflow-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {currentContent.length > 300 
                      ? currentContent.substring(0, 300) + '...' 
                      : currentContent}
                  </p>
                </div>
              ) : (
                <div className="border border-border dark:border-gray-700 rounded-md p-3 bg-muted dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No email content to summarize.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Action button */}
          <div className="mt-4">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          
          {/* Generated content */}
          {hasGenerated && (
            <div className="mt-4 space-y-3">
              <Separator />
              
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

AIComposeAssistant.propTypes = {
  onApplyText: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  currentContent: PropTypes.string,
  selectedText: PropTypes.string,
  isReply: PropTypes.bool
};

export default AIComposeAssistant; 