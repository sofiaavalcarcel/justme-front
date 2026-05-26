export interface PlatformSettings {
  platformName: string;
  commissionRate: string;
  supportEmail: string;
  maxRadius: string;
  // Expanded settings for demo
  maintenanceMode?: boolean;
  allowGuestBooking?: boolean;
  autoApproveProfessionals?: boolean;
  currencyCode?: string;
  smtpHost?: string;
  smtpPort?: string;
}
