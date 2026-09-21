export type AvatarState = 
  | 'idle' 
  | 'listening' 
  | 'thinking' 
  | 'speaking' 
  | 'happy' 
  | 'confused' 
  | 'error' 
  | 'processing';

export type AssistantLanguage = 'en' | 'hi' | 'hinglish';

export interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  expression?: AvatarState;
  toolCalls?: ToolCall[];
  status?: 'pending' | 'sent' | 'delivered';
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
  requiresConfirmation?: boolean;
  confirmationPrompt?: string;
  executed?: boolean;
  result?: any;
}

export interface AppSettings {
  language: AssistantLanguage;
  voiceSpeed: number;
  voicePitch: number;
  voiceName: string;
  avatarStyle: 'cyber_cyan' | 'sakura_pink' | 'matrix_emerald' | 'solar_gold';
  theme: 'obsidian' | 'midnight' | 'neon';
  securityLabMode: boolean;
  autoSpeak: boolean;
  hapticFeedback: boolean;
}

export interface AndroidPermission {
  id: string;
  name: string;
  description: string;
  granted: boolean;
  rationale: string;
}

export interface DeviceInfo {
  batteryLevel: number;
  isCharging: boolean;
  platform: string;
  networkType: string;
  isOnline: boolean;
  screenResolution: string;
  androidApiLevel: number;
  ramUsage: string;
}
