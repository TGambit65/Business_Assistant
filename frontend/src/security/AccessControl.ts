/**
 * AccessControl system
 * 
 * Implements Role-Based Access Control (RBAC) for the email assistant
 * with fine-grained permissions for different resources.
 */

/**
 * Available permissions in the system
 */
export enum Permission {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  ADMIN = 'admin',
  EXPORT = 'export',
  SHARE = 'share',
  CONFIGURE = 'configure'
}

/**
 * Resource types that can be access-controlled
 */
export enum Resource {
  EMAIL = 'email',
  TEMPLATE = 'template',
  CONTACT = 'contact',
  ATTACHMENT = 'attachment',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
  USER = 'user',
  API_KEY = 'api_key',
  DASHBOARD = 'dashboard'
}

/**
 * Predefined roles in the system
 */
export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest',
  API = 'api'
}

/**
 * Access control entry defining a permission on a resource
 */
export interface AccessControlEntry {
  resource: Resource;
  permission: Permission;
  condition?: (context: any) => boolean; // Optional conditional check
}

/**
 * AccessControl class implementing Role-Based Access Control
 */
export class AccessControl {
  private static instance: AccessControl;
  private readonly rolePermissions: Map<Role, AccessControlEntry[]> = new Map();
  private readonly userRoles: Map<string, Set<Role>> = new Map();
  private readonly userPermissions: Map<string, Set<AccessControlEntry>> = new Map();
  
  private constructor() {
    // Initialize with default role permissions
    this.initializeDefaultRoles();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): AccessControl {
    if (!AccessControl.instance) {
      AccessControl.instance = new AccessControl();
    }
    return AccessControl.instance;
  }
  
  /**
   * Add a role with permissions
   * @param role The role to add
   * @param permissions Permissions for this role
   */
  public addRole(role: Role | string, permissions: AccessControlEntry[]): void {
    this.rolePermissions.set(role as Role, permissions);
  }
  
