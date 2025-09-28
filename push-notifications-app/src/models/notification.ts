export interface Notification {
    title: string;
    message: string;
    timestamp: Date;
}

export class NotificationModel {
    constructor(public title: string, public message: string, public timestamp: Date = new Date()) {}

    toJSON() {
        return {
            title: this.title,
            message: this.message,
            timestamp: this.timestamp.toISOString(),
        };
    }
}