import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import storyRoutes from './routes/story.routes';
import cityRoutes from './routes/city.routes';
import userRoutes from './routes/user.routes';
import profileRoutes from './routes/profile.routes';
import trendingRoutes from './routes/trending.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.json({
    message: 'BaladVerse API — use the Next.js app for the UI',
    frontend,
    health: '/api/health',
    docs: 'See README.md in the project root',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'BaladVerse API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/trending', trendingRoutes);

app.use(
  (
    err: Error & { status?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  }
);

app.listen(PORT, () => {
  console.log(`BaladVerse API running on http://localhost:${PORT}`);
});
