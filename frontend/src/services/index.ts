/**
 * Services Index
 * 
 * Exports all services from a central location for easier imports
 */

// Authentication Services
export { default as authService } from './AuthService';

// Integration Services
export { IntegrationManager } from './IntegrationManager';
export * from './integrations';

// API Services - add other services here as they are created
// export { default as emailService } from './EmailService';
// export { default as userService } from './UserService'; 