import "./styles/globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900">
        <header className="border-b bg-white">
          <nav className="mx-auto max-w-6xl px-4 h-12 flex items-center gap-6">
            <Link href="/" className="font-semibold">CDRI</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/search">Search</Link>
            <Link href="/explain">Explain</Link>
            <Link href="/eda">Insights</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
