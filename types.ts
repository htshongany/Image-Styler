import React from 'react';
import type { Translations } from './i18n/translations';

export interface Resolution {
    id: 'square' | 'portrait' | 'landscape' | 'tall_portrait' | 'wide_landscape';
    value: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export interface DefaultStyle {
  id: string;
  nameKey: keyof Translations['styles'];
  prompt: string;
}

export interface Pose {
  id: string;
  icon: React.FC<{className?: string}>;
}

export interface Expression {
  id: string;
  icon: React.FC<{className?: string}>;
}