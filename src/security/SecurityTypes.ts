// Placeholder for SecurityTypes module
export class SecurityTypes {
  static readonly ROLE_USER = 'user';
  static readonly ROLE_ADMIN = 'admin';
  static readonly ROLE_MANAGER = 'manager';
  static readonly ROLE_AUDITOR = 'auditor';
  
  static readonly PERMISSION_READ = 'read';
  static readonly PERMISSION_WRITE = 'write';
  static readonly PERMISSION_DELETE = 'delete';
  static readonly PERMISSION_ADMIN = 'admin';
  
  static readonly AUTH_PROVIDER_LOCAL = 'local';
  static readonly AUTH_PROVIDER_GOOGLE = 'google';
  static readonly AUTH_PROVIDER_MICROSOFT = 'microsoft';
  static readonly AUTH_PROVIDER_GITHUB = 'github';
}

export interface SecurityRole {
  name: string;
  permissions: string[];
  description: string;
}

export interface SecurityPermission {
  name: string;
  resource: string;
  description: string;
}

export interface SecuritySession {
  userId: string;
  token: string;
  expiresAt: number;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}