export interface OnboardingInterface<T extends Record<string, any>> {
  show(): Promise<T>;
  update(): Promise<any>;
}
