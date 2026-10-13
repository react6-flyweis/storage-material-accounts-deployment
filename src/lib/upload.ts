import { store } from "@/redux/store";

export async function uploadFileToS3(
  file: File,
  folder: string = "documents",
  onProgress?: (progress: number) => void
): Promise<string> {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "https://mr-storage-backend-025k.onrender.com";
  const baseUrl = apiBase.replace(/\/$/, "");

  const token = store.getState().auth?.accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Step 1: Request presigned URL from backend
  const res = await fetch(`${baseUrl}/api/upload/presigned-url`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      folder,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || `Failed to retrieve upload URL (${res.status})`);
  }

  const json = await res.json();
  const payload = json?.data || json;
  const uploadUrl: string = payload?.uploadUrl;
  const fileUrl: string = payload?.fileUrl;

  if (!uploadUrl || !fileUrl) {
    throw new Error("Invalid presigned URL payload received from server.");
  }

  // Step 2: Upload file directly to S3 via XHR for real-time progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during file upload to S3."));
    };

    xhr.send(file);
  });

  return fileUrl;
}
