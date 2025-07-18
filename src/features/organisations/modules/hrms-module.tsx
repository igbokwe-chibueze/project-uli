// src/features/organisations/modules/hrms-module.tsx

import { UsersIcon } from "lucide-react"

const HrmsModule  = () => {
  return (
    <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-blue-500" />
            Human Resources Management
        </h2>
        <p className="text-muted-foreground mt-1">Manage your organization&apos;s human capital and workforce</p>
    </div>
  )
}

export default HrmsModule 