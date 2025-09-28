import { Router } from 'express';
import NotificationController from '../controllers/notificationController';

const router = Router();
const notificationController = new NotificationController();

export function setNotificationRoutes(app: Router) {
    app.post('/notifications/send', notificationController.sendNotification.bind(notificationController));
    app.get('/notifications', notificationController.getNotifications.bind(notificationController));
}