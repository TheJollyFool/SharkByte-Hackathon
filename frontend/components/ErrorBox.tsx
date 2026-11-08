import { t } from "@/lib/i18n";
import type { Language } from "@/lib/types";

export default function ErrorBox({ lang, message, onRetry }: { lang: Language; message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="m-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
          {t(lang, "retry")}
        </button>
      )}
    </div>
  );
}
