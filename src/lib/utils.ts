import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn: Utility to merge Tailwind CSS classes safely using clsx and tailwind-merge.
 * Hàm hỗ trợ gộp các class Tailwind CSS một cách an toàn và tối ưu.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
