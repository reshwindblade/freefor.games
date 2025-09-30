const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const Notification = require('../models/Notification');

// Configure VAPID keys if available
let vapidConfigured = false;
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      'mailto:' + (process.env.VAPID_EMAIL || 'contact@freefor.games'),
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    vapidConfigured = true;
    console.log('VAPID keys configured successfully');
  } catch (error) {
    console.warn('Failed to configure VAPID keys:', error.message);
  }
} else {
  console.warn('VAPID keys not found in environment variables. Push notifications will be disabled.');
}

/**
 * Send push notification to a user
 * @param {String} userId - Target user ID
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {String} type - Notification type
 * @param {Object} data - Additional data
 */
const sendPushNotification = async (userId, title, body, type = 'general', data = {}) => {
  try {
    // Check if VAPID is configured
    if (!vapidConfigured) {
      console.log('Push notifications disabled - VAPID not configured');
      // Still create notification record for future use
      const notification = new Notification({
        userId: userId,
        title: title,
        body: body,
        type: type,
        data: data,
        isRead: false
      });
      await notification.save();
      
      return { 
        success: false, 
        message: 'Push notifications disabled', 
        notificationId: notification._id 
      };
    }

    // Get user's push subscriptions
    const subscriptions = await PushSubscription.find({ 
      userId: userId,
      isActive: true 
    });

    if (subscriptions.length === 0) {
      console.log(`No active push subscriptions found for user ${userId}`);
      
      // Still create notification record
      const notification = new Notification({
        userId: userId,
        title: title,
        body: body,
        type: type,
        data: data,
        isRead: false
      });
      await notification.save();
      
      return { 
        success: false, 
        message: 'No active subscriptions',
        notificationId: notification._id 
      };
    }

    // Create notification record
    const notification = new Notification({
      userId: userId,
      title: title,
      body: body,
      type: type,
      data: data,
      isRead: false
    });

    await notification.save();

    // Prepare notification payload
    const payload = JSON.stringify({
      title: title,
      body: body,
      type: type,
      data: {
        ...data,
        notificationId: notification._id,
        timestamp: new Date().toISOString()
      },
      badge: '/icon-badge.png',
      icon: '/icon-192x192.png',
      tag: type, // Groups notifications of same type
      requireInteraction: type === 'friend_request' || type === 'game_invitation',
      actions: getNotificationActions(type)
    });

    // Send to all user's devices
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription.subscription, payload);
        console.log(`Push notification sent successfully to user ${userId}`);
        return { success: true, subscriptionId: subscription._id };
      } catch (error) {
        console.error(`Failed to send push notification to subscription ${subscription._id}:`, error);
        
        // If subscription is invalid, mark as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await PushSubscription.findByIdAndUpdate(subscription._id, { 
            isActive: false,
            lastError: error.message 
          });
        }
        
        return { success: false, subscriptionId: subscription._id, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    return {
      success: successCount > 0,
      notificationId: notification._id,
      sentTo: successCount,
      total: subscriptions.length,
      results: results
    };

  } catch (error) {
    console.error('Push notification service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get notification actions based on type
 * @param {String} type - Notification type
 * @returns {Array} Array of action objects
 */
const getNotificationActions = (type) => {
  switch (type) {
    case 'friend_request':
      return [
        { action: 'accept', title: 'Accept', icon: '/icon-check.png' },
        { action: 'decline', title: 'Decline', icon: '/icon-close.png' }
      ];
    case 'game_invitation':
      return [
        { action: 'join', title: 'Join', icon: '/icon-play.png' },
        { action: 'decline', title: 'Decline', icon: '/icon-close.png' }
      ];
    case 'availability_match':
      return [
        { action: 'view', title: 'View Match', icon: '/icon-calendar.png' }
      ];
    default:
      return [];
  }
};

/**
 * Send notification to multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {String} type - Notification type
 * @param {Object} data - Additional data
 */
const sendBulkPushNotification = async (userIds, title, body, type = 'general', data = {}) => {
  try {
    const results = await Promise.all(
      userIds.map(userId => sendPushNotification(userId, title, body, type, data))
    );

    const successCount = results.filter(r => r.success).length;

    return {
      success: successCount > 0,
      sent: successCount,
      total: userIds.length,
      results: results
    };

  } catch (error) {
    console.error('Bulk push notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test push notification functionality
 * @param {String} userId - Test user ID
 */
const testPushNotification = async (userId) => {
  return await sendPushNotification(
    userId,
    'Test Notification',
    'This is a test notification from freefor.games',
    'test',
    { test: true }
  );
};

module.exports = {
  sendPushNotification,
  sendBulkPushNotification,
  testPushNotification
};