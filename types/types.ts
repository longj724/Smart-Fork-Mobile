export interface MealData {
  created_at: string;
  id: number;
  notes: string | null;
  imageUrls: string[] | null;
  datetime: string;
  type: string | null;
  userId: string;
}

export interface IMealTypeSelectData {
  key: string;
  value: string;
}