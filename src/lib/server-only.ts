// This file ensures that modules importing this are only used on the server
// This is a Next.js pattern to prevent server-only code from being bundled on the client

if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}


