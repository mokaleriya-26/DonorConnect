import React from 'react';
import {
  Cpu,
  Palette,
  Music,
  Briefcase,
  GraduationCap,
  Trophy,
  Utensils,
  Sparkles,
  Layers
} from 'lucide-react';

const iconMap = {
  Cpu,
  Palette,
  Music,
  Briefcase,
  GraduationCap,
  Trophy,
  Utensils,
  Sparkles,
  Layers
};

export const CategoryIcon = ({ name, size = 20, color, className = '' }) => {
  const IconComponent = iconMap[name] || Sparkles;
  return <IconComponent size={size} color={color} className={className} />;
};
