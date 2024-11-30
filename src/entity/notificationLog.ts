
export const BIRTHDAY_TYPE = 1;

export interface NotificationLog {
  id: number,
  type: number,
  userId: number,
  status: string,
  sentTime: Date,
}

