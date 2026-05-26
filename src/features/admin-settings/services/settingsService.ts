import type { PlatformSettings } from '../types';

const STORAGE_KEY = 'justme_admin_settings';

export const settingsService = {
  getSettings: (): PlatformSettings => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {
        platformName: 'JustMe',
        commissionRate: '9',
        supportEmail: 'support@justme.com',
        maxRadius: '5'
      };
    } catch {
      return {
        platformName: 'JustMe',
        commissionRate: '9',
        supportEmail: 'support@justme.com',
        maxRadius: '5'
      };
    }
  },

  saveSettings: async (settings: PlatformSettings): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
};
