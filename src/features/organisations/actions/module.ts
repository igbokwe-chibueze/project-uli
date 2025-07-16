// src/features/organisations/actions/module.ts

'use server';

import { revalidatePath } from 'next/cache'; // To refresh data after mutations
import { prisma } from '@/lib/prisma/prisma';
import { ModuleType, Prisma } from '@prisma/client';

import { serializeModule } from '@/lib/serializers';
// import { getOrganizationId, hasPermission } from '@/lib/auth';

/**
 * Server Action to get all available modules for the marketplace.
 * This can be used for the "App Store" page.
 */

export const getAvailableModules = async (organisationId: string) => {
    if (!organisationId) {
        return { success: false, error: 'Organization not found.' };
    }

    try {
        const modules = await prisma.module.findMany({
            where: {
                isActive: true, // Only fetch active modules
            },
        });

        const data = modules.map((m) => serializeModule(m));
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching available modules:', error);
        return { success: false, error: 'Failed to fetch available modules.' };
    }
}


/**
 * Server Action to get modules installed/enabled by the current organization.
 * This is crucial for displaying the organization's dashboard navigation.
 */
export const getOrganizationInstalledModules = async (organisationId: string,) => {
    if (!organisationId) {
        return { success: false, error: 'Organization not found.' };
    }

    try {
        const orgModules = await prisma.organizationModule.findMany({
            where: {
                orgId: organisationId,
                isEnabled: true, // Only fetch modules that are currently enabled
            },
            include: {
                module: true, // Include the module details (type, name, etc.)
            },
            orderBy: {
                module: {
                    name: 'asc',
                },
            },
        });

        const data = orgModules.map((om) => serializeModule(om.module));
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching organization modules:', error);
        return { success: false, error: 'Failed to fetch organization modules.' };
    }
}

/**
 * Server Action to install a module for the current organization.
 * Requires ADMIN permission.
 */
export const installModule = async (moduleId: string, organisationId: string,) => {
    if (!organisationId) {
        return { success: false, error: 'Organization not found.' };
    }

    /***TODO : RUN PERMISSION CHECK */
    //   if (!(await hasPermission('ADMIN'))) {
    //     return { success: false, error: 'Permission denied. Only Admins can install modules.' };
    //   }

    try {

        // Check if the module exists and is active globally
        const moduleToInstall = await prisma.module.findUnique({
            where: { id: moduleId, isActive: true },
        });

        if (!moduleToInstall) {
            return { success: false, error: 'Module not found or not available.' };
        }

        // Attempt to create or update the OrganizationModule record
        const result = await prisma.organizationModule.upsert({
            where: {
                orgId_moduleId: {
                    orgId: organisationId,
                    moduleId: moduleId,
                },
            },
            update: {
                isEnabled: true, // Ensure it's enabled if it already existed
                installedAt: new Date(), // Update installation time
            },
            create: {
                orgId: organisationId,
                moduleId: moduleId,
                isEnabled: true,
            },
        });

        revalidatePath('/organisations'); // Invalidate cache for the organisations to show new module
        revalidatePath('/organisations/marketplace'); // Invalidate cache for marketplace to update status
        return { 
            success: true, 
            data: {
                ...result,
                module: serializeModule(moduleToInstall),
            },
            message: `${moduleToInstall.name} installed successfully.` };
    } catch (err) {
        // Handle specific errors like unique constraint violation (already installed)
        if (err instanceof  Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return {
                success: false,
                error: 'Module is already installed for this organization.'
                }
            }
        }

        // Narrow `unknown` → built‑in Error
        if (err instanceof Error) {
            console.error('Error installing module:', err)
            return {
                success: false,
                error: `Failed to install module: ${err.message}`
            }
        }

        // Fallback for truly unknown throwables (e.g. strings, objects)
        console.error('Unknown error installing module:', err)
        return {
            success: false,
            error: 'An unexpected error occurred'
        }
    }
}

/**
 * Server Action to uninstall (or disable) a module for the current organization.
 * Requires ADMIN permission.
 */
export const uninstallModule = async (moduleId: string, organisationId: string) => {
    if (!organisationId) {
        return { success: false, error: 'Organization not found.' };
    }
    
    /***TODO : RUN PERMISSION CHECK */
    //   if (!(await hasPermission('ADMIN'))) {
    //     return { success: false, error: 'Permission denied. Only Admins can uninstall modules.' };
    //   }

    try {

        // First, retrieve the module to check its type
        const moduleToUninstall = await prisma.module.findUnique({
            where: { id: moduleId },
            select: { type: true, name: true }, // Select type and name
        });

        if (!moduleToUninstall) {
            return { success: false, error: 'Module not found.' };
        }

        // Prevent uninstallation if it's the HRMS module
        if (moduleToUninstall.type === ModuleType.HRMS) {
            return { success: false, error: `${moduleToUninstall.name} is a core module and cannot be uninstalled.` };
        }

        const result = await prisma.organizationModule.update({
            where: {
                orgId_moduleId: {
                    orgId: organisationId,
                    moduleId: moduleId,
                },
            },
            data: {
                isEnabled: false, // Soft delete / disable
            },
        });

        revalidatePath('/organisations'); // Invalidate cache for the organisations to show new module
        revalidatePath('/organisations/marketplace'); // Invalidate cache for marketplace
        return { success: true, data: result, message: 'Module uninstalled successfully.' };
    } catch (error) {
        console.error('Error uninstalling module:', error);
        return { success: false, error: 'Failed to uninstall module.' };
    }
}