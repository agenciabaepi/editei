import { hc } from "hono/client";

import { AppType } from "@/app/api/[[...route]]/route";

// Get base URL - use relative URL in browser to automatically include cookies
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return ''; // Use relative URLs in browser to automatically include cookies
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

// Create custom fetch that includes credentials
const customFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  return fetch(input, {
    ...init,
    credentials: 'include', // Include cookies in requests
  });
};

export const client = hc<AppType>(getBaseUrl(), {
  fetch: customFetch,
});
