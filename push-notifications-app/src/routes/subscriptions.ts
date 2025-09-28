import { Router } from 'express';
import SubscriptionController from '../controllers/subscriptionController';

const router = Router();
const subscriptionController = new SubscriptionController();

export function setSubscriptionRoutes(app: Router) {
    app.post('/subscribe', subscriptionController.subscribe.bind(subscriptionController));
    app.post('/unsubscribe', subscriptionController.unsubscribe.bind(subscriptionController));
}