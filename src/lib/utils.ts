import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { httpRequest, HttpError } from "@/lib/http-client";
import type { RepoStatus } from "@/types/Repository";

export const API_BASE = "/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: Date | string | null): string {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function safeParse<T>(value: unknown): T | undefined {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }
  return value as T;
}

// Helper function for API requests

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await httpRequest<T>(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    return response.data;
  } catch (err) {
    const error = err as HttpError;

    const message =
      error.response ||
      error.message ||
      "An unknown error occurred";

    throw new Error(message);
  }
}

export const getStatusColor = (status: RepoStatus): string => {
  switch (status) {
    case "imported":
      return "bg-blue-500"; // Info/primary-like
    case "mirroring":
      return "bg-yellow-400"; // In progress
    case "mirrored":
      return "bg-emerald-500"; // Success
    case "failed":
      return "bg-rose-500"; // Error
    case "syncing":
      return "bg-indigo-500"; // Sync in progress
    case "synced":
      return "bg-teal-500"; // Sync complete
    default:
      return "bg-gray-400"; // Unknown/neutral
  }
};

export const jsonResponse = ({
  data,
  status = 200,
}: {
  data: unknown;
  status?: number;
}): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};
