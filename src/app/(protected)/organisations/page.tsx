// src/app/(protected)/organisations/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";

const OrgHomePage = () => {
  const organisationsCount = 1;

  // If the user already belongs to an organisation, redirect on the server
  if (organisationsCount > 0) {
    // Replace `1` with your dynamic organisation ID
    redirect(`/organisations/1`);
  }

  // Render create/join UI if no organisations exist
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Welcome!</h1>
        <p className="text-gray-600">
          You don’t belong to any organisation yet. Get started by creating or joining one.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/organisations/create"
            className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition"
          >
            Create Organisation
          </Link>
          <Link
            href="/organisations/join"
            className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Join Organisation
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrgHomePage