export type ProjectStatus =
  | '未定'
  | '依頼準備中'
  | '制作中'
  | '振興会確認中'
  | '修正指示あり'
  | '印刷・納品待ち'
  | '完了'
  | '不要';

export type UserRole = 'company' | 'agency';

export interface ProjectFile {
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  userName: string;
  role: UserRole;
}

export interface Project {
  id:string;
  eventName: string;
  eventDate: string; // Storing as ISO string 'YYYY-MM-DD'
  eventTime: string;
  eventLocation: string;
  printCount: number;
  deliveryHopeDate: string; // Storing as ISO string 'YYYY-MM-DD'
  notes: string;
  status: ProjectStatus;
  createdAt: Date;
  isUrgent: boolean;
  files?: ProjectFile[];
  comments?: Comment[];
}
