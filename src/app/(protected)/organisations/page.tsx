// src/app/(protected)/organisations/page.tsx

import { AppSidebarX } from "@/features/organisations/components/app-sidebarX"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SiteHeaderX } from "@/features/organisations/components/site-headerX"
import { SectionCards } from "@/features/organisations/components/section-cardsX"
import { ChartAreaInteractiveX } from "@/features/organisations/components/chart-area-interactiveX"
import { DataTableX } from "@/features/organisations/components/data-tableX"

import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebarX />

      <SidebarInset>
        <SiteHeaderX/>

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
              <h1 className="text-3xl font-bold">Organazation Name</h1>
              <p className="text-muted-foreground">Oraganisation overview and key metrics</p>
            </div>

            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractiveX />
              </div>
              <DataTableX data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
      
    </SidebarProvider>
  )
}
