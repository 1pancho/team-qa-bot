import { Context } from 'grammy';

/**
 * Extended bot context with custom data
 */
export interface BotContext extends Context {
  // Add custom context properties if needed
}

/**
 * Deployment type
 */
export type DeploymentType = 'ui' | 'backend';

/**
 * Bug status
 */
export type BugStatus = 'pending' | 'assigned';

/**
 * Database model for deployments
 */
export interface Deployment {
  id: number;
  type: DeploymentType;
  deployer_id: number;
  deployer_name: string;
  created_at: string;
}

/**
 * Database model for bugs
 */
export interface Bug {
  id: number;
  reporter_id: number;
  reporter_name: string;
  assigned_to_id: number | null;
  assigned_to_name: string | null;
  message_id: number;
  created_at: string;
  status: BugStatus;
}

/**
 * Chat member information
 */
export interface ChatMember {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  isBot: boolean;
}
