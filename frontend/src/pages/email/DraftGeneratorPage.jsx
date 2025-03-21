import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Sparkles, 
  Send, 
  Clock, 
  Copy, 
  Loader2,
  X
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import DeepseekService from '../../services/DeepseekService';

export default function DraftGeneratorPage() {
  const navigate = useNavigate();
  const { success, error, warning, info } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [isReplyOrForward, setIsReplyOrForward] = useState(false);
  const [sourceEmail, setSourceEmail] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    recipientType: 'customer',
    purpose: 'information',
    tone: 'professional',
    subject: '',
    keyPoints: '',
    recipientName: '',
    recipientEmail: '',
    senderName: user?.displayName || '',
    senderPosition: user?.position || ''
  });

  // Add these new state variables and industry templates
  const [documentType, setDocumentType] = useState('email');
  const [industry, setIndustry] = useState('general');
  const [showIndustrySelector, setShowIndustrySelector] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Define industries and their specific document types
  const industries = [
    { id: 'general', name: 'General Business' },
    { id: 'construction', name: 'Construction' },
    { id: 'roofing', name: 'Roofing Contractor' },
    { id: 'flooring', name: 'Flooring Sales' },
    { id: 'appliances', name: 'Appliance Sales' },
    { id: 'automotive', name: 'Automotive Sales' },
    { id: 'realEstate', name: 'Real Estate' },
    { id: 'insurance', name: 'Insurance' },
    { id: 'software', name: 'Software/SaaS' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'retail', name: 'Retail' }
  ];

  // Document types by industry
  const documentTypes = {
    general: [
      { id: 'email', name: 'Email' },
      { id: 'proposal', name: 'Business Proposal' },
      { id: 'followUp', name: 'Follow-up Letter' },
      { id: 'meetingNotes', name: 'Meeting Notes' },
      { id: 'newsletter', name: 'Newsletter' }
    ],
    construction: [
      { id: 'email', name: 'Email' },
      { id: 'proposal', name: 'Project Proposal' },
      { id: 'estimate', name: 'Cost Estimate' },
      { id: 'contract', name: 'Construction Contract' },
      { id: 'changeOrder', name: 'Change Order' },
      { id: 'invoice', name: 'Invoice' }
    ],
    roofing: [
      { id: 'email', name: 'Email' },
      { id: 'estimate', name: 'Roofing Estimate' },
      { id: 'inspection', name: 'Roof Inspection Report' },
      { id: 'warranty', name: 'Warranty Document' },
      { id: 'maintenancePlan', name: 'Maintenance Plan' }
    ],
    flooring: [
      { id: 'email', name: 'Email' },
      { id: 'quote', name: 'Flooring Quote' },
      { id: 'installGuide', name: 'Installation Guide' },
      { id: 'careInstructions', name: 'Care Instructions' },
      { id: 'productSpecs', name: 'Product Specifications' }
    ],
    appliances: [
      { id: 'email', name: 'Email' },
      { id: 'quote', name: 'Appliance Quote' },
      { id: 'warrantyInfo', name: 'Warranty Information' },
      { id: 'specSheet', name: 'Appliance Spec Sheet' },
      { id: 'comparison', name: 'Product Comparison' }
    ],
    automotive: [
      { id: 'email', name: 'Email' },
      { id: 'vehicleOffer', name: 'Vehicle Offer' },
      { id: 'financing', name: 'Financing Options' },
      { id: 'testDriveInvite', name: 'Test Drive Invitation' },
      { id: 'serviceReminder', name: 'Service Reminder' }
    ],
    realEstate: [
      { id: 'email', name: 'Email' },
      { id: 'listing', name: 'Property Listing' },
      { id: 'marketAnalysis', name: 'Market Analysis' },
      { id: 'offerLetter', name: 'Offer Letter' },
      { id: 'clientUpdates', name: 'Client Updates' }
    ],
    insurance: [
      { id: 'email', name: 'Email' },
      { id: 'policyOverview', name: 'Policy Overview' },
      { id: 'quote', name: 'Insurance Quote' },
      { id: 'claimInfo', name: 'Claim Information' },
      { id: 'benefitsSummary', name: 'Benefits Summary' }
    ],
    software: [
      { id: 'email', name: 'Email' },
      { id: 'proposal', name: 'Software Solution Proposal' },
      { id: 'onboarding', name: 'Onboarding Guide' },
      { id: 'releaseNotes', name: 'Release Notes' },
      { id: 'supportResponse', name: 'Support Response' }
    ],
    healthcare: [
      { id: 'email', name: 'Email' },
      { id: 'patientInfo', name: 'Patient Information' },
      { id: 'treatmentPlan', name: 'Treatment Plan' },
      { id: 'followUpCare', name: 'Follow-up Care' },
      { id: 'referral', name: 'Referral Letter' }
    ],
    retail: [
      { id: 'email', name: 'Email' },
      { id: 'productInfo', name: 'Product Information' },
      { id: 'orderConfirmation', name: 'Order Confirmation' },
      { id: 'promotionalOffer', name: 'Promotional Offer' },
      { id: 'returnPolicy', name: 'Return Policy' }
    ]
  };

  // Helper function to determine recipient type from email - defined with useCallback before it's used in useEffect
  const determineRecipientType = useCallback((email) => {
    if (!email) return 'customer';
    
    // Get domain from user email
    const getDomainFromUserEmail = () => {
      const email = user?.email || '';
      const parts = email.split('@');
      return parts.length > 1 ? parts[1] : '';
    };
    
    // Simple logic - in real app this would be more sophisticated
    if (email.includes('vendor') || email.includes('partner')) return 'vendor';
    if (email.includes('manager') || email.includes('supervisor')) return 'manager';
    if (email.includes('colleague') || email.endsWith(getDomainFromUserEmail())) return 'colleague';
    if (email.includes('applicant') || email.includes('candidate')) return 'applicant';
    
    return 'customer'; // Default
  }, [user]);
  
  // Load source email data if available (for reply/forward)
  useEffect(() => {
    const sourceEmailData = localStorage.getItem('sourceEmail');
    if (sourceEmailData) {
      try {
        const parsedEmail = JSON.parse(sourceEmailData);
        setSourceEmail(parsedEmail);
        setIsReplyOrForward(true);
        
        // Populate form based on source email
        const isReply = parsedEmail.type === 'reply';
        
        setFormData(prev => ({
          ...prev,
          recipientType: determineRecipientType(parsedEmail.from.email),
          purpose: isReply ? 'follow-up' : 'information',
          subject: isReply ? `Re: ${parsedEmail.subject}` : `Fwd: ${parsedEmail.subject}`,
          recipientName: isReply ? parsedEmail.from.name : '',
          recipientEmail: isReply ? parsedEmail.from.email : '',
          keyPoints: `Regarding your email about "${parsedEmail.subject}"\n\n`
        }));
        
        // Remove the data after using it
        localStorage.removeItem('sourceEmail');
      } catch (error) {
        console.error('Error parsing source email:', error);
      }
    }
    
    // Check if we have draft data from compose
    const draftEmailData = localStorage.getItem('draftEmailData');
    if (draftEmailData && !sourceEmailData) {
      try {
        const parsedDraft = JSON.parse(draftEmailData);
        
        setFormData(prev => ({
          ...prev,
          subject: parsedDraft.subject || prev.subject,
          recipientEmail: parsedDraft.to || prev.recipientEmail,
          keyPoints: parsedDraft.body 
            ? `Draft content: ${stripHtml(parsedDraft.body)}\n\n` 
            : prev.keyPoints
        }));
        
        localStorage.removeItem('draftEmailData');
      } catch (error) {
        console.error('Error parsing draft email data:', error);
      }
    }
  }, [determineRecipientType]);
  
  // Strip HTML for plaintext use
  const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Available options for the form
  const recipientOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'vendor', label: 'Vendor/Partner' },
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager/Supervisor' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'applicant', label: 'Job Applicant' },
    { value: 'other', label: 'Other' }
  ];

  const purposeOptions = [
    { value: 'information', label: 'Share Information' },
    { value: 'request', label: 'Make a Request' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'thank-you', label: 'Thank You' },
    { value: 'apology', label: 'Apology' },
    { value: 'introduction', label: 'Introduction' },
    { value: 'feedback', label: 'Feedback/Review' },
    { value: 'praise', label: 'Recognition/Praise' },
    { value: 'instruction', label: 'Instructions/Directions' },
    { value: 'invitation', label: 'Invitation' },
    { value: 'other', label: 'Other' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual/Friendly' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'empathetic', label: 'Empathetic' },
    { value: 'assertive', label: 'Assertive' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'appreciative', label: 'Appreciative' }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle industry selection
  const handleIndustryChange = (e) => {
    const newIndustry = e.target.value;
    setIndustry(newIndustry);
    // Reset document type to email when industry changes
    setDocumentType('email');
  };
  
  // Handle document type selection
  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
  };

  // Generate the draft based on form inputs
  const handleGenerateDraft = (e) => {
    e.preventDefault();
    
    if (!formData.subject && !sourceEmail) {
      warning("Please provide a subject for better results");
      return;
    }
    
    generateDraft();
  };
  
  // Generate the draft based on form inputs
  const generateDraft = () => {
    setIsGenerating(true);
    setGenerationError(null);
    
    // Prepare parameters for API call
    const params = {
      recipientType: formData.recipientType,
      recipientName: formData.recipientName,
      recipientEmail: formData.recipientEmail,
      subject: formData.subject,
      emailPurpose: formData.purpose,
      emailTone: formData.tone,
      keyPoints: formData.keyPoints,
      yourName: formData.senderName,
      yourPosition: formData.senderPosition,
      industry,
      documentType
    };
    
    // In a real implementation, this would call the AI service API
    setTimeout(() => {
      try {
        // Generate appropriate opening based on document type
        let draftContent = '';
        
        if (documentType === 'email') {
          // Email draft format
          draftContent = generateEmailDraftLocal(params);
        } else {
          // Generate content based on document type and industry
          draftContent = `# ${documentTypes[industry].find(type => type.id === documentType)?.name || documentType}
Date: ${new Date().toLocaleDateString()}
Industry: ${industries.find(ind => ind.id === industry)?.name || industry}
Document Type: ${documentTypes[industry].find(type => type.id === documentType)?.name || documentType}

${generateDocumentContent(documentType, industry, params)}
`;
        }
        
        // Store the generated draft content
        setDraftContent(draftContent);
        setIsGenerating(false);
        setShowPreview(true);
        
        // Success notification
        success("Draft generated successfully!");
      } catch (error) {
        console.error("Error generating draft:", error);
        setGenerationError("An error occurred while generating the draft. Please try again.");
        setIsGenerating(false);
      }
    }, 2000);
  };
  
  // Helper function to generate content based on document type and industry
  const generateDocumentContent = (docType, industryType, formData) => {
    const { recipientName, subject, keyPoints, yourName, yourPosition } = formData;
    
    // Generate content based on document type and industry
    switch (industryType) {
      case 'construction':
        if (docType === 'proposal') {
          return `
## Project Overview
${subject || "Construction project for [Project Name]"}

## Scope of Work
${keyPoints || "- Detailed scope of work to be inserted here\n- Include all relevant construction activities\n- Timeline and milestones"}

## Cost Estimate
[Include detailed cost breakdown]

## Timeline
[Include project timeline and milestones]

## Terms and Conditions
[Standard terms and conditions]

Prepared by: ${yourName || "[Your Name]"}, ${yourPosition || "Project Manager"}
`;
        } else if (docType === 'estimate') {
          return `
## Project Details
Project: ${subject || "[Project Name]"}
Client: ${recipientName || "[Client Name]"}
Date: ${new Date().toLocaleDateString()}

## Cost Breakdown
[Detailed cost breakdown by category]
${keyPoints ? "Notes: " + keyPoints : ""}

## Timeline
Estimated Start Date: [Date]
Estimated Completion: [Date]

Prepared by: ${yourName || "[Your Name]"}, ${yourPosition || "Estimator"}
`;
        }
        break;
        
      case 'roofing':
        if (docType === 'estimate') {
          return `
## Property Details
Property: ${subject || "[Property Address]"}
Client: ${recipientName || "[Client Name]"}
Date of Inspection: ${new Date().toLocaleDateString()}

## Recommended Roofing Solution
${keyPoints || "- Roof type and materials\n- Square footage\n- Special considerations"}

## Cost Breakdown
Materials: $[Amount]
Labor: $[Amount]
Additional Services: $[Amount]
Total Estimate: $[Total Amount]

## Warranty Information
[Warranty details]

Prepared by: ${yourName || "[Your Name]"}, ${yourPosition || "Roofing Specialist"}
`;
        } else if (docType === 'inspection') {
          return `
## Property Information
Property: ${subject || "[Property Address]"}
Client: ${recipientName || "[Client Name]"}
Inspection Date: ${new Date().toLocaleDateString()}

## Inspection Findings
${keyPoints || "- Current roof condition\n- Identified issues\n- Recommended repairs"}

## Recommendations
[Detailed recommendations]

## Photo Documentation
[Photo references]

Prepared by: ${yourName || "[Your Name]"}, ${yourPosition || "Roof Inspector"}
`;
        }
        break;
        
      case 'flooring':
        if (docType === 'quote') {
          return `
## Property Details
Property: ${subject || "[Property Address]"}
Client: ${recipientName || "[Client Name]"}

## Flooring Solution
${keyPoints || "- Flooring type and materials\n- Square footage\n- Special considerations"}

## Cost Breakdown
Materials: $[Amount]
Installation: $[Amount]
Additional Services: $[Amount]
Total Estimate: $[Total Amount]

## Warranty & Timeline
Installation Timeline: [X] days
Warranty Period: [X] years

Prepared by: ${yourName || "[Your Name]"}, ${yourPosition || "Flooring Specialist"}
`;
        }
        break;
        
      case 'automotive':
        if (docType === 'vehicleOffer') {
          return `
## Vehicle Information
Make/Model: ${subject || "[Vehicle Make/Model]"}
Year: [Year]
VIN: [VIN]

## Offer Details
Offered Price: $[Amount]
Trade-in Value: $[Amount]
Financing Options:
- [Option 1]
- [Option 2]

## Additional Information
${keyPoints || "- Special features\n- Warranty details\n- Additional services included"}

This offer is valid until: [Date]

Prepared by: ${yourName || "[Your Name]"}, ${yourPosition || "Sales Representative"}
`;
        }
        break;
        
      // More industry-specific templates can be added here
        
      default:
        return `## Summary
${subject || "[Document Subject]"}

## Details
${keyPoints || "[Key points to be included]"}

## Additional Information
[Include any additional information]

Prepared by: ${yourName || "[Your Name]"}, ${yourPosition || "[Your Position]"}
`;
    }
    
    // Default content if no specific template is found
    return `## Summary
${subject || "[Document Subject]"}

## Details
${keyPoints || "[Key points to be included]"}

## Additional Information
[Include any additional information]

Prepared by: ${yourName || "[Your Name]"}, ${yourPosition || "[Your Position]"}
`;
  };

  // Renamed the original method to indicate it's a local fallback
  const generateEmailDraftLocal = (data) => {
    const { 
      recipientType, 
      purpose, 
      tone, 
      subject, 
      keyPoints, 
      recipientName, 
      senderName, 
      senderPosition 
    } = data;

    // Common phrases for different tones
    const toneMap = {
      professional: {
        greeting: 'Dear',
        closing: 'Best regards,',
        style: 'clear and concise'
      },
      formal: {
        greeting: 'Dear',
        closing: 'Sincerely,',
        style: 'formal and structured'
      },
      casual: {
        greeting: 'Hi',
        closing: 'Thanks,',
        style: 'friendly and conversational'
      },
      enthusiastic: {
        greeting: 'Hello',
        closing: 'Looking forward to your response!',
        style: 'energetic and positive'
      },
      empathetic: {
        greeting: 'Hello',
        closing: 'With appreciation,',
        style: 'understanding and supportive'
      },
      assertive: {
        greeting: 'Hello',
        closing: 'Regards,',
        style: 'direct and clear'
      },
      urgent: {
        greeting: 'Hello',
        closing: 'Thank you for your prompt attention to this matter.',
        style: 'time-sensitive and action-oriented'
      },
      appreciative: {
        greeting: 'Dear',
        closing: 'With sincere thanks,',
        style: 'grateful and appreciative'
      }
    };

    // Get tone phrases
    const selectedTone = toneMap[tone];

    // Create greeting
    const greeting = recipientName ? `${selectedTone.greeting} ${recipientName},` : `${selectedTone.greeting} Recipient,`;

    // Create subject line if not provided
    let emailSubject = subject;
    if (!emailSubject) {
      switch (purpose) {
        case 'information':
          emailSubject = `Important Information: ${keyPoints.split('\n')[0] || 'Update'}`;
          break;
        case 'request':
          emailSubject = `Request: ${keyPoints.split('\n')[0] || 'Assistance Needed'}`;
          break;
        case 'follow-up':
          emailSubject = `Follow-up: ${keyPoints.split('\n')[0] || 'Our Recent Discussion'}`;
          break;
        case 'thank-you':
          emailSubject = `Thank You for ${keyPoints.split('\n')[0] || 'Your Support'}`;
          break;
        case 'apology':
          emailSubject = `Apology: ${keyPoints.split('\n')[0] || 'Recent Incident'}`;
          break;
        case 'introduction':
          emailSubject = `Introduction: ${senderName || 'New Contact'}`;
          break;
        case 'feedback':
          emailSubject = `Feedback on ${keyPoints.split('\n')[0] || 'Recent Interaction'}`;
          break;
        case 'praise':
          emailSubject = `Recognition: ${keyPoints.split('\n')[0] || 'Excellent Work'}`;
          break;
        case 'instruction':
          emailSubject = `Instructions for ${keyPoints.split('\n')[0] || 'Next Steps'}`;
          break;
        case 'invitation':
          emailSubject = `Invitation: ${keyPoints.split('\n')[0] || 'Upcoming Event'}`;
          break;
        default:
          emailSubject = keyPoints.split('\n')[0] || 'Important Message';
      }
    }

    // Create email body based on purpose
    let bodyContent = '';
    const keyPointsList = keyPoints.split('\n').filter(point => point.trim());
    
    // Introduction paragraph
    switch (purpose) {
      case 'information':
        bodyContent = `I hope this email finds you well. I wanted to share some important information with you regarding ${keyPointsList[0] || 'our recent discussions'}.`;
        break;
      case 'request':
        bodyContent = `I hope you're doing well. I'm reaching out to request your assistance with ${keyPointsList[0] || 'an important matter'}.`;
        break;
      case 'follow-up':
        bodyContent = `I'm writing to follow up on ${keyPointsList[0] || 'our recent conversation'}.`;
        break;
      case 'thank-you':
        bodyContent = `I wanted to express my sincere gratitude for ${keyPointsList[0] || 'your support and contribution'}.`;
        break;
      case 'apology':
        bodyContent = `I would like to sincerely apologize for ${keyPointsList[0] || 'the recent incident'}.`;
        break;
      case 'introduction':
        bodyContent = `I hope this message finds you well. My name is ${senderName || 'Name'}, and I am ${senderPosition || 'Position'} at our company.`;
        break;
      case 'feedback':
        bodyContent = `I wanted to provide some feedback regarding ${keyPointsList[0] || 'our recent interaction'}.`;
        break;
      case 'praise':
        bodyContent = `I wanted to take a moment to recognize your excellent work on ${keyPointsList[0] || 'recent contributions'}.`;
        break;
      case 'instruction':
        bodyContent = `I'm writing to provide instructions for ${keyPointsList[0] || 'the upcoming task'}.`;
        break;
      case 'invitation':
        bodyContent = `I'm pleased to invite you to ${keyPointsList[0] || 'our upcoming event'}.`;
        break;
      default:
        bodyContent = `I hope this email finds you well. I'm writing regarding ${keyPointsList[0] || 'an important matter'}.`;
    }

    // Main content
    if (keyPointsList.length > 1) {
      bodyContent += '\n\n';
      
      if (['information', 'instruction'].includes(purpose)) {
        bodyContent += 'Here are the details:\n\n';
      } else if (purpose === 'request') {
        bodyContent += 'Specifically, I need your help with the following:\n\n';
      } else if (['feedback', 'praise'].includes(purpose)) {
        bodyContent += 'I would like to highlight the following points:\n\n';
      } else {
        bodyContent += 'Here are the key points:\n\n';
      }
      
      // Add key points as bullet points
      keyPointsList.slice(1).forEach(point => {
        bodyContent += `• ${point}\n`;
      });
    }

    // Closing paragraph
    switch (purpose) {
      case 'information':
        bodyContent += '\n\nPlease let me know if you have any questions or need additional information.';
        break;
      case 'request':
        bodyContent += '\n\nI appreciate your consideration of this request. Please let me know if you need any clarification.';
        break;
      case 'follow-up':
        bodyContent += '\n\nI look forward to your response and am happy to provide any additional information if needed.';
        break;
      case 'thank-you':
        bodyContent += '\n\nYour support means a great deal, and I truly appreciate your contribution.';
        break;
      case 'apology':
        bodyContent += '\n\nI understand the impact of this situation and am committed to making things right. Please let me know if there\'s anything else I can do.';
        break;
      case 'introduction':
        bodyContent += '\n\nI would welcome the opportunity to connect and discuss how we might collaborate in the future.';
        break;
      case 'feedback':
        bodyContent += '\n\nI hope this feedback is helpful. I\'m available to discuss further if you\'d like.';
        break;
      case 'praise':
        bodyContent += '\n\nYour contributions are greatly valued, and I wanted to ensure you know how much your efforts are appreciated.';
        break;
      case 'instruction':
        bodyContent += '\n\nPlease let me know if you have any questions about these instructions or need any clarification.';
        break;
      case 'invitation':
        bodyContent += '\n\nI hope you\'ll be able to join us. Please let me know if you can attend or if you have any questions.';
        break;
      default:
        bodyContent += '\n\nThank you for your time and attention to this matter.';
    }

    // Add original email content for replies/forwards
    if (isReplyOrForward && sourceEmail) {
      bodyContent += '\n\n';
      
      if (sourceEmail.type === 'reply') {
        bodyContent += `\n\nOn ${sourceEmail.date || 'earlier'}, ${sourceEmail.from.name} <${sourceEmail.from.email}> wrote:\n`;
        bodyContent += `> ${stripHtml(sourceEmail.body).replace(/\n/g, '\n> ')}`;
      } else {
        bodyContent += '\n\n---------- Forwarded message ----------\n';
        bodyContent += `From: ${sourceEmail.from.name} <${sourceEmail.from.email}>\n`;
        bodyContent += `Date: ${sourceEmail.date || 'Unknown'}\n`;
        bodyContent += `Subject: ${sourceEmail.subject}\n`;
        bodyContent += `To: ${(sourceEmail.to || []).map(to => `${to.name} <${to.email}>`).join(', ')}\n\n`;
        bodyContent += stripHtml(sourceEmail.body);
      }
    }

    // Add signature (with different format based on recipient type)
    let signature = `\n\n${selectedTone.closing}\n${senderName || 'Your Name'}`;
    
    if (senderPosition) {
      signature += `\n${senderPosition}`;
    }
    
    // Add company name for customers and vendors
    if (['customer', 'vendor'].includes(recipientType)) {
      signature += `\nCompany Name`;
    }
    
    // Add contact info for external recipients
    if (['customer', 'vendor', 'applicant'].includes(recipientType)) {
      signature += `\n${user?.email || 'your.email@company.com'}\n${user?.phone || '(555) 123-4567'}`;
    }

    return {
      subject: emailSubject,
      body: `${greeting}\n\n${bodyContent}${signature}`
    };
  };

  // Use the generated draft in the compose page
  const handleUseDraft = () => {
    if (!generatedDraft) return;
    
    // Navigate to compose page with draft
    navigate('/email/compose', { 
      state: { 
        draft: {
          subject: generatedDraft.subject,
          body: generatedDraft.body,
        } 
      } 
    });
    
    setTimeout(() => {
      success({
        title: 'Success',
        description: 'Your draft has been loaded in the compose page'
      });
    }, 0);
  };

  // Save to drafts without immediately using
  const handleSaveDraft = () => {
    if (!generatedDraft) return;
    
    // This would save to the drafts folder in a real app
    setTimeout(() => {
      success({
        title: 'Success',
        description: 'Your draft has been saved successfully'
      });
    }, 0);
  };

  // Copy draft to clipboard
  const handleCopyDraft = () => {
    if (!generatedDraft) return;
    
    try {
      const textToCopy = `Subject: ${generatedDraft.subject}\n\n${stripHtml(generatedDraft.body)}`;
      navigator.clipboard.writeText(textToCopy);
      setTimeout(() => {
        success({
          title: 'Success',
          description: 'Draft copied to clipboard'
        });
      }, 0);
    } catch (err) {
      setTimeout(() => {
        error({
          title: 'Error',
          description: 'Failed to copy to clipboard'
        });
      }, 0);
    }
  };

  // Check for generated draft on component mount
  useEffect(() => {
    const generatedDraft = localStorage.getItem('emailDraft');
    
    if (generatedDraft) {
      try {
        const parsedDraft = JSON.parse(generatedDraft);
        setFormData(prev => ({
          ...prev,
          subject: parsedDraft.subject,
          body: parsedDraft.body
        }));
        
        // Remove the draft from localStorage to prevent loading it again
        localStorage.removeItem('emailDraft');
        
        success({
          title: 'Success',
          description: 'AI-generated draft has been loaded'
        });
      } catch (error) {
        console.error('Error parsing generated draft:', error);
      }
    }
  }, [success]);

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span>AI Draft Generator</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {showPreview ? (
                // Preview generated draft
                <div className="space-y-4">
                  <div className="border p-4 rounded-lg min-h-[300px] whitespace-pre-wrap">
                    {draftContent}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => setShowPreview(false)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Back to Editor
                    </Button>
                    <Button 
                      onClick={handleCopyDraft}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="mr-1 h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                    <Button 
                      onClick={handleUseDraft}
                      variant="default"
                      size="sm"
                    >
                      <Send className="mr-1 h-4 w-4" />
                      Use Draft
                    </Button>
                    <Button 
                      onClick={handleSaveDraft}
                      variant="outline"
                      size="sm"
                    >
                      <Clock className="mr-1 h-4 w-4" />
                      Save as Draft
                    </Button>
                  </div>
                </div>
              ) : (
                // Input form
                <form onSubmit={handleGenerateDraft}>
                  {/* Industry and document type selector */}
                  <div className="mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Industry</label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={industry}
                          onChange={handleIndustryChange}
                        >
                          {industries.map(ind => (
                            <option key={ind.id} value={ind.id}>{ind.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Document Type</label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={documentType}
                          onChange={handleDocumentTypeChange}
                        >
                          {documentTypes[industry].map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Existing form fields */}
                  {isReplyOrForward && sourceEmail && (
                    <div className="mb-6 p-3 bg-gray-50 rounded-md border">
                      <div className="text-sm text-gray-500 mb-2">
                        {sourceEmail.type === 'reply' ? 'Replying to:' : 'Forwarding:'} 
                        <span className="font-semibold"> {sourceEmail.subject}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        From: {sourceEmail.from.name} ({sourceEmail.from.email})
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Recipient Type</label>
                      <select 
                        name="recipientType" 
                        value={formData.recipientType}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      >
                        {recipientOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Recipient Name</label>
                      <input 
                        type="text" 
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Recipient Email</label>
                      <input 
                        type="email" 
                        name="recipientEmail"
                        value={formData.recipientEmail}
                        onChange={handleInputChange}
                        placeholder="johndoe@example.com"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject</label>
                      <input 
                        type="text" 
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Enter subject"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Purpose</label>
                      <select 
                        name="purpose" 
                        value={formData.purpose}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      >
                        {purposeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Tone</label>
                      <select 
                        name="tone" 
                        value={formData.tone}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      >
                        {toneOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Key Points (include any specific details you want to mention)
                    </label>
                    <textarea 
                      name="keyPoints"
                      value={formData.keyPoints}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder="Enter key points, one per line"
                      className="w-full p-2 border rounded-md"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Name</label>
                      <input 
                        type="text" 
                        name="senderName"
                        value={formData.senderName}
                        onChange={handleInputChange}
                        placeholder="Your Name"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Position</label>
                      <input 
                        type="text" 
                        name="senderPosition"
                        value={formData.senderPosition}
                        onChange={handleInputChange}
                        placeholder="Your Position"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  {generationError && (
                    <div className="text-red-500 mb-4 text-sm">{generationError}</div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button 
                      type="button"
                      onClick={() => navigate(-1)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Draft
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 