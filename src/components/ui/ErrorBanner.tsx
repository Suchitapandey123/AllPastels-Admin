import { AlertIcon } from "@/components/icons";

export function ErrorBanner({
  message,
  onRetry,
  className = "mb-4",
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`${className} flex flex-col items-start gap-3 rounded-sm bg-powder-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
    >
      <p className="flex items-start gap-2 text-sm text-powder-200">
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
        {message}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-sm border border-powder-200 px-3 py-1.5 text-xs text-powder-100 transition-colors hover:bg-powder-800"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
