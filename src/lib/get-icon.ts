// src/lib/get-icon.ts

import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";
import { ComponentType } from "react";

// Every Lucide icon is a React component taking LucideProps
type IconComponent = ComponentType<LucideProps>;

// We cast the entire namespace to a simple map string → IconComponent
const iconMap = Icons as unknown as Record<string, IconComponent>;

export function getIcon(iconName?: string | null): IconComponent {
  // fallback:
  const Default = Icons.SettingsIcon;

  if (!iconName) {
    // no icon specified
    return Default;
  }

  // lookup and fallback
  return iconMap[iconName] ?? Default;
}
