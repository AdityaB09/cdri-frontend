// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="px-6 py-10">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
        Cross-Domain Review Intelligence
      </h1>
      <p className="mt-3 text-lg text-neutral-600 max-w-3xl">
        Transfer insights from health/drug reviews to general products. Search similar experiences.
        Explain model decisions.
      </p>

      {/* Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className="block rounded-2xl border hover:shadow-md transition-shadow bg-white p-6"
        >
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="mt-2 text-neutral-600">
            System health, index status, sentiment trends.
          </p>
        </Link>

        {/* Similar Experiences */}
        <Link
          href="/search"
          className="block rounded-2xl border hover:shadow-md transition-shadow bg-white p-6"
        >
          <h2 className="text-2xl font-semibold">Similar Experiences</h2>
          <p className="mt-2 text-neutral-600">
            Ask a question. Retrieve semantically similar reviews.
          </p>
        </Link>

        {/* Explain */}
        <Link
          href="/explain"
          className="block rounded-2xl border hover:shadow-md transition-shadow bg-white p-6"
        >
          <h2 className="text-2xl font-semibold">Explain a Prediction</h2>
          <p className="mt-2 text-neutral-600">
            Aspect-based sentiment + token highlights.
          </p>
        </Link>

        {/* NEW: Insights (EDA) — this will appear BELOW the first 3 on md+ screens */}
        <Link
          href="/eda"
          className="block rounded-2xl border hover:shadow-md transition-shadow bg-white p-6 justify-center"
        >
          <h2 className="text-2xl font-semibold">Insights (EDA)</h2>
          <p className="mt-2 text-neutral-600">
            Aggregated aspects, heatmaps, and pain-point bubbles from your corpus.
          </p>
        </Link>
      </div>
    </main>
  );
}
