"use client";

import React from "react";

export type AspectRow = {
  aspect: string;
  mentions: number;        // aka count
  avg_sentiment: number;   // -1..1
};

type Props =
  | { aspects: AspectRow[]; rows?: never }
  | { rows: AspectRow[]; aspects?: never };

export default function AspectTable(props: Props) {
  const data: AspectRow[] = ("aspects" in props ? props.aspects : props.rows) ?? [];

  if (!data.length) {
    return (
      <div className="rounded-lg border p-4 text-sm text-neutral-500">
        No aspect data yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600">
          <tr>
            <th className="px-4 py-2 text-left">Aspect</th>
            <th className="px-4 py-2 text-right">Mentions</th>
            <th className="px-4 py-2 text-right">Avg Sentiment</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.aspect} className="border-t">
              <td className="px-4 py-2">{r.aspect}</td>
              <td className="px-4 py-2 text-right">{r.mentions}</td>
              <td className="px-4 py-2 text-right">{r.avg_sentiment.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
