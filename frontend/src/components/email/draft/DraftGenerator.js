/**
 * DraftGenerator.js
 * 
 * Utility functions for generating email drafts based on form inputs.
 */

// Generate a quick draft from basic inputs
export const generateQuickDraft = (formData) => {
  const { 
    recipientType, 
    purpose, 
    tone, 
    subject, 
    keyPoints,
    senderName,
    senderRole,
    formality = 'neutral'
  } = formData;
  
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
      feedback: 'I am writing to provide feedback on ',
    },
    friendly: {
      update: 'Just wanted to update you on ',
      request: 'I was hoping you could help me with ',
      followup: 'Just checking in about ',
      meeting: 'Let\'s set up some time to talk about ',
      introduction: 'I wanted to introduce you to ',
      feedback: 'I wanted to share some thoughts on ',
    },
    formal: {
      update: 'This correspondence serves to update you regarding ',
      request: 'I am writing to formally request ',
      followup: 'I am writing to follow up regarding ',
      meeting: 'I would like to request a meeting to discuss ',
      introduction: 'I am writing to formally introduce ',
      feedback: 'I am writing to provide formal feedback regarding ',
    }
  };
  
  // Start building the draft
  let draft = '';
  
  // Add greeting
  draft += (greetings[tone]?.[recipientType] || 'Hello,') + '\n\n';
  
  // Add intro based on purpose
  draft += (purposeIntros[tone]?.[purpose] || 'I am writing regarding ');
  
  // Add subject/key points
  if (subject) {
    draft += subject + '.\n\n';
  } else {
    draft += 'the matter we discussed.\n\n';
  }
  
  // Add key points
  if (keyPoints) {
    const points = keyPoints.split('\n').filter(point => point.trim());
    
    if (points.length > 1) {
      draft += 'Here are the key points:\n\n';
      points.forEach(point => {
        if (point.trim()) {
          draft += `• ${point.trim()}\n`;
        }
      });
      draft += '\n';
    } else if (points.length === 1) {
      draft += `${points[0]}\n\n`;
    }
  }
  
  // Add call to action if needed
  if (formData.includeCTA) {
    const ctas = {
      formal: 'I would appreciate your response at your earliest convenience.',
      neutral: 'Please let me know your thoughts on this matter.',
      casual: 'Let me know what you think!'
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

// Generate a comprehensive draft with advanced options
export const generateAdvancedDraft = (formData) => {
  const { 
    recipientType, 
    purpose, 
    tone, 
    subject,
    industry,
    documentType,
    audience,
    includeData,
    includeCTA,
    formality,
    senderName,
    senderRole,
    originalSubject,
    originalSender,
    originalContent
  } = formData;
  
  // Start with the quick draft as a base
  let draft = generateQuickDraft(formData);
  
  // Add industry-specific language
  const industryTerminology = {
    technology: ['implementation', 'integration', 'platform', 'solution', 'interface'],
    healthcare: ['patient care', 'treatment plan', 'medical records', 'clinical', 'health outcomes'],
    finance: ['investment', 'portfolio', 'assets', 'financial planning', 'risk assessment'],
    education: ['curriculum', 'learning outcomes', 'student engagement', 'assessment', 'educational'],
    retail: ['customer experience', 'product offering', 'sales performance', 'inventory', 'merchandising'],
    manufacturing: ['production line', 'quality control', 'supply chain', 'operational efficiency', 'assembly'],
    legal: ['pursuant to', 'legal counsel', 'contractual obligations', 'liability', 'compliance'],
    marketing: ['campaign performance', 'brand awareness', 'market positioning', 'customer engagement', 'conversion']
  };
  
  // Add document-specific structure
  if (documentType === 'proposal' || documentType === 'businessProposal') {
    // Add proposal-specific content
    draft += '\n\nProposed Timeline: [Insert timeline details]\n';
    draft += 'Budget Considerations: [Insert budget details]\n';
    draft += 'Next Steps: [Insert next steps]\n\n';
  } else if (documentType === 'statusUpdate' || documentType === 'progressReport') {
    // Add status update specific content
    draft += '\n\nCurrent Status: [Insert status details]\n';
    draft += 'Milestones Achieved: [Insert milestone details]\n';
    draft += 'Challenges: [Insert challenges if any]\n';
    draft += 'Next Steps: [Insert next steps]\n\n';
  }
  
  // If it's a reply, include the original email
  if (originalContent && (purpose === 'followup' || purpose === 'reply')) {
    draft += '\n\n';
    draft += '-----Original Message-----\n';
    if (originalSender) {
      draft += `From: ${originalSender}\n`;
    }
    if (originalSubject) {
      draft += `Subject: ${originalSubject}\n`;
    }
    draft += '\n';
    draft += originalContent;
  }
  
  return draft;
};

// Generate a reply draft
export const generateReplyDraft = (formData) => {
  const { 
    tone, 
    keyPoints,
    originalSender,
    originalSubject,
    originalContent,
    senderName,
    senderRole
  } = formData;
  
  // Start building the draft
  let draft = '';
  
  // Add greeting based on tone
  const greetings = {
    professional: `Dear ${originalSender?.split(' ')[0] || 'colleague'},`,
    friendly: `Hi ${originalSender?.split(' ')[0] || 'there'},`,
    formal: `Dear ${originalSender || 'Sir/Madam'},`
  };
  
  draft += (greetings[tone] || `Hi ${originalSender?.split(' ')[0] || 'there'},`) + '\n\n';
  
  // Add intro for reply
  const replyIntros = {
    professional: 'Thank you for your email regarding ',
    friendly: 'Thanks for your message about ',
    formal: 'I acknowledge receipt of your correspondence regarding '
  };
  
  draft += (replyIntros[tone] || 'Thank you for your email regarding ');
  draft += (originalSubject || 'this matter') + '.\n\n';
  
  // Add key points
  if (keyPoints) {
    const points = keyPoints.split('\n').filter(point => point.trim());
    
    if (points.length > 1) {
      draft += 'In response:\n\n';
      points.forEach(point => {
        if (point.trim()) {
          draft += `• ${point.trim()}\n`;
        }
      });
      draft += '\n';
    } else if (points.length === 1) {
      draft += `${points[0]}\n\n`;
    }
  } else {
    draft += 'I appreciate you bringing this to my attention.\n\n';
  }
  
  // Add closing
  const closings = {
    professional: 'Thank you for your consideration.\n\nBest regards,',
    friendly: 'Thanks!\n\nCheers,',
    formal: 'Thank you for your attention to this matter.\n\nSincerely,'
  };
  
  draft += closings[tone] || 'Best regards,';
  draft += `\n${senderName}`;
  
  if (senderRole) {
    draft += `\n${senderRole}`;
  }
  
  // Include the original email
  if (originalContent) {
    draft += '\n\n';
    draft += '-----Original Message-----\n';
    if (originalSender) {
      draft += `From: ${originalSender}\n`;
    }
    if (originalSubject) {
      draft += `Subject: ${originalSubject}\n`;
    }
    draft += '\n';
    draft += originalContent;
  }
  
  return draft;
};
