import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with custom config
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add common headers here
    // For example, adding an auth token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    // Handle request errors here
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // You can transform the data here
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Redirect to login page or refresh token
      if (typeof window !== 'undefined') {
        // Clear local storage
        localStorage.removeItem('token');
        
        // Get the current path
        const currentPath = window.location.pathname;
        
        // Redirect to login while preserving the return URL
        window.location.href = `/auth/login?returnUrl=${encodeURIComponent(currentPath)}`;
      }
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      // Handle forbidden access
      console.error('Forbidden access:', error);
    }

    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      console.error('Resource not found:', error);
    }

    // Handle 500 Internal Server errors
    if (error.response?.status === 500) {
      console.error('Server error:', error);
    }

    // Handle Network errors
    if (error.message === 'Network Error') {
      console.error('Network error - make sure API is running');
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }

    // Reject the promise with the error
    return Promise.reject(error);
  }
);

// Type for the error response from the API
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

// Helper function to extract error message from API response
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.message || apiError?.error || error.message;
  }
  return error instanceof Error ? error.message : 'An unknown error occurred';
};

export default axiosInstance;