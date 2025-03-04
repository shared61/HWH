export interface Circle {
  id?: string;
  name: string;
  description: string;
  goalAmount: number;
  currentAmount?: number;
  type: 'public' | 'private';
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  members?: string[];
  status?: 'active' | 'completed' | 'cancelled';
}

export type CircleFormData = Omit<Circle, 'id' | 'createdAt' | 'createdBy' | 'currentAmount' | 'members' | 'status'>; 