// frontend/src/services/notifications.js
class NotificationService {
  constructor() {
    this.permission = 'default';
    this.init();
  }

  async init() {
    if ('Notification' in window) {
      this.permission = await Notification.permission;
    }
  }

  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }
    return false;
  }

  send(title, options = {}) {
    if (this.permission === 'granted') {
      const defaultOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'smart-portal',
        requireInteraction: false,
        silent: false,
        ...options,
      };
      
      const notification = new Notification(title, defaultOptions);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) options.onClick();
      };
      
      return notification;
    }
    return null;
  }

  sendStudyReminder(topic) {
    return this.send('📚 Study Reminder', {
      body: `Time to study ${topic}! Your Pomodoro session is ready.`,
      icon: '/favicon.ico',
      tag: 'study-reminder',
      requireInteraction: true,
    });
  }

  sendAchievement(achievement) {
    return this.send('🏆 Achievement Unlocked!', {
      body: `${achievement.icon} ${achievement.title}: ${achievement.description}`,
      tag: 'achievement',
    });
  }

  sendStreakReminder(streak) {
    return this.send('🔥 Keep Your Streak!', {
      body: `You have a ${streak}-day streak! Don't break it today!`,
      tag: 'streak',
    });
  }

  sendNewMessage(username, message) {
    return this.send(`💬 New message from ${username}`, {
      body: message.substring(0, 100),
      tag: 'new-message',
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;