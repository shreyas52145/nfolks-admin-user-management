import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { delayMiddleware } from './middleware/delay.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import invitationRoutes from './routes/invitations.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', delayMiddleware);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invitations', invitationRoutes);

app.listen(config.PORT, () => {
  console.log(`Mock server running on http://localhost:${config.PORT}`);
  console.log(`Access token lifetime: ${config.ACCESS_TOKEN_LIFETIME}s`);
  console.log(`Refresh token lifetime: ${config.REFRESH_TOKEN_LIFETIME}s`);
  console.log('');
  console.log('Seeded credentials:');
  console.log('  admin@nfolks.dev / Admin123 (admin)');
  console.log('  admin2@nfolks.dev / Admin123 (admin)');
  console.log('  member1@nfolks.dev / Member123 (member)');
});
