import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Since we might not have these packages in all environments, providing a simple fallback or assuming usage
// For this generation, I will implement a simple class joiner if dependencies are missing,
// but sticking to standard React practices, I'll define a simple helper.

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
};
