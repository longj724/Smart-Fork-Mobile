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

export interface IStravaRefreshTokenRequest {
  code: string;
  clientId: string;
  clientSecret: string;
  grantType: string;
  userId: string;
}

export interface IStravaData {
  userConnected: boolean;
  activityData: Array<IStravaActivityData>;
}

export interface IStravaActivityData {
  startDateLocal: string;
  name: string;
  sportType: string;
  movingTime: number;
  distance: number;
  totalElevationGain: number;
}
