export interface IMealData {
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

export interface IMealUpdateData {
  notes: string;
  datetime: string;
  type: string;
  mealId: string;
}

export interface IMessage {
  role: string;
  content: string;
}
