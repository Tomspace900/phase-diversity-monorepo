import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPupilTypeLabel(type: number): string {
  switch (type) {
    case 0:
      return "Circular";
    case 1:
      return "ELT (5 petals)";
    case 2:
      return "ELT (6 petals)";
    default:
      return `Type ${type}`;
  }
}

export function getBasisLabel(basis: string): string {
  switch (basis) {
    case "eigen":
      return "Eigenmodes";
    case "eigenfull":
      return "Full Eigenmodes";
    case "zernike":
      return "Zernike";
    case "zonal":
      return "Zonal";
    default:
      return basis;
  }
}

export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}
