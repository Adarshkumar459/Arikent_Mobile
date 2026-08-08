import { secureStore } from '../services/storage/secureStore';

export class OnboardingRepository {
  private static ONBOARDING_KEY = 'onboarding_completed';

  public static async isOnboardingCompleted(): Promise<boolean> {
    const val = await secureStore.getItem(this.ONBOARDING_KEY);
    return val === 'true';
  }

  public static async setOnboardingCompleted(completed = true): Promise<void> {
    await secureStore.setItem(this.ONBOARDING_KEY, completed ? 'true' : 'false');
  }
}
