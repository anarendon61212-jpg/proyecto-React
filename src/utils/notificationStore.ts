export type AppNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  recipientUserId?: string;
  recipientCode?: string;
  recipientIdentification?: string;
};

const NOTIFICATIONS_KEY = 'app.notifications';
const NOTIFICATION_EVENT = 'app-notifications-changed';

const readStoredNotifications = (): AppNotification[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error leyendo notificaciones:', error);
    return [];
  }
};

const writeStoredNotifications = (notifications: AppNotification[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event(NOTIFICATION_EVENT));
};

export const loadNotifications = (): AppNotification[] => {
  return readStoredNotifications().sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
};

export const filterNotificationsForRecipient = (
  notifications: AppNotification[],
  recipient?: { id?: string; code?: string; identification?: string } | null,
) => {
  if (!recipient) {
    return [];
  }

  return notifications.filter((notification) => {
    const matchesUserId = recipient.id && notification.recipientUserId === recipient.id;
    const matchesCode = recipient.code && notification.recipientCode === recipient.code;
    const matchesIdentification =
      recipient.identification && notification.recipientIdentification === recipient.identification;

    return Boolean(matchesUserId || matchesCode || matchesIdentification);
  });
};

export const pushNotification = (notification: Omit<AppNotification, 'id' | 'createdAt'>) => {
  const nextNotification: AppNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...notification,
  };

  const currentNotifications = readStoredNotifications();
  const updatedNotifications = [nextNotification, ...currentNotifications].slice(0, 20);
  writeStoredNotifications(updatedNotifications);

  return nextNotification;
};

export const subscribeToNotificationChanges = (listener: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = () => listener();

  window.addEventListener(NOTIFICATION_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(NOTIFICATION_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};