// src/features/organisations/components/module-loader.tsx

'use client'

// This is a Client Component that handles dynamic imports for each module.

import React from 'react'
import dynamic from 'next/dynamic'

// Map module types to their dynamic imports
// Define a more specific props type for dynamically loaded components
type ModuleProps = Record<string, unknown>

// Map module types to their dynamic imports (components accept ModuleProps)
const moduleMap: Record<string, React.ComponentType<ModuleProps>> = {
  hrms: dynamic<ModuleProps>(
    () => import('@/features/organisations/modules/hrms-module'),
    { loading: () => <p>Loading HRMS...</p> }
  ),
  hsems: dynamic<ModuleProps>(
    () => import('@/features/organisations/modules/hsems-module'),
    { loading: () => <p>Loading HSEMS...</p> }
  ),
  qms: dynamic<ModuleProps>(
    () => import('@/features/organisations/modules/qms-module'),
    { loading: () => <p>Loading QMS...</p> }
  ),
}

interface ModuleLoaderProps {
  moduleType: string
}

/**
  * ModuleLoader props:
  * @param moduleType - Type of module to load (hrms, hsems, qms)
*/
export function ModuleLoader({ moduleType }: ModuleLoaderProps) {
  const key = moduleType.toLowerCase()
  const DynamicComponent = moduleMap[key]

  if (!DynamicComponent) {
    // The parent Server Component should ideally handle the `notFound()`
    // if `moduleInfo` itself isn't found. This specific message
    // would be for cases where a moduleInfo exists but no component is mapped.
    return <p>Module component not found or not configured.</p>
  }

  // Render the dynamic component without explicit any
  return <DynamicComponent />
}