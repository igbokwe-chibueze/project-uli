// src/features/organisations/components/org-sidebar.tsx

"use client"

import { useMemo } from "react";
import { Building2Icon, HelpCircleIcon, PackageIcon, SearchIcon, SettingsIcon, StoreIcon } from "lucide-react";

import { getIcon } from "@/lib/get-icon";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { NavSecondary } from "@/components/nav-secondary";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { useOrganisation } from "@/features/organisations/context/organisation-context"
import { useUserOrganizations } from "@/features/organisations/hooks/use-user-organisations"
import { OrganisationSwitcher } from "@/features/organisations/components/organisation-switcher"


/**
 * Each top-level route now has a `url` which serves as the “base” for all its children.
 * - If you want a section at `/organisations/${orgId}/foo/bar`, set `url: "/foo"` and then
 * put child URLs like `"/bar"`.
 * - For Company Navigation we set `url: ""`, meaning “no extra segment” before the child-page.
 */
// Static routes for core navigation
const staticRoutes = [
    {
        title: "Company Navigation",
        segment: "", // No extra segment for children
        icon: Building2Icon,
        isActive: true, // Default open
        items: [
            { title: "Home", url: "" },
            { title: "Analytics", url: "/analytics" },
            { title: "Members", url: "/members" },
            { title: "Contractors", url: "/contractors" },
        ],
    },
    {
      title: "Settings",
      segment: "/settings",
      icon: SettingsIcon,
      items: [
        { title: "General", url: "/general" },
        { title: "Team", url: "/#" },
        { title: "Billing", url: "/#" },
        { title: "Limits", url: "/#" },
      ],
    },
];

const secondaryRoutes = [
  {
    title: "Marketplace",
    url: "/marketplace",
    icon: StoreIcon,
  },
  {
    title: "Get Help",
    url: "/#",
    icon: HelpCircleIcon,
  },
  {
    title: "Search",
    url: "/#",
    icon: SearchIcon,
  },
]

export const OrgSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { organizations, loading, error } = useUserOrganizations();
  const organisation = useOrganisation(); // Get the current organisation from context
  const organisationId = organisation?.id; // Safely access organisationId

  const basePath = `/organisations/${organisationId}`

  // Build module-based dynamic routes
  const installedModuleRoutes = useMemo(
    () => (
      organisation.modules?.map((orgModule) => {
        const { module: moduleData } = orgModule;
        const ModuleIcon = getIcon(moduleData.icon);
        return {
          title: moduleData.type,
          url: `/${moduleData.type.toLowerCase()}`,
          icon: ModuleIcon,
          id: moduleData.id,
        };
      }) || []
    ),
    [organisation.modules]
  );

  // Define a group for installed modules
  const moduleGroup = useMemo(
    () => ({
      title: "Installed Modules",
      segment: "/modules",
      icon: PackageIcon,
      showBadge: true,
      items: installedModuleRoutes.map(({ title, url, icon }) => ({ title, url, icon })),
    }),
    [installedModuleRoutes]
  );

  // Combine static and dynamic routes
  const combinedRoutes = useMemo(
    () => [...staticRoutes, moduleGroup],
    [moduleGroup]
  );


  return (
    <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <OrganisationSwitcher
            organizations={organizations}
            loading={loading}
            error={error}
          />
        </SidebarHeader>

        <SidebarContent>
          <NavMain label="Pages" basePath={basePath} routes={combinedRoutes} />
          <NavSecondary basePath={basePath} routes={secondaryRoutes} className = "mt-auto"/>
        </SidebarContent>

        <SidebarFooter>
          <NavUser/>
        </SidebarFooter>

        <SidebarRail />
    </Sidebar>
  )
}
