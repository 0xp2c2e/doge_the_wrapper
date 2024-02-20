// src/types/providers.d.ts

export interface CallError extends Error {
  reason?: string;
  info?: {
    code: number; // Assuming code is always present and is a number
    data?: {
      message?: string; // Assuming message is optional
    };
  };
}
