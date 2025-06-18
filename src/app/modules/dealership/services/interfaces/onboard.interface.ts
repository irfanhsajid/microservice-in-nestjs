import { Request } from 'express';

export interface OnboardingInterface<T extends Record<string, any>> {
  show(request: Request): Promise<T | null>;
  updateOrCreate(dto: Record<string, any>): Promise<any>;
}
