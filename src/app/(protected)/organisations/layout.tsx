// src/app/(protected)/organisations/layout.tsx

import React from 'react'

const OrgLayout = async ({children,}: {children: React.ReactNode;}) => {
  return (
    <div>
        {children}
    </div>
  )
}

export default OrgLayout