// External Dependencies
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Relative Dependencies
import { IMealTypeSelectData } from '@/types/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mealTypeSelectData: IMealTypeSelectData[] = [
  { key: '1', value: 'Breakfast' },
  { key: '2', value: 'Lunch' },
  { key: '3', value: 'Dinner' },
  { key: '4', value: 'Snack' },
];
