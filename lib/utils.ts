import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(value: number) {
  return INR_FORMATTER.format(Math.round(value))
}
