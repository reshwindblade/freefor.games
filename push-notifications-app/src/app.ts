import express from 'express';
import { setNotificationRoutes } from './routes/notifications';
import { setSubscriptionRoutes } from './routes/subscriptions';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(authMiddleware);

// Routes
setNotificationRoutes(app);
setSubscriptionRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});