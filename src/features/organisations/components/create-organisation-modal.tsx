// src/features/organisations/components/create-organisation-modal.tsx

"use client"

import { useStaticData } from "@/hooks/use-static-data";

import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal"; // Reusable modal component.

import CreateOrganisationForm from "@/features/organisations/components/create-organisation-form"; // The form to be rendered inside the modal.
import { useCreateOrganisationModal } from "@/features/organisations/hooks/use-create-organisation-modal"; // Custom hook to manage modal open/close state.
import { CreateOrganisationFormSkeleton } from "@/features/organisations/components/create-organisation-form-skeleton";


export const CreateOrganisationModal = () => {
  // Destructure modal state and control functions from the custom modal hook.
  const { isOpen, setIsOpen, close } = useCreateOrganisationModal();

  // Consume the static data, loading status, and error from the `useStaticData` hook.
  // Pass `isOpen` to `useStaticData` as the `enabled` flag.
  // Data will only be fetched when `isOpen` becomes true.
  const { countries, states, loading, error } = useStaticData({ enabled: isOpen });

  // 1. Handle Error State: If an error occurred during data fetching, display an error message
  //    within the modal. This prevents the form from rendering with incomplete data.
  if (error) {
      return (
          <ResponsiveModal open={isOpen} onOpenChange={setIsOpen} title="Error">
              <div className="p-4 text-red-600">
                  Error loading form data: {error.message} {/* Display the actual error message */}
                  <Button onClick={close} className="mt-4">Close</Button>
              </div>
          </ResponsiveModal>
      );
  }

  // 2. Handle Loading State: If data is still being fetched (`loading` is true) and the
  //    modal is intended to be open (`isOpen` is true), display a loading spinner.
  //    This provides immediate feedback to the user.
  if (loading && isOpen) {
      return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen} title="Create a New Organisation">
          <CreateOrganisationFormSkeleton />
        </ResponsiveModal>
      );
  }

  // 3. Render Form State: If the modal is open, data has finished loading (`!loading`),
  //    and no error occurred (`!error`), then render the `CreateOrganisationForm`.
  //    Pass the fetched `countries` and `states` as props to the form.
  if (isOpen && !loading && !error) {
      return (
          <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}
              title="Create a New Organisation" // Title for accessibility and display.
              // You can add a description here also which would be visible.
          >
              {/* Render the actual form, passing the data and cancel callback */}
              <CreateOrganisationForm onCancel={close} countries={countries} states={states} isModal={true}/>
          </ResponsiveModal>
      );
  }

  // 4. Default State (Modal Closed): If the modal is not open, return null.
  //    This ensures the modal and its content are not rendered when not needed,
  //    optimizing performance.
  return null;
}