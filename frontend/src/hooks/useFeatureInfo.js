import { useState } from 'react';

const DEFAULT_FEATURES = {
  aiSummary: {
    title: 'AI Email Summary',
    description: 'Get instant AI-generated summaries of your emails',
    steps: [
      'Select any email in your inbox',
      'Click on the "Analyze" button',
      'View the AI-generated summary that highlights key points',
      'Choose between quick summary or detailed analysis'
    ],
    image: '/images/features/ai-summary.png'
  },
  draftGenerator: {
    title: 'AI Draft Generator',
    description: 'Generate professional email drafts with AI assistance',
    steps: [
      'Click "Generate Draft" in the compose window',
      'Provide context about the email purpose',
      'Select tone and style preferences',
      'Review and edit the AI-generated draft',
      'Send or save as draft'
    ],
    image: '/images/features/draft-generator.png'
  },
  emailRules: {
    title: 'Smart Email Rules',
    description: 'Create intelligent rules to automatically organize your inbox',
    steps: [
      'Go to Settings > Email Rules',
      'Create a new rule with conditions',
      'Choose actions to perform on matching emails',
      'Enable AI-powered suggestions for rule creation',
      'Monitor rule performance in the analytics dashboard'
    ],
    image: '/images/features/email-rules.png'
  },
  securityTools: {
    title: 'Enhanced Security Tools',
    description: 'Advanced security features to protect your email communications',
    steps: [
      'Enable two-factor authentication',
      'Set up phishing detection alerts',
      'Configure sensitive information warnings',
      'Schedule security audits',
      'Review security recommendations'
    ],
    image: '/images/features/security-tools.png'
  },
  teamAnalytics: {
    title: 'Team Performance Analytics',
    description: 'Track and optimize your team\'s email communication efficiency',
    steps: [
      'View response time metrics',
      'Analyze email volume patterns',
      'Track resolution rates for customer inquiries',
      'Identify communication bottlenecks',
      'Set team goals and monitor progress'
    ],
    image: '/images/features/team-analytics.png'
  },
  templateBuilder: {
    title: 'Email Template Builder',
    description: 'Create and manage custom email templates',
    steps: [
      'Access the template builder',
      'Design templates using the drag-and-drop editor',
      'Add dynamic fields for personalization',
      'Save templates for personal use or share with team',
      'Insert templates directly into email composer'
    ],
    image: '/images/features/template-builder.png'
  },
  adminSettings: {
    title: 'Admin Console',
    description: 'Comprehensive administrative tools for organization management',
    steps: [
      'Manage user roles and permissions with granular control',
      'Create custom roles with specific access rights',
      'Set organization-wide security policies',
      'Monitor system usage and compliance',
      'Configure domain-specific settings and integrations'
    ],
    security: [
      'Role-based access control prevents unauthorized settings changes',
      'All admin actions are logged for security auditing',
      'Critical changes require two-factor authentication',
      'Permission templates ensure consistent security across user roles'
    ],
    image: '/images/features/admin-settings.png'
  },
  ragExplanation: {
    title: 'Retrieval Augmented Generation (RAG)',
    description: 'Enhance AI responses with your organization\'s knowledge base',
    steps: [
      'Upload relevant documents to the context library',
      'AI automatically indexes and processes document content',
      'When users ask questions, the system retrieves relevant information',
      'AI generates responses using both its training and your specific documents',
      'Documents are kept secure and only accessible to authorized users'
    ],
    security: [
      'All documents are encrypted at rest and in transit',
      'Access controls determine which users can view specific documents',
      'Content is never shared between different organization accounts',
      'Document parsing happens locally to ensure privacy'
    ],
    image: '/images/features/rag-system.png'
  },
  userManagement: {
    title: 'User Management System',
    description: 'Streamlined tools for managing user access and permissions',
    steps: [
      'Send secure email invitations to new users',
      'Set custom permission levels for each user',
      'Manage user groups for easier permission management',
      'Monitor user activity and login history',
      'Enable or disable accounts as needed',
      'Enforce password policies and security requirements'
    ],
    security: [
      'All user invitations expire after 48 hours for security',
      'New users must set strong passwords that meet complexity requirements',
      'Optional two-factor authentication for added security',
      'Admin actions on user accounts are logged and auditable'
    ],
    image: '/images/features/user-management.png'
  },
  companyTemplates: {
    title: 'Company Email Templates',
    description: 'Create and manage standardized email templates across your organization',
    steps: [
      'Design professional templates with your brand elements',
      'Add variable fields that auto-populate with contextual information',
      'Organize templates by department or purpose',
      'Set templates as required or optional for specific user roles',
      'Track template usage through analytics'
    ],
    security: [
      'Templates are centrally managed for brand consistency',
      'Edit permissions can be restricted to authorized users',
      'Template changes are versioned and can be rolled back if needed',
      'Regular template reviews ensure compliance with communication policies'
    ],
    image: '/images/features/company-templates.png'
  },
  registrationProcess: {
    title: 'User Registration',
    description: 'Secure sign-up process for new users',
    steps: [
      'New users are invited by an administrator via email',
      'The invitation includes a secure, time-limited registration link',
      'User creates their account with personal details and password',
      'System verifies email address and enforces password requirements',
      'Admin approves account activation for additional security (optional)'
    ],
    security: [
      'All registration links are securely generated with limited validity',
      'Passwords must meet complex requirements for enhanced security',
      'Email verification prevents unauthorized registrations',
      'Rate limiting prevents brute force attempts',
      'Backend validation ensures secure account creation'
    ],
    image: '/images/features/registration.png'
  },
  envSecurity: {
    title: 'Environment Security',
    description: 'Best practices for securing application configuration',
    steps: [
      'Environment variables should be stored outside public directories',
      'Use .env.example for documentation while keeping actual .env files private',
      'Implement proper environment variable validation',
      'Never commit sensitive values to version control',
      'Set up proper access controls for environment configuration'
    ],
    security: [
      'The .env file in public directories poses a security risk',
      'Sensitive keys should only be accessible to authorized systems',
      'Production environments should use secure secret management systems',
      'Regular security audits should verify proper environment configuration'
    ],
    image: '/images/features/security-config.png'
  },
  mobileOptimization: {
    title: 'Mobile Optimization',
    description: 'Responsive design for an optimal experience on any device',
    steps: [
      'All app interfaces are designed with mobile-first principles',
      'Responsive layouts adapt to any screen size',
      'Touch-friendly controls for mobile users',
      'Optimized performance for mobile networks',
      'Native app coming soon after SaaS launch'
    ],
    security: [
      'Mobile sessions include the same security protections as desktop',
      'Automatic session timeout for mobile devices',
      'Secure data synchronization across devices',
      'Optional biometric authentication on supported devices'
    ],
    image: '/images/features/mobile-optimization.png'
  },
  upcomingApp: {
    title: 'Mobile App Coming Soon',
    description: 'Native mobile application for iOS and Android platforms',
    steps: [
      'Currently optimizing web experience for mobile devices',
      'Native apps for iOS and Android in development',
      'Will be released after the SaaS service launch',
      'Push notifications for real-time alerts',
      'Offline access to important emails and documents',
      'Seamless synchronization with web version'
    ],
    security: [
      'Native device encryption for local data',
      'Secure authentication with biometric options',
      'Remote wipe capability for lost devices',
      'Enterprise mobility management (EMM) compatibility'
    ],
    image: '/images/features/mobile-app.png'
  },
  signatureHelp: {
    title: 'Email Signature Assistant',
    description: 'Create professional email signatures with AI assistance',
    steps: [
      'Enter a name for your signature',
      'Choose a style (professional, minimal, modern, or colorful)',
      'Select which information to include in your signature',
      'Click "Generate with AI" to create a professional signature',
      'Edit manually if needed, then save your signature',
      'Set a signature as default to automatically add it to new emails'
    ],
    benefits: [
      'Save time with AI-generated signature templates',
      'Create multiple signatures for different contexts',
      'Maintain consistent professional branding',
      'Easily update and manage all your signatures in one place'
    ],
    image: '/images/features/signature-helper.png'
  }
};

/**
 * Hook for showing a feature info popup
 * @returns {Object} Functions and state for managing feature info popup
 */
export const useFeatureInfo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(null);

  /**
   * Show the feature info modal for a specific feature
   * @param {string} featureKey - The key of the feature in DEFAULT_FEATURES
   */
  const showFeatureInfo = (featureKey) => {
    if (DEFAULT_FEATURES[featureKey]) {
      setCurrentFeature(DEFAULT_FEATURES[featureKey]);
      setIsOpen(true);
    } else {
      console.warn(`Feature info for '${featureKey}' not found`);
    }
  };

  /**
   * Close the feature info modal
   */
  const closeFeatureInfo = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    currentFeature,
    showFeatureInfo,
    closeFeatureInfo
  };
}; 