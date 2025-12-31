import { AxiosError } from "axios"

// Define ApiError interface to match the expected structure
interface ApiError {
  status: number;
  data: any;
}

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'data' in error
  );
};

function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.response?.data?.detail) {
      return err.response.data.detail;
    }
    return err.message;
  }

  if (isApiError(err)) {
    if (err.data?.detail) {
      return err.data.detail;
    }
    return `API Error: ${err.status}`;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "An unknown error occurred";
}

export const handleError = (showErrorToast: (message: string) => void) => {
  return (error: any) => {
    const message = extractErrorMessage(error);
    showErrorToast(message);
  };
};

export const getInitials = (name: string) => {
  if (!name) return '';
  const names = name.trim().split(' ');
  return names
    .filter(n => n)
    .map(n => n[0].toUpperCase())
    .join('');
};

export { extractErrorMessage };