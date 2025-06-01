// src/features/organisations/components/create-organisation-modal.tsx
"use client"

import { ResponsiveModal } from "@/components/responsive-modal";

import CreateOrganisationForm from "@/features/organisations/components/create-organisation-form";
import { useCreateOrganisationModal } from "@/features/organisations/hooks/use-create-organisation-modal"

export const CreateOrganisationModal = () => {
    const { isOpen, setIsOpen, close } = useCreateOrganisationModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}
        title="Create a New Organisation" // This is only available to screen readers, without this we get an aria warning
        // we can add a description here also which would be visible.
    >
        <CreateOrganisationForm onCancel={close}/>
    </ResponsiveModal>
  )
}
