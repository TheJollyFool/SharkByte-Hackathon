"use client";
// Next.js route-level error boundary: never show a blank panel.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p>Something went wrong. / Algo salió mal.</p>
      <button onClick={reset} className="mt-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
        Try again / Intentar de nuevo
      </button>
    </div>
  );
}
