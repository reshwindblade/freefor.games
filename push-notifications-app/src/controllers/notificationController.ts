export class NotificationController {
    private notifications: Array<{ title: string; message: string; timestamp: Date }> = [];

    public sendNotification(title: string, message: string): void {
        const notification = {
            title,
            message,
            timestamp: new Date(),
        };
        this.notifications.push(notification);
        // Logic to send the notification to users would go here
    }

    public getNotifications(): Array<{ title: string; message: string; timestamp: Date }> {
        return this.notifications;
    }
}