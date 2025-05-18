// src/app/(landing)/layout.tsx

import Navbar from "@/components/navigation/navbar"

const LandingPageLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <>
        <Navbar />
        <div>
            {children}
        </div>
    </>
  )
}

export default LandingPageLayout