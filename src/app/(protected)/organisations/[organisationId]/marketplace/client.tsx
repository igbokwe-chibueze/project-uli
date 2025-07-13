// src/app/(protected)/organisations/[organisationId]/marketplace/client.tsx

'use client';

import { useState, useEffect, useCallback } from "react";
import { ModuleType } from "@prisma/client";
import {
  getAvailableModules,
  getOrganizationEnabledModules,
  installModule,
  uninstallModule,
} from "@/features/organisations/actions/module";
import { getIcon } from "@/lib/get-icon";

interface MarketplaceModule {
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
  isLoading: boolean;
}

interface OrgProps { id: string; }

export default function MarketplaceClient({ id: organisationId }: OrgProps) {
  const [modules, setModules] = useState<MarketplaceModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [available, enabled] = await Promise.all([
      getAvailableModules(),
      getOrganizationEnabledModules(organisationId),
    ]);

    if (!available.success || !available.data) {
      setError(available.error ?? "Failed to load available modules.");
      setLoading(false);
      return;
    }
    if (!enabled.success || !enabled.data) {
      setError(enabled.error ?? "Failed to load installed modules.");
      setLoading(false);
      return;
    }

    const installed = new Set(enabled.data.map((m) => m.id));
    setModules(
      available.data.map((m) => ({
        ...m,
        isInstalled: installed.has(m.id),
        isLoading: false,
      }))
    );
    setLoading(false);
  }, [organisationId]);

  useEffect(() => {
    void fetchModules();
  }, [fetchModules]);

  const handleToggle = async (id: string, ins: boolean) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isLoading: true } : m))
    );
    const res = ins
      ? await uninstallModule(id, organisationId)
      : await installModule(id, organisationId);

    if (res.success) {
      alert(res.message);
      await fetchModules();
    } else {
      alert(`Failed: ${res.error}`);
      setModules((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isLoading: false } : m))
      );
    }
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {modules.map((mod) => {
        const Icon = getIcon(mod.icon);
        return (
          <div
            key={mod.id}
            className="bg-white rounded-lg shadow p-6 border"
          >
            {/* Icon + Title */}
            <div className="flex items-center mb-4">
              <Icon className="h-8 w-8 text-indigo-500 mr-3" />
              <h2 className="text-2xl font-bold">{mod.name}</h2>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4">
              {mod.description ?? "No description."}
            </p>

            {/* Price & Action */}
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {mod.isFree ? "Free" : `$${mod.price?.toFixed(2)}`}
              </span>
              <button
                onClick={() => handleToggle(mod.id, mod.isInstalled)}
                disabled={mod.isLoading}
                className={`px-4 py-2 rounded text-white transition ${
                  mod.isInstalled
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-600 hover:bg-green-700"
                } ${mod.isLoading ? "opacity-70" : ""}`}
              >
                {mod.isLoading
                  ? mod.isInstalled
                    ? "Uninstalling…"
                    : "Installing…"
                  : mod.isInstalled
                  ? "Uninstall"
                  : "Install"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
