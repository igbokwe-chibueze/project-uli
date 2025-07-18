// src/app/(protected)/organisations/[organisationId]/marketplace/client.tsx

'use client';

import { useState, useEffect, useCallback } from "react";
import { ModuleType } from "@prisma/client";
import { installModule, uninstallModule, getAvailableModules, getOrganizationInstalledModules } from "@/features/organisations/actions/module";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SearchIcon, RefreshCwIcon, ChevronLeftIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleCard } from "@/features/organisations/components/module-card";
import { useRouter } from "next/navigation";

// Define the structure of a module as it will be used in the client
interface ClientModule {
  id: string;
  type: ModuleType;
  name: string;
  description: string | null;
  version: string;
  isActive: boolean;
  isFree: boolean;
  price: number | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
  isInstalled: boolean;
  isLoading: boolean; // This will track loading for individual module actions
}

interface OrgProps {
  id: string;
}

export default function MarketplaceClient({ id: organisationId }: OrgProps) {
  const [availableModules, setAvailableModules] = useState<ClientModule[]>([]);
  const [installedModuleIds, setInstalledModuleIds] = useState<Set<string>>(new Set());
  // Rename 'loading' to 'isFetchingModules' to be more specific
  const [isFetchingModules, setIsFetchingModules] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshingData, setIsRefreshingData] = useState(false); // Renamed from 'refreshing'
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [filterType, setFilterType] = useState("all");

  const fetchModulesData = useCallback(async () => {
    setIsFetchingModules(true); // Indicate that modules data is being fetched
    setError(null); // Clear any previous errors
    setIsRefreshingData(true); // For the refresh button spinner

    try {
      const allModulesResult = await getAvailableModules(organisationId);
      const installedModulesResult = await getOrganizationInstalledModules(organisationId);

      if (allModulesResult.success && installedModulesResult.success) {
        const installedIds = new Set(installedModulesResult.data?.map((m) => m.id));
        const modulesWithStatus = allModulesResult.data?.map((mod) => ({
          ...mod,
          isInstalled: installedIds.has(mod.id),
          isLoading: false, // Default: not loading for individual actions
        }));
        setAvailableModules(modulesWithStatus as ClientModule[]);
        setInstalledModuleIds(installedIds);
      } else {
        const errorMessage = allModulesResult.error || installedModulesResult.error || "Failed to fetch modules.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error fetching marketplace data:", err);
      setError("An unexpected error occurred while fetching modules.");
      toast.error("An unexpected error occurred while fetching modules.");
    } finally {
      setIsFetchingModules(false); // Finished fetching modules data
      setIsRefreshingData(false); // Stop refresh button spinner
    }
  }, [organisationId]);

  useEffect(() => {
    fetchModulesData();
  }, [fetchModulesData]); // Depend on fetchModulesData

  const handleInstall = async (moduleId: string) => {
    // Optimistically update UI for the specific module
    setAvailableModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, isLoading: true } : mod))
    );
    try {
      const result = await installModule(moduleId, organisationId);
      if (result.success) {
        setInstalledModuleIds((prev) => new Set(prev).add(moduleId));
        // Update the module's isInstalled status in availableModules directly
        setAvailableModules((prev) =>
            prev.map((mod) => (mod.id === moduleId ? { ...mod, isInstalled: true } : mod))
        );
        toast.success(result.message || "Module installed successfully!");
        router.refresh(); // Still useful to refresh server cache for nav/other parts of app
      } else {
        toast.error(result.error || "Failed to install module.");
      }
    } catch (err) {
      console.error("Error installing module:", err);
      toast.error("An unexpected error occurred during installation.");
    } finally {
      setAvailableModules((prev) =>
        prev.map((mod) => (mod.id === moduleId ? { ...mod, isLoading: false } : mod))
      );
      // Consider if you really need to re-fetch all modules after every install/uninstall.
      // If the optimistic update + router.refresh() is sufficient, avoid this.
      // fetchModulesData(); // Only if you absolutely need to re-validate entire list
    }
  };

  const handleUninstall = async (moduleId: string) => {
    // Optimistically update UI for the specific module
    setAvailableModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, isLoading: true } : mod))
    );
    try {
      const result = await uninstallModule(moduleId, organisationId);
      if (result.success) {
        setInstalledModuleIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(moduleId);
          return newSet;
        });
        // Update the module's isInstalled status in availableModules directly.ss
        setAvailableModules((prev) =>
            prev.map((mod) => (mod.id === moduleId ? { ...mod, isInstalled: false } : mod))
        );
        toast.success(result.message || "Module uninstalled successfully!");
        router.refresh(); // Still useful to refresh server cache for nav/other parts of app
      } else {
        toast.error(result.error || "Failed to uninstall module.");
      }
    } catch (err) {
      console.error("Error uninstalling module:", err);
      toast.error("An unexpected error occurred during uninstallation.");
    } finally {
      setAvailableModules((prev) =>
        prev.map((mod) => (mod.id === moduleId ? { ...mod, isLoading: false } : mod))
      );
      // Consider if you really need to re-fetch all modules after every install/uninstall.
      // If the optimistic update + router.refresh() is sufficient, avoid this.
      // fetchModulesData(); // Only if you absolutely need to re-validate entire list
    }
  };

  const filteredModules = availableModules.filter((module) => {
    const matchesSearch =
      module.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (module.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ?? false);

    const isInstalled = installedModuleIds.has(module.id);

    switch (filterType) {
      case "free":
        return matchesSearch && module.isFree;
      case "paid":
        return matchesSearch && !module.isFree;
      case "installed":
        return matchesSearch && isInstalled;
      case "available":
        return matchesSearch && !isInstalled;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} aria-label="Go back">
        <ChevronLeftIcon className="size-5" />
        Back
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">App Marketplace</h1>
          <p className="text-muted-foreground text-sm">Discover and manage your modules easily.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchModulesData} disabled={isRefreshingData}>
          <RefreshCwIcon className={`size-4 ${isRefreshingData ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "free", "paid", "installed", "available"].map((filter) => (
            <Button
              key={filter}
              variant={filterType === filter ? "default" : "outline"}
              onClick={() => setFilterType(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{filteredModules.length} module{filteredModules.length !== 1 ? "s" : ""}</Badge>
        {searchQuery && <Badge variant="outline">Search: &quot;{searchQuery}&quot;</Badge>}
        {filterType !== "all" && <Badge variant="outline">Filter: {filterType}</Badge>}
      </div>

      {/* Module Grid - This section will now conditionally render loading skeletons or modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isFetchingModules ? (
          // Render skeletons while modules are being fetched
          Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-60 rounded-lg" />
          ))
        ) : error ? (
          // Show error if fetching failed
          <div className="col-span-full text-red-600 text-center">Error: {error}</div>
        ) : filteredModules.length === 0 ? (
          // Show no modules message if no modules match filters/search
          <p className="col-span-full text-center text-muted-foreground">No modules found matching your criteria.</p>
        ) : (
          // Render actual modules
          filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              isInstalled={installedModuleIds.has(module.id)}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
              isLoading={module.isLoading} // This refers to the individual module's action loading state
              orgId={organisationId}
            />
          ))
        )}
      </div>
    </div>
  );
}