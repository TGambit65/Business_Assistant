/**
 * User Preferences Types
 * 
 * Defines the data model for user preferences
 * 
 * Font Size Properties:
 * - accessibilityFontSize: Font size for accessibility needs (screen readers, visual impairments)
 * - uiFontSize: General UI element font size for visual preference
 * - defaultFontSize: Email content font size (in EmailPreferences)
 */

// Accessibility preferences
export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderHints: boolean;
  accessibilityFontSize: 'small' | 'medium' | 'large' | 'x-large'; // Font size for accessibility needs
  lineSpacing: 'normal' | 'wide' | 'wider';
  keyboardNavigation: boolean;
}

// Notification preferences
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
  securityAlerts: boolean;
}

// Security preferences
export interface SecurityPreferences {
  mfaEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number; // in minutes
  loginNotifications: boolean;
  trustedDevices: string[];
}

// Display preferences
export interface DisplayPreferences {
  density: 'compact' | 'comfortable' | 'spacious';
  uiFontSize: 'small' | 'medium' | 'large' | 'x-large'; // UI element font size
  colorMode: 'light' | 'dark' | 'system';
  animations: boolean;
}

// Attachment behavior preferences
export interface AttachmentBehaviors {
  single: {
    preview: 'show' | 'hide';
    download: 'download' | 'preview';
    delete: 'delete' | 'archive';
    rename: 'rename' | 'keep';
    move: 'move' | 'copy';
    share: 'share' | 'keep';
    export: 'export' | 'keep';
    import: 'import' | 'keep';
    compress: 'compress' | 'keep';
    extract: 'extract' | 'keep';
    convert: 'convert' | 'keep';
    print: 'print' | 'keep';
    email: 'email' | 'keep';
    link: 'link' | 'keep';
    embed: 'embed' | 'keep';
    upload: 'upload' | 'keep';
  };
  bulk: {
    downloadAll: 'downloadAll' | 'keep';
    deleteAll: 'deleteAll' | 'keep';
    renameAll: 'renameAll' | 'keep';
    moveAll: 'moveAll' | 'keep';
    shareAll: 'shareAll' | 'keep';
    exportAll: 'exportAll' | 'keep';
    importAll: 'importAll' | 'keep';
    compressAll: 'compressAll' | 'keep';
    extractAll: 'extractAll' | 'keep';
    convertAll: 'convertAll' | 'keep';
    printAll: 'printAll' | 'keep';
    emailAll: 'emailAll' | 'keep';
    linkAll: 'linkAll' | 'keep';
    embedAll: 'embedAll' | 'keep';
    uploadAll: 'uploadAll' | 'keep';
  };
}

// Email preferences
export interface EmailPreferences {
  defaultSignature: string;
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  defaultFont: string;
  defaultFontSize: number;
  defaultLineHeight: number;
  defaultTextColor: string;
  defaultBackgroundColor: string;
  defaultReplyBehavior: 'reply' | 'replyAll' | 'forward';
  defaultComposeBehavior: 'newWindow' | 'sameWindow';
  defaultAttachmentBehavior: 'inline' | 'attachment';
  defaultCcBehavior: 'show' | 'hide';
  defaultBccBehavior: 'show' | 'hide';
  defaultToBehavior: 'show' | 'hide';
  defaultSubjectBehavior: 'show' | 'hide';
  defaultBodyBehavior: 'show' | 'hide';
  defaultAttachmentsBehavior: 'show' | 'hide';
  attachmentBehaviors: AttachmentBehaviors;
}

// Rephrase settings for AI assistance
export interface RephraseSettings {
  // Core style attributes
  style: 'formal' | 'casual' | 'professional' | 'friendly';
  tone: 'neutral' | 'positive' | 'negative' | 'empathetic';
  length: 'short' | 'medium' | 'long';
  complexity: 'simple' | 'moderate' | 'complex';
  formality: 'informal' | 'semi-formal' | 'formal';
  clarity: 'clear' | 'concise' | 'detailed';
  creativity: 'standard' | 'creative' | 'very-creative';
  
  // Quality attributes
  consistency: 'consistent' | 'varied';
  coherence: 'coherent' | 'focused';
  fluency: 'fluent' | 'natural';
  grammar: 'grammatical' | 'correct';
  punctuation: 'punctuated' | 'correct';
  spelling: 'spelled' | 'correct';
  capitalization: 'capitalized' | 'correct';
  formatting: 'formatted' | 'correct';
  
  // Consistency overrides for fine-grained control
  styleConsistency: 'consistent' | 'varied';
  toneConsistency: 'consistent' | 'varied';
  lengthConsistency: 'consistent' | 'varied';
  complexityConsistency: 'consistent' | 'varied';
  formalityConsistency: 'consistent' | 'varied';
  clarityConsistency: 'consistent' | 'varied';
  creativityConsistency: 'consistent' | 'varied';
  coherenceConsistency: 'consistent' | 'varied';
  fluencyConsistency: 'consistent' | 'varied';
  grammarConsistency: 'consistent' | 'varied';
  punctuationConsistency: 'consistent' | 'varied';
  spellingConsistency: 'consistent' | 'varied';
  capitalizationConsistency: 'consistent' | 'varied';
  formattingConsistency: 'consistent' | 'varied';
}

