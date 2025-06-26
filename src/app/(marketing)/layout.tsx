// src/app/(marketing)/layout.tsx

import Navbar from "@/components/navigation/navbar"

const MarketingLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <>
        <Navbar />
        <div>
            {children}
        </div>
    </>
  )
}

export default MarketingLayout