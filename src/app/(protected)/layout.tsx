// src/app/(protected)/layout.tsx

const ProctectedLayout = async ({children,}: {children: React.ReactNode;}) => {
  return (
    <div>
        {children}
    </div>
  )
}

export default ProctectedLayout