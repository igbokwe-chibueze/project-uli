// src/app/(standalone)/organisations/layout.tsx

import Image from "next/image";
import Link from "next/link";

interface StandaloneLayoutProps {
    children: React.ReactNode;
};

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
  return (
    <main className="min-h-screen">
        <div className="mx-auto max-w-screen-2xl p-4">
            <nav className="flex justify-between items-center h-[73px]">
                <Link href={"/"}>
                    <Image src={"/logo.svg"} alt="Logo" height={56} width={152}/>
                </Link>
            </nav>

            <div className="max-w-screen-xl mx-auto px-4 py-8">
                {children}
            </div>
        </div>
    </main>
  )
}

export default StandaloneLayout;