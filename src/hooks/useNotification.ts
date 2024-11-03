import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { IReminder } from '@/models/notification/reminderModel';

interface UsePushNotificationsProps {
  swPath?: string;
  onPermissionChange?: (permission: NotificationPermission) => void;
  onError?: (error: Error) => void;
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
}

interface UsePushNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  error: Error | null;
  registration: ServiceWorkerRegistration | null;
  subscription: PushSubscription | null;
  requestPermission: () => Promise<NotificationPermission>;
  subscribeToPushNotifications: () => Promise<PushSubscription>;
  unsubscribeFromPushNotifications: () => Promise<void>;
  createReminder: (reminder: IReminder) => Promise<any>;
  getReminders: (entityType?: string, entityId?: string) => Promise<IReminder[]>;
  scheduleNotification: (reminder: IReminder) => Promise<void>;
  getStoredReminders: () => Promise<IReminder[]>;
  clearStoredReminders: () => Promise<void>;
  registerPeriodicSync: () => Promise<void>;
}

// Helper function to convert VAPID key
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export const usePushNotifications = ({
  swPath = '/service-worker.js',
  onPermissionChange,
  onError,
  onSubscriptionChange,
}: UsePushNotificationsProps = {}): UsePushNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Check for browser support
  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        'Notification' in window && 
        'serviceWorker' in navigator && 
        'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Register Service Worker
  useEffect(() => {
    const registerSW = async () => {
      if (!isSupported) return;

      try {
        const existingReg = await navigator.serviceWorker.getRegistration();
        
        if (existingReg) {
          setRegistration(existingReg);
        } else {
          const reg = await navigator.serviceWorker.register(swPath, {
            scope: '/'
          });
          setRegistration(reg);
        }

        await navigator.serviceWorker.ready;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to register service worker');
        setError(error);
        onError?.(error);
      }
    };

    registerSW();
  }, [isSupported, swPath, onError]);

 

  // Check and update push subscription
  const checkSubscription = useCallback(async () => {
    if (!registration) return;

    try {
      const existingSub = await registration.pushManager.getSubscription();
      setSubscription(existingSub);
      onSubscriptionChange?.(existingSub);
    } catch (err) {
      console.error('Error checking push subscription:', err);
    }
  }, [registration, onSubscriptionChange]);
  
  
  useEffect(() => {
    checkSubscription();
  }, [registration, checkSubscription]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      if (!isSupported) {
        throw new Error('Push notifications are not supported');
      }

      const result = await Notification.requestPermission();
      setPermission(result);
      onPermissionChange?.(result);

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to request permission');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [isSupported, onPermissionChange, onError]);

  // Subscribe to push notifications
  const subscribeToPushNotifications = useCallback(async () => {
    if (!registration) {
      throw new Error('Service Worker not registered');
    }

    try {
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        return existingSub;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      });

      // Send subscription to server
      await axios.post('/api/push-subscriptions', subscription);
      
      setSubscription(subscription);
      onSubscriptionChange?.(subscription);
      
      return subscription;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to subscribe to push notifications');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [registration, onError, onSubscriptionChange]);

  // Unsubscribe from push notifications
  const unsubscribeFromPushNotifications = useCallback(async () => {
    if (!subscription) {
      return;
    }

    try {
      await subscription.unsubscribe();
      await axios.delete('/api/push-subscriptions');
      
      setSubscription(null);
      onSubscriptionChange?.(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unsubscribe from push notifications');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [subscription, onError, onSubscriptionChange]);

  // Schedule notification with retry logic
  const scheduleNotification = useCallback(async (reminder: IReminder, attempt = 0): Promise<void> => {
    if (!registration?.active) {
      throw new Error('Service Worker not registered');
    }

    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      
      const timeoutId = setTimeout(() => {
        channel.port1.close();
        if (attempt < MAX_RETRY_ATTEMPTS) {
          setTimeout(() => {
            scheduleNotification(reminder, attempt + 1)
              .then(resolve)
              .catch(reject);
          }, RETRY_DELAY * Math.pow(2, attempt));
        } else {
          reject(new Error('Notification scheduling timeout'));
        }
      }, 5000);

      channel.port1.onmessage = (event) => {
        clearTimeout(timeoutId);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve();
        }
      };

      registration?.active?.postMessage(
        { type: 'SCHEDULE_NOTIFICATION', reminder },
        [channel.port2]
      );
    });
  }, [registration]);

  // Create reminder
  const createReminder = useCallback(async (reminder: IReminder) => {
    try {
      if (!isSupported) {
        throw new Error('Push notifications are not supported');
      }

      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      if (!subscription) {
        await subscribeToPushNotifications();
      }

      // Schedule the notification
      await scheduleNotification(reminder);

      // Send the reminder to the server
      const response = await axios.post('/api/reminder', reminder);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create reminder');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [isSupported, permission, subscription, scheduleNotification, subscribeToPushNotifications, onError]);

  // Get reminders
  const getReminders = useCallback(async (entityType?: string, entityId?: string) => {
    try {
      let url = '/api/reminder';
      if (entityType && entityId) {
        url += `?entityType=${entityType}&entityId=${entityId}`;
      }
      const response = await axios.get<{ reminders: IReminder[] }>(url);
      
      // Schedule notifications for all fetched reminders
      if (permission === 'granted') {
        await Promise.all(
          response.data.reminders
            .filter(reminder => reminder.notification?.enabled)
            .map(reminder => scheduleNotification(reminder)
              .catch(err => {
                console.error(`Failed to schedule notification for reminder ${reminder._id}:`, err);
                return null;
              })
            )
        );
      }

      return response.data.reminders;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch reminders');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [permission, scheduleNotification, onError]);


   // Handle Service Worker updates
   useEffect(() => {
    if (!registration) return;

    const handleControllerChange = async () => {
      console.log('Service Worker updated');
      try {
        // Reload subscriptions and reminders when service worker is updated
        await getReminders();
        await checkSubscription();
      } catch (error) {
        console.error('Error handling service worker update:', error);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [checkSubscription, getReminders, registration]);


  // Get stored reminders from IndexedDB
  const getStoredReminders = useCallback(async (): Promise<IReminder[]> => {
    if (!registration?.active) {
      throw new Error('Service Worker not registered');
    }

    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      
      const timeoutId = setTimeout(() => {
        channel.port1.close();
        reject(new Error('Get stored reminders timeout'));
      }, 5000);

      channel.port1.onmessage = (event) => {
        clearTimeout(timeoutId);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      registration?.active?.postMessage(
        { type: 'GET_STORED_REMINDERS' },
        [channel.port2]
      );
    });
  }, [registration]);

  // Clear stored reminders
  const clearStoredReminders = useCallback(async (): Promise<void> => {
    if (!registration?.active) {
      throw new Error('Service Worker not registered');
    }

    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      
      const timeoutId = setTimeout(() => {
        channel.port1.close();
        reject(new Error('Clear stored reminders timeout'));
      }, 5000);

      channel.port1.onmessage = (event) => {
        clearTimeout(timeoutId);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve();
        }
      };

      registration?.active?.postMessage(
        { type: 'CLEAR_STORED_REMINDERS' },
        [channel.port2]
      );
    });
  }, [registration]);

  const setupFallbackSync = useCallback(() => {
    const syncInterval = 24 * 60 * 60 * 1000; // 1 day in milliseconds

    const performSync = async () => {
      if (registration?.active) {
        registration.active.postMessage({ type: 'MANUAL_SYNC' });
      }
      setTimeout(performSync, syncInterval);
    };

    setTimeout(performSync, syncInterval);
  }, [registration]);

  // Register periodic sync
  const registerPeriodicSync = useCallback(async (): Promise<void> => {
    if (!registration) {
      throw new Error('Service Worker not registered');
    }

    if (!('periodicSync' in registration)) {
      console.warn('Periodic Sync not supported in this browser');
      return;
    }

    try {
      // Check if we have permission to use periodic sync
      const status = await (navigator as any).permissions.query({
        name: 'periodic-background-sync',
      });

      if (status.state === 'granted') {
        await (registration as any).periodicSync.register('check-notifications', {
          minInterval: 24 * 60 * 60 * 1000, // 1 day
        });
        console.log('Periodic Sync registered successfully');
      } else {
        console.warn('Permission for Periodic Sync not granted');
        // Implement a fallback mechanism here
        setupFallbackSync();
      }
    } catch (error) {
      console.error('Error registering Periodic Sync:', error);
      // Implement a fallback mechanism here
      setupFallbackSync();
    }
  }, [registration, setupFallbackSync]);

  return {
    permission,
    isSupported,
    error,
    registration,
    subscription,
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    createReminder,
    getReminders,
    scheduleNotification,
    getStoredReminders,
    clearStoredReminders,
    registerPeriodicSync
  };
};

