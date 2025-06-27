// src/app/(protected)/organisations/layout.tsx

const OrgLayout = async ({children,}: {children: React.ReactNode;}) => {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  )
}

export default OrgLayout