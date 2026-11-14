import { AlertIcon } from "@/components/icons";

export function FormNotice({
  tone,
  message,
}: {
  tone: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`flex items-start gap-2 rounded-sm px-4 py-3 text-sm ${
        tone === "success"
          ? "bg-cotton-500 text-cotton-100"
          : "bg-powder-800 text-powder-200"
      }`}
      role={tone === "success" ? "status" : "alert"}
    >
      {tone === "error" ? (
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
      ) : null}
      {message}
    </div>
  );
}
