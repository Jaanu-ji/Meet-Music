import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import hireRoutes from './routes/hireRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bandRoutes from './routes/bandRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI must be set in .env');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_here') {
  throw new Error('JWT_SECRET must be set to a strong secret in .env');
}

connectDB();

const app = express();
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5174';
const corsOptions = {
  origin: clientOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/hire', hireRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bands', bandRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Music Ecosystem API is online' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
