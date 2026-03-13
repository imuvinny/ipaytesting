import { ReactNode } from 'react';

export type ThemeColor = 'green' | 'pink' | 'blue' | 'purple' | 'orange' | 'cyan';

export interface ThemeStyle {
  base: string;
  bg: string;
  text: string;
  accent: string;
}

export type ThemeMap = Record<ThemeColor, ThemeStyle>;

export interface Transaction {
  id?: string; // Add ID for DB reference
  icon: ReactNode;
  type: string;
  date: string;
  amount: string;
  isCredit: boolean;
  fee?: number;
  commission?: number;
  category?: string; // For icon mapping from DB
  role?: 'client' | 'agent'; // To distinguish dashboards
}

export interface UserProfile {
  id?: string; // Add ID for DB reference
  name: string;
  skinTone: string;
  gender: 'masculine' | 'feminine';
  seed: string;
  style: string;
  fixedHair: string | null;
  noBeard: boolean;
  avatarUrl?: string;
  cardSkin?: {
    background: string;
    pattern: string | null;
    id: string;
  };
  agentStatus?: 'none' | 'pending' | 'approved';
}

export interface AvatarPreset {
  id: number;
  name: string;
  seed: string;
  style: string;
  color: string;
  gender: 'masculine' | 'feminine';
  fixedHair?: string;
  noBeard?: boolean;
}