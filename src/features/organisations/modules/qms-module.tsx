// src/features/organisations/modules/qms-module.tsx

import { CheckSquareIcon } from "lucide-react"


const QmsModule = () => {
  return (
    <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquareIcon className="h-6 w-6 text-green-500" />
            Quality Management System
        </h2>
        <p className="text-muted-foreground mt-1">Ensure product and service quality through systematic management</p>
    </div>
  )
}

export default QmsModule