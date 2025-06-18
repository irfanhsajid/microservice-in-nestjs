import { Request } from 'express';

export interface OnboardingInterface<T extends Record<string, any>> {
  show(request: Request): Promise<T | null>;
  updateOrCreate(request: Request, dto: Record<string, any>): Promise<any>;
}
