export class PushService {
    sendPushNotification(userId: string, title: string, message: string): Promise<void> {
        // Logic to send push notification to the user
        return new Promise((resolve, reject) => {
            // Simulate sending notification
            console.log(`Sending notification to ${userId}: ${title} - ${message}`);
            resolve();
        });
    }
}