  /**
   * Assign a role to a user
   * @param userId The user ID
   * @param role The role to assign
   */
  public assignRole(userId: string, role: Role | string): void {
    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set());
    }
    
    this.userRoles.get(userId)!.add(role as Role);
    
    // Clear cached permissions
    this.userPermissions.delete(userId);
  }
  
  /**
   * Remove a role from a user
   * @param userId The user ID
   * @param role The role to remove
   */
  public removeRole(userId: string, role: Role | string): void {
    if (this.userRoles.has(userId)) {
      this.userRoles.get(userId)!.delete(role as Role);
    }
    
    // Clear cached permissions
    this.userPermissions.delete(userId);
  }
  
  /**
   * Check if a user has a specific role
   * @param userId The user ID
   * @param role The role to check
   */
  public hasRole(userId: string, role: Role | string): boolean {
    return this.userRoles.has(userId) && this.userRoles.get(userId)!.has(role as Role);
  }
  
  /**
   * Get all roles assigned to a user
   * @param userId The user ID
   */
  public getUserRoles(userId: string): Role[] {
    if (!this.userRoles.has(userId)) {
      return [];
    }
    
    return Array.from(this.userRoles.get(userId)!);
  }
  
  /**
   * Check if a user has permission for a specific action
   * @param userId The user ID
   * @param resource The resource type
   * @param permission The permission to check
   * @param context Optional context for conditional permissions
   */
  public hasPermission(
    userId: string, 
    resource: Resource, 
    permission: Permission,
    context?: any
  ): boolean {
    // Admin role always has all permissions
    if (this.hasRole(userId, Role.ADMIN)) {
      return true;
    }
    
    // Get all permissions for the user
    const permissions = this.getUserPermissions(userId);
    
    // Check if the user has the specific permission
    for (const entry of permissions) {
      if (entry.resource === resource && entry.permission === permission) {
        // If there's a condition, evaluate it
        if (entry.condition && context) {
          return entry.condition(context);
        }
        
        // No condition or context needed
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get all permissions for a user
   * @param userId The user ID
   */
  public getUserPermissions(userId: string): AccessControlEntry[] {
    // Return cached permissions if available
    if (this.userPermissions.has(userId)) {
      return Array.from(this.userPermissions.get(userId)!);
    }
    
    const permissions = new Set<AccessControlEntry>();
    
    // Get all roles for the user
    const roles = this.getUserRoles(userId);
    
    // Collect permissions from all roles
    for (const role of roles) {
      const rolePermissions = this.rolePermissions.get(role);
      if (rolePermissions) {
        for (const permission of rolePermissions) {
          permissions.add(permission);
        }
      }
    }
    
    // Cache the permissions
    this.userPermissions.set(userId, permissions);
    
    return Array.from(permissions);
  }
  
  /**
   * Initialize default roles and permissions
   */
  private initializeDefaultRoles(): void {
    // Admin role has all permissions
    this.addRole(Role.ADMIN, [
      { resource: Resource.EMAIL, permission: Permission.ADMIN },
      { resource: Resource.TEMPLATE, permission: Permission.ADMIN },
      { resource: Resource.CONTACT, permission: Permission.ADMIN },
      { resource: Resource.ATTACHMENT, permission: Permission.ADMIN },
      { resource: Resource.ANALYTICS, permission: Permission.ADMIN },
      { resource: Resource.SETTINGS, permission: Permission.ADMIN },
      { resource: Resource.USER, permission: Permission.ADMIN },
      { resource: Resource.API_KEY, permission: Permission.ADMIN },
      { resource: Resource.DASHBOARD, permission: Permission.ADMIN }
    ]);
    
    // Manager role has most permissions but limited admin access
    this.addRole(Role.MANAGER, [
      { resource: Resource.EMAIL, permission: Permission.CREATE },
      { resource: Resource.EMAIL, permission: Permission.READ },
      { resource: Resource.EMAIL, permission: Permission.UPDATE },
      { resource: Resource.EMAIL, permission: Permission.DELETE },
      { resource: Resource.EMAIL, permission: Permission.SHARE },
      { resource: Resource.EMAIL, permission: Permission.EXPORT },
      
      { resource: Resource.TEMPLATE, permission: Permission.CREATE },
      { resource: Resource.TEMPLATE, permission: Permission.READ },
      { resource: Resource.TEMPLATE, permission: Permission.UPDATE },
      { resource: Resource.TEMPLATE, permission: Permission.DELETE },
      { resource: Resource.TEMPLATE, permission: Permission.SHARE },
      
      { resource: Resource.CONTACT, permission: Permission.CREATE },
      { resource: Resource.CONTACT, permission: Permission.READ },
      { resource: Resource.CONTACT, permission: Permission.UPDATE },
      { resource: Resource.CONTACT, permission: Permission.DELETE },
      
      { resource: Resource.ATTACHMENT, permission: Permission.CREATE },
      { resource: Resource.ATTACHMENT, permission: Permission.READ },
      { resource: Resource.ATTACHMENT, permission: Permission.DELETE },
      
      { resource: Resource.ANALYTICS, permission: Permission.READ },
      { resource: Resource.ANALYTICS, permission: Permission.EXPORT },
      
      { resource: Resource.SETTINGS, permission: Permission.READ },
      { resource: Resource.SETTINGS, permission: Permission.UPDATE },
      
      { resource: Resource.DASHBOARD, permission: Permission.READ },
      { resource: Resource.DASHBOARD, permission: Permission.CONFIGURE }
    ]);
    
    // Regular user role with standard permissions
    this.addRole(Role.USER, [
      { resource: Resource.EMAIL, permission: Permission.CREATE },
      { resource: Resource.EMAIL, permission: Permission.READ },
      { resource: Resource.EMAIL, permission: Permission.UPDATE },
      { resource: Resource.EMAIL, permission: Permission.DELETE, condition: ctx => ctx.ownerId === ctx.userId },
      
      { resource: Resource.TEMPLATE, permission: Permission.READ },
      { resource: Resource.TEMPLATE, permission: Permission.CREATE },
      { resource: Resource.TEMPLATE, permission: Permission.UPDATE, condition: ctx => ctx.ownerId === ctx.userId },
      { resource: Resource.TEMPLATE, permission: Permission.DELETE, condition: ctx => ctx.ownerId === ctx.userId },
      
      { resource: Resource.CONTACT, permission: Permission.CREATE },
      { resource: Resource.CONTACT, permission: Permission.READ },
      { resource: Resource.CONTACT, permission: Permission.UPDATE },
      { resource: Resource.CONTACT, permission: Permission.DELETE },
      
      { resource: Resource.ATTACHMENT, permission: Permission.CREATE },
      { resource: Resource.ATTACHMENT, permission: Permission.READ },
      { resource: Resource.ATTACHMENT, permission: Permission.DELETE, condition: ctx => ctx.ownerId === ctx.userId },
      
      { resource: Resource.SETTINGS, permission: Permission.READ },
      { resource: Resource.SETTINGS, permission: Permission.UPDATE, condition: ctx => ctx.section === 'profile' },
      
      { resource: Resource.DASHBOARD, permission: Permission.READ }
    ]);
    
    // Guest role with minimal permissions
    this.addRole(Role.GUEST, [
      { resource: Resource.EMAIL, permission: Permission.READ, condition: ctx => ctx.isShared === true },
      { resource: Resource.TEMPLATE, permission: Permission.READ, condition: ctx => ctx.isPublic === true },
      { resource: Resource.DASHBOARD, permission: Permission.READ }
    ]);
    
    // API role for programmatic access
    this.addRole(Role.API, [
      { resource: Resource.EMAIL, permission: Permission.CREATE },
      { resource: Resource.EMAIL, permission: Permission.READ },
      { resource: Resource.EMAIL, permission: Permission.UPDATE },
      
      { resource: Resource.TEMPLATE, permission: Permission.READ },
      
      { resource: Resource.CONTACT, permission: Permission.READ },
      
      { resource: Resource.ANALYTICS, permission: Permission.READ }
    ]);
  }
  
  /**
   * Reset all roles and permissions
   */
  public reset(): void {
    this.rolePermissions.clear();
    this.userRoles.clear();
    this.userPermissions.clear();
    this.initializeDefaultRoles();
  }
}

// Export a singleton instance
export const accessControl = AccessControl.getInstance(); 