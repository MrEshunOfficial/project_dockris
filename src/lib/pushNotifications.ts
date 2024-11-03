import webpush from 'web-push';
import { IReminder } from '@/models/notification/reminderModel';

export class PushNotificationService {
  private static instance: PushNotificationService;
  private readonly maxRetries = 3;

  private constructor() {
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async sendNotification(
    subscription: webpush.PushSubscription,
    reminder: IReminder
  ): Promise<boolean> {
    const payload = {
      title: reminder.title,
      body: reminder.description || 'Reminder',
      url: `/Features/${reminder.entityType}/${reminder.entityId}`,
      entityId: reminder.entityId,
      entityType: reminder.entityType
    };
  
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        return true;
      } catch (error) {
        if ((error as any).statusCode === 410) {
          throw new Error('subscription-expired');
        }
        if (attempt === this.maxRetries - 1) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
    return false;
  }
}
