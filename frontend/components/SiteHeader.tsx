'use client';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="bg-green-900 text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="font-bold text-lg">TalentScout</Link>
        <nav className="space-x-4 text-sm">
          <Link href="/login" className="hover:underline">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-400"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}
