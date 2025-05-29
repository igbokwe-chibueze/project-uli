// src/app/not-found.tsx

import Link from 'next/link'

interface NotFoundProps {
  message?: string;
}

export default function NotFound({ message }: NotFoundProps) {
    return (
        <div className="flex h-full min-h-screen flex-col items-center justify-center space-y-4 p-4">
            <h1 className="text-6xl font-bold">404</h1>

            <p className="text-xl">
                {message ?? "Sorry, the page you’re looking for could not be found."}
            </p>

            <Link href="/" className="rounded-lg border px-4 py-2 hover:bg-gray-100">
                Go home
            </Link>
        </div>
    )
}
