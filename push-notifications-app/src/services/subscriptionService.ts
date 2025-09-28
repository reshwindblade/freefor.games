export class SubscriptionService {
    private subscriptions: Map<string, string[]>;

    constructor() {
        this.subscriptions = new Map();
    }

    addSubscription(userId: string, notificationId: string): void {
        if (!this.subscriptions.has(userId)) {
            this.subscriptions.set(userId, []);
        }
        this.subscriptions.get(userId)?.push(notificationId);
    }

    removeSubscription(userId: string, notificationId: string): void {
        const userSubscriptions = this.subscriptions.get(userId);
        if (userSubscriptions) {
            this.subscriptions.set(userId, userSubscriptions.filter(id => id !== notificationId));
        }
    }

    getSubscriptions(userId: string): string[] {
        return this.subscriptions.get(userId) || [];
    }
}