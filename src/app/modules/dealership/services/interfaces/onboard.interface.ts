export interface OnboardingInterface<T extends Record<string, any>> {
  show(): Promise<T>;
  updateOrCreate(dto: Record<string, any>): Promise<any>;
}
