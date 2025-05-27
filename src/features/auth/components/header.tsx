// src/features/auth/components/header.tsx

interface HeaderProps {
    heading: string;
    label: string;
    icon?: React.ReactNode;
};

export const Header = ({ heading, label, icon }: HeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
            {/* title + icon container */}
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
                {icon && (
                    <div className="flex-shrink-0">
                        {icon}
                    </div>
                )}

                <h1 className="text-3xl font-semibold">
                    {heading}
                </h1>
            </div>
            <p className="text-muted-foreground text-sm">{label}</p>
        </div>
    )
}
