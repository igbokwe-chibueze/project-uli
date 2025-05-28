// src/app/(protected)/organisations/layout.tsx

const OrgLayout = async ({children,}: {children: React.ReactNode;}) => {
  return (
    <div className="min-h-screen">
      <div>
      {/* <div className="max-w-screen-xl mx-auto text-center px-4 lg:px-12 py-8 lg:py-16"> //use this in create page instead */}
        {children}
      </div>
    </div>
  )
}

export default OrgLayout