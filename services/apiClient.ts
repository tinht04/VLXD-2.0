// API client for frontend
// Use `VITE_API_URL` when provided; otherwise default to a relative `/api`
// so the frontend will call the same origin (works when backend is served
// from the same domain, e.g., Vercel functions at `/api`). If you host the
// backend separately, set `VITE_API_URL` to the full backend URL.
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem("auth_token");
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseUrl}${endpoint}`;

    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query.append(key, String(value));
        }
      });
      const queryString = query.toString();
      if (queryString) url += `?${queryString}`;
    }

    return url;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(),
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  async post<T>(
    endpoint: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// API Service Methods
export const API = {
  // Auth
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      apiClient.post("/auth/register", data),
    login: (data: { email: string; password: string }) =>
      apiClient.post("/auth/login", data),
    verify: () => apiClient.get("/auth/verify"),
  },

  // Products
  products: {
    getAll: (category?: string) =>
      apiClient.get("/products", { params: { category } }),
    get: (id: string) => apiClient.get(`/products/${id}`),
    create: (data: any) => apiClient.post("/products", data),
    update: (id: string, data: any) => apiClient.put(`/products/${id}`, data),
    delete: (id: string) => apiClient.delete(`/products/${id}`),
  },

  // Customers
  customers: {
    getAll: () => apiClient.get("/customers"),
    get: (id: string) => apiClient.get(`/customers/${id}`),
    create: (data: any) => apiClient.post("/customers", data),
    update: (id: string, data: any) => apiClient.put(`/customers/${id}`, data),
    delete: (id: string) => apiClient.delete(`/customers/${id}`),
  },

  // Invoices
  invoices: {
    getAll: (filters?: {
      customerId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }) => apiClient.get("/invoices", { params: filters }),
    get: (id: string) => apiClient.get(`/invoices/${id}`),
    create: (data: any) => apiClient.post("/invoices", data),
    update: (id: string, data: any) => apiClient.put(`/invoices/${id}`, data),
    delete: (id: string) =>
      apiClient.delete(`/invoices/${id}`, { params: { id } }),
    getStats: (startDate?: string, endDate?: string) =>
      apiClient.get("/invoices/stats", { params: { startDate, endDate } }),
  },
};
