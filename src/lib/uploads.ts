import { ApiError } from "@/lib/api";

const UPLOAD_PATH = "/api/uploads";

/** Upload progress: 0–100 while sending, then "processing" once uploaded. */
export type UploadProgress =
  | { phase: "sending"; percent: number }
  | { phase: "processing" };

/**
 * Uploads image files through the existing POST /api/uploads proxy.
 *
 * Uses XMLHttpRequest (not fetch) so the browser can report byte-level
 * upload progress to `onProgress`; the response envelope and error mapping
 * match `apiFetch` exactly.
 */
export function uploadImages(
  files: File[],
  onProgress?: (progress: UploadProgress) => void,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (files.length === 0) {
      resolve([]);
      return;
    }

    const body = new FormData();
    for (const file of files) {
      body.append("images", file);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOAD_PATH);
    xhr.responseType = "json";

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      // Once every byte is on the wire, the remaining wait is server-side
      // (Cloudinary) processing rather than upload.
      onProgress?.(percent >= 100 ? { phase: "processing" } : { phase: "sending", percent });
    });

    xhr.addEventListener("load", () => {
      const payload = xhr.response;
      const envelope =
        payload && typeof payload === "object"
          ? (payload as { success?: boolean; message?: string; data?: { urls?: string[] } })
          : null;

      if (
        xhr.status >= 200 &&
        xhr.status < 300 &&
        envelope?.success === true &&
        Array.isArray(envelope.data?.urls)
      ) {
        resolve(envelope.data.urls as string[]);
        return;
      }

      reject(
        new ApiError(
          envelope?.message || `Image upload failed (${xhr.status})`,
          xhr.status,
        ),
      );
    });

    xhr.addEventListener("error", () => {
      reject(
        new ApiError(
          "Could not reach the API. Check that the backend is running.",
          0,
        ),
      );
    });

    xhr.addEventListener("abort", () => {
      reject(new ApiError("Image upload was cancelled.", 0));
    });

    onProgress?.({ phase: "sending", percent: 0 });
    xhr.send(body);
  });
}
