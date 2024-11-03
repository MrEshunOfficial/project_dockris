// Constants and state
const CACHE_NAME = "app-cache-v1";
const URLS_TO_CACHE = ["/"];
const SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes
let notificationQueue = new Map();

// Database operations wrapper
class ReminderDB {
  static async getInstance() {
    if (!ReminderDB.db) {
      ReminderDB.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("ReminderDB", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore("reminders", { keyPath: "_id" });
        };
      });
    }
    return ReminderDB.db;
  }

  static async operation(storeName, mode, operation) {
    const db = await this.getInstance();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  static async getAllReminders() {
    return this.operation("reminders", "readonly", (store) => store.getAll());
  }

  static async storeReminder(reminder) {
    return this.operation("reminders", "readwrite", (store) =>
      store.put(reminder)
    );
  }

  static async removeReminder(id) {
    return this.operation("reminders", "readwrite", (store) =>
      store.delete(id)
    );
  }

  static async clearReminders() {
    return this.operation("reminders", "readwrite", (store) => store.clear());
  }
}

// Notification handling
class NotificationManager {
  static createNotification(reminder) {
    return {
      title: reminder.title,
      options: {
        body: reminder.description || "Reminder!",
        vibrate: [100, 50, 100],
        data: {
          entityId: reminder.entityId,
          entityType: reminder.entityType,
          url: "/Features",
        },
        actions: [
          { action: "open", title: "Open" },
          { action: "close", title: "Close" },
        ],
      },
    };
  }

  static async schedule(reminder) {
    if (!reminder._id) {
      reminder._id = Date.now().toString();
    }

    const notificationTime = new Date(
      `${reminder.notification.notificationDate}T${reminder.notification.notificationTime}`
    ).getTime();

    const delay = notificationTime - Date.now();
    if (delay <= 0) return;

    await ReminderDB.storeReminder(reminder);

    const timeoutId = setTimeout(async () => {
      const { title, options } = this.createNotification(reminder);
      await self.registration.showNotification(title, options);
      await ReminderDB.removeReminder(reminder._id);
    }, delay);

    notificationQueue.set(reminder._id, timeoutId);
  }

  static async checkScheduled() {
    const reminders = await ReminderDB.getAllReminders();
    reminders.forEach((reminder) => this.schedule(reminder));
  }
}

// Service Worker event handlers
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((name) => name !== CACHE_NAME)
              .map((name) => caches.delete(name))
          )
        ),
      self.clients.claim(),
      NotificationManager.checkScheduled(),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener("message", (event) => {
  const { type, reminder } = event.data;

  const actions = {
    SCHEDULE_NOTIFICATION: () => NotificationManager.schedule(reminder),
    GET_STORED_REMINDERS: async () => {
      const reminders = await ReminderDB.getAllReminders();
      event.ports[0].postMessage(reminders);
    },
    CLEAR_STORED_REMINDERS: async () => {
      await ReminderDB.clearReminders();
      notificationQueue.forEach((timeoutId) => clearTimeout(timeoutId));
      notificationQueue.clear();
      event.ports[0].postMessage({ success: true });
    },
    MANUAL_SYNC: () => NotificationManager.checkScheduled(),
  };

  if (actions[type]) {
    event.waitUntil(actions[type]());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open") {
    const url = event.notification.data?.url || "/";
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          const existingClient = clientList.find(
            (client) => client.url === url && "focus" in client
          );
          return existingClient
            ? existingClient.focus()
            : clients.openWindow(url);
        })
    );
  }
});

// Push notification support
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: data.vibrate,
        data: data.data,
      })
    );
  }
});

// Periodic sync
if ("periodicSync" in self.registration) {
  self.registration.periodicSync.register("check-notifications", {
    minInterval: SYNC_INTERVAL,
  });
}

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-notifications") {
    event.waitUntil(NotificationManager.checkScheduled());
  }
});
