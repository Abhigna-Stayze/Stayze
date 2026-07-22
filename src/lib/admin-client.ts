import type { StayFormValues, StayStatusValue } from "@/lib/stay-form";

/**
 * The browser-side client for the admin REST API.
 *
 * Client Components never touch Prisma or a service — they go over HTTP to
 * `/api/admin/*`, which guards the SUPER_ADMIN session and calls the service.
 * Every call unwraps the standard `{ success, data | error }` envelope and
 * throws the human-safe error message on failure, so a form can surface it
 * directly. Field-level `issues` ride along on the thrown error for the form to
 * map back onto inputs.
 */

export type ApiError = Error & {
  status?: number;
  issues?: { field: string; message: string }[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  const body = json as
    | { success: true; data: T }
    | {
        success: false;
        error: { message: string; issues?: ApiError["issues"] };
      }
    | null;

  if (res.ok && body?.success) return body.data;

  const err: ApiError = Object.assign(
    new Error(
      (body && !body.success && body.error?.message) ||
        "Something went wrong. Please try again.",
    ),
    {
      status: res.status,
      issues: body && !body.success ? body.error?.issues : undefined,
    },
  );
  throw err;
}

export function createStay(values: StayFormValues) {
  return request<{ id: string; slug: string }>("/api/admin/stays", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function updateStay(id: string, values: StayFormValues) {
  return request<{ id: string; slug: string }>(`/api/admin/stays/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function setStayStatus(id: string, status: StayStatusValue) {
  return request<{ id: string; status: string }>(
    `/api/admin/stays/${id}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
}

export function deleteStay(id: string) {
  return request<{ id: string; deleted: true }>(`/api/admin/stays/${id}`, {
    method: "DELETE",
  });
}

export function moderateReview(reviewId: string, isPublished: boolean) {
  return request(`/api/admin/reviews/${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isPublished }),
  });
}

export function removeReview(reviewId: string) {
  return request(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
}

export type AvailabilityDay = {
  date: string;
  status: string;
  priceOverride: number | null;
};

export function getAvailability(stayId: string, from: string, to: string) {
  return request<AvailabilityDay[]>(
    `/api/admin/stays/${stayId}/availability?from=${from}&to=${to}`,
  );
}

export function mutateAvailability(
  stayId: string,
  body:
    | {
        action: "set";
        dates: string[];
        status: "AVAILABLE" | "BLOCKED";
        priceOverride?: number | null;
      }
    | { action: "clear"; dates: string[] },
) {
  return request(`/api/admin/stays/${stayId}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export type UploadedImage = {
  bucket: string;
  path: string;
  url: string;
  width: number | null;
  height: number | null;
};

/** Upload one image and get its stored reference + a preview URL. */
export async function uploadImage(
  file: File,
  kind: "cover" | "gallery" | "menu" | "owner-photo",
): Promise<UploadedImage> {
  const dims = await readDimensions(file);
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  if (dims) {
    form.append("width", String(dims.width));
    form.append("height", String(dims.height));
  }
  return request<UploadedImage>("/api/admin/upload", {
    method: "POST",
    body: form,
  });
}

/** Read an image's intrinsic size in the browser, to avoid layout shift later. */
function readDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
