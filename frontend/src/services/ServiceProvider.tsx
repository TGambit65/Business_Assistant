import React, { createContext, useContext, useMemo } from 'react';
import { AnalyticsService } from './AnalyticsService';
import { DeepseekService } from './DeepseekService';
import { EmailTemplateService } from './EmailTemplateService';
import { TemplateEngine } from './TemplateEngine';
import { AIEmailService } from './AIEmailService';
import { AIDraftGenerator } from './AIDraftGenerator';
import { PerplexityService } from './business/perplexityService';
import { SecurityManager } from '../security/SecurityManager';
import { LocalStorageService } from './LocalStorageService';
import { UserPreferencesService } from './UserPreferencesService';
import { UserPreferencesAPI } from './UserPreferencesAPI';

/**
 * Service configuration interface
 */
interface ServiceConfig {
  analytics?: {
    enabled?: boolean;
    apiEndpoint?: string;
  };
  deepseek?: {
    apiKey?: string;
    model?: string;
  };
  perplexity?: {
    apiKey?: string;
  };
}

/**
 * Service context interface containing all application services
 */
interface ServiceContextValue {
  analyticsService: AnalyticsService;
  deepseekService: DeepseekService;
  emailTemplateService: EmailTemplateService;
  templateEngine: TemplateEngine;
  aiEmailService: AIEmailService;
  aiDraftGenerator: AIDraftGenerator;
  perplexityService: PerplexityService;
  securityManager: SecurityManager;
  storageService: LocalStorageService;
  userPreferencesService: UserPreferencesService;
  userPreferencesAPI: UserPreferencesAPI;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

/**
 * Service Provider Props
 */
interface ServiceProviderProps {
  children: React.ReactNode;
  config?: ServiceConfig;
}

/**
 * Service Provider Component
 * Provides all application services through React context
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children, config = {} }) => {
  const services = useMemo(() => {
    // Initialize core services
    const storageService = new LocalStorageService();
    const securityManager = new SecurityManager();
    const analyticsService = new AnalyticsService();
    
    // Initialize API services
    const userPreferencesAPI = new UserPreferencesAPI();
    const userPreferencesService = new UserPreferencesService(userPreferencesAPI);
    
    // Initialize AI services with configuration
    const deepseekService = new DeepseekService({
      apiKey: config.deepseek?.apiKey || process.env.REACT_APP_DEEPSEEK_API_KEY || '',
      model: config.deepseek?.model || 'deepseek-chat'
    });
    
    const perplexityService = new PerplexityService({
      apiKey: config.perplexity?.apiKey || process.env.REACT_APP_PERPLEXITY_API_KEY
    });
    
    // Initialize template services
    const emailTemplateService = new EmailTemplateService(storageService);
    const templateEngine = new TemplateEngine({
      analyticsService,
      deepseekService,
      securityManager
    });
    
    // Initialize AI email services
    const aiEmailService = new AIEmailService(deepseekService, analyticsService);
    const aiDraftGenerator = new AIDraftGenerator(deepseekService, analyticsService);
    
    return {
      analyticsService,
      deepseekService,
      emailTemplateService,
      templateEngine,
      aiEmailService,
      aiDraftGenerator,
      perplexityService,
      securityManager,
      storageService,
      userPreferencesService,
      userPreferencesAPI
    };
  }, [config]);
  
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

/**
 * Hook to access services
 * @returns Service context value
 * @throws Error if used outside ServiceProvider
 */
export const useServices = (): ServiceContextValue => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

/**
 * Hook to access a specific service
 * @param serviceName Name of the service to access
 * @returns The requested service
 */
export const useService = <K extends keyof ServiceContextValue>(
  serviceName: K
): ServiceContextValue[K] => {
  const services = useServices();
  return services[serviceName];
};