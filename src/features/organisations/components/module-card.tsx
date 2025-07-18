// src/features/organisations/components/module-card.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import { getIcon } from "@/lib/get-icon"
import { ModuleType } from "@prisma/client"
import { Download, Trash2, ExternalLink, Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

interface ModuleCardProps {
  module: {
    id: string;
    type: ModuleType;
    name: string;
    description: string | null;
    icon: string | null;
    isFree: boolean;
  };
  isInstalled: boolean;
  onInstall: (moduleId: string) => Promise<void>;
  onUninstall: (moduleId: string) => Promise<void>;
  isLoading: boolean;
  orgId: string;
}

export function ModuleCard({ module, isInstalled, onInstall, onUninstall, isLoading: parentIsLoading, orgId }: ModuleCardProps) {
  const Icon = getIcon(module.icon);
  const [localIsLoading, setLocalIsLoading] = useState(false);

  let colorClass = ""
  let bgClass = ""

  switch (module.type) {
    case "HRMS":
      colorClass = "text-blue-500"
      bgClass = "bg-blue-50 dark:bg-blue-950"
      break
    case "HSEMS":
      colorClass = "text-orange-500"
      bgClass = "bg-orange-50 dark:bg-orange-950"
      break
    case "QMS":
      colorClass = "text-green-500"
      bgClass = "bg-green-50 dark:bg-green-950"
      break
    default:
      colorClass = "text-gray-500"
      bgClass = "bg-gray-50 dark:bg-gray-950"
  }

  const isAnyLoading = parentIsLoading || localIsLoading;
  const isUninstallForbidden = module.type === ModuleType.HRMS;

  const handleInstallClick = async () => {
    setLocalIsLoading(true);
    try {
      await onInstall(module.id);
    } finally {
      setLocalIsLoading(false);
    }
  }

  const handleUninstallClick = async () => {
    setLocalIsLoading(true);
    try {
      await onUninstall(module.id);
    } finally {
      setLocalIsLoading(false);
    }
  }

  return (
    // STEP 1: Add flex flex-col to make the card a flex container for its direct children
    <Card className="flex flex-col group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <div className={`absolute inset-0 opacity-5 ${bgClass}`} />

      {/* STEP 2: Make CardHeader flex-grow to push CardFooter to the bottom */}
      <CardHeader className="relative flex-grow">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-xl ${bgClass}`}>
            <Icon className={`size-6 ${colorClass}`} />
          </div>
          <div className="flex gap-2">
            <Badge variant={!module.isFree ? "default" : "secondary"} className="text-xs">
              {!module.isFree ? "Paid" : "Free"}
            </Badge>
            {isInstalled && (
              <Badge variant="outline" className="text-xs gap-1">
                <Check className="size-3" />
                Installed
              </Badge>
            )}
          </div>
        </div>

        <CardTitle className="text-lg leading-tight">{module.name}</CardTitle>
        {/* STEP 3 (Optional but Recommended): Set min-height and max-height for CardDescription */}
        {/* min-h-[4rem] ensures consistent spacing for short descriptions (approx. 3 lines) */}
        {/* max-h-[6rem] truncates longer descriptions after approx. 5-6 lines with ... */}
        <CardDescription className="text-sm leading-relaxed min-h-[4rem] max-h-[6rem] overflow-hidden">
          {module.description}
        </CardDescription>
      </CardHeader>

      {/* CardFooter will now consistently be at the bottom */}
      <CardFooter className="relative pt-0">
        {isInstalled ? (
          <div className="flex w-full gap-2">
            <Button asChild variant="default" className="flex-1">
              <Link href={`/organisations/${orgId}/modules/${module.type.toLowerCase()}`} className="gap-2">
                <ExternalLink className="size-4" />
                Open
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleUninstallClick}
              disabled={isAnyLoading || isUninstallForbidden}
              className="gap-2 bg-transparent"
            >
              <Trash2 className="size-4" />
              {isAnyLoading ? "..." : (isUninstallForbidden ? "Core Module" : "Remove")}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleInstallClick}
            disabled={isAnyLoading}
            className="w-full gap-2"
          >
            <Download className="size-4" />
            {isAnyLoading ? "Installing..." : "Install"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}