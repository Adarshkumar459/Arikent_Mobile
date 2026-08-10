import { secureStore } from '../services/storage/secureStore';

type OnboardingListener = (completed: boolean) => void;

export class OnboardingRepository {
  private static ONBOARDING_KEY = 'onboarding_completed';
  private static listeners: OnboardingListener[] = [];

  public static subscribe(listener: OnboardingListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public static async isOnboardingCompleted(): Promise<boolean> {
    const val = await secureStore.getItem(this.ONBOARDING_KEY);
    return val === 'true';
  }

  public static async setOnboardingCompleted(completed = true): Promise<void> {
    await secureStore.setItem(this.ONBOARDING_KEY, completed ? 'true' : 'false');
    this.listeners.forEach((listener) => listener(completed));
  }

  public static async resetOnboarding(): Promise<void> {
    await this.setOnboardingCompleted(false);
  }
}
