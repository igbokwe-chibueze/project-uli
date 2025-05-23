// src/app/(auth)/layout.tsx

const AuthLayout = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="min-h-screen">
            <div className="max-w-screen-xl mx-auto text-center px-4 lg:px-12 py-8 lg:py-16">
                {children}
            </div>
        </div>
    )
}

export default AuthLayout;