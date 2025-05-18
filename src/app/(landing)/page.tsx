// src/app/(landing)/page.tsx

import { FeaturesSection } from "@/components/landing-page-sections/features-section"
import { HomeSection } from "@/components/landing-page-sections/home-section"

const LandingPage = () => {
  return (
    <div className="pt-20">
        <HomeSection/>
        <FeaturesSection/>
    </div>
  )
}

export default LandingPage
