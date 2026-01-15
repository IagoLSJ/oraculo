"use client";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && "error" in data && data.error) ||
      `Erro ${response.status}`;
    throw new ApiError(String(message), response.status, data);
  }

  return data as T;
}

export const api = {
  async uploadFile(file: File, customName?: string): Promise<{ fileId: string; fileName: string; rowCount?: number }> {
    const formData = new FormData();
    formData.append("file", file);
    if (customName && customName.trim() !== '') {
      formData.append("custom_name", customName.trim());
    }
    const result = await request<{ fileId: number | string; fileName: string; rowCount?: number }>("/api/upload", { method: "POST", body: formData });
    // Converte fileId para string para uso em URLs (backend retorna int)
    return { ...result, fileId: String(result.fileId) };
  },

  async listFiles(): Promise<{ files: Array<{ id: string; nome: string; uploadedAt?: string }> }> {
    return request("/api/files");
  },

  async getFileDetails(
    fileId: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<{
    unidades: string[];
    semestres: string[];
    preview_data: { headers: string[]; rows: string[][] };
    pagination: {
      page: number;
      page_size: number;
      total_rows: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
    row_count: number;
    status: string;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    return request(`/api/files/${fileId}/details?${params.toString()}`);
  },

  async analyze(payload: unknown): Promise<unknown> {
    return request("/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
};
