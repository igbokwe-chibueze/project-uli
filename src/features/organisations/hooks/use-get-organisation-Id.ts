// src/features/organisations/hooks/use-get-organisation-Id.ts

import { useParams } from "next/navigation";

export const UseGetOrganisationId = () => {
    const params = useParams();
    return params.organisationId as string;
}