// AI preferences
export interface AIPreferences {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
  autoComplete: boolean;
  autoCorrect: boolean;
  autoFormat: boolean;
  autoSuggest: boolean;
  autoSummarize: boolean;
  autoTranslate: boolean;
  autoReply: boolean;
  autoDraft: boolean;
  autoCompose: boolean;
  autoRewrite: boolean;
  autoExpand: boolean;
  autoContract: boolean;
  autoParaphrase: boolean;
  autoRephrase: boolean;
  rephraseSettings: RephraseSettings;
}

// User preferences
export interface UserPreferences {
  language: string;
  theme: string;
  accessibility: AccessibilityPreferences;
  notifications: NotificationPreferences;
  security: SecurityPreferences;
  display: DisplayPreferences;
  email: EmailPreferences;
  ai: AIPreferences;
  lastUpdated: number | null;
  version: string;
}

// Preference schema version
export const PREFERENCES_VERSION = '1.0.0';

// Default preferences
export const defaultPreferences: UserPreferences = {
  language: 'en',
  theme: 'system',
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    screenReaderHints: false,
    accessibilityFontSize: 'medium',
    lineSpacing: 'normal',
    keyboardNavigation: true,
  },
  notifications: {
    email: true,
    push: true,
    inApp: true,
    marketing: false,
    securityAlerts: true,
  },
  security: {
    mfaEnabled: false,
    biometricEnabled: false,
    sessionTimeout: 30, // 30 minutes
    loginNotifications: true,
    trustedDevices: [],
  },
  display: {
    density: 'comfortable',
    uiFontSize: 'medium',
    colorMode: 'system',
    animations: true,
  },
  email: {
    defaultSignature: '',
    autoSave: true,
    autoSaveInterval: 60, // 60 seconds
    defaultFont: 'Arial',
    defaultFontSize: 14,
    defaultLineHeight: 1.5,
    defaultTextColor: '#000000',
    defaultBackgroundColor: '#FFFFFF',
    defaultReplyBehavior: 'reply',
    defaultComposeBehavior: 'sameWindow',
    defaultAttachmentBehavior: 'attachment',
    defaultCcBehavior: 'show',
    defaultBccBehavior: 'hide',
    defaultToBehavior: 'show',
    defaultSubjectBehavior: 'show',
    defaultBodyBehavior: 'show',
    defaultAttachmentsBehavior: 'show',
    attachmentBehaviors: {
      single: {
        preview: 'show',
        download: 'preview',
        delete: 'delete',
        rename: 'rename',
        move: 'move',
        share: 'share',
        export: 'export',
        import: 'import',
        compress: 'compress',
        extract: 'extract',
        convert: 'convert',
        print: 'print',
        email: 'email',
        link: 'link',
        embed: 'embed',
        upload: 'upload',
      },
      bulk: {
        downloadAll: 'downloadAll',
        deleteAll: 'deleteAll',
        renameAll: 'renameAll',
        moveAll: 'moveAll',
        shareAll: 'shareAll',
        exportAll: 'exportAll',
        importAll: 'importAll',
        compressAll: 'compressAll',
        extractAll: 'extractAll',
        convertAll: 'convertAll',
        printAll: 'printAll',
        emailAll: 'emailAll',
        linkAll: 'linkAll',
        embedAll: 'embedAll',
        uploadAll: 'uploadAll',
      },
    },
  },
  ai: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
    autoComplete: true,
    autoCorrect: true,
    autoFormat: true,
    autoSuggest: true,
    autoSummarize: true,
    autoTranslate: true,
    autoReply: false,
    autoDraft: false,
    autoCompose: false,
    autoRewrite: false,
    autoExpand: false,
    autoContract: false,
    autoParaphrase: false,
    autoRephrase: false,
    rephraseSettings: {
      style: 'professional',
      tone: 'neutral',
      length: 'medium',
      complexity: 'moderate',
      formality: 'semi-formal',
      clarity: 'clear',
      creativity: 'standard',
      consistency: 'consistent',
      coherence: 'coherent',
      fluency: 'fluent',
      grammar: 'grammatical',
      punctuation: 'punctuated',
      spelling: 'spelled',
      capitalization: 'capitalized',
      formatting: 'formatted',
      styleConsistency: 'consistent',
      toneConsistency: 'consistent',
      lengthConsistency: 'consistent',
      complexityConsistency: 'consistent',
      formalityConsistency: 'consistent',
      clarityConsistency: 'consistent',
      creativityConsistency: 'consistent',
      coherenceConsistency: 'consistent',
      fluencyConsistency: 'consistent',
      grammarConsistency: 'consistent',
      punctuationConsistency: 'consistent',
      spellingConsistency: 'consistent',
      capitalizationConsistency: 'consistent',
      formattingConsistency: 'consistent',
    },
  },
  lastUpdated: null,
  version: PREFERENCES_VERSION,
};