export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
}

export interface Subscription {
    userId: string;
    notificationId: string;
}