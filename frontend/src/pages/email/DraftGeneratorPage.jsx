import React, { useState, useEffect, useMemo } from 'react'; // Removed unused useCallback
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, /* CardFooter */ } from '../../components/ui/card'; // Removed unused CardFooter

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
// import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'; // Removed unused RadioGroup components
import { Separator } from '../../components/ui/separator';
import { 
  ArrowLeft, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Copy, 
  Maximize2, 
  Minimize2,
  FileText,
  Briefcase, // Keep Briefcase as it might be used in tips
  Lightbulb,
  // CheckCircle2, // Removed unused CheckCircle2
  Wand,
  MessageSquare,
  ThumbsUp,
  Book

} from 'lucide-react';
// import { useToast } from '../../contexts/ToastContext';
// import { useAuth } from '../../contexts/AuthContext';
// import DeepseekService from '../../services/DeepseekService'; // Removed unused DeepseekService

export default function DraftGeneratorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const { /* error, */ /* info */ } = useToast(); // Removed unused error, info, success, warning - Entire line commented out
  // const { user } = useAuth(); // Removed unused user
  
  // State
  const [activeTab, setActiveTab] = useState('purpose');
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  // const [isReplyOrForward, setIsReplyOrForward] = useState( // Removed unused state
  //   searchParams.get('mode') === 'reply' || searchParams.get('mode') === 'forward'
  // );
  // const [sourceEmail, setSourceEmail] = useState(null); // Removed unused state
  
  // Form state
  const [formData, setFormData] = useState({
    // Email context
    recipientType: searchParams.get('recipientType') || 'colleague',
    purpose: searchParams.get('purpose') || 'update',
    tone: searchParams.get('tone') || 'professional',
    
    // Quick draft fields
    subject: searchParams.get('subject') || '',
    keyPoints: searchParams.get('keyPoints') || '',
    
    // Advanced fields
    industry: 'technology',
    documentType: 'proposal',
    audience: 'internal',
    includeData: false,
    includeCTA: true,
    formality: 'neutral',
    
    // Sender info
    senderName: localStorage.getItem('userName') || 'Your Name',
    senderRole: localStorage.getItem('userRole') || 'Your Role',
    
    // Original email (for reply/forward)
    originalSubject: searchParams.get('originalSubject') || '',
    originalSender: searchParams.get('originalSender') || '',
    originalContent: searchParams.get('originalContent') || '',
  });
  
  // Industry-specific document types
  const industries = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'legal', label: 'Legal' },
    { value: 'marketing', label: 'Marketing' },
  ];
  
  const documentTypes = useMemo(() => ({
    technology: [
      { value: 'proposal', label: 'Project Proposal' },
      { value: 'statusUpdate', label: 'Status Update' },
      { value: 'technicalReport', label: 'Technical Report' },
      { value: 'productAnnouncement', label: 'Product Announcement' },
    ],
    healthcare: [
      { value: 'patientCommunication', label: 'Patient Communication' },
      { value: 'referral', label: 'Referral' },
      { value: 'treatmentSummary', label: 'Treatment Summary' },
      { value: 'healthAdvisory', label: 'Health Advisory' },
    ],
    finance: [
      { value: 'financialReport', label: 'Financial Report' },
      { value: 'investmentProposal', label: 'Investment Proposal' },
      { value: 'taxDocument', label: 'Tax Documentation' },
      { value: 'budgetRequest', label: 'Budget Request' },
    ],
    education: [
      { value: 'lessonPlan', label: 'Lesson Plan' },
      { value: 'studentFeedback', label: 'Student Feedback' },
      { value: 'courseAnnouncement', label: 'Course Announcement' },
      { value: 'researchProposal', label: 'Research Proposal' },
    ],
    retail: [
      { value: 'productLaunch', label: 'Product Launch' },
      { value: 'promotionAnnouncement', label: 'Promotion Announcement' },
      { value: 'customerFeedback', label: 'Customer Feedback' },
      { value: 'inventoryUpdate', label: 'Inventory Update' },
    ],
    manufacturing: [
      { value: 'qualityReport', label: 'Quality Report' },
      { value: 'supplyChainUpdate', label: 'Supply Chain Update' },
      { value: 'processImprovement', label: 'Process Improvement' },
      { value: 'equipmentRequest', label: 'Equipment Request' },
    ],
    legal: [
      { value: 'caseUpdate', label: 'Case Update' },
      { value: 'legalAdvice', label: 'Legal Advice' },
      { value: 'contractReview', label: 'Contract Review' },
      { value: 'compliance', label: 'Compliance Notice' },
    ],
    marketing: [
      { value: 'campaignBrief', label: 'Campaign Brief' },
      { value: 'marketResearch', label: 'Market Research' },
      { value: 'contentStrategy', label: 'Content Strategy' },
      { value: 'brandGuidelines', label: 'Brand Guidelines' },
    ],
  }), []);
  
  // Update document types when industry changes
  useEffect(() => {
    // Reset document type when industry changes to avoid invalid selection
    setFormData(prev => ({
      ...prev,
      documentType: documentTypes[prev.industry][0].value
    }));
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.industry]); // Removed documentTypes dependency
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch changes
  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Generate draft email with AI
  const handleGenerateDraft = async () => {
    setLoading(true);
    setGeneratedDraft('');
    
    try {
      // In a real app, this would call your AI service API
      // For demo purposes, we'll just simulate a delay and response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate draft based on form data
      const draft = generateDraftFromTemplate();
      setGeneratedDraft(draft);
    } catch (error) {
      console.error('Error generating draft:', error);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };
  
  // Quick draft generation
  const handleQuickDraft = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a simpler draft for quick use
      const quickDraft = generateQuickDraft();
      setGeneratedDraft(quickDraft);
      
      // Skip to the preview tab
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating quick draft:', error);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to generate a quick draft from basic inputs
  const generateQuickDraft = () => {
    const { recipientType, purpose, tone, subject, keyPoints } = formData;
    
    // Define templates for different scenarios
    const greetings = {
      professional: {
        colleague: 'Dear colleague,',
        client: 'Dear valued client,',
        manager: 'Dear manager,',
        team: 'Dear team,',
        vendor: 'Dear vendor partner,',
        other: 'Hello,'
      },
      friendly: {
        colleague: 'Hi there,',
        client: 'Hello!',
        manager: 'Hi,',
        team: 'Hey team,',
        vendor: 'Hi folks,',
        other: 'Hey,'
      },
      formal: {
        colleague: 'Dear colleague,',
        client: 'Dear Sir/Madam,',
        manager: 'Dear Manager,',
        team: 'Dear Team Members,',
        vendor: 'Dear Service Provider,',
        other: 'To Whom It May Concern,'
      }
    };
    
    const purposeIntros = {
      professional: {
        update: 'I am writing to provide you with an update regarding ',
        request: 'I would like to request ',
        followup: 'I am following up on ',
        meeting: 'I would like to schedule a meeting to discuss ',
        introduction: 'I would like to introduce ',
        feedback: 'I would like to provide feedback on ',
        other: 'I am writing regarding '
      },
      friendly: {
        update: 'Just wanted to give you a quick update about ',
        request: 'I was hoping you could help with ',
        followup: 'Just checking in about ',
        meeting: 'Let\'s find some time to talk about ',
        introduction: 'I wanted to introduce you to ',
        feedback: 'I have some thoughts to share about ',
        other: 'I wanted to reach out about '
      },
      formal: {
        update: 'This correspondence serves to provide an update concerning ',
        request: 'I am writing to formally request ',
        followup: 'This email serves as a follow-up regarding ',
        meeting: 'I would like to request a formal meeting to discuss ',
        introduction: 'I would like to formally introduce ',
        feedback: 'I am writing to provide formal feedback regarding ',
        other: 'The purpose of this communication is to address '
      }
    };
    
    // Generate email components
    const greeting = greetings[tone][recipientType] || greetings[tone].other;
    const intro = purposeIntros[tone][purpose] || purposeIntros[tone].other;
    
    // Format key points
    let pointsSection = '';
    let points = []; // Initialize points variable
    if (keyPoints) {
      points = keyPoints.split('\n').filter(point => point.trim());
      
      if (points.length > 1) {
        pointsSection = '\n\nKey points:\n';
        points.forEach((point, index) => {
          pointsSection += `${index + 1}. ${point.trim()}\n`;
        });
      } else if (points.length === 1) {
        pointsSection = ` ${points[0].trim()}.`;
      }
    }
    
    // Closings based on tone
    const closings = {
      professional: 'Thank you for your attention to this matter.\n\nBest regards,',
      friendly: 'Thanks!\n\nCheers,',
      formal: 'Thank you for your consideration.\n\nSincerely,'
    };
    
    // Assemble the email
    let emailBody = `${greeting}\n\n${intro}${subject}.${pointsSection}`;
    
    // Add appropriate closing
    if (points && points.length > 1) {
      emailBody += `\n\n${closings[tone]}`;
    } else {
      emailBody += `\n\n${closings[tone]}`;
    }
    
    // Add sender name
    emailBody += `\n${formData.senderName}`;
    if (formData.senderRole) {
      emailBody += `\n${formData.senderRole}`;
    }
    
    return emailBody;
  };
  
  // Helper function to generate more complex draft from templates
  const generateDraftFromTemplate = () => {
    // This would be more complex in a real application
    // with templates for different document types and industries
    
    const { 
      industry, documentType, audience, formality, 
      includeData, includeCTA, purpose, keyPoints, 
      senderName, senderRole
    } = formData;
    
    // Example of a template-based generation (simplified for demo)
    let draft = '';
    
    // Add greeting based on audience and formality
    if (audience === 'internal') {
      draft += formality === 'formal' ? 'Dear Team,\n\n' : 'Hi Team,\n\n';
    } else {
      draft += formality === 'formal' ? 'Dear Sir/Madam,\n\n' : 'Hello,\n\n';
    }
    
    // Add industry-specific introduction
    const introductions = {
      technology: 'As we continue to innovate and develop our technical solutions, ',
      healthcare: 'In our ongoing commitment to patient care and health services, ',
      finance: 'With respect to our financial objectives and market position, ',
      education: 'In support of our educational mission and student development, ',
      retail: 'As we focus on enhancing customer experience and product offerings, ',
      manufacturing: 'To optimize our production processes and supply chain efficiency, ',
      legal: 'Regarding the legal considerations and compliance requirements, ',
      marketing: 'To strengthen our brand presence and marketing initiatives, '
    };
    
    draft += introductions[industry] || '';
    
    // Add purpose-specific content
    const purposeContent = {
      update: 'I wanted to provide you with an update on our recent progress. ',
      request: 'I am writing to request your support and input on a critical matter. ',
      meeting: 'I would like to schedule a meeting to discuss important developments. ',
      proposal: 'I am pleased to present the following proposal for your consideration. ',
      feedback: 'I would like to share some feedback based on recent developments. '
    };
    
    draft += purposeContent[purpose] || '';
    
    // Add document type specific section
    const currentDocTypes = documentTypes[industry] || [];
    const selectedDocType = currentDocTypes.find(dt => dt.value === documentType);
    
    if (selectedDocType) {
      draft += `This ${selectedDocType.label.toLowerCase()} addresses the following aspects:\n\n`;
    }
    
    // Add key points if available
    if (keyPoints) {
      const points = keyPoints.split('\n').filter(point => point.trim());
      points.forEach((point, index) => {
        draft += `${index + 1}. ${point.trim()}\n`;
      });
      draft += '\n';
    } else {
      draft += '1. [Key point one]\n2. [Key point two]\n3. [Key point three]\n\n';
    }
    
    // Add data placeholder if requested
    if (includeData) {
      draft += 'Supporting data:\n';
      draft += '- [Insert relevant metric or data point]\n';
      draft += '- [Insert relevant metric or data point]\n\n';
    }
    
    // Add call to action if requested
    if (includeCTA) {
      const ctas = {
        formal: 'Please review the information provided and respond with your feedback by [date].',
        neutral: 'Let me know your thoughts on this when you have a chance.',
        casual: 'Looking forward to hearing what you think about this!'
      };
      
      draft += ctas[formality] || ctas.neutral;
      draft += '\n\n';
    }
    
    // Add closing
    const closings = {
      formal: 'Thank you for your attention to this matter.\n\nSincerely,',
      neutral: 'Thank you for your consideration.\n\nBest regards,',
      casual: 'Thanks!\n\nCheers,'
    };
    
    draft += closings[formality] || closings.neutral;
    draft += `\n${senderName}`;
    
    if (senderRole) {
      draft += `\n${senderRole}`;
    }
    
    return draft;
  };
  
  // Use the generated draft in new email
  const handleUseDraft = () => {
    if (!generatedDraft) return;
    
    // Redirect to compose page with the generated draft
    navigate(`/email/compose?draft=${encodeURIComponent(generatedDraft)}&subject=${encodeURIComponent(formData.subject)}`);
  };
  
  // Copy draft to clipboard
  const handleCopyDraft = () => {
    if (!generatedDraft) return;
    
    navigator.clipboard.writeText(generatedDraft);
    // Show success toast (in a real app)
  };
  
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Email Draft Generator</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-violet-500 text-white">
              <CardTitle className="flex items-center text-xl">
                <FileText className="mr-2 h-5 w-5" />
                Draft Generator
              </CardTitle>
            </CardHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="purpose" className="text-sm">
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="content" className="text-sm">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-sm">
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <CardContent className="p-4">
                {/* Purpose Tab */}
                <TabsContent value="purpose" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientType">Recipient Type</Label>
                      <Select 
                        value={formData.recipientType} 
                        onValueChange={(value) => handleSelectChange('recipientType', value)}
                      >
                        <SelectTrigger id="recipientType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="colleague">Colleague</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Email Purpose</Label>
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
                          <SelectItem value="followup">Follow-up</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="introduction">Introduction</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
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
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Enter email subject"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="keyPoints">Key Points</Label>
                    <Textarea
                      id="keyPoints"
                      name="keyPoints"
                      placeholder="Enter key points (one per line)"
                      rows={4}
                      value={formData.keyPoints}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={handleQuickDraft}
                      disabled={loading || !formData.subject}
                      className="flex items-center"
                    >
                      <Wand className="mr-2 h-4 w-4" />
                      Quick Draft
                    </Button>
                    
                    <Button onClick={() => setActiveTab('content')} className="flex items-center">
                      Advanced Options
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Advanced Options</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('purpose')}
                      className="text-sm"
                    >
                      Back to Basics
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select 
                        value={formData.industry} 
                        onValueChange={(value) => handleSelectChange('industry', value)}
                      >
                        <SelectTrigger id="industry">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map(ind => (
                            <SelectItem key={ind.value} value={ind.value}>
                              {ind.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Document Type</Label>
                      <Select 
                        value={formData.documentType} 
                        onValueChange={(value) => handleSelectChange('documentType', value)}
                      >
                        <SelectTrigger id="documentType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes[formData.industry]?.map(docType => (
                            <SelectItem key={docType.value} value={docType.value}>
                              {docType.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="audience">Target Audience</Label>
                      <Select 
                        value={formData.audience} 
                        onValueChange={(value) => handleSelectChange('audience', value)}
                      >
                        <SelectTrigger id="audience">
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="formality">Formality Level</Label>
                      <Select 
                        value={formData.formality} 
                        onValueChange={(value) => handleSelectChange('formality', value)}
                      >
                        <SelectTrigger id="formality">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeData" className="text-base">Include Data</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add placeholders for data points and metrics
                        </p>
                      </div>
                      <Switch
                        id="includeData"
                        checked={formData.includeData}
                        onCheckedChange={(checked) => handleSwitchChange('includeData', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="includeCTA" className="text-base">Include Call to Action</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add a clear next step or request
                        </p>
                      </div>
                      <Switch
                        id="includeCTA"
                        checked={formData.includeCTA}
                        onCheckedChange={(checked) => handleSwitchChange('includeCTA', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-3 space-y-2">
                    <Label>Sender Information</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        name="senderName"
                        placeholder="Your Name"
                        value={formData.senderName}
                        onChange={handleChange}
                      />
                      <Input
                        name="senderRole"
                        placeholder="Your Role"
                        value={formData.senderRole}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Button 
                      onClick={handleGenerateDraft}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Generating...' : 'Generate Draft'}
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Preview Tab */}
                <TabsContent value="preview" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Draft Preview</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                      >
                        {isPreviewExpanded ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div 
                      className={`border rounded-md p-4 bg-muted dark:bg-gray-800 overflow-auto whitespace-pre-wrap ${
                        isPreviewExpanded ? 'h-[500px]' : 'h-[250px]'
                      }`}
                    >
                      {generatedDraft || (
                        <p className="text-gray-500 italic">
                          Your generated email will appear here. Go to the Basic Info tab to enter your information.
                        </p>
                      )}
                    </div>
                    
                    {generatedDraft && (
                      <div className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          onClick={handleCopyDraft}
                          className="flex items-center"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy to Clipboard
                        </Button>
                        
                        <Button 
                          onClick={handleUseDraft}
                          className="bg-green-600 hover:bg-green-700 flex items-center"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Use This Draft
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
        
        {/* Right Column: Tips and Help */}
        <div className="hidden md:block">
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <CardTitle className="flex items-center text-lg">
                <Lightbulb className="mr-2 h-5 w-5" />
                Email Writing Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                  Professional Emails
                </h3>
                <ul className="list-disc list-inside ml-1 text-gray-700 dark:text-gray-300">
                  <li>Keep subject lines clear and descriptive</li>
                  <li>Start with a proper greeting</li>
                  <li>Be concise and stay on topic</li>
                  <li>Use proper formatting for readability</li>
                  <li>End with a professional signature</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4 text-purple-500" />
                  Effective Communication
                </h3>
                <ul className="list-disc list-inside ml-1 text-gray-700 dark:text-gray-300">
                  <li>State your purpose early in the email</li>
                  <li>Use bullet points for multiple items</li>
                  <li>Include a clear call to action</li>
                  <li>Specify deadlines if applicable</li>
                  <li>Proofread before sending</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                  Best Practices
                </h3>
                <ul className="list-disc list-inside ml-1 text-gray-700 dark:text-gray-300">
                  <li>Respond promptly to important emails</li>
                  <li>Use appropriate tone for your audience</li>
                  <li>Be careful with humor and sarcasm</li>
                  <li>Avoid all caps and excessive punctuation</li>
                  <li>Include relevant context in replies</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <h3 className="font-medium flex items-center text-blue-700 dark:text-blue-300">
                  <Book className="mr-2 h-4 w-4" />
                  Did you know?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  The average professional spends 28% of their workday on email. Well-written emails reduce back-and-forth communication and save time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 