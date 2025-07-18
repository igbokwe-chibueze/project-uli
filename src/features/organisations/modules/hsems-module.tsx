// src/features/organisations/modules/hsems-module.tsx

import { FireExtinguisherIcon } from "lucide-react"


const HsemsModule = () => {
  return (
    <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <FireExtinguisherIcon className="size-6 text-orange-500" />
            Health, Safety & Environment
        </h2>
        <p className="text-muted-foreground mt-1">Monitor workplace safety and environmental compliance</p>
    </div>
  )
}

export default HsemsModule