// src/app/(protected)/organisations/[organisationId]/modules/[modulesType]/page.tsx

import { notFound, redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

import { getOrganizationInstalledModules } from '@/features/organisations/actions/module'
import { currentID } from '@/features/auth/lib/authenticate'
import { getOrganisationSummaryById, isUserOrganizationMember } from '@/features/organisations/data/organizations'
import NotFound from '@/app/not-found'
import { ModuleLoader } from '@/features/organisations/components/module-loader'

interface ModulePageProps {
  params: Promise<{
    organisationId: string
    modulesType:    string
  }>
}

export default async function Page({ params }: ModulePageProps) {
  const user = await currentID()
  if (!user) return redirect('/access')

  const { organisationId, modulesType } = await params

  const organisation = await getOrganisationSummaryById(organisationId)
  if (!organisation) return <NotFound message="Organisation not found." />

  const isMember = await isUserOrganizationMember(user, organisation.id)
  if (!isMember) return <NotFound message="Access denied: you are not a member of this organisation." />

  const installedModulesResponse = await getOrganizationInstalledModules(organisationId)
  if (!installedModulesResponse.success) {
    console.error('Failed to fetch installed modules:', installedModulesResponse.error)
    return notFound()
  }

  const moduleInfo = installedModulesResponse.data?.find(
    (m) => m.type.toLowerCase() === modulesType.toLowerCase()
  )
  if (!moduleInfo) return notFound()

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/organisations/${organisationId}`} className="gap-2">
                <ArrowLeft className="size-4" />
                Back to {organisation.name} Dashboard
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{moduleInfo.name}</h1>
            <Badge variant="secondary">Active</Badge>
          </div>
          <p className="text-muted-foreground">{moduleInfo.description}</p>
        </div>

        <div className="flex flex-col space-y-4 px-4 lg:px-6 py-4 md:py-6">
          {/* Client-side loader mounts here */}
          <ModuleLoader moduleType={modulesType} />
        </div>
      </div>
    </div>
  )
